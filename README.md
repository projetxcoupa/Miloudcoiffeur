# FRESHCUT X - Cyberpunk Barber Management System

FRESHCUT X is a premium, high-performance barber shop management platform designed with a cyberpunk aesthetic. It provides tools for queue management, appointment scheduling, client CRM, and business analytics.

## 🗄️ Database Documentation

The system is designed for a relational database (recommended: **PostgreSQL**). Below is the schema documentation derived from the core data models.

### 1. Core Entities & Tables

#### `shops`
Global shop settings and identity.
- `id` (UUID, PK): Unique identifier.
- `name` (String): Business name.
- `plan` (Enum): 'starter', 'pro', or 'elite'.
- `address` (Text): Physical location.
- `phone` (String): Contact number.
- `is_open` (Boolean): Current status.
- `created_at` (Timestamp).

#### `users`
Internal staff/manager access accounts.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `name` (String).
- `email` (String, Unique).
- `role` (Enum): 'super_admin', 'manager', 'barber'.
- `avatar` (String, Optional).
- `is_active` (Boolean).

#### `barbers`
Service providers in the shop.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `user_id` (UUID, FK -> users.id, Optional): Link to user account.
- `name` (String).
- `avatar` (String, Optional).
- `status` (Enum): 'active', 'pause', 'off'.
- `commission_rate` (Decimal): Percentage commission.
- `specialties` (JSONB/Array): List of skills.
- `schedule` (JSONB): Working hours for each day.
- `is_active` (Boolean).

#### `clients`
Customer CRM data.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `name` (String).
- `phone` (String, Unique within shop).
- `email` (String, Optional).
- `avatar` (String, Optional).
- `total_visits` (Integer): Counter for visits.
- `total_spent` (Decimal): Revenue generated.
- `last_visit` (Timestamp, Optional).
- `loyalty_score` (Integer).
- `is_vip` (Boolean).
- `is_blocked` (Boolean).
- `notes` (Text, Optional).

#### `services`
Menu of treatments offered.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `name` (String).
- `description` (Text, Optional).
- `price` (Decimal).
- `duration` (Integer): Time in minutes.
- `category` (String).
- `color` (String): Hex code for UI representation.
- `is_active` (Boolean).

#### `appointments`
Scheduled bookings.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `client_id` (UUID, FK -> clients.id).
- `barber_id` (UUID, FK -> barbers.id).
- `start_time` (Timestamp).
- `end_time` (Timestamp).
- `status` (Enum): 'scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled'.
- `total_price` (Decimal).
- `is_paid` (Boolean).
- `payment_method` (Enum): 'cash', 'card', 'other'.
- `notes` (Text, Optional).

#### `queue_items`
Real-time walk-in queue.
- `id` (UUID, PK).
- `shop_id` (UUID, FK -> shops.id).
- `client_id` (UUID, FK -> clients.id).
- `barber_id` (UUID, FK -> barbers.id, Optional).
- `position` (Integer).
- `status` (Enum): 'waiting', 'notified', 'in_progress', 'done', 'cancelled'.
- `estimated_wait_time` (Integer): Minutes.
- `joined_at` (Timestamp).
- `started_at` (Timestamp, Optional).
- `completed_at` (Timestamp, Optional).

### 2. Supporting Tables

#### `appointment_services` / `queue_services`
Many-to-many relationships between bookings/queue and services.
- `booking_id` (FK).
- `service_id` (FK).

#### `notifications`
System alerts and reminders.
- `shop_id`, `recipient_id`, `type`, `title`, `message`, `is_read`, `sent_at`.

#### `promotions`
Discount management.
- `shop_id`, `name`, `discount_type`, `discount_value`, `start_date`, `end_date`, `is_active`.

#### `products`
Retail inventory.
- `shop_id`, `name`, `price`, `stock`, `category`, `is_active`.

## 🛠️ Tech Stack
- **Frontend**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS + Shadcn UI.
- **State Management**: React Hooks + Context.
- **Proposed Backend**: Node.js / PostgreSQL.
