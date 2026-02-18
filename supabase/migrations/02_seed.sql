-- FRESHCUT X - Seed Data
-- Run this AFTER 01_schema.sql

-- 1. Insert Shop
INSERT INTO "shops" ("id", "name", "plan", "address", "phone", "isOpen")
VALUES
('shop_001', 'FreshCut Premium', 'pro', '123 Rue de la Barbe, Paris', '+33 1 23 45 67 89', true)
ON CONFLICT ("id") DO NOTHING;

-- 2. Insert Users
INSERT INTO "users" ("id", "shopId", "name", "email", "role", "avatar", "isActive")
VALUES
('user_001', 'shop_001', 'Alex Manager', 'alex@freshcut.com', 'manager', 'https://i.pravatar.cc/150?u=alex', true)
ON CONFLICT ("id") DO NOTHING;

-- 3. Insert Barbers
INSERT INTO "barbers" ("id", "shopId", "name", "avatar", "status", "commissionRate", "specialties", "schedule", "isActive")
VALUES
('barber_001', 'shop_001', 'Marcus', 'https://i.pravatar.cc/150?u=marcus', 'active', 40.00, ARRAY['Dégradé', 'Barbe'], '{"monday": {"start": "09:00", "end": "19:00", "isWorking": true}, "tuesday": {"start": "09:00", "end": "19:00", "isWorking": true}, "wednesday": {"start": "09:00", "end": "19:00", "isWorking": true}, "thursday": {"start": "09:00", "end": "19:00", "isWorking": true}, "friday": {"start": "09:00", "end": "20:00", "isWorking": true}, "saturday": {"start": "10:00", "end": "18:00", "isWorking": true}, "sunday": {"start": "", "end": "", "isWorking": false}}', true),
('barber_002', 'shop_001', 'Jordan', 'https://i.pravatar.cc/150?u=jordan', 'active', 35.00, ARRAY['Coupe classique', 'Rasage'], '{"monday": {"start": "09:00", "end": "19:00", "isWorking": true}, "tuesday": {"start": "09:00", "end": "19:00", "isWorking": true}, "wednesday": {"start": "09:00", "end": "19:00", "isWorking": true}, "thursday": {"start": "09:00", "end": "19:00", "isWorking": true}, "friday": {"start": "09:00", "end": "20:00", "isWorking": true}, "saturday": {"start": "10:00", "end": "18:00", "isWorking": true}, "sunday": {"start": "", "end": "", "isWorking": false}}', true),
('barber_003', 'shop_001', 'Tyler', 'https://i.pravatar.cc/150?u=tyler', 'pause', 38.00, ARRAY['Design', 'Coupe afro'], '{"monday": {"start": "10:00", "end": "20:00", "isWorking": true}, "tuesday": {"start": "10:00", "end": "20:00", "isWorking": true}, "wednesday": {"start": "10:00", "end": "20:00", "isWorking": true}, "thursday": {"start": "10:00", "end": "20:00", "isWorking": true}, "friday": {"start": "10:00", "end": "21:00", "isWorking": true}, "saturday": {"start": "11:00", "end": "19:00", "isWorking": true}, "sunday": {"start": "", "end": "", "isWorking": false}}', true)
ON CONFLICT ("id") DO NOTHING;

-- 4. Insert Services
INSERT INTO "services" ("id", "shopId", "name", "description", "price", "duration", "category", "color", "targetAge", "isActive")
VALUES
('service_001', 'shop_001', 'Coupe Homme', 'Coupe personnalisée avec finitions', 25.00, 30, 'Coupe', '#00FF9C', 'adult', true),
('service_002', 'shop_001', 'Dégradé', 'Dégradé précis à la tondeuse', 30.00, 35, 'Coupe', '#00D4FF', 'adult', true),
('service_003', 'shop_001', 'Barbe', 'Taille et façonnage de la barbe', 20.00, 20, 'Barbe', '#FF4D00', 'adult', true),
('service_004', 'shop_001', 'Coupe + Barbe', 'Pack complet coupe et barbe', 40.00, 50, 'Pack', '#8B5CF6', 'adult', true),
('service_005', 'shop_001', 'Rasage Traditionnel', 'Rasage à l''ancienne avec serviette chaude', 35.00, 40, 'Barbe', '#FF00FF', 'adult', true),
('service_006', 'shop_001', 'Soin Cheveux', 'Shampoing et soin nourrissant', 15.00, 15, 'Soin', '#10B981', 'both', true),
('service_007', 'shop_001', 'Coupe Enfant', 'Style adapté pour les moins de 12 ans', 15.00, 25, 'Coupe', '#F472B6', 'child', true)
ON CONFLICT ("id") DO NOTHING;

-- 5. Insert Clients
INSERT INTO "clients" ("id", "shopId", "name", "phone", "email", "avatar", "totalVisits", "totalSpent", "lastVisit", "loyaltyScore", "isVip", "isBlocked", "notes")
VALUES
('client_001', 'shop_001', 'Thomas Martin', '+33 6 12 34 56 78', 'thomas.martin@email.com', 'https://i.pravatar.cc/150?u=thomas', 24, 960.00, '2024-01-15', 95, true, false, 'Préfère Marcus'),
('client_002', 'shop_001', 'Lucas Bernard', '+33 6 23 45 67 89', 'lucas.bernard@email.com', 'https://i.pravatar.cc/150?u=lucas', 12, 420.00, '2024-01-20', 78, false, false, ''),
('client_003', 'shop_001', 'Emma Dubois', '+33 6 34 56 78 90', 'emma.dubois@email.com', 'https://i.pravatar.cc/150?u=emma', 8, 280.00, '2024-01-22', 65, false, false, 'Coupe courte'),
('client_004', 'shop_001', 'Hugo Petit', '+33 6 45 67 89 01', 'hugo.petit@email.com', 'https://i.pravatar.cc/150?u=hugo', 36, 1440.00, '2024-01-23', 100, true, false, 'VIP - Toujours le samedi'),
('client_005', 'shop_001', 'Léa Moreau', '+33 6 56 78 90 12', 'lea.moreau@email.com', 'https://i.pravatar.cc/150?u=lea', 3, 105.00, '2024-01-10', 30, false, false, 'Nouvelle cliente'),
('client_006', 'shop_001', 'Nathan Roux', '+33 6 67 89 01 23', 'nathan.roux@email.com', 'https://i.pravatar.cc/150?u=nathan', 18, 720.00, '2024-01-18', 85, false, false, ''),
('client_007', 'shop_001', 'Sophie Leroy', '+33 6 78 90 12 34', 'sophie.leroy@email.com', 'https://i.pravatar.cc/150?u=sophie', 6, 210.00, '2024-01-21', 50, false, true, 'No-show multiple')
ON CONFLICT ("shopId", "phone") DO NOTHING;

-- 6. Insert Queue Iterms
INSERT INTO "queueItems" ("id", "shopId", "clientId", "barberId", "position", "status", "estimatedWaitTime", "joinedAt")
VALUES
('queue_001', 'shop_001', 'client_001', 'barber_001', 1, 'in_progress', 0, NOW() - INTERVAL '30 minutes'),
('queue_002', 'shop_001', 'client_002', 'barber_002', 2, 'notified', 15, NOW() - INTERVAL '20 minutes'),
('queue_003', 'shop_001', 'client_003', NULL, 3, 'waiting', 35, NOW() - INTERVAL '15 minutes'),
('queue_004', 'shop_001', 'client_004', 'barber_001', 4, 'waiting', 55, NOW() - INTERVAL '10 minutes'),
('queue_005', 'shop_001', 'client_005', NULL, 5, 'waiting', 75, NOW() - INTERVAL '5 minutes')
ON CONFLICT ("id") DO NOTHING;

-- 7. Insert Queue Services (Many-to-Many)
INSERT INTO "queueServices" ("queueId", "serviceId")
VALUES
('queue_001', 'service_002'),
('queue_002', 'service_001'),
('queue_002', 'service_003'),
('queue_003', 'service_001'),
('queue_004', 'service_004'),
('queue_005', 'service_002')
ON CONFLICT ("queueId", "serviceId") DO NOTHING;

-- 8. Insert Products
INSERT INTO "products" ("id", "shopId", "name", "description", "price", "stock", "category", "image", "isActive")
VALUES
('prod_001', 'shop_001', 'Cire Matte Cyber', 'Fixation forte, aspect mat naturel. Parfum boisé.', 15.00, 24, 'Coiffage', 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=200', true),
('prod_002', 'shop_001', 'Huile Barbe Neon', 'Hydrate et adoucit les poils. Brilliance naturelle.', 18.00, 15, 'Entretien', 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=200', true),
('prod_003', 'shop_001', 'Shampoing Purifiant', 'Nettoyage en profondeur pour cuir chevelu sensible.', 12.00, 45, 'Soin', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=200', true)
ON CONFLICT ("id") DO NOTHING;

-- 9. Insert Promotions
INSERT INTO "promotions" ("id", "shopId", "name", "description", "discountType", "discountValue", "startDate", "endDate", "usageCount", "isActive")
VALUES
('promo_001', 'shop_001', 'Pack Weekend', '20% de réduction sur Coupe + Barbe', 'percentage', 20.00, '2024-01-01', '2024-12-31', 45, true),
('promo_002', 'shop_001', 'Nouveau Client', '10€ offerts sur la première visite', 'fixed', 10.00, '2024-01-01', '2024-12-31', 23, true),
('promo_003', 'shop_001', 'Fidélité VIP', '30% de réduction pour les clients VIP', 'percentage', 30.00, '2024-01-01', '2024-12-31', 67, true)
ON CONFLICT ("id") DO NOTHING;

ON CONFLICT ("id") DO NOTHING;

-- 10. Insert Appointments
INSERT INTO "appointments" ("id", "shopId", "clientId", "barberId", "startTime", "endTime", "status", "totalPrice", "isPaid", "createdAt", "notes")
VALUES
('apt_001', 'shop_001', 'client_006', 'barber_001', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour 30 minutes', 'confirmed', 25.00, false, NOW(), ''),
('apt_002', 'shop_001', 'client_007', 'barber_002', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 20 minutes', 'scheduled', 20.00, false, NOW(), ''),
('apt_003', 'shop_001', 'client_001', 'barber_003', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours 40 minutes', 'confirmed', 35.00, false, NOW(), 'Rasage complet')
ON CONFLICT ("id") DO NOTHING;

-- 11. Insert Appointment Services (Many-to-Many)
INSERT INTO "appointmentServices" ("appointmentId", "serviceId")
VALUES
('apt_001', 'service_001'),
('apt_002', 'service_003'),
('apt_003', 'service_005')
ON CONFLICT ("appointmentId", "serviceId") DO NOTHING;
