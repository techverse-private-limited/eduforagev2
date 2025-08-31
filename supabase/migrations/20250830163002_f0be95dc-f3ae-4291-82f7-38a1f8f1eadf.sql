
-- Create a function to update leaderboard when quiz attempts are made
CREATE OR REPLACE FUNCTION update_leaderboard_on_quiz_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total score for the student
  INSERT INTO leaderboard (student_id, score)
  SELECT 
    NEW.student_id,
    COALESCE(SUM(qa.score), 0) as total_score
  FROM quiz_attempts qa
  WHERE qa.student_id = NEW.student_id
  ON CONFLICT (student_id) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    updated_at = now();

  -- Update ranks based on scores
  WITH ranked_scores AS (
    SELECT 
      id,
      DENSE_RANK() OVER (ORDER BY score DESC) as new_rank
    FROM leaderboard
  )
  UPDATE leaderboard 
  SET rank = ranked_scores.new_rank
  FROM ranked_scores
  WHERE leaderboard.id = ranked_scores.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update leaderboard
CREATE TRIGGER update_leaderboard_trigger
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_on_quiz_attempt();

-- Enable realtime for leaderboard table
ALTER TABLE leaderboard REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;

-- Enable realtime for quiz_attempts table  
ALTER TABLE quiz_attempts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
