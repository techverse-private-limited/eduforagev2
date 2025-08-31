-- Create storage policies for resumes bucket
CREATE POLICY "Authenticated users can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can view all resumes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND (
    auth.uid() IS NOT NULL 
    OR is_custom_admin()
  )
);

CREATE POLICY "Users can update their own resumes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resumes' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own resumes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resumes' 
  AND auth.uid() IS NOT NULL
);