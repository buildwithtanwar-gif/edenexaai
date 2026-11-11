# Live Supabase Database Schema

This document represents the **SOURCE OF TRUTH** for the Edenexa live database tables. Do not alter or drop these tables.

---

## 1. `inquiries`
Client and visitor project inquiries submitted through the website.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | Primary key (default `gen_random_uuid()`) |
| `name` | text | NO | Client full name |
| `business_name` | text | YES | Client company or organization name |
| `email` | text | YES | Client email address |
| `phone` | text | NO | WhatsApp / Phone number |
| `service` | text | YES | Selected service / package |
| `budget` | text | YES | Estimated budget range |
| `message` | text | NO | Requirements and inquiry details (includes `[Category: ...]`) |
| `status` | text | NO | Allowed values: `'new'`, `'contacted'`, `'in_progress'`, `'completed'`, `'rejected'` (default `'new'`) |
| `priority` | text | NO | Allowed values: `'low'`, `'normal'`, `'high'` (default `'normal'`) |
| `admin_notes` | text | YES | Internal notes added by administrators |
| `created_at` | timestamptz | NO | Submission timestamp (default `now()`) |

*Note: There is NO `updated_at`, `source`, `package_snapshot`, `full_name`, `whatsapp_number`, `business_type`, `package_interest`, or `requirements` column.*

---

## 2. `services`
Agency service offerings displayed on the website and admin management.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | Primary key |
| `title` | text | NO | Service title |
| `slug` | text | NO | Unique URL slug |
| `description` | text | YES | Service description |
| `price` | text | YES | Display price string (e.g., `'Starting at ₹1,499'`) |
| `features` | jsonb / text[] | YES | List of feature bullets |
| `active` | boolean | NO | Visibility flag (default `true`) |
| `sort_order` | integer | NO | Display order index |
| `created_at` | timestamptz | NO | Creation timestamp |

---

## 3. `pricing_packages`
Standard packages and pricing tiers.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | Primary key |
| `name` | text | NO | Package name |
| `price` | numeric | YES | Numeric price (e.g. `1499.00`). If `null`, represents custom scope ("Let's Discuss") |
| `description` | text | YES | Package overview |
| `features` | jsonb / text[] | YES | Inclusions and deliverables |
| `highlighted` | boolean | NO | Featured / Recommended badge |
| `active` | boolean | NO | Visibility toggle |
| `sort_order` | integer | NO | Ordering index |
| `created_at` | timestamptz | NO | Creation timestamp |

---

## 4. `projects`
Showcase portfolio projects and case studies.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | Primary key |
| `title` | text | NO | Project title |
| `slug` | text | NO | Unique slug |
| `category` | text | YES | Industry or project category |
| `description` | text | YES | Project overview and story |
| `image_url` | text | YES | Cover / preview image URL |
| `project_url` | text | YES | Live project URL |
| `featured` | boolean | NO | Flagship showcase toggle |
| `active` | boolean | NO | Visibility flag (filtered by `active = true`) |
| `sort_order` | integer | NO | Ordering index |
| `created_at` | timestamptz | NO | Creation timestamp |

*Note: Filter projects by `active` (not `published`). Column is `project_url` (not `demo_url`). There is NO `tags` column.*

---

## 5. `faqs`
Frequently asked questions.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | Primary key |
| `question` | text | NO | Question text |
| `answer` | text | NO | Answer text |
| `active` | boolean | NO | Visibility toggle |
| `sort_order` | integer | NO | Ordering index |
| `created_at` | timestamptz | NO | Creation timestamp |

---

## 6. `site_settings`
Global agency settings and contact configuration.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `key` | text | NO | Setting key (e.g. `'brand_name'`, `'contact_email'`, `'whatsapp_number'`, `'social_links'`, `'contact'`, `'brand'`, `'about'`) |
| `value` | jsonb | NO | Setting values (strings, numbers, or JSON objects) |
| `updated_at` | timestamptz | NO | Timestamp of last modification |

---

## 7. `coupons`
Promo and referral discount codes.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | text / uuid | NO | Primary key |
| `code` | text | NO | Uppercase coupon code |
| `description` | text | YES | Promo description |
| `discount_type` | text | NO | `'percentage'` or `'fixed'` |
| `discount_value` | numeric | NO | Discount percent or fixed value |
| `min_order_value` | numeric | YES | Minimum budget required |
| `max_discount` | numeric | YES | Max cap for percentage discounts |
| `valid_from` | timestamptz | YES | Start date |
| `valid_until` | timestamptz | YES | Expiry date |
| `usage_limit` | integer | YES | Total allowed usage |
| `times_used` | integer | NO | Usage counter |
| `active` | boolean | NO | Active status |
| `created_at` | timestamptz | NO | Creation timestamp |
| `updated_at` | timestamptz | YES | Last update timestamp |

---

## 8. `profiles`
User profiles linked to authentication.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NO | References `auth.users(id)` |
| `full_name` | text | YES | User full name |
| `created_at` | timestamptz | NO | Creation timestamp |

---

## 9. `user_roles`
Role-based access control.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `user_id` | uuid | NO | References `auth.users(id)` |
| `role` | text | NO | `'admin'` or `'user'` |
| `created_at` | timestamptz | NO | Creation timestamp |
