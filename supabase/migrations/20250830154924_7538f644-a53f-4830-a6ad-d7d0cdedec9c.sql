-- Fix RLS policies on profiles table to remove auth.users table access
-- This fixes the "permission denied for table users" error

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can update verification status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate policies without auth.users table access
CREATE POLICY "Admins can update verification status" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_custom_admin());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING ((auth.uid() = user_id) OR is_custom_admin());