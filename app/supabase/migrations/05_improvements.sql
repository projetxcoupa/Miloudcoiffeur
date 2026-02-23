-- FRESHCUT X — Migration 05: Indexes + Transactions + Commission Snapshot
-- Performance, financial tracking, and commission historization

-- ============================================================
-- 1. MISSING INDEXES — Performance critical for dashboard queries
-- ============================================================

-- Queue: shop + position (used on every queue load)
CREATE INDEX IF NOT EXISTS idx_queue_shop_position
    ON "queueItems" ("shopId", "position");

-- Queue: status (filtering active queue items)
CREATE INDEX IF NOT EXISTS idx_queueItems_status
    ON "queueItems" ("status");

-- Queue: joinedAt (time-based sorting)
CREATE INDEX IF NOT EXISTS idx_queueItems_joinedAt
    ON "queueItems" ("joinedAt");

-- Appointments: barber + startTime (overlap checks, barber schedule)
CREATE INDEX IF NOT EXISTS idx_appointments_barber_time
    ON "appointments" ("barberId", "startTime");

-- Appointments: startTime alone (today's appointments, upcoming)
CREATE INDEX IF NOT EXISTS idx_appointments_startTime
    ON "appointments" ("startTime");

-- Appointments: status (filtering active/completed)
CREATE INDEX IF NOT EXISTS idx_appointments_status
    ON "appointments" ("status");

-- Clients: shop + phone (lookup by phone during booking)
CREATE INDEX IF NOT EXISTS idx_clients_shop_phone
    ON "clients" ("shopId", "phone");

-- ============================================================
-- 2. COMMISSION SNAPSHOT — Prevent retroactive recalculation
-- ============================================================
-- Stores the barber's commission rate at the time of booking
-- so historical revenue calculations remain accurate.

ALTER TABLE "appointments"
    ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5,2);

-- Also for queue items that have a payment
ALTER TABLE "queueItems"
    ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5,2);

-- Also add paymentMethod to queueItems if missing
ALTER TABLE "queueItems"
    ADD COLUMN IF NOT EXISTS "paymentMethod" payment_method;

-- Also add totalPrice to queueItems for walk-in revenue tracking
ALTER TABLE "queueItems"
    ADD COLUMN IF NOT EXISTS "totalPrice" DECIMAL(10,2) DEFAULT 0.00;

-- ============================================================
-- 3. TRANSACTIONS TABLE — Financial tracking & daily cash closing
-- ============================================================

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK ("type" IN ('service', 'product', 'refund', 'adjustment')),
    "amount" DECIMAL(10,2) NOT NULL,
    "barberId" TEXT REFERENCES "barbers"("id") ON DELETE SET NULL,
    "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL,
    "queueItemId" TEXT REFERENCES "queueItems"("id") ON DELETE SET NULL,
    "paymentMethod" payment_method DEFAULT 'cash',
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_shopId
    ON "transactions" ("shopId");

CREATE INDEX IF NOT EXISTS idx_transactions_createdAt
    ON "transactions" ("createdAt");

CREATE INDEX IF NOT EXISTS idx_transactions_barberId
    ON "transactions" ("barberId");

CREATE INDEX IF NOT EXISTS idx_transactions_type
    ON "transactions" ("type");

-- RLS for transactions
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_shop_read" ON "transactions"
    FOR SELECT TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "transactions_shop_insert" ON "transactions"
    FOR INSERT TO authenticated
    WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "transactions_shop_update" ON "transactions"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );
