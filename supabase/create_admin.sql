-- ============================================================================
-- create_admin.sql
-- Run this AFTER creating your first user in Supabase Auth
-- (Authentication -> Users -> Add User, in the Supabase dashboard).
--
-- This inserts the matching `profiles` row that marks that user as an
-- admin — without a profiles row, is_admin() returns false and the
-- account cannot write to any table or reach the admin dashboard.
-- ============================================================================

insert into public.profiles (id, full_name, role)
values (
  'PASTE-THE-USER-UUID-HERE', -- copy from Authentication -> Users in the dashboard
  'Admin Name',
  'admin'
)
on conflict (id) do update set full_name = excluded.full_name;
