-- Add learning_speed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN learning_speed TEXT DEFAULT 'medium' CHECK (learning_speed IN ('low', 'medium', 'high'));