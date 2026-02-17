-- Complete fix for notes table and upload issues
-- This script will comprehensively fix all potential issues

-- Step 1: Check current table structure
-- Checking notes table structure...
SELECT 
    'Checking notes table structure...' as status,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Handle note_year column issue
DO $$
DECLARE
    note_year_exists BOOLEAN;
    academic_year_exists BOOLEAN;
BEGIN
    -- Check if columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'note_year' AND table_schema = 'public'
    ) INTO note_year_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'academic_year' AND table_schema = 'public'
    ) INTO academic_year_exists;
    
    RAISE NOTICE 'note_year exists: %, academic_year exists: %', note_year_exists, academic_year_exists;
    
    -- If note_year exists, handle it
    IF note_year_exists THEN
        IF NOT academic_year_exists THEN
            -- Rename note_year to academic_year
            RAISE NOTICE 'Renaming note_year to academic_year';
            ALTER TABLE public.notes RENAME COLUMN note_year TO academic_year;
        ELSE
            -- Both exist, migrate data and drop note_year
            RAISE NOTICE 'Migrating data from note_year to academic_year and dropping note_year';
            UPDATE public.notes 
            SET academic_year = COALESCE(academic_year, note_year, 'N/A');
            ALTER TABLE public.notes DROP COLUMN note_year;
        END IF;
    END IF;
    
    -- Ensure academic_year exists
    IF NOT academic_year_exists AND NOT note_year_exists THEN
        RAISE NOTICE 'Adding academic_year column';
        ALTER TABLE public.notes ADD COLUMN academic_year TEXT;
    END IF;
END $$;

-- Step 3: Ensure all required columns exist
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS course_subject TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS seller_id UUID;

-- Step 4: Ensure array columns exist and are properly formatted
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;

-- Step 5: Set default values for any NULL required fields
UPDATE public.notes SET academic_year = 'N/A' WHERE academic_year IS NULL OR academic_year = '';
UPDATE public.notes SET title = 'Untitled' WHERE title IS NULL OR title = '';
UPDATE public.notes SET college = 'Unknown' WHERE college IS NULL OR college = '';
UPDATE public.notes SET course_subject = 'General' WHERE course_subject IS NULL OR course_subject = '';
UPDATE public.notes SET category = 'Notes' WHERE category IS NULL OR category = '';
UPDATE public.notes SET price = 0 WHERE price IS NULL;
UPDATE public.notes SET description = '' WHERE description IS NULL;

-- Step 6: Add constraints (but make them reasonable)
-- Only add NOT NULL constraints for truly required fields
ALTER TABLE public.notes ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN college SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN price SET NOT NULL;

-- Don't add NOT NULL to academic_year in case some old records don't have it
-- ALTER TABLE public.notes ALTER COLUMN academic_year SET NOT NULL;

-- Step 7: Add foreign key if it doesn't exist
DO $$
BEGIN
    -- Add foreign key constraint if users table exists and constraint doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'notes_seller_id_fkey' 
            AND table_name = 'notes'
        ) THEN
            ALTER TABLE public.notes 
            ADD CONSTRAINT notes_seller_id_fkey 
            FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Step 8: Verify final structure
-- Final notes table structure:
SELECT 
    'Final notes table structure:' as status,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Notes table fix complete!
SELECT 'Notes table fix complete!' as completion_status;
