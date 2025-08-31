-- Update the roadmaps table to support AI-generated roadmaps with progress tracking
ALTER TABLE roadmaps 
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS timeframe text,
ADD COLUMN IF NOT EXISTS selected_topics text[],
ADD COLUMN IF NOT EXISTS progress_tracking integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_steps integer DEFAULT 0;

-- Update the roadmap_json column to store structured learning steps
COMMENT ON COLUMN roadmaps.roadmap_json IS 'Stores structured learning roadmap with steps, resources, and progress tracking';
COMMENT ON COLUMN roadmaps.progress_tracking IS 'Progress percentage (0-100)';
COMMENT ON COLUMN roadmaps.current_step IS 'Current step the student is working on';
COMMENT ON COLUMN roadmaps.total_steps IS 'Total number of steps in the roadmap';