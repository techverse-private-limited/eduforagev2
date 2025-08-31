-- Phase 1: Add RLS policy for students to UPDATE their own roadmaps
CREATE POLICY "Students can update their own roadmaps" 
ON public.roadmaps 
FOR UPDATE 
USING (student_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));