-- Phase 1: Database Schema Updates for Tutor Workflow

-- Add missing columns to existing tables
ALTER TABLE public.roadmaps 
ADD COLUMN IF NOT EXISTS is_verified_by_tutor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS assigned_tutor_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS tutor_feedback text;

-- Update meeting status enum to include 'in-progress'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_status_new') THEN
        CREATE TYPE meeting_status_new AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');
        ALTER TABLE public.meetings ALTER COLUMN status TYPE meeting_status_new USING status::text::meeting_status_new;
        DROP TYPE meeting_status;
        ALTER TYPE meeting_status_new RENAME TO meeting_status;
    END IF;
END $$;

-- Create ai_assistant_logs table for tutor insights
CREATE TABLE IF NOT EXISTS public.ai_assistant_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.profiles(id),
    query_text text NOT NULL,
    ai_response text,
    response_rating integer CHECK (response_rating >= 1 AND response_rating <= 5),
    needs_tutor_intervention boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_assistant_logs
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_assistant_logs
CREATE POLICY "Students can create their own logs" 
ON public.ai_assistant_logs 
FOR INSERT 
WITH CHECK (student_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Students can view their own logs" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (student_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Tutors can view logs for assigned students" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (
    get_current_user_role() = 'tutor'::user_role 
    AND EXISTS (
        SELECT 1 FROM roadmaps 
        WHERE roadmaps.student_id = ai_assistant_logs.student_id 
        AND roadmaps.assigned_tutor_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
    )
);

CREATE POLICY "Admins can view all logs" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin'::user_role);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_assigned_tutor ON public.roadmaps(assigned_tutor_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_student ON public.ai_assistant_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_assistant_logs(created_at DESC);