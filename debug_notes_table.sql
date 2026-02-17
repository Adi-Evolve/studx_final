-- Debug script to check the current structure of the notes table
-- Run this in your Supabase SQL editor to see the actual columns

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'notes' 
AND tc.table_schema = 'public';

-- Check if note_year column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND column_name = 'note_year' 
    AND table_schema = 'public'
) AS note_year_exists;

-- Check if academic_year column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND column_name = 'academic_year' 
    AND table_schema = 'public'
) AS academic_year_exists;
