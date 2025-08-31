-- Add policy for tutors to view unassigned tickets
CREATE POLICY "Tutors can view unassigned tickets"
ON support_tickets
FOR SELECT
TO authenticated
USING (
  (tutor_id IS NULL) AND 
  (get_current_user_role() = 'tutor'::user_role)
);