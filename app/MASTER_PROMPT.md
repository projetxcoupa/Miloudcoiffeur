# MASTER PROMPT — FRESHCUT X: Cyberpunk Barber Management System

> Use this prompt to instruct any AI coding agent to fully understand, rebuild, or extend the FRESHCUT X application. It covers every layer: tech stack, architecture, database, UI/UX, business logic, and design system.

---

## 1. PROJECT IDENTITY

**Name**: FRESHCUT X — Miloud Coiffeur  
**Type**: Full-Stack SaaS Web Application for Barber Shop Management  
**Language**: French (UI text, labels, CTAs are in French)  
**Domain**: Hair Salon / Barber Shop — Walk-in Queue + Appointment Booking + Admin Dashboard  
**Target Users**:
- **Clients** (public visitors who book appointments or join the live waitlist)
- **Barbers** (staff who manage their personal queue and schedule)
- **Managers / Super Admins** (shop owners who oversee operations, analytics, and settings)

---

## 2. TECH STACK (Exact Versions)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Language** | TypeScript | 5.9.3 |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Component Library** | Shadcn/UI (Radix primitives) | Latest |
| **Animations** | Framer Motion | 12.34.0 |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.562.0 |
| **Backend / Database** | Supabase (PostgreSQL + Realtime) | supabase-js 2.48.1 |
| **Auth** | Supabase SSR (@supabase/ssr) | 0.8.0 |
| **Forms** | React Hook Form + Zod | 7.70.0 / 4.3.5 |
| **Date Utilities** | date-fns | 4.1.0 |
| **Carousel** | Embla Carousel React | 8.6.0 |
| **Toasts / Notifications** | Sonner | 2.0.7 |
| **Drawer / Bottom Sheets** | Vaul | 1.1.2 |
| **Testing** | Vitest + Playwright | 4.0.18 / 1.58.2 |

---

## 3. APPLICATION ARCHITECTURE

### 3.1 Routing (Next.js App Router)

```
src/app/
├── page.tsx              → Landing Page (renders <LandingPageClient />)
├── book/page.tsx         → Booking Flow (renders <BookingFlowClient />)
├── login/page.tsx        → Admin Login (mock auth, password: "admin123", sets cookie "admin-session")
├── dashboard/page.tsx    → Admin Dashboard (renders <DashboardOverview />)
└── layout.tsx            → Root layout (fonts, metadata, providers)
```

### 3.2 Component Architecture

```
src/components/
├── landing/
│   └── LandingPageClient.tsx    → Full public-facing landing page
├── booking/
│   └── BookingFlowClient.tsx    → Multi-step booking wizard
├── dashboard/
│   └── DashboardOverview.tsx    → Admin command center
└── ui/                          → Shadcn/UI primitives (Button, Badge, Card, Dialog, etc.)
```

### 3.3 State Management
- **Client-side state**: React `useState` + `useEffect` hooks
- **Real-time data**: Custom `useRealtime<T>()` hook wrapping Supabase Realtime subscriptions
- **Mock data fallback**: `src/data/mockData.ts` provides `mockShop`, `mockProducts`, `mockBarbers`, etc.

### 3.4 Data Flow

```
[Supabase PostgreSQL] ←→ [Supabase Realtime] ←→ [useRealtime hook] ←→ [React Components]
                                                                            ↕
                                                                    [Mock Data Fallback]
```

---

## 4. DATABASE SCHEMA (Supabase PostgreSQL)

### 4.1 Core Tables

**`shops`** — Multi-tenant root entity
- `id` UUID PK
- `name` TEXT NOT NULL
- `address`, `phone`, `email` TEXT
- `status` ENUM (`open`, `break`, `closed`) DEFAULT `closed`
- `plan` ENUM (`free`, `pro`, `enterprise`) DEFAULT `free`
- `settings` JSONB (opening hours, notifications config)
- `created_at` TIMESTAMPTZ

**`users`** — Internal staff accounts
- `id` UUID PK
- `shopId` UUID FK → shops
- `email` TEXT UNIQUE NOT NULL
- `name` TEXT
- `role` ENUM (`super_admin`, `manager`, `barber`)
- `avatar` TEXT

**`barbers`** — Barber profiles (linked to users)
- `id` UUID PK
- `shopId` UUID FK → shops
- `name` TEXT NOT NULL
- `avatar` TEXT
- `status` ENUM (`active`, `pause`, `off`) DEFAULT `active`
- `commissionRate` DECIMAL DEFAULT 40
- `schedule` JSONB (per-day working hours)
- `specialties` TEXT[]
- `rating` DECIMAL

**`clients`** — Customer records
- `id` UUID PK
- `shopId` UUID FK → shops
- `name` TEXT NOT NULL
- `phone` TEXT NOT NULL
- `email` TEXT
- `loyaltyScore` INT DEFAULT 0
- `totalVisits` INT DEFAULT 0
- `totalSpent` DECIMAL DEFAULT 0
- `isVip` BOOLEAN DEFAULT false
- `isBlocked` BOOLEAN DEFAULT false
- `notes` TEXT

**`services`** — Available services catalog
- `id` UUID PK
- `shopId` UUID FK → shops
- `name` TEXT NOT NULL
- `description` TEXT
- `price` DECIMAL NOT NULL
- `duration` INT NOT NULL (minutes)
- `category` ENUM (`hair`, `beard`, `care`, `combo`)
- `ageGroup` ENUM (`adult`, `child`, `all`) DEFAULT `all`
- `isActive` BOOLEAN DEFAULT true

**`appointments`** — Scheduled bookings
- `id` UUID PK
- `shopId` UUID FK → shops
- `clientId` UUID FK → clients
- `barberId` UUID FK → barbers (nullable = "any available")
- `startTime` TIMESTAMPTZ NOT NULL
- `endTime` TIMESTAMPTZ
- `status` ENUM (`scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`)
- `totalPrice` DECIMAL
- `paymentMethod` ENUM (`cash`, `card`, `pending`)
- `notes` TEXT

**`appointmentServices`** — Junction: appointment ↔ services (M:N)
- `appointmentId` UUID FK → appointments
- `serviceId` UUID FK → services

**`queueItems`** — Live walk-in waitlist
- `id` UUID PK
- `shopId` UUID FK → shops
- `clientId` UUID FK → clients
- `barberId` UUID FK → barbers (nullable)
- `position` INT NOT NULL
- `status` ENUM (`waiting`, `notified`, `in_progress`, `done`, `cancelled`, `no_show`)
- `estimatedWaitTime` INT (minutes)
- `startedAt` TIMESTAMPTZ
- `completedAt` TIMESTAMPTZ
- `paymentMethod` ENUM (`cash`, `card`, `pending`)

**`queueServices`** — Junction: queueItem ↔ services (M:N)
- `queueItemId` UUID FK → queueItems
- `serviceId` UUID FK → services

**`products`** — Retail products for sale
- `id` UUID PK
- `shopId` UUID FK → shops
- `name` TEXT NOT NULL
- `category` TEXT
- `price` DECIMAL NOT NULL
- `image` TEXT
- `stock` INT DEFAULT 0

**`promotions`** — Marketing promotions
- `id` UUID PK
- `shopId` UUID FK → shops
- `title` TEXT NOT NULL
- `discount` DECIMAL
- `startDate`, `endDate` TIMESTAMPTZ
- `isActive` BOOLEAN DEFAULT true

### 4.2 Entity Relationships

```
SHOPS 1──∞ USERS
SHOPS 1──∞ BARBERS
SHOPS 1──∞ CLIENTS
SHOPS 1──∞ SERVICES
SHOPS 1──∞ PRODUCTS
SHOPS 1──∞ PROMOTIONS

CLIENTS 1──∞ APPOINTMENTS
BARBERS 1──∞ APPOINTMENTS
APPOINTMENTS ∞──∞ SERVICES  (via appointmentServices)

CLIENTS 1──∞ QUEUE_ITEMS
BARBERS 1──∞ QUEUE_ITEMS
QUEUE_ITEMS ∞──∞ SERVICES  (via queueServices)
```

---

## 5. USER ROLES & PERMISSIONS

| Role | Queue | Appointments | Clients | Analytics | Settings | Users |
|------|-------|-------------|---------|-----------|----------|-------|
| **Super Admin** | Full | Full | Full | Full | Full | Full |
| **Manager** | Full | Full | Full | Read | Limited | Read |
| **Barber** | Own Only | Own Only | Read | None | None | None |

**Client Access**: Public (no auth required for landing + booking). Optional phone-based OTP for returning clients.

---

## 6. BUSINESS RULES

### 6.1 Queue Management
- Status flow: `waiting` → `notified` → `in_progress` → `done`
- Alternative exits: `cancelled`, `no_show`
- Notification trigger: Staff clicks "Notify" ~10-15 min before client's turn
- When queue is empty and client is first: estimated wait = 1 minute (not default 15)
- Position is auto-calculated based on existing items

### 6.2 Appointments
- Double-booking prevention: Check `barberId` + `startTime` + `duration` overlap
- Optional 5-min buffer between appointments
- Status flow: `scheduled` → `confirmed` → `in_progress` → `completed`

### 6.3 Financials
- Commission formula: `Barber Revenue = Total Price × (commissionRate / 100)`
- Shop keeps remainder
- Product sales: 100% to shop (configurable)

### 6.4 Loyalty System
- `loyaltyScore` increments per visit
- `isVip` triggers at threshold (configurable)
- `isBlocked` prevents bookings (for repeat no-shows)

### 6.5 Barber Availability
- `active`: Accepting clients
- `pause`: Temporary break, no new queue additions
- `off`: Clocked out
- `schedule` JSONB: Per-day hours (e.g., `{ "monday": { "start": "09:00", "end": "19:00", "isWorking": true } }`)

---

## 7. UI/UX SPECIFICATION — DESIGN SYSTEM

### 7.1 Visual Identity: "Cyberpunk Barber"

**Core Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `cyber-dark` | `#0a0f18` | Page backgrounds |
| `cyber-gray` | `#1a1f2e` | Card backgrounds, secondary surfaces |
| `cyber-neon` | `#00ff9c` | Primary accent, CTAs, status indicators, glow effects |
| `cyber-cyan` | `#00d4ff` | Secondary accent, links, info elements |
| `cyber-purple` | `#bc13fe` | Tertiary accent, section labels |
| `cyber-orange` | `#ff4d00` | Warnings, "in progress" status, price highlights |

**Typography:**
- Headings: `font-black uppercase tracking-tight` (Inter or system sans-serif)
- Body: `text-white/60` for secondary text, `text-white` for primary
- Monospace labels: `font-mono text-sm uppercase tracking-widest` for section tags (e.g., `// CATALOGUE`)

**Effects:**
- **Glassmorphism**: `bg-black/40 backdrop-blur-md border border-white/5` (class: `glass-card`)
- **Neon Glow**: `shadow-[0_0_15px_rgba(0,255,156,0.3)]` on buttons and active elements
- **Grid Background**: Subtle CSS grid lines with `rgba(0,255,156,0.03)` + radial top glow
- **Text Gradient**: `bg-gradient-to-r from-cyber-neon to-cyber-cyan` with `-webkit-background-clip: text`

**Animations:**
- Framer Motion for page transitions (`initial={{ opacity: 0, y: 20 }}`)
- `animate-pulse` for status badges
- `animate-bounce` for map pin
- Hover: `group-hover:scale-110`, `hover:-translate-y-2`, `transition-all duration-500`
- Gallery marquee: `motion.div animate={{ x: "-50%" }}` with `repeat: Infinity, ease: "linear", duration: 40`

---

### 7.2 Page: Landing Page (`LandingPageClient.tsx`)

**Purpose**: High-conversion marketing page. Convince visitors to book.

**Sections (top to bottom):**

1. **Navbar** (fixed, glassmorphism)
   - Logo: "Miloud **Coiffeur**" (Coiffeur in `text-cyber-neon`)
   - Links: Services, Produits, À Propos, Contact
   - CTA: "Réserver" button (`btn-neon`)
   - Mobile: Hamburger → full-screen slide-in drawer

2. **Hero** (min-height: 100vh, flex center)
   - Live status badge: Pulsing dot + "Salon Ouvert" / "En Pause" / "Salon Fermé"
   - Headline: `text-6xl md:text-8xl lg:text-9xl font-black` → "Dominez **Votre Style**" (gradient text)
   - Subtext: `text-xl text-white/60`
   - Two CTAs: "Prendre RDV" (neon) + "Voir les Tarifs" (outline)
   - Background: Two large blurred gradient circles (neon + cyan)

3. **Stats Bar** (border-y, glass backdrop)
   - 4-column grid: "4.9/5 Note Clients" | "5k+ Coupes" | "3 Barbiers Pro" | "0min Attente"

4. **Services Grid** (3 columns)
   - Card 1: "Coupe Homme" — 1000 DZD / 30 min (default style)
   - Card 2: "Coupe + Barbe" — 1500 DZD / 50 min (**featured**: `border-cyber-neon`, "Best Seller" badge, `hover:shadow-neon hover:-translate-y-2`)
   - Card 3: "Soin Visage" — 1200 DZD / 40 min (orange accent)
   - Each card: Icon (16×16, rounded-2xl), Title, Description, Price + Duration footer

5. **Gallery** (infinite marquee)
   - 5 images from Unsplash (barber cuts), duplicated for seamless loop
   - `aspect-[3/4]`, `rounded-3xl`, hover reveals category label + neon underline

6. **Products** (2×2 grid on mobile, 4-col on desktop)
   - Product cards: Square image, hover overlay with ShoppingBag icon, Name + Category + Price

7. **About & Location** (2-col grid)
   - Left: Square image with `rotate-2 hover:rotate-0` + floating "99% Satisfait" glass card
   - Right: Section title "Redéfinir **la tradition**", description, contact info (MapPin, Phone, Clock icons)

8. **Map** (full-width, 400-500px height)
   - Grayscale inverted Google Maps iframe (`opacity-40`)
   - Overlay: Bouncing MapPin icon + "P6QW+R74, Ain El Turk"

9. **CTA Footer** (centered)
   - "Prêt pour votre **prochaine mise à jour ?**"
   - Giant "RÉSERVER MAINTENANT" button (h-24, text-2xl)

10. **Footer** (bg-black)
    - Logo + Copyright + Legal links (Mentions Légales, Privacy, Cookies)

---

### 7.3 Page: Booking Flow (`BookingFlowClient.tsx`)

**Purpose**: Guide clients through service selection and booking in 6 steps.

**Global UI:**
- Progress bar at top (neon line, percentage-based)
- Back button on each step
- Dark background consistent with landing page

**Steps:**

| Step | Title | UI Elements |
|------|-------|-------------|
| 1 | Age Selection | Two large cards: "Adulte" (User icon) / "Enfant" (Heart icon). Card click advances. |
| 2 | Service Selection | Multi-select list. Each row: Name, Duration badge, Price. Running total at bottom. Services filtered by age group. |
| 3 | Barber Selection | "Premier Disponible" option (highlighted). List of barbers: Avatar, Name, Rating (e.g., "4.9/5"). |
| 4 | Booking Type | Two options: **"File d'attente"** (shows live estimated wait "~25 MIN") or **"Rendez-vous fixe"** (reveals iOS-style Wheel Date/Time Picker). |
| 5 | Contact Details | Form: Name (text input), Phone (10-digit input). Order recap card: services list, barber name, total price. |
| 6 | Success | CheckCircle animation. Confirmation message. Estimated time or appointment time. "Activer les notifications" button. "Retour à l'accueil" link. |

**Data Integration:**
- Services fetched from Supabase (fallback: mockData)
- Barbers fetched from Supabase with `status = 'active'`
- Queue data via `useRealtime('queueItems')`
- On submit: Inserts into `appointments` or `queueItems` + `queueServices`/`appointmentServices`

---

### 7.4 Page: Admin Dashboard (`DashboardOverview.tsx`)

**Purpose**: Real-time command center for shop operations.

**Layout:**
- Optional sidebar (managed by `App.tsx`)
- Main content area with animated sections (Framer Motion stagger)

**Sections:**

1. **Welcome Banner**
   - "Bonjour, [Name] !" + "En ligne" status dot
   - Summary text: "[X] clients en attente • Prochain RDV à [time]"

2. **KPI Grid** (4 columns)
   - Revenue: "12,450 DZD" + "+8%" trend (green arrow) + "vs hier"
   - Clients: "23" + "+12%" trend
   - Queue: "4" + "~15 min avg"
   - Appointments: "8" + "aujourd'hui"
   - Each card: Glass background, gradient left border, icon, click navigates to detail view

3. **Live Queue Widget**
   - Top 4 items from `queueItems` ordered by position
   - Each row: Position badge, Client name, Service name, Barber name, Status badge
   - Status colors: `waiting` = yellow, `notified` = blue, `in_progress` = neon green
   - Quick actions per item (Start, Notify, Cancel)

4. **Next Appointment Card**
   - Client avatar, name, time, services list
   - "Confirmer" / "Annuler" action buttons

5. **Barber Performance**
   - Mini leaderboard: Barber name + clients served today
   - Progress bars (percentage of daily target)

6. **Charts** (2-column grid)
   - Left: Area chart — "Revenus (30 jours)" — gradient green fill
   - Right: Bar chart — "Clients par jour" — blue bars
   - Both use Recharts with custom cyberpunk styling

7. **Quick Actions** (bottom row or floating)
   - "Nouveau Client" (UserPlus icon)
   - "Nouvelle Réservation" (Calendar icon)
   - "Ajouter à la file" (ListPlus icon)
   - "Clôturer la caisse" (DollarSign icon)

---

## 8. RESPONSIVE BEHAVIOR

| Breakpoint | Behavior |
|------------|----------|
| **Mobile** (< 768px) | Stack layouts, hamburger menu, bottom sheets (Vaul), single-column grids |
| **Tablet** (768-1024px) | 2-column grids, collapsible sidebar |
| **Desktop** (> 1024px) | Full sidebar, 3-4 column grids, hover effects active |

---

## 9. KEY CUSTOM CSS CLASSES

```css
.grid-bg        → Cyberpunk grid background with radial neon glow
.glass-card      → bg-black/40 backdrop-blur-md border-white/5 rounded-2xl
.glass-card-strong → bg-black/60 backdrop-blur-xl border-white/10
.btn-neon        → bg-cyber-neon text-cyber-dark font-bold shadow-neon
.btn-outline-neon → border-2 border-cyber-neon text-cyber-neon
.input-cyber     → bg-black/30 border-white/10 focus:border-cyber-neon/50
.sidebar-item    → flex items-center gap-3 px-4 py-3 rounded-xl
.status-waiting  → bg-yellow-500/10 text-yellow-500
.status-in_progress → bg-cyber-orange/10 text-cyber-orange
.status-completed → bg-cyber-neon/10 text-cyber-neon
.status-cancelled → bg-red-500/10 text-red-500
.text-gradient   → linear-gradient(to right, #00FF9C, #00D4FF) with background-clip: text
```

---

## 10. REAL-TIME FEATURES

- **Supabase Realtime** subscriptions on: `shops`, `queueItems`, `appointments`, `barbers`
- **Custom Hook**: `useRealtime<T>(tableName, fallbackData)` — subscribes to INSERT/UPDATE/DELETE events
- **Use Cases**:
  - Shop status changes (open/closed) reflect instantly on landing page hero badge
  - Queue updates reflect in dashboard and client booking flow (estimated wait time)
  - Appointment confirmations/cancellations update dashboard KPIs

---

## 11. LOCATION & CONTACT DATA

- **Shop Name**: Miloud Coiffeur
- **Address**: rue n° .., Paradis, Ain El-Turk – Oran, Algeria
- **Google Maps Plus Code**: P6QW+R74, Ain El Turk
- **Phone**: +213 771 54 60 88
- **Hours**: Sunday 08:00-20:00, Monday CLOSED, Tuesday-Thursday 08:00-20:00
- **Currency**: DZD (Algerian Dinar)

---

## 12. INSTRUCTIONS FOR AI AGENT

When building or modifying this application:

1. **Always use the cyberpunk design system** — dark backgrounds, neon accents, glassmorphism cards, uppercase bold headings
2. **All UI text must be in French** — including button labels, error messages, form placeholders
3. **Use `glass-card` and `btn-neon` utility classes** — they are defined in `globals.css`
4. **Use Lucide React for all icons** — never use emojis as UI elements
5. **Use Framer Motion** for page transitions and micro-animations
6. **Use Recharts** for all data visualizations with cyberpunk-themed colors
7. **Use Supabase** for all data operations — prefer realtime subscriptions over polling
8. **Preserve the multi-step booking flow** — age → service → barber → type → details → success
9. **Maintain responsive behavior** — mobile-first, stack on small screens, grid on large
10. **Currency is DZD** — format prices as "1000 DZD", "1500 DZD", etc.
