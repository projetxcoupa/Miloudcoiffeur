# 📋 FRESHCUT X — Plan de Corrections & Améliorations

> **Source** : Analyse CTO / investisseur SaaS de la conversation  
> **Date** : 22 Février 2026  
> **Projet** : FRESHCUT X — Miloud Coiffeur  
> **Objectif** : Passer de **prototype fonctionnel** → **SaaS production-ready vendable**

---

## 📊 Résumé de l'Évaluation

| Critère | Note | État |
|---------|------|------|
| Architecture | 9.5/10 | ✅ Très solide |
| UX | 9/10 | ✅ Très bon |
| SaaS readiness | 8.5/10 | ⚠️ Améliorations nécessaires |
| Scalabilité | 9/10 | ✅ Bonne base |
| Différenciation | 9/10 | ✅ Unique (Queue + RDV) |
| **Production ready** | **~70%** | ⚠️ **Corrections obligatoires** |

---

## ✅ Points Forts Confirmés (Ce qui marche bien)

- ✔ Architecture multi-tenant claire (`shopId` partout)
- ✔ Séparation Queue / Appointments propre
- ✔ Design system cyberpunk cohérent
- ✔ UX booking flow logique (6 étapes optimisées conversion)
- ✔ Double système différenciant : RDV fixe + File d'attente live
- ✔ Dashboard = mini ERP spécialisé barber
- ✔ Stack moderne : Next.js + React 19 + Supabase + Tailwind + Shadcn
- ✔ Realtime Supabase natif (pas de polling)

---

## 🔴 CORRECTIONS CRITIQUES (Obligatoires avant production)

### 1. 🔐 Auth — Remplacer le Login Mock

**Problème actuel** :
```typescript
// src/app/login/page.tsx - Ligne 16
if (password === 'admin123') {
    document.cookie = "admin-session=true; path=/";
}
```

**Risques** :
- Pas de vraie authentification
- Cookie non sécurisé, côté client
- Aucune isolation des données par utilisateur
- Impossible de savoir quel barber/manager est connecté

**Correction** :
- Implémenter Supabase Auth avec email/password
- Utiliser `@supabase/ssr` pour la gestion des sessions côté serveur
- Lier les utilisateurs à la table `users` existante (rôle, shopId)
- Protéger les routes dashboard via middleware Next.js

**Fichiers concernés** :
- `src/app/login/page.tsx` — Refonte complète
- `src/middleware.ts` — Vérification session Supabase
- `src/utils/supabase/` — Configuration client/serveur

---

### 2. 🛡️ RLS (Row Level Security) — Renforcement Obligatoire

**Problème actuel** :
```sql
-- supabase/migrations/01_schema.sql - Ligne 199-200
CREATE POLICY "Allow all for authenticated users" ON "queueItems" FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON "appointments" FOR ALL TO authenticated USING (true);
```
- RLS activé sur toutes les tables ✅
- Mais les policies sont trop permissives (tout le monde voit tout)
- Les autres tables n'ont AUCUNE policy → données inaccessibles

**Correction** :
- Ajouter des policies strictes par `shopId` sur TOUTES les tables :
```sql
-- Exemple pour chaque table :
CREATE POLICY "shop_isolation" ON "appointments"
  FOR ALL TO authenticated
  USING ("shopId" = auth.jwt() ->> 'shopId');
```
- Appliquer le même pattern sur : `shops`, `users`, `barbers`, `clients`, `services`, `products`, `promotions`, `queueItems`

**Fichiers concernés** :
- `supabase/migrations/01_schema.sql` — Ajout policies
- Nouvelle migration `03_rls_policies.sql` recommandée

---

### 3. ⚡ Realtime — Filtrage par shopId Manquant

**Problème actuel** :
```typescript
// src/hooks/useRealtime.ts - Ligne 30-32
.on(
    'postgres_changes',
    { event: '*', schema: 'public', table },
```
- Écoute TOUTES les lignes de la table, toutes shops confondues
- Charge réseau excessive en multi-tenant
- Fuite de données potentielle entre shops

**Correction** :
```typescript
.on(
    'postgres_changes',
    { event: '*', schema: 'public', table, filter: `shopId=eq.${shopId}` },
```
- Modifier `useRealtime` pour accepter un paramètre `shopId`
- Toujours filtrer les subscriptions par shop

**Fichiers concernés** :
- `src/hooks/useRealtime.ts` — Ajouter paramètre `shopId` + filter

---

### 4. 🏎️ Race Condition — Position Queue

**Problème** :
- Si deux clients s'inscrivent simultanément → même `position`
- Pas de transaction atomique pour le calcul de position

**Correction** :
```sql
-- Utiliser SELECT FOR UPDATE dans une RPC Supabase
CREATE OR REPLACE FUNCTION get_next_queue_position(p_shop_id TEXT)
RETURNS INTEGER AS $$
DECLARE next_pos INTEGER;
BEGIN
    SELECT COALESCE(MAX("position"), 0) + 1 INTO next_pos
    FROM "queueItems"
    WHERE "shopId" = p_shop_id
    FOR UPDATE;
    RETURN next_pos;
END;
$$ LANGUAGE plpgsql;
```

**Fichiers concernés** :
- Nouvelle migration `04_queue_rpc.sql`
- `src/components/booking/BookingFlowClient.tsx` — Appeler la RPC au lieu d'insérer directement

---

### 5. 📅 Double Booking — Logique Incomplète

**Problème** :
- Le check overlap vérifie `barberId + startTime + duration`
- Mais ne prend pas en compte :
  - `endTime` basé sur la somme des durées de services multiples
  - Le buffer optionnel de 5 min entre RDV
  - La gestion des fuseaux horaires (timezone)

**Correction** :
```sql
-- Vérification anti-overlap robuste
CREATE OR REPLACE FUNCTION check_booking_overlap(
    p_barber_id TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ,
    p_exclude_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;
```
- Calculer `endTime = startTime + SUM(services.duration) + buffer(5min)`

**Fichiers concernés** :
- Nouvelle migration `05_booking_functions.sql`
- `src/components/booking/BookingFlowClient.tsx` — Logique de soumission

---

### 6. 💰 Commission — Historisation Manquante

**Problème** :
- `commissionRate` est sur la table `barbers`
- Si le taux change → tous les anciens RDV changent rétroactivement
- Ex: barbier passe de 40% à 50% → ses anciens revenus recalculés à 50%

**Correction** :
- Ajouter `commissionRate` snapshot dans `appointments` :
```sql
ALTER TABLE "appointments" ADD COLUMN "commissionRate" DECIMAL(5,2);
```
- Au moment de la création du RDV, copier le taux actuel du barbier
- Le calcul historique utilise le taux snapshot, pas le taux actuel

**Fichiers concernés** :
- `supabase/migrations/01_schema.sql` ou nouvelle migration
- `src/components/booking/BookingFlowClient.tsx` — Stocker le taux
- `src/components/dashboard/AnalyticsDashboard.tsx` — Lire le taux snapshot

---

## 🟡 AMÉLIORATIONS IMPORTANTES (Niveau Pro)

### 7. 📊 Indexes DB Manquants

**Problème** : Les requêtes fréquentes n'ont pas d'index optimisés.

**Indexes existants** : `shopId` sur chaque table ✅

**Indexes manquants** :
```sql
-- Performance critique
CREATE INDEX idx_queue_shop_position ON "queueItems" ("shopId", "position");
CREATE INDEX idx_appointments_barber_time ON "appointments" ("barberId", "startTime");
CREATE INDEX idx_clients_shop_phone ON "clients" ("shopId", "phone");
CREATE INDEX idx_appointments_startTime ON "appointments" ("startTime");
CREATE INDEX idx_queueItems_status ON "queueItems" ("status");
CREATE INDEX idx_queueItems_joinedAt ON "queueItems" ("joinedAt");
```

**Impact** : Sans ces index, les requêtes dashboard deviennent lentes avec >1000 enregistrements.

---

### 8. 💳 Table Transactions — Comptabilité Absente

**Problème** : Pas de traçabilité financière, pas de gestion refund, pas de caisse journalière.

**Correction** : Créer la table `transactions` :
```sql
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "shopId" TEXT REFERENCES "shops"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL, -- 'service', 'product', 'refund'
    "amount" DECIMAL(10,2) NOT NULL,
    "barberId" TEXT REFERENCES "barbers"("id") ON DELETE SET NULL,
    "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL,
    "queueItemId" TEXT REFERENCES "queueItems"("id") ON DELETE SET NULL,
    "paymentMethod" payment_method,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

### 9. ⏱️ Queue Estimation — Formule Floue

**Problème** : `estimatedWaitTime = auto` sans formule définie.

**Correction** — Formule claire :
```
estimatedWait = (nb_personnes_avant × durée_moyenne_service) ÷ nb_barbiers_actifs
```
- `nb_personnes_avant` = COUNT queueItems WHERE position < ma_position AND status = 'waiting'
- `durée_moyenne_service` = AVG(services.duration) pour les services sélectionnés
- `nb_barbiers_actifs` = COUNT barbers WHERE status = 'active'

---

### 10. 📱 Mobile UX — Wheel Picker SSR

**Problème** :
- iOS-style Wheel Date/Time Picker peut causer un hydration mismatch avec SSR
- Configuration `date-fns` locale FR nécessaire

**Correction** :
- Wraper le Wheel Picker dans un composant `dynamic()` avec `ssr: false`
- Configurer `date-fns/locale/fr` pour tous les formats de date

---

## 🟢 VERSIONS STACK — Points à Surveiller

| Package | Version actuelle | Observation |
|---------|-----------------|-------------|
| Next.js | 16.1.6 | ⚠️ Vérifier que c'est une version stable officielle |
| React | 19.2.4 | ✅ OK |
| date-fns | 4.1.0 | ⚠️ v3 est la base stable largement adoptée |
| Zod | 4.3.5 | ⚠️ Vérifier compatibilité (v3 est mainstream) |

**Action** : Valider la cohérence des versions dans `package.json` et tester `npm audit`.

---

## 🚀 ROADMAP — 3 Phases

### Phase 1 — Production Ready (Priorité MAX)
| # | Tâche | Priorité | Complexité |
|---|-------|----------|------------|
| 1 | Auth Supabase réelle (remplacer mock) | 🔴 Critique | Haute |
| 2 | RLS policies strictes par shopId | 🔴 Critique | Moyenne |
| 3 | Realtime filtré par shopId | 🔴 Critique | Faible |
| 4 | Transaction atomique queue position (RPC) | 🔴 Critique | Moyenne |
| 5 | Double booking SQL robuste | 🔴 Critique | Moyenne |
| 6 | Commission rate snapshot | 🟡 Important | Faible |
| 7 | Index DB performants | 🟡 Important | Faible |
| 8 | Table transactions | 🟡 Important | Moyenne |
| 9 | Formule estimation queue | 🟡 Important | Faible |
| 10 | Fix Wheel Picker SSR | 🟢 Nice-to-have | Faible |

### Phase 2 — SaaS Expansion
- Multi-shop onboarding
- Paiement **cash uniquement** (pas de paiement en ligne)
- Feature flags par plan
- Notifications push via **PWA** (Service Worker)
- Logs d'activité
- Admin global multi-tenant

### Phase 3 — Killer Features
- IA prédictive (temps d'attente)
- IA recommandation staffing
- Reconnaissance client fidélité
- Heatmap horaires rentables
- ~~Paiement en ligne (Chargily pour Algérie)~~ → **Cash uniquement**

---

## 📁 Fichiers Impactés — Résumé

| Fichier | Modifications |
|---------|--------------|
| [login/page.tsx](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/src/app/login/page.tsx) | Refonte auth complète → Supabase Auth |
| [middleware.ts](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/src/middleware.ts) | Vérification session Supabase |
| [useRealtime.ts](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/src/hooks/useRealtime.ts) | Ajouter filtre `shopId` |
| [01_schema.sql](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/supabase/migrations/01_schema.sql) | + Column `commissionRate` sur appointments |
| **NOUVEAU** `03_rls_policies.sql` | Policies RLS strictes toutes tables |
| **NOUVEAU** `04_queue_rpc.sql` | RPC position atomique |
| **NOUVEAU** `05_booking_functions.sql` | Fonction anti-overlap |
| **NOUVEAU** `06_transactions.sql` | Table transactions + indexes |
| [BookingFlowClient.tsx](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/src/components/booking/BookingFlowClient.tsx) | Logique overlap + RPC queue |
| [AnalyticsDashboard.tsx](file:///c:/Users/lenovo/Desktop/COIF%20FIAL/Kimi_Agent_FRESHCUT%20X%20Cyberpunk%20Barber/app/src/components/dashboard/AnalyticsDashboard.tsx) | Commission snapshot |

---

## 🎯 Conclusion

FRESHCUT X est **architecturalement solide** et **bien pensé**, mais pour devenir un **SaaS vendable à 8 000 – 15 000 DZD/mois** en Algérie, les **6 corrections critiques** doivent être implémentées en priorité. Le reste (Phase 2 & 3) peut être planifié sur 3-6 mois après le lancement initial.
