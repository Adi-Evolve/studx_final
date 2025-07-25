-- QUICK FIX for note_year NOT NULL constraint error
-- Run this immediately to resolve the upload issue

-- Option 1: If note_year column exists, drop the NOT NULL constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'note_year' AND table_schema = 'public'
    ) THEN
        -- Drop NOT NULL constraint from note_year
        ALTER TABLE public.notes ALTER COLUMN note_year DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL constraint from note_year column';
        
        -- Set default value for any existing NULL records
        UPDATE public.notes SET note_year = 'N/A' WHERE note_year IS NULL;
        RAISE NOTICE 'Updated NULL note_year values to N/A';
    ELSE
        RAISE NOTICE 'note_year column does not exist';
    END IF;
END $$;

-- Option 2: Add academic_year column if it doesn't exist
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Verify the fix
SELECT 
    'VERIFICATION - note_year column status:' as status,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public' 
AND column_name IN ('note_year', 'academic_year')
ORDER BY column_name;
