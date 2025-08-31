-- Add RLS policy to allow students to view tutor profiles for feedback
CREATE POLICY "Students can view tutor profiles for feedback" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'tutor' AND 
  verification_status = 'approved' AND
  get_current_user_role() = 'student'
);