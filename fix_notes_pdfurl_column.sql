-- Check notes table schema and fix pdfUrl column issue
-- This script will diagnose and fix the database schema problems

-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if pdfUrl column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND table_schema = 'public'
    AND column_name = 'pdfUrl'
) as pdfUrl_exists;

-- Check if pdf_urls column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND table_schema = 'public'
    AND column_name = 'pdf_urls'
) as pdf_urls_exists;

-- Add pdfUrl column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND table_schema = 'public'
        AND column_name = 'pdfUrl'
    ) THEN
        ALTER TABLE public.notes ADD COLUMN pdfUrl TEXT;
        RAISE NOTICE 'Added pdfUrl column to notes table';
    ELSE
        RAISE NOTICE 'pdfUrl column already exists in notes table';
    END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
AND column_name IN ('pdfUrl', 'pdf_urls')
ORDER BY column_name;
