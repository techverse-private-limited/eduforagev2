-- Update admin password to match the expected plain text password from the UI
UPDATE admin_profiles 
SET password_hash = '12345' 
WHERE email = 'admin@gmail.com';