-- ============================================================================
-- FIX NOTES TABLE COLUMN MISMATCH
-- This script fixes the column name issues in the notes table
-- ============================================================================

-- First, let's see what columns currently exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns that the API expects
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS course_subject TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Notes';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Set default values for required fields if they are NULL
UPDATE public.notes SET academic_year = 'Undergraduate' WHERE academic_year IS NULL;
UPDATE public.notes SET course_subject = 'General' WHERE course_subject IS NULL;
UPDATE public.notes SET category = 'Notes' WHERE category IS NULL;

-- Verify the columns now exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;
