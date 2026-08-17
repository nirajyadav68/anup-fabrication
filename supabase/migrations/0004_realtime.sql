-- ============================================================================
-- 0004_realtime.sql
-- Adds the tables the app subscribes to via Supabase Realtime
-- (see components/RealtimeRefresher.tsx) to the realtime publication.
-- Without this, postgres_changes events never fire even though RLS
-- otherwise allows the read.
-- ============================================================================

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.services;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.gallery;
alter publication supabase_realtime add table public.quotes;
alter publication supabase_realtime add table public.contact_messages;
alter publication supabase_realtime add table public.orders;
