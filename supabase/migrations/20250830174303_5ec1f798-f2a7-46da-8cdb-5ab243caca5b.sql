-- Create tutor verification requests table
CREATE TABLE IF NOT EXISTS public.tutor_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutor_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tutors can view their own verification requests" 
ON public.tutor_verification_requests 
FOR SELECT 
USING (tutor_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Tutors can create their own verification requests" 
ON public.tutor_verification_requests 
FOR INSERT 
WITH CHECK (tutor_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Admins can view all verification requests" 
ON public.tutor_verification_requests 
FOR ALL 
USING (is_custom_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tutor_verification_requests_updated_at
BEFORE UPDATE ON public.tutor_verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();