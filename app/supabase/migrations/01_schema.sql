-- FRESHCUT X - Database Schema Migration (CamelCase for Frontend Matching)
-- Recommended: PostgreSQL with Supabase

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables to allow clean reload
DROP TABLE IF EXISTS "queueServices" CASCADE;
DROP TABLE IF EXISTS "appointmentServices" CASCADE;
DROP TABLE IF EXISTS "queueItems" CASCADE;
DROP TABLE IF EXISTS "promotions" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "barbers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "shops" CASCADE;

-- 3. Create Types/Enums
DO $$ BEGIN
    CREATE TYPE shop_plan AS ENUM ('starter', 'pro', 'elite');
    CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'barber');
    CREATE TYPE barber_status AS ENUM ('active', 'pause', 'off');
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled');
    CREATE TYPE queue_status AS ENUM ('waiting', 'notified', 'in_progress', 'done', 'cancelled');
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Tables

-- Shops
CREATE TABLE IF NOT EXISTS "shops" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "plan" shop_plan DEFAULT 'pro',
    "address" TEXT,
    "phone" TEXT,
    "isOpen" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users (Internal Staff)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" user_role DEFAULT 'barber',
    "avatar" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Barbers
CREATE TABLE IF NOT EXISTS "barbers" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "status" barber_status DEFAULT 'off',
    "commissionRate" DECIMAL(5,2) DEFAULT 40.00,
    "specialties" TEXT[], 
    "schedule" JSONB, 
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clients
CREATE TABLE IF NOT EXISTS "clients" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "totalVisits" INTEGER DEFAULT 0,
    "totalSpent" DECIMAL(10,2) DEFAULT 0.00,
    "lastVisit" TIMESTAMP WITH TIME ZONE,
    "loyaltyScore" INTEGER DEFAULT 0,
    "isVip" BOOLEAN DEFAULT false,
    "isBlocked" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("shopId", "phone")
);

-- Services
CREATE TABLE IF NOT EXISTS "services" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL, 
    "category" TEXT,
    "color" TEXT DEFAULT '#00FF9C',
    "targetAge" TEXT DEFAULT 'adult',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "clientId" TEXT REFERENCES "clients"("id") ON DELETE CASCADE,
    "barberId" TEXT REFERENCES "barbers"("id") ON DELETE SET NULL,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" appointment_status DEFAULT 'scheduled',
    "totalPrice" DECIMAL(10,2) DEFAULT 0.00,
    "isPaid" BOOLEAN DEFAULT false,
    "paymentMethod" payment_method,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER DEFAULT 0,
    "category" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Promotions
CREATE TABLE IF NOT EXISTS "promotions" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL, -- 'percentage' or 'fixed'
    "discountValue" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "usageCount" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Queue Items
CREATE TABLE IF NOT EXISTS "queueItems" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "clientId" TEXT REFERENCES "clients"("id") ON DELETE CASCADE,
    "barberId" TEXT REFERENCES "barbers"("id") ON DELETE SET NULL,
    "position" INTEGER NOT NULL,
    "status" queue_status DEFAULT 'waiting',
    "estimatedWaitTime" INTEGER DEFAULT 0,
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "notifiedAt" TIMESTAMP WITH TIME ZONE
);

-- Many-to-Many
CREATE TABLE IF NOT EXISTS "appointmentServices" (
    "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE CASCADE,
    "serviceId" TEXT REFERENCES "services"("id") ON DELETE CASCADE,
    PRIMARY KEY ("appointmentId", "serviceId")
);

CREATE TABLE IF NOT EXISTS "queueServices" (
    "queueId" TEXT REFERENCES "queueItems"("id") ON DELETE CASCADE,
    "serviceId" TEXT REFERENCES "services"("id") ON DELETE CASCADE,
    PRIMARY KEY ("queueId", "serviceId")
);

-- 4. Indexes
CREATE INDEX idx_users_shopId ON "users"("shopId");
CREATE INDEX idx_barbers_shopId ON "barbers"("shopId");
CREATE INDEX idx_clients_shopId ON "clients"("shopId");
CREATE INDEX idx_services_shopId ON "services"("shopId");
CREATE INDEX idx_appointments_shopId ON "appointments"("shopId");
CREATE INDEX idx_appointments_clientId ON "appointments"("clientId");
CREATE INDEX idx_appointments_barberId ON "appointments"("barberId");
CREATE INDEX idx_queueItems_shopId ON "queueItems"("shopId");

-- 5. RLS Policies
ALTER TABLE "shops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "barbers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "queueItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON "queueItems" FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON "appointments" FOR ALL TO authenticated USING (true);
