
-- 1) Ensure the auth.users trigger is present to create profiles automatically
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Backfill profiles for any existing users without a profile
insert into public.profiles (user_id, full_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', 'Anonymous User'),
  coalesce((u.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role)
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- 3) Normalize old role values from 'teacher' to 'tutor'
update public.profiles
set role = 'tutor'::public.user_role
where role = 'teacher'::public.user_role;

-- 4) Prevent duplicate profiles per user
create unique index if not exists profiles_user_id_unique on public.profiles(user_id);
