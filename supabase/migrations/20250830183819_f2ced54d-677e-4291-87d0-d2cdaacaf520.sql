
-- Add a trigger to automatically assign students to available tutors when they create roadmaps
CREATE OR REPLACE FUNCTION assign_tutor_to_student()
RETURNS TRIGGER AS $$
DECLARE
    available_tutor_id UUID;
BEGIN
    -- Only assign if no tutor is already assigned
    IF NEW.assigned_tutor_id IS NULL THEN
        -- Find an available verified tutor (you can modify this logic as needed)
        SELECT p.id INTO available_tutor_id
        FROM profiles p
        WHERE p.role = 'tutor' 
        AND p.verification_status = 'approved'
        ORDER BY RANDOM() -- Simple random assignment, you can improve this logic
        LIMIT 1;
        
        -- Assign the tutor if one is found
        IF available_tutor_id IS NOT NULL THEN
            NEW.assigned_tutor_id := available_tutor_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before inserting a new roadmap
DROP TRIGGER IF EXISTS assign_tutor_on_roadmap_creation ON roadmaps;
CREATE TRIGGER assign_tutor_on_roadmap_creation
    BEFORE INSERT ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION assign_tutor_to_student();

-- For existing roadmaps without assigned tutors, let's assign them
UPDATE roadmaps 
SET assigned_tutor_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'tutor' 
    AND p.verification_status = 'approved' 
    ORDER BY RANDOM() 
    LIMIT 1
)
WHERE assigned_tutor_id IS NULL;
