
-- Create a table for tutor feedback to students (separate from existing student-to-tutor feedback)
CREATE TABLE public.tutor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.tutor_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy that allows tutors to INSERT their own feedback
CREATE POLICY "Tutors can create feedback for students" 
  ON public.tutor_feedback 
  FOR INSERT 
  WITH CHECK (tutor_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'tutor'));

-- Create policy that allows tutors to SELECT their own sent feedback
CREATE POLICY "Tutors can view their own sent feedback" 
  ON public.tutor_feedback 
  FOR SELECT 
  USING (tutor_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'tutor'));

-- Create policy that allows students to view feedback they received
CREATE POLICY "Students can view feedback they received" 
  ON public.tutor_feedback 
  FOR SELECT 
  USING (student_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'student'));

-- Create policy that allows admins to view all feedback
CREATE POLICY "Admins can view all tutor feedback" 
  ON public.tutor_feedback 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');
