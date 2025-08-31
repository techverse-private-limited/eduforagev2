
-- 1) Add email column to profiles (if missing)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

-- 2) Backfill existing emails from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.user_id = au.id
  AND (p.email IS NULL OR p.email = '');

-- 3) Ensure new users get email saved into profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Anonymous User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student'::user_role),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- 4) Allow tutors to view student profiles (read-only)
CREATE POLICY "Tutors can view student profiles"
ON public.profiles
FOR SELECT
USING (
  get_current_user_role() = 'tutor'::user_role
  AND role = 'student'::user_role
);
