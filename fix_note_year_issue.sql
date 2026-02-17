-- Fix note_year column issue
-- This script will:
-- 1. Check if note_year column exists
-- 2. If it exists but academic_year doesn't, rename it to academic_year
-- 3. If both exist, drop note_year and keep academic_year
-- 4. If note_year exists with NOT NULL constraint, either populate it or remove the constraint

-- Step 1: Check what we have
DO $$
DECLARE
    note_year_exists BOOLEAN;
    academic_year_exists BOOLEAN;
    note_year_has_not_null BOOLEAN;
BEGIN
    -- Check if note_year column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'note_year' AND table_schema = 'public'
    ) INTO note_year_exists;
    
    -- Check if academic_year column exists  
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'academic_year' AND table_schema = 'public'
    ) INTO academic_year_exists;
    
    -- Check if note_year has NOT NULL constraint
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'note_year' 
        AND table_schema = 'public' AND is_nullable = 'NO'
    ) INTO note_year_has_not_null;
    
    RAISE NOTICE 'note_year exists: %, academic_year exists: %, note_year has NOT NULL: %', 
        note_year_exists, academic_year_exists, note_year_has_not_null;
    
    -- Handle different scenarios
    IF note_year_exists AND NOT academic_year_exists THEN
        -- Scenario 1: Only note_year exists, rename it to academic_year
        RAISE NOTICE 'Renaming note_year to academic_year';
        ALTER TABLE public.notes RENAME COLUMN note_year TO academic_year;
        
    ELSIF note_year_exists AND academic_year_exists THEN
        -- Scenario 2: Both exist, migrate data and drop note_year
        RAISE NOTICE 'Both columns exist, migrating data and dropping note_year';
        
        -- First, populate academic_year from note_year where academic_year is empty
        UPDATE public.notes 
        SET academic_year = note_year 
        WHERE (academic_year IS NULL OR academic_year = '') 
        AND note_year IS NOT NULL;
        
        -- Then drop note_year column
        ALTER TABLE public.notes DROP COLUMN IF EXISTS note_year;
        
    ELSIF note_year_exists AND note_year_has_not_null THEN
        -- Scenario 3: note_year exists with NOT NULL, but we need to populate it or remove constraint
        RAISE NOTICE 'note_year has NOT NULL constraint, removing constraint';
        
        -- First try to populate any NULL values with a default
        UPDATE public.notes 
        SET note_year = 'N/A' 
        WHERE note_year IS NULL;
        
        -- Then remove the NOT NULL constraint
        ALTER TABLE public.notes ALTER COLUMN note_year DROP NOT NULL;
        
    END IF;
    
END $$;

-- Step 2: Ensure academic_year column exists and is properly set up
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Step 3: Make sure academic_year is NOT NULL only if we want it to be required
-- For now, let's make it NOT required since the form provides it
-- ALTER TABLE public.notes ALTER COLUMN academic_year SET NOT NULL;

-- Step 4: Create default values for any existing records that might be missing academic_year
UPDATE public.notes 
SET academic_year = 'N/A' 
WHERE academic_year IS NULL OR academic_year = '';

RAISE NOTICE 'note_year column issue should now be resolved';
