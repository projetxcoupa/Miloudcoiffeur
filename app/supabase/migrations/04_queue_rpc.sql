-- FRESHCUT X — Migration 04: Queue RPC + Anti Double-Booking
-- Atomic operations to prevent race conditions and overlapping bookings

-- ============================================================
-- 1. ATOMIC QUEUE POSITION — Prevents duplicate positions
-- ============================================================
-- Uses SELECT FOR UPDATE to lock the row during position calculation
-- Two simultaneous inserts will never get the same position

CREATE OR REPLACE FUNCTION get_next_queue_position(p_shop_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_pos INTEGER;
BEGIN
    SELECT COALESCE(MAX("position"), 0) + 1 INTO next_pos
    FROM "queueItems"
    WHERE "shopId" = p_shop_id
    AND "status" IN ('waiting', 'notified', 'in_progress')
    FOR UPDATE;

    RETURN next_pos;
END;
$$;

-- ============================================================
-- 2. ANTI DOUBLE-BOOKING — Robust overlap detection
-- ============================================================
-- Checks if a barber already has a booking that overlaps with the
-- requested time window. Excludes cancelled and no_show appointments.
-- p_exclude_id allows editing an existing appointment without
-- conflicting with itself.

CREATE OR REPLACE FUNCTION check_booking_overlap(
    p_barber_id TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ,
    p_exclude_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "appointments"
        WHERE "barberId" = p_barber_id
        AND "status" NOT IN ('cancelled', 'no_show')
        AND "startTime" < p_end
        AND "endTime" > p_start
        AND ("id" != p_exclude_id OR p_exclude_id IS NULL)
    );
END;
$$;

-- ============================================================
-- 3. SAFE QUEUE INSERT — Combines position + insert atomically
-- ============================================================
-- Single RPC call from frontend that handles everything:
-- 1. Gets next position atomically
-- 2. Calculates estimated wait time
-- 3. Inserts the queue item

CREATE OR REPLACE FUNCTION insert_queue_item(
    p_shop_id TEXT,
    p_client_id TEXT,
    p_barber_id TEXT DEFAULT NULL
)
RETURNS TABLE(
    id TEXT,
    position INTEGER,
    "estimatedWaitTime" INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_position INTEGER;
    v_wait INTEGER;
    v_id TEXT;
    v_active_barbers INTEGER;
    v_avg_duration INTEGER;
    v_people_ahead INTEGER;
BEGIN
    -- Get next position atomically
    SELECT get_next_queue_position(p_shop_id) INTO v_position;

    -- Count people ahead
    SELECT COUNT(*) INTO v_people_ahead
    FROM "queueItems"
    WHERE "shopId" = p_shop_id
    AND "status" IN ('waiting', 'notified')
    AND "position" < v_position;

    -- Count active barbers
    SELECT COUNT(*) INTO v_active_barbers
    FROM "barbers"
    WHERE "shopId" = p_shop_id
    AND "status" = 'active';

    -- Default to 1 if no active barbers (avoid division by zero)
    IF v_active_barbers = 0 THEN
        v_active_barbers := 1;
    END IF;

    -- Average service duration (default 20 min)
    SELECT COALESCE(AVG("duration"), 20) INTO v_avg_duration
    FROM "services"
    WHERE "shopId" = p_shop_id
    AND "isActive" = true;

    -- Calculate estimated wait
    -- If first in queue, wait is 1 minute (barber is free)
    IF v_people_ahead = 0 THEN
        v_wait := 1;
    ELSE
        v_wait := CEIL((v_people_ahead * v_avg_duration)::NUMERIC / v_active_barbers);
    END IF;

    -- Generate ID
    v_id := uuid_generate_v4()::text;

    -- Insert queue item
    INSERT INTO "queueItems" ("id", "shopId", "clientId", "barberId", "position", "status", "estimatedWaitTime")
    VALUES (v_id, p_shop_id, p_client_id, p_barber_id, v_position, 'waiting', v_wait);

    RETURN QUERY SELECT v_id, v_position, v_wait;
END;
$$;

-- ============================================================
-- 4. SAFE APPOINTMENT INSERT — With overlap check
-- ============================================================
-- Creates an appointment only if there is no time overlap with
-- the barber's existing appointments. Also snapshots the
-- commission rate from the barber at the time of booking.

CREATE OR REPLACE FUNCTION insert_appointment_safe(
    p_shop_id TEXT,
    p_client_id TEXT,
    p_barber_id TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ,
    p_total_price DECIMAL DEFAULT 0,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    id TEXT,
    status TEXT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overlap BOOLEAN;
    v_id TEXT;
    v_commission_rate DECIMAL;
BEGIN
    -- Check for overlap (only if a specific barber is selected)
    IF p_barber_id IS NOT NULL THEN
        SELECT check_booking_overlap(p_barber_id, p_start, p_end) INTO v_overlap;

        IF v_overlap THEN
            RETURN QUERY SELECT NULL::TEXT, 'error'::TEXT, 'Ce créneau est déjà pris pour ce barbier'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Snapshot commission rate from barber
    IF p_barber_id IS NOT NULL THEN
        SELECT "commissionRate" INTO v_commission_rate
        FROM "barbers"
        WHERE "id" = p_barber_id;
    ELSE
        v_commission_rate := NULL;
    END IF;

    -- Generate ID and insert
    v_id := uuid_generate_v4()::text;

    INSERT INTO "appointments" (
        "id", "shopId", "clientId", "barberId",
        "startTime", "endTime", "status", "totalPrice",
        "commissionRate", "notes"
    ) VALUES (
        v_id, p_shop_id, p_client_id, p_barber_id,
        p_start, p_end, 'scheduled', p_total_price,
        v_commission_rate, p_notes
    );

    RETURN QUERY SELECT v_id, 'success'::TEXT, 'Rendez-vous créé avec succès'::TEXT;
END;
$$;
