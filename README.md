# Anup Fabrication Works — Website

A production-grade website for **Anup Fabrication Works**, a metal fabrication
business (MS/SS fabrication, gates, railings, doors, windows, sheds and custom
metal work).

This repo is being built in phases (see [Roadmap](#roadmap) below). **This
version covers all five phases**: Phase 1 (public site), Phase 2
(database, auth, admin dashboard shell), Phase 3 (Products, Services,
Projects, Gallery, Contact Messages CRUD), Phase 4 (the Quote system,
Orders, Customers, Reviews, Website Settings, Admin Profile), and Phase 5
(Realtime updates, ISR caching, pagination, security/accessibility pass).
What's left is your own Supabase project setup and Vercel deployment —
see §3a and §8 below.

## 1. Technologies

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons
- Database/auth (**Supabase**) and image storage arrive in Phase 2–3

## 2. Installation

Requires Node.js 18.17+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 3. Environment Variables

Copy the example file and fill in your own values:

```bash
cp .env.local.example .env.local
```

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Used for canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_PHONE_NUMBER` | Shown in navbar/footer, used for "Call Now" |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Used by every WhatsApp button (never hardcode this elsewhere) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in footer/contact page |
| `NEXT_PUBLIC_GOOGLE_MAPS_URL` | Linked from the contact page |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key — **server-side only, never expose to the browser** |

**Never commit `.env.local`.** It's already in `.gitignore`.

## 3a. Supabase Setup (Phase 2)

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy **Project URL**, **anon public key**, and **service_role key** from
   *Settings → API* into your `.env.local`.
3. Open the Supabase **SQL Editor** and run these three files, in order,
   from `supabase/migrations/`:
   - `0001_init.sql` — creates every table (products, services, projects,
     quotes, orders, customers, contact_messages, reviews,
     website_settings, etc.) with proper primary/foreign keys, timestamps,
     constraints and indexes.
   - `0002_rls.sql` — enables Row Level Security everywhere. Public visitors
     can read published content and submit quotes/contact messages; only
     authenticated admins (rows in `profiles`) can create, update or delete.
   - `0003_storage.sql` — creates the public `media` storage bucket (with
     `products/`, `services/`, `projects/`, `gallery/`, `quotes/` used as
     folders inside it) and its access policies.
4. **Create your admin account**: in the Supabase dashboard go to
   *Authentication → Users → Add User*, set an email and password. Copy
   the new user's UUID.
5. Open `supabase/create_admin.sql`, paste that UUID and your name in, and
   run it in the SQL Editor. This inserts the `profiles` row that actually
   marks the account as an admin — without it, sign-in works but the
   dashboard and every write are still blocked by RLS.
6. Run `npm run dev`, go to `/admin/login`, and sign in with that account.

### Storage setup notes

The `media` bucket is public-read (so product/project photos load on the
public site) but scoped for writes: only admins can upload outside
`quotes/`, and the public can only upload into `quotes/` (attaching a
drawing or reference image to their own quote submission). See
`0003_storage.sql` for the exact policies.

## 4. Project Structure

```
anup-fabrication/
├── app/                  # Pages (App Router)
│   ├── page.tsx          # Home
│   ├── about/
│   ├── services/
│   │   └── [slug]/       # Individual service detail pages
│   ├── contact/
│   ├── projects/         # Real — Supabase-backed portfolio (filter/search/lightbox)
│   ├── gallery/          # Real — Supabase-backed photo grid with lightbox
│   ├── products/         # Real — Supabase-backed catalogue
│   ├── quote/            # Real — full quote form with file upload to Supabase Storage
│   ├── api/contact/      # Contact form submission handler
│   ├── privacy-policy/
│   ├── terms/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
├── components/           # Navbar, Footer, Hero, ServiceCard, ContactForm, etc.
├── lib/
│   ├── site-config.ts    # All editable business info in one place
│   ├── data/services.ts  # Static service list (moves to Supabase in Phase 2/3)
│   ├── validations.ts    # Zod schemas
│   └── utils.ts
└── types/
```

## 5. What Works Right Now

**Phase 1 — public site:**
- Home, About, Services (+ individual service pages), Contact, Privacy Policy,
  Terms & Conditions — all real pages, real content, real navigation.
- Fully responsive navbar with a working mobile menu.
- Contact form with client-side validation (React Hook Form + Zod) that
  posts to `/api/contact`. **Once Supabase is set up (5.a above), wire the
  handler in `app/api/contact/route.ts` to insert into `contact_messages`**
  (the TODO comment shows exactly where).
- WhatsApp buttons throughout that open a prefilled chat using the number
  set in `NEXT_PUBLIC_WHATSAPP_NUMBER` — change the env var, every button
  updates.
- SEO: per-page metadata, Open Graph/Twitter tags, `sitemap.xml`,
  `robots.txt`.

**Phase 2 — database, auth, admin shell:**
- Full PostgreSQL schema (`supabase/migrations/0001_init.sql`): products,
  services, projects, gallery, quotes, orders, customers, contact_messages,
  reviews, website_settings and their image/line-item tables — with UUID
  primary keys, foreign keys, timestamps, constraints and indexes.
- Row Level Security on every table (`0002_rls.sql`): public read of
  published content, public insert for quotes/contact messages, admin-only
  writes everywhere else.
- Storage bucket + policies for images and quote attachments
  (`0003_storage.sql`).
- Real admin authentication via Supabase Auth: `/admin/login` with sign
  in, forgot-password/reset-email flow, and sign out — no mocked auth.
- `middleware.ts` protects every `/admin/*` route: signed-out visitors are
  redirected to login; signed-in non-admins (no `profiles` row) are signed
  back out automatically.
- `/admin/dashboard` — real server-rendered stat cards (total/active
  products, projects, quotes by status, orders, unread messages) querying
  live counts from Supabase.
- Admin sidebar linking to every section from the spec (Products, Services,
  Projects, Gallery, Quotes, Messages, Orders, Customers, Settings,
  Profile) — each is a clearly labeled placeholder until its Phase 3/4 CRUD
  is built, so no link in the dashboard 404s.

**Phase 3 — Products, Services, Projects, Gallery & Messages CRUD (done):**
- **Services**: fully database-backed. `/admin/services` lists, adds,
  edits and deletes services with image upload to Supabase Storage, plus
  an enable/disable toggle. The public `/services` and `/services/[slug]`
  pages now read live from Supabase (falling back to the Phase 1 static
  list only if Supabase isn't configured, so the site never breaks).
- **Products**: fully database-backed. `/admin/products` supports full
  CRUD with SKU, material, size, weight, price/price-type, stock status,
  featured flag, publish toggle, and multi-image upload. The public
  `/products` catalogue and `/products/[slug]` detail page (image gallery,
  price, availability, Request Quote / WhatsApp Inquiry buttons) read live
  from Supabase.
- **Projects**: fully database-backed, including a text category field
  that resolves into the `categories` table (find-or-create) behind the
  scenes. `/admin/projects` supports full CRUD with multi-image upload.
  The public `/projects` page has a working category filter, search, and
  lightbox; `/projects/[slug]` shows the full photo set.
- **Gallery**: fully database-backed. `/admin/gallery` supports batch
  photo upload, publish toggle and delete. The public `/gallery` page is
  a responsive grid with a lightbox.
- **Contact Messages**: `/admin/messages` lists real submissions from the
  public Contact form (which now inserts into `contact_messages` instead
  of just logging), with read/unread toggle and delete.
- Still placeholder, landing in Phase 4: the full Quote form with file
  upload; Orders; Customers; Reviews; Website Settings; Admin Profile.

**Phase 4 — Quote System, Orders, Customers, Reviews, Settings, Profile (done):**
- **Quote System**: the full `/quote` form (name, phone, WhatsApp, email,
  city, address, service type, product/project, material, size, quantity,
  budget, required date, description, drawing upload, reference image
  uploads) submits directly to Supabase — RLS allows anonymous inserts
  into `quotes`/`quote_files` and uploads into the `quotes/` storage
  folder. Each submission gets an auto-generated quote number (e.g.
  `AFW-2026-000001`, via the database trigger from Phase 2) shown back to
  the customer along with their status. `/admin/quotes` lists every
  request with status-filter tabs, and each detail page
  (`/admin/quotes/[id]`) shows the full submission, attached
  drawings/reference images, a status-change form (New → Contacted →
  Quotation Sent → Negotiation → Approved/Rejected → Completed), and
  delete.
- **Orders**: `/admin/orders` — add an order (auto-creates/reuses the
  customer by phone number), inline status + payment-status editors,
  delete. Payment stays quotation-based (no online payment forced), per
  the spec.
- **Customers**: `/admin/customers` — a read view of customer records,
  currently populated as orders are created (quote submissions store
  customer info directly on the quote rather than a separate customer
  record, since public visitors don't have write access to `customers`
  by design — see RLS in `0002_rls.sql`).
- **Reviews**: `/admin/reviews` — add (name, star rating, review text,
  optional photo), publish toggle, delete. Published reviews now appear
  in a real "What Customers Say" section on the homepage.
- **Website Settings**: `/admin/settings` — edit company name, phone,
  WhatsApp, email, address, Google Maps URL, business hours, social
  links, homepage hero text and footer text, all stored in the
  single-row `website_settings` table. (Wiring these into the actual
  public components — currently driven by `lib/site-config.ts` — is a
  clearly-scoped follow-up; the storage/editing layer is complete.)
- **Admin Profile**: `/admin/profile` — edit your display name and
  avatar, and change your password.

## 6. Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1** | Project setup, Navbar, Footer, Home, About, Services, Contact | ✅ Done |
| **2** | Supabase project, database schema, Row Level Security, admin authentication, admin dashboard shell | ✅ Done |
| **3** | Products, Services, Projects, Gallery, Contact Messages CRUD + image upload | ✅ Done |
| **4** | Quote request system (with file upload), Orders, Customers, Reviews, Website Settings, Admin Profile | ✅ Done |
| **5** | Realtime updates, performance pass, final SEO/security/accessibility audit, Vercel deployment | ✅ Done (deployment is a one-time step you run — see §8) |

## Phase 5 details

**Realtime** — `components/RealtimeRefresher.tsx` subscribes to Supabase
Realtime and refreshes the current page's server data when rows change.
Wired narrowly, where it actually matters:
- `/admin/dashboard` watches `quotes`, `contact_messages`, `orders`,
  `products` — the stat cards update live.
- `/admin/quotes` and `/admin/messages` watch their own table, so a new
  submission appears without a manual refresh.
- The public product detail page (`/products/[slug]`) has its own
  narrower live component, `components/ProductAvailability.tsx` — if an
  admin changes that product's price, price type, or stock status while
  someone is looking at the page, it updates in place.
- `supabase/migrations/0004_realtime.sql` adds the necessary tables to
  Supabase's realtime publication — run it after `0001`–`0003`.

**Performance** — public marketing pages (`/`, `/services`,
`/services/[slug]`, `/products`, `/products/[slug]`, `/projects`,
`/projects/[slug]`, `/gallery`) use `lib/supabase/public.ts`, a
cookie-free Supabase client, specifically so `export const revalidate =
60` on each page actually works as ISR instead of being forced into
fully dynamic, uncached rendering (which is what happens the moment a
route touches `next/headers` `cookies()`). Admin pages still use the
cookie-aware client from `lib/supabase/server.ts`, since they need the
signed-in user.

**Pagination** — `/admin/products` and `/admin/quotes` paginate at 20
rows/page using Supabase's `.range()`, with Previous/Next controls
driven by a `?page=` search param. (The public `/products` catalogue is
ISR-cached and not yet paginated — worth adding the same pattern if your
catalogue grows past a page or two.)

**Security** — every write path re-checks `auth.getUser()` server-side
in addition to RLS (defense in depth: even if a bug let a request reach
a server action, the database itself would still reject a non-admin
write). File uploads are type- and size-validated client-side before
upload; the real enforcement is Postgres/Storage RLS, not the client
check. No secrets are ever sent to the browser — `SUPABASE_SERVICE_ROLE_KEY`
is referenced only in `lib/supabase/server.ts`'s `createAdminClient()`,
which isn't currently called from anywhere (kept available for a future
need, e.g. bulk admin scripts), and never imported into a Client
Component.

**Accessibility** — carried through from Phase 1: semantic HTML, labeled
form fields, `aria-invalid`/`aria-describedby` on validation errors,
visible focus rings (`globals.css`), `aria-current="page"` on active nav
links, `aria-expanded`/`aria-label` on toggle buttons, `role="dialog"`
+ `aria-modal` on lightboxes, and `prefers-reduced-motion` handling.

**Known follow-ups, deliberately left for you to prioritize:**
- No API rate limiting on the public `/api/contact` route or the
  client-side quote/contact inserts — add this at the edge (e.g. Vercel's
  rate limiting, or Upstash) before high public traffic.
- `types/database.types.ts` is hand-written and intentionally not the
  source of truth — regenerate it with `supabase gen types` (§3a) once
  you're linked to a real project for full query type-safety.
- Website Settings (`/admin/settings`) writes to the database but the
  public components still read from `lib/site-config.ts` env vars — wire
  one to the other when you're ready to stop redeploying for text
  changes.

## 7. Production Build

```bash
npm run build
npm start
```

Fix any TypeScript/ESLint errors `npm run build` reports before deploying.

## 8. Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.local` in the Vercel project
   settings (Production + Preview).
4. Deploy.

## 9. Updating Business Info (no code changes needed for most of it)

Right now (Phase 1), phone number, WhatsApp number, email, address and
business hours all live in `lib/site-config.ts` / environment variables —
edit the env vars and redeploy, no code change required. From Phase 2
onward, these move into the admin **Website Settings** page so they can be
edited from the browser.

## 10. Maintaining Services, Products, Projects & Gallery

All four are fully managed from the admin dashboard now — no code changes needed:
- **Services**: `/admin/services` → Add Service / Edit / Delete / enable-disable toggle.
- **Products**: `/admin/products` → Add Product / Edit / Delete / publish toggle,
  including multi-image upload (stored in Supabase Storage under `media/products/`).
- **Projects**: `/admin/projects` → Add Project / Edit / Delete / publish toggle,
  multi-image upload (`media/projects/`), and a free-text category field that
  automatically creates/reuses rows in the `categories` table.
- **Gallery**: `/admin/gallery` → batch photo upload (`media/gallery/`),
  publish toggle, delete.

`lib/data/services.ts`, `lib/data/products.ts` and `lib/data/projects.ts`
now only contain fetch helpers for the public pages (plus a static
fallback list in `services.ts`, used only if Supabase isn't configured).
