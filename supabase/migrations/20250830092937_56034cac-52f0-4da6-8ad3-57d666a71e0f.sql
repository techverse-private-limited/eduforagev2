
-- First, let's check what values are currently in the user_role enum
-- and then add the missing 'tutor' value if it doesn't exist

-- Add 'tutor' to the user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tutor' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'tutor';
    END IF;
END $$;

-- Also ensure 'admin' value exists in the enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
END $$;
