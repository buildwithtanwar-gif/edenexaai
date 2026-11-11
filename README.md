# EDENEXA — Full-Stack Web Engineering Agency Platform

> **Build Smarter. Grow Faster.**
> High-performance web development studio for growing businesses, startups, and service providers.

---

## 🚀 Overview

Edenexa is a production-ready agency website and content management platform built with modern web technologies:
- **Public Website:** Responsive Light Theme (#3A0F34 Deep Plum, #DDE3E8 Light Grey, #EAAA00 Golden Yellow), service showcases, portfolio gallery, transparent dual-tier pricing, promo coupons, interactive FAQ accordion, honeypot-protected inquiry form with direct Supabase persistence, and direct WhatsApp communication.
- **Backend & Database:** Live Supabase PostgreSQL database with Row Level Security (RLS), UUID primary keys, and exact schema alignment with `supabase/LIVE_SCHEMA.md`.
- **Admin Panel & Authentication:** Dedicated `/admin/login`, role-based verification against `user_roles` with `role = 'admin'`, live dashboard analytics, lead & inquiry tracking with private admin notes, and verified CRUD for services, pricing, projects, FAQs, coupons, and site settings.
- **Single Source of Truth:** Supabase PostgreSQL is the only data store for all business data. Client localStorage is restricted solely to the first-visit intro sequence flag (`edenexa_intro_shown`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Three.js (Lazy-loaded) |
| **Backend & DB** | Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security) |
| **API Client** | `@supabase/supabase-js` v2 |
| **Security** | Public anon key only; `user_roles` table check; strict RLS; no service-role key in client |

---

## 🗄️ Database Table & Column Mapping (Live Schema)

The application matches the live Supabase database schema documented in `supabase/LIVE_SCHEMA.md`:

| Table | Columns in Database | Application Usage |
|---|---|---|
| `inquiries` | `id`, `name`, `email`, `phone`, `service`, `budget`, `message`, `status`, `priority`, `admin_notes`, `created_at`, `business_name` | Client name, business name, phone/WhatsApp, email, selected service, budget, message (with `[Category: ...]`), status (`new`, `contacted`, `in_progress`, `completed`, `rejected`), priority, private admin notes |
| `services` | `id`, `title`, `slug`, `description`, `price` (text), `features`, `active`, `sort_order`, `created_at` | Service offerings, bullet inclusions, price display string, active toggle, sort order |
| `pricing_packages` | `id`, `name`, `price` (numeric), `description`, `features`, `highlighted`, `active`, `sort_order`, `created_at` | Package name, numeric price (`null` for "Let's Discuss"), description, inclusions, highlighted badge, active toggle |
| `projects` | `id`, `title`, `slug`, `description`, `image_url`, `project_url`, `category`, `featured`, `active`, `sort_order`, `created_at` | Portfolio title, category, description, project URL, image URL, featured badge, active status |
| `faqs` | `id`, `question`, `answer`, `active`, `sort_order`, `created_at` | Frequently asked questions, answers, active toggle, sort order |
| `site_settings` | `key`, `value` (jsonb), `updated_at` | Key-value store for contact settings, branding, working hours, and social profiles |
| `coupons` | `id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_value`, `max_discount`, `valid_from`, `valid_until`, `usage_limit`, `times_used`, `active`, `created_at`, `updated_at` | Promo and referral discounts |
| `user_roles` | `user_id`, `role`, `created_at` | RBAC admin verification (`role = 'admin'`) |
| `profiles` | `id`, `full_name`, `created_at` | User profile record linked to `auth.users(id)` |

---

## 🔐 Admin Account Setup

To securely set up your admin account:

1. Open your **Supabase Project Dashboard**.
2. Navigate to **Authentication** &rarr; **Users** &rarr; **Add User** &rarr; **Create User**.
3. Enter your administrative email and password.
4. Copy the generated **User UID** (UUID).
5. Open the **SQL Editor** in Supabase and run:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_UID_HERE', 'admin')
   ON CONFLICT (user_id) DO NOTHING;
   ```
6. Navigate to `/admin/login` on your Edenexa deployment.
7. Sign in with your administrative credentials.

---

## ⚙️ Environment Variables (`.env`)

```env
# Supabase Project REST API URL (e.g. https://[PROJECT_ID].supabase.co)
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co

# Supabase Public Anon Key (Safe for frontend clients)
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

> ⚠️ **CRITICAL SECURITY RULE:** Never put the Supabase `service_role` key in frontend code or client-accessible environment variables. Only use the public `anon` key.

---

## 💻 Local Development & Build Commands

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript checks and linting
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
