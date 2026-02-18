-- FRESHCUT X - Database Schema Migration (CamelCase for Frontend Matching)
-- Recommended: PostgreSQL with Supabase

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Types/Enums
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

-- 3. Tables

-- Shops
CREATE TABLE IF NOT EXISTS "shops" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "plan" shop_plan DEFAULT 'pro',
    "address" TEXT,
    "phone" TEXT,
    "isOpen" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users (Internal Staff)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" user_role DEFAULT 'barber',
    "avatar" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Barbers
CREATE TABLE IF NOT EXISTS "barbers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
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
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
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
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL, 
    "category" TEXT,
    "color" TEXT DEFAULT '#00FF9C',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
    "clientId" UUID REFERENCES "clients"("id") ON DELETE CASCADE,
    "barberId" UUID REFERENCES "barbers"("id") ON DELETE SET NULL,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" appointment_status DEFAULT 'scheduled',
    "totalPrice" DECIMAL(10,2) DEFAULT 0.00,
    "isPaid" BOOLEAN DEFAULT false,
    "paymentMethod" payment_method,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Queue Items
CREATE TABLE IF NOT EXISTS "queueItems" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID REFERENCES "shops"("id") ON DELETE CASCADE,
    "clientId" UUID REFERENCES "clients"("id") ON DELETE CASCADE,
    "barberId" UUID REFERENCES "barbers"("id") ON DELETE SET NULL,
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
    "appointmentId" UUID REFERENCES "appointments"("id") ON DELETE CASCADE,
    "serviceId" UUID REFERENCES "services"("id") ON DELETE CASCADE,
    PRIMARY KEY ("appointmentId", "serviceId")
);

CREATE TABLE IF NOT EXISTS "queueServices" (
    "queueId" UUID REFERENCES "queueItems"("id") ON DELETE CASCADE,
    "serviceId" UUID REFERENCES "services"("id") ON DELETE CASCADE,
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

CREATE POLICY "Allow all for authenticated users" ON "queueItems" FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON "appointments" FOR ALL TO authenticated USING (true);
