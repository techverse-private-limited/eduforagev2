-- Drop existing conflicting policies and create simpler ones
DROP POLICY IF EXISTS "Users can upload their own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

-- Create simpler, working policies for resume uploads
CREATE POLICY "Allow authenticated users to upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow users to read resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Allow users to update resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Allow users to delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');