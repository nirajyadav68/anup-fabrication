-- ============================================================================
-- 0001_init.sql
-- Anup Fabrication Works — core schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- profiles: one row per admin user, linked 1:1 to auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- categories: shared by products and projects
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  kind text not null check (kind in ('product', 'project')),
  created_at timestamptz not null default now()
);

create index if not exists categories_kind_idx on public.categories (kind);

-- ----------------------------------------------------------------------------
-- services
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  description text not null,
  image_url text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_enabled_idx on public.services (is_enabled);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  sku text unique,
  name text not null,
  slug text not null unique,
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  material text,
  size text,
  weight_kg numeric(10, 2),
  price numeric(12, 2),
  price_type text not null default 'contact' check (price_type in ('fixed', 'starting_from', 'contact')),
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'out_of_stock', 'made_to_order')),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_published_idx on public.products (is_published);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured = true;

create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id);

-- ----------------------------------------------------------------------------
-- projects (portfolio)
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  cover_image_path text,
  is_published boolean not null default false,
  completed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects (is_published);
create index if not exists projects_category_idx on public.projects (category_id);

create table if not exists public.project_images (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id);

-- ----------------------------------------------------------------------------
-- gallery (standalone photo gallery, not tied to a specific project)
-- ----------------------------------------------------------------------------
create table if not exists public.gallery (
  id uuid primary key default uuid_generate_v4(),
  title text,
  storage_path text not null,
  category_id uuid references public.categories (id) on delete set null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_published_idx on public.gallery (is_published);

-- ----------------------------------------------------------------------------
-- customers
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_phone_idx on public.customers (phone);

-- ----------------------------------------------------------------------------
-- quotes
-- ----------------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  quote_number text not null unique, -- e.g. AFW-2026-000123, generated by trigger below
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  address text,
  service_type text,
  product_or_project text,
  material text,
  approximate_size text,
  quantity integer,
  budget numeric(12, 2),
  required_date date,
  description text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'quotation_sent', 'negotiation', 'approved', 'rejected', 'completed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_status_idx on public.quotes (status);
create index if not exists quotes_created_idx on public.quotes (created_at desc);

create table if not exists public.quote_files (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  storage_path text not null,
  file_type text not null check (file_type in ('drawing', 'reference_image')),
  original_filename text,
  created_at timestamptz not null default now()
);

create index if not exists quote_files_quote_idx on public.quote_files (quote_id);

-- Auto-generate a human-readable quote number, e.g. AFW-2026-000001
create sequence if not exists public.quote_number_seq;

create or replace function public.set_quote_number()
returns trigger as $$
begin
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := 'AFW-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.quote_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_quote_number on public.quotes;
create trigger trg_set_quote_number
  before insert on public.quotes
  for each row execute function public.set_quote_number();

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled')
  ),
  payment_status text not null default 'pending' check (
    payment_status in ('pending', 'paid', 'partially_paid', 'refunded')
  ),
  total numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);

create sequence if not exists public.order_number_seq;

create or replace function public.set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2),
  total_price numeric(12, 2),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_read_idx on public.contact_messages (is_read);

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review text not null,
  image_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_published_idx on public.reviews (is_published);

-- ----------------------------------------------------------------------------
-- website_settings: single-row table the admin edits from Settings page
-- ----------------------------------------------------------------------------
create table if not exists public.website_settings (
  id boolean primary key default true, -- always exactly one row
  company_name text not null default 'Anup Fabrication Works',
  logo_path text,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  google_maps_url text,
  business_hours text,
  social_instagram text,
  social_facebook text,
  hero_title text,
  hero_description text,
  footer_text text,
  updated_at timestamptz not null default now(),
  constraint website_settings_singleton check (id)
);

insert into public.website_settings (id) values (true)
  on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- updated_at auto-touch trigger, reused by every table with an updated_at column
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'services', 'products', 'projects', 'customers',
    'quotes', 'orders', 'website_settings'
  ]
  loop
    execute format(
      'drop trigger if exists trg_touch_updated_at on public.%I;
       create trigger trg_touch_updated_at before update on public.%I
       for each row execute function public.touch_updated_at();',
      t, t
    );
  end loop;
end $$;
