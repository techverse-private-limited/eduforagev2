
-- Goal:
-- 1) Use user_id on ai_assistant_logs to link directly to auth.uid()
-- 2) Keep existing tutor/admin behavior intact
-- 3) Remove FK requirement on student_id to avoid insert errors
-- 4) Update student RLS policies to use user_id

BEGIN;

-- 1) Add user_id column if it doesn't exist
ALTER TABLE public.ai_assistant_logs
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Backfill user_id from profiles for existing rows
UPDATE public.ai_assistant_logs AS l
SET user_id = p.user_id
FROM public.profiles AS p
WHERE l.student_id = p.id
  AND l.user_id IS NULL;

-- 3) Helpful index for queries by user_id
CREATE INDEX IF NOT EXISTS ai_assistant_logs_user_id_idx
ON public.ai_assistant_logs (user_id);

-- 4) Drop FK constraint on student_id and allow NULLs
ALTER TABLE public.ai_assistant_logs
DROP CONSTRAINT IF EXISTS ai_assistant_logs_student_id_fkey;

ALTER TABLE public.ai_assistant_logs
ALTER COLUMN student_id DROP NOT NULL;

-- 5) Update student-facing RLS to use user_id
DROP POLICY IF EXISTS "Students can create their own logs" ON public.ai_assistant_logs;
DROP POLICY IF EXISTS "Students can view their own logs" ON public.ai_assistant_logs;

CREATE POLICY "Students can create their own logs"
ON public.ai_assistant_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can view their own logs"
ON public.ai_assistant_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;

COMMIT;
