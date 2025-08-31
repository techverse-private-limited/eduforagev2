-- Storage policies to allow tutors to upload their resume into their own folder in the private 'resumes' bucket

-- Allow authenticated users to INSERT files only into their own profile folder
CREATE POLICY "Users can upload their own resume files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);

-- Allow authenticated users to read files in their own folder (optional but useful)
CREATE POLICY "Users can read their own resume files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);
