
-- Add title and description fields to meetings table
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update the default status if needed
ALTER TABLE public.meetings 
ALTER COLUMN status SET DEFAULT 'scheduled'::meeting_status;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_student_id ON public.meetings(student_id);
CREATE INDEX IF NOT EXISTS idx_meetings_tutor_id ON public.meetings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON public.meetings(scheduled_at);

-- Enable realtime for meetings table
ALTER TABLE public.meetings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
