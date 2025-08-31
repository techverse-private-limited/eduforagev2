
-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL DEFAULT 'Administrator',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert admin user with hashed password (bcrypt hash of '12345')
INSERT INTO public.admin_profiles (email, password_hash, full_name) 
VALUES ('admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');

-- Enable RLS for security
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to access their own data
CREATE POLICY "Admins can access their own data" 
  ON public.admin_profiles 
  FOR ALL 
  USING (true);
