-- Create resumes storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the resumes bucket
CREATE POLICY "Allow authenticated users to view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow tutors to upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow tutors to update their own resumes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow tutors to delete their own resumes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to access all resumes for verification
CREATE POLICY "Allow admin access to all resumes" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'resumes' AND is_custom_admin());