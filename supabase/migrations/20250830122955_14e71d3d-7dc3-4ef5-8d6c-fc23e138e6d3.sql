-- Fix relationships between admin, student, tutor profiles
-- First, let's check if we need to add proper foreign key relationships

-- Add foreign key constraints to link profiles properly
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Update feedback table to use proper foreign keys to profiles
ALTER TABLE feedback 
DROP CONSTRAINT IF EXISTS feedback_student_id_fkey,
DROP CONSTRAINT IF EXISTS feedback_tutor_id_fkey;

ALTER TABLE feedback 
ADD CONSTRAINT feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id),
ADD CONSTRAINT feedback_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES profiles(id);

-- Update meetings table to use proper foreign keys to profiles  
ALTER TABLE meetings
DROP CONSTRAINT IF EXISTS meetings_student_id_fkey,
DROP CONSTRAINT IF EXISTS meetings_tutor_id_fkey;

ALTER TABLE meetings
ADD CONSTRAINT meetings_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id),
ADD CONSTRAINT meetings_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES profiles(id);

-- Update quiz_attempts table
ALTER TABLE quiz_attempts
DROP CONSTRAINT IF EXISTS quiz_attempts_student_id_fkey;

ALTER TABLE quiz_attempts
ADD CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id);

-- Update support_tickets table
ALTER TABLE support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_student_id_fkey,
DROP CONSTRAINT IF EXISTS support_tickets_tutor_id_fkey;

ALTER TABLE support_tickets
ADD CONSTRAINT support_tickets_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id),
ADD CONSTRAINT support_tickets_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES profiles(id);

-- Update roadmaps table
ALTER TABLE roadmaps
DROP CONSTRAINT IF EXISTS roadmaps_student_id_fkey;

ALTER TABLE roadmaps
ADD CONSTRAINT roadmaps_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id);

-- Update resumes table
ALTER TABLE resumes
DROP CONSTRAINT IF EXISTS resumes_student_id_fkey;

ALTER TABLE resumes
ADD CONSTRAINT resumes_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id);

-- Update leaderboard table
ALTER TABLE leaderboard
DROP CONSTRAINT IF EXISTS leaderboard_student_id_fkey;

ALTER TABLE leaderboard
ADD CONSTRAINT leaderboard_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id);

-- Update notifications table to reference profiles properly
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

ALTER TABLE notifications
ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES profiles(id);