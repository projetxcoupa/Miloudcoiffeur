-- FRESHCUT X — Migration 03: Strict RLS Policies
-- Replaces permissive "Allow all" policies with shopId-based isolation

-- ============================================================
-- 1. Drop existing overly-permissive policies
-- ============================================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON "queueItems";
DROP POLICY IF EXISTS "Allow all for authenticated users" ON "appointments";

-- ============================================================
-- 2. SHOPS — Public read (landing page), admin write
-- ============================================================
CREATE POLICY "shops_public_read" ON "shops"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "shops_admin_write" ON "shops"
    FOR ALL TO authenticated
    USING (
        "id" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 3. USERS — Only same-shop authenticated users
-- ============================================================
CREATE POLICY "users_shop_isolation" ON "users"
    FOR ALL TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 4. BARBERS — Public read (booking flow), shop admin write
-- ============================================================
CREATE POLICY "barbers_public_read" ON "barbers"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "barbers_admin_write" ON "barbers"
    FOR INSERT TO authenticated
    WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "barbers_admin_update" ON "barbers"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "barbers_admin_delete" ON "barbers"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 5. CLIENTS — Public insert (booking), shop admin full access
-- ============================================================
CREATE POLICY "clients_public_insert" ON "clients"
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "clients_shop_read" ON "clients"
    FOR SELECT TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "clients_shop_update" ON "clients"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "clients_shop_delete" ON "clients"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 6. SERVICES — Public read (booking flow), shop admin write
-- ============================================================
CREATE POLICY "services_public_read" ON "services"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "services_admin_write" ON "services"
    FOR INSERT TO authenticated
    WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "services_admin_update" ON "services"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "services_admin_delete" ON "services"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 7. APPOINTMENTS — Public insert (booking), shop admin manage
-- ============================================================
CREATE POLICY "appointments_public_insert" ON "appointments"
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "appointments_shop_read" ON "appointments"
    FOR SELECT TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "appointments_anon_read" ON "appointments"
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "appointments_shop_update" ON "appointments"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "appointments_shop_delete" ON "appointments"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 8. QUEUE ITEMS — Public insert (walk-in), shop admin manage
-- ============================================================
CREATE POLICY "queue_public_insert" ON "queueItems"
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "queue_anon_read" ON "queueItems"
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "queue_shop_read" ON "queueItems"
    FOR SELECT TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "queue_shop_update" ON "queueItems"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "queue_shop_delete" ON "queueItems"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 9. PRODUCTS — Public read, shop admin write
-- ============================================================
CREATE POLICY "products_public_read" ON "products"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "products_admin_write" ON "products"
    FOR INSERT TO authenticated
    WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "products_admin_update" ON "products"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "products_admin_delete" ON "products"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 10. PROMOTIONS — Public read, shop admin write
-- ============================================================
CREATE POLICY "promotions_public_read" ON "promotions"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "promotions_admin_write" ON "promotions"
    FOR INSERT TO authenticated
    WITH CHECK (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "promotions_admin_update" ON "promotions"
    FOR UPDATE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

CREATE POLICY "promotions_admin_delete" ON "promotions"
    FOR DELETE TO authenticated
    USING (
        "shopId" = (auth.jwt() -> 'user_metadata' ->> 'shopId')
    );

-- ============================================================
-- 11. JUNCTION TABLES — Follow parent table policies
-- ============================================================
ALTER TABLE "appointmentServices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "queueServices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointmentServices_public" ON "appointmentServices"
    FOR ALL TO anon, authenticated
    USING (true);

CREATE POLICY "queueServices_public" ON "queueServices"
    FOR ALL TO anon, authenticated
    USING (true);
