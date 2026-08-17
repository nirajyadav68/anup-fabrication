-- ============================================================================
-- 0002_rls.sql
-- Row Level Security: public can read published content and submit
-- quotes/contact messages; only authenticated admins can write.
-- ============================================================================

-- Helper: is the current user an admin (has a row in profiles)?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.gallery enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_files enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.website_settings enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: admins can read/update only their own profile
-- ---------------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- categories: public read, admin write
-- ---------------------------------------------------------------------------
create policy "categories: public read" on public.categories
  for select using (true);

create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- services: public read enabled only, admin full access
-- ---------------------------------------------------------------------------
create policy "services: public read enabled" on public.services
  for select using (is_enabled = true or public.is_admin());

create policy "services: admin write" on public.services
  for insert with check (public.is_admin());
create policy "services: admin update" on public.services
  for update using (public.is_admin()) with check (public.is_admin());
create policy "services: admin delete" on public.services
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- products / product_images: public read published, admin full access
-- ---------------------------------------------------------------------------
create policy "products: public read published" on public.products
  for select using (is_published = true or public.is_admin());

create policy "products: admin insert" on public.products
  for insert with check (public.is_admin());
create policy "products: admin update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products: admin delete" on public.products
  for delete using (public.is_admin());

create policy "product_images: public read" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (p.is_published = true or public.is_admin())
    )
  );

create policy "product_images: admin write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- projects / project_images: public read published, admin full access
-- ---------------------------------------------------------------------------
create policy "projects: public read published" on public.projects
  for select using (is_published = true or public.is_admin());

create policy "projects: admin insert" on public.projects
  for insert with check (public.is_admin());
create policy "projects: admin update" on public.projects
  for update using (public.is_admin()) with check (public.is_admin());
create policy "projects: admin delete" on public.projects
  for delete using (public.is_admin());

create policy "project_images: public read" on public.project_images
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id
        and (p.is_published = true or public.is_admin())
    )
  );

create policy "project_images: admin write" on public.project_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- gallery: public read published, admin full access
-- ---------------------------------------------------------------------------
create policy "gallery: public read published" on public.gallery
  for select using (is_published = true or public.is_admin());

create policy "gallery: admin write" on public.gallery
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- customers: admin only (contains personal data)
-- ---------------------------------------------------------------------------
create policy "customers: admin only" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- quotes / quote_files: public can INSERT (submit a request) but not read
-- others' quotes; admins can read/update/delete everything
-- ---------------------------------------------------------------------------
create policy "quotes: public can submit" on public.quotes
  for insert with check (true);

create policy "quotes: admin read" on public.quotes
  for select using (public.is_admin());

create policy "quotes: admin update" on public.quotes
  for update using (public.is_admin()) with check (public.is_admin());

create policy "quotes: admin delete" on public.quotes
  for delete using (public.is_admin());

create policy "quote_files: public can attach to own submission" on public.quote_files
  for insert with check (true);

create policy "quote_files: admin read" on public.quote_files
  for select using (public.is_admin());

create policy "quote_files: admin delete" on public.quote_files
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders / order_items: admin only
-- ---------------------------------------------------------------------------
create policy "orders: admin only" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items: admin only" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- contact_messages: public can INSERT, admin can read/update/delete
-- ---------------------------------------------------------------------------
create policy "contact_messages: public can submit" on public.contact_messages
  for insert with check (true);

create policy "contact_messages: admin read" on public.contact_messages
  for select using (public.is_admin());

create policy "contact_messages: admin update" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

create policy "contact_messages: admin delete" on public.contact_messages
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews: public read published, admin full access
-- ---------------------------------------------------------------------------
create policy "reviews: public read published" on public.reviews
  for select using (is_published = true or public.is_admin());

create policy "reviews: admin write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- website_settings: public read, admin write
-- ---------------------------------------------------------------------------
create policy "website_settings: public read" on public.website_settings
  for select using (true);

create policy "website_settings: admin update" on public.website_settings
  for update using (public.is_admin()) with check (public.is_admin());
