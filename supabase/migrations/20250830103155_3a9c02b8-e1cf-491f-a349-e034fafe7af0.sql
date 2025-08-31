-- Create new custom types for enums (skip user_role as it exists)
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved');

-- Update existing profiles table to match the new schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reg_no TEXT,
ADD COLUMN IF NOT EXISTS degree_program TEXT,
ADD COLUMN IF NOT EXISTS qualifications TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending';

-- Create roadmaps table
CREATE TABLE public.roadmaps (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    track_name TEXT NOT NULL,
    duration INTERVAL,
    roadmap_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meetings table
CREATE TABLE public.meetings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    meeting_link TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status meeting_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    ai_feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    questions JSONB NOT NULL,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id)
);

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feedback_txt TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    image_url TEXT,
    status ticket_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for roadmaps
CREATE POLICY "Students can view their own roadmaps" ON public.roadmaps
    FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can create their own roadmaps" ON public.roadmaps
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors and admins can view all roadmaps" ON public.roadmaps
    FOR SELECT USING (public.get_current_user_role() IN ('tutor', 'admin'));

-- RLS Policies for meetings
CREATE POLICY "Users can view their own meetings" ON public.meetings
    FOR SELECT USING (
        tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Tutors can create meetings" ON public.meetings
    FOR INSERT WITH CHECK (
        tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
        public.get_current_user_role() = 'tutor'
    );

CREATE POLICY "Meeting participants can update meetings" ON public.meetings
    FOR UPDATE USING (
        tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- RLS Policies for resumes
CREATE POLICY "Students can manage their own resumes" ON public.resumes
    FOR ALL USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors and admins can view all resumes" ON public.resumes
    FOR SELECT USING (public.get_current_user_role() IN ('tutor', 'admin'));

-- RLS Policies for quizzes
CREATE POLICY "Everyone can view quizzes" ON public.quizzes
    FOR SELECT USING (true);

CREATE POLICY "Tutors can create quizzes" ON public.quizzes
    FOR INSERT WITH CHECK (public.get_current_user_role() IN ('tutor', 'admin'));

-- RLS Policies for quiz_attempts
CREATE POLICY "Students can view their own attempts" ON public.quiz_attempts
    FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can create their own attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors and admins can view all attempts" ON public.quiz_attempts
    FOR SELECT USING (public.get_current_user_role() IN ('tutor', 'admin'));

-- RLS Policies for leaderboard
CREATE POLICY "Everyone can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

CREATE POLICY "System can update leaderboard" ON public.leaderboard
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for feedback
CREATE POLICY "Students can create feedback for their tutors" ON public.feedback
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view feedback they're involved in" ON public.feedback
    FOR SELECT USING (
        student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        public.get_current_user_role() = 'admin'
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (recipient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for support_tickets
CREATE POLICY "Students can create and view their own tickets" ON public.support_tickets
    FOR ALL USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can view assigned tickets" ON public.support_tickets
    FOR SELECT USING (tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can update assigned tickets" ON public.support_tickets
    FOR UPDATE USING (tutor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_roadmaps_student_id ON public.roadmaps(student_id);
CREATE INDEX idx_meetings_tutor_id ON public.meetings(tutor_id);
CREATE INDEX idx_meetings_student_id ON public.meetings(student_id);
CREATE INDEX idx_meetings_scheduled_at ON public.meetings(scheduled_at);
CREATE INDEX idx_resumes_student_id ON public.resumes(student_id);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX idx_feedback_tutor_id ON public.feedback(tutor_id);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_support_tickets_student_id ON public.support_tickets(student_id);
CREATE INDEX idx_support_tickets_tutor_id ON public.support_tickets(tutor_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();