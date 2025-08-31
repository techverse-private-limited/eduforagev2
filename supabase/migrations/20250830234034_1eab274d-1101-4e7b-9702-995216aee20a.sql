-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated users to view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin access to all resumes" ON storage.objects;

-- Create a comprehensive admin policy for resume access
CREATE POLICY "Admin can access all resume files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'resumes');

-- Create policy for authenticated users to view resumes
CREATE POLICY "Authenticated users can view resume files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);