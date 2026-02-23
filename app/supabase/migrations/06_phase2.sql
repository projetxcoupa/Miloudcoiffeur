-- ============================================================
-- FRESHCUT X — Phase 2: SaaS Expansion Migration
-- Run after: 05_improvements.sql
-- IMPORTANT: All IDs are TEXT to match 01_schema.sql
-- ============================================================

-- ============================================================
-- 1. PUSH SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id"          TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId"      TEXT NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
    "clientId"    TEXT REFERENCES "clients"("id") ON DELETE CASCADE,
    "endpoint"    TEXT NOT NULL,
    "p256dh"      TEXT NOT NULL,
    "auth"        TEXT NOT NULL,
    "createdAt"   TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one subscription per endpoint per shop
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
    ON "push_subscriptions"("shopId", "endpoint");

-- Index for looking up subscriptions by client
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client 
    ON "push_subscriptions"("clientId");

-- RLS
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own subscription (public booking flow)
CREATE POLICY "push_sub_insert" ON "push_subscriptions"
    FOR INSERT WITH CHECK (true);

-- Only shop staff can read subscriptions for their shop
CREATE POLICY "push_sub_select" ON "push_subscriptions"
    FOR SELECT USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- Shop staff can delete subscriptions
CREATE POLICY "push_sub_delete" ON "push_subscriptions"
    FOR DELETE USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );


-- ============================================================
-- 2. ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id"          TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId"      TEXT NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
    "actorId"     TEXT,  -- auth.uid() of the user who performed the action, NULL for system actions
    "actorName"   TEXT,  -- Display name cached for fast rendering
    "action"      TEXT NOT NULL,  -- e.g. 'queue.add', 'appointment.complete', 'barber.pause'
    "tableName"   TEXT,  -- e.g. 'queueItems', 'appointments'
    "recordId"    TEXT,  -- The ID of the affected record
    "details"     JSONB DEFAULT '{}',  -- Additional context
    "createdAt"   TIMESTAMPTZ DEFAULT now()
);

-- Fast queries: recent activity per shop
CREATE INDEX IF NOT EXISTS idx_activity_logs_shop_created 
    ON "activity_logs"("shopId", "createdAt" DESC);

-- Filter by action type
CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
    ON "activity_logs"("shopId", "action");

-- RLS
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;

-- Shop staff can read their shop's activity
CREATE POLICY "activity_logs_select" ON "activity_logs"
    FOR SELECT USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- Shop staff can insert activity logs
CREATE POLICY "activity_logs_insert" ON "activity_logs"
    FOR INSERT WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- System can insert via service_role (no policy needed, bypasses RLS)


-- ============================================================
-- 3. FEATURE FLAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id"            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId"        TEXT NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
    "flag"          TEXT NOT NULL,  -- e.g. 'push_notifications', 'activity_logs'
    "enabled"       BOOLEAN DEFAULT false,
    "planRequired"  TEXT DEFAULT 'starter',  -- 'starter', 'pro', 'elite'
    "updatedAt"     TIMESTAMPTZ DEFAULT now()
);

-- Unique: one flag per shop
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_unique 
    ON "feature_flags"("shopId", "flag");

-- RLS
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;

-- Shop staff can read their flags
CREATE POLICY "feature_flags_select" ON "feature_flags"
    FOR SELECT USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- Only managers can toggle flags
CREATE POLICY "feature_flags_update" ON "feature_flags"
    FOR UPDATE USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );


-- ============================================================
-- 4. SEED DEFAULT FEATURE FLAGS
-- Uncomment and replace 'YOUR_SHOP_ID' with your actual shop ID
-- ============================================================
-- INSERT INTO "feature_flags" ("shopId", "flag", "enabled", "planRequired")
-- VALUES
--     ('YOUR_SHOP_ID', 'push_notifications', true,  'starter'),
--     ('YOUR_SHOP_ID', 'activity_logs',      true,  'pro'),
--     ('YOUR_SHOP_ID', 'cash_payment',       true,  'starter'),
--     ('YOUR_SHOP_ID', 'online_booking',     true,  'starter'),
--     ('YOUR_SHOP_ID', 'promotions',         true,  'pro'),
--     ('YOUR_SHOP_ID', 'analytics_advanced', false, 'elite')
-- ON CONFLICT ("shopId", "flag") DO NOTHING;


-- ============================================================
-- 5. HELPER: Log activity function (callable from triggers or app)
-- ============================================================
CREATE OR REPLACE FUNCTION log_activity(
    p_shop_id       TEXT,
    p_actor_id      TEXT,
    p_actor_name    TEXT,
    p_action        TEXT,
    p_table_name    TEXT DEFAULT NULL,
    p_record_id     TEXT DEFAULT NULL,
    p_details       JSONB DEFAULT '{}'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id TEXT;
BEGIN
    INSERT INTO "activity_logs" ("shopId", "actorId", "actorName", "action", "tableName", "recordId", "details")
    VALUES (p_shop_id, p_actor_id, p_actor_name, p_action, p_table_name, p_record_id, p_details)
    RETURNING "id" INTO v_log_id;

    RETURN v_log_id;
END;
$$;
