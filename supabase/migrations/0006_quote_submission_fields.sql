-- Add quote fields used by the public quote form and tracker.

alter table public.quotes
  add column if not exists width numeric(12, 2);

alter table public.quotes
  add column if not exists height numeric(12, 2);

alter table public.quotes
  add column if not exists finish text;

alter table public.quotes
  add column if not exists estimated_price numeric(12, 2);
