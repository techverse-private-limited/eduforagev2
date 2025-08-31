
-- Remove the automatic tutor assignment trigger and function
DROP TRIGGER IF EXISTS assign_tutor_on_roadmap_creation ON roadmaps;
DROP FUNCTION IF EXISTS assign_tutor_to_student();

-- Clear existing automatic assignments if you want to start fresh
UPDATE roadmaps SET assigned_tutor_id = NULL;
