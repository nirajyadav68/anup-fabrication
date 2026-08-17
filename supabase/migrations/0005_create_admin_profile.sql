-- 0005_create_admin_profile.sql
-- Create the initial business admin profile.

insert into public.profiles (id, full_name, role)
select
  '866c1b7b-ee57-4998-811c-e599203023cb'::uuid,
  'Niraj Yadav',
  'admin'
where exists (
  select 1
  from auth.users
  where id = '866c1b7b-ee57-4998-811c-e599203023cb'::uuid
)
on conflict (id) do update
set
  full_name = 'Niraj Yadav',
  role = 'admin';