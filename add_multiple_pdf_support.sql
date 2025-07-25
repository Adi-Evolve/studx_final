-- ============================================================================
-- ADD MULTIPLE PDF SUPPORT TO NOTES TABLE
-- Run this to add support for multiple PDFs (100MB each)
-- ============================================================================

-- Add new column for storing multiple PDF URLs
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];

-- Update existing notes to migrate single pdfUrl to pdf_urls array
UPDATE public.notes 
SET pdf_urls = CASE 
    WHEN pdfUrl IS NOT NULL AND pdfUrl != '' THEN ARRAY[pdfUrl]
    ELSE ARRAY[]::TEXT[]
END
WHERE pdf_urls IS NULL;

-- Verify the migration
SELECT 
    id,
    title,
    pdfUrl,
    pdf_urls,
    array_length(pdf_urls, 1) as pdf_count
FROM public.notes 
WHERE pdfUrl IS NOT NULL 
LIMIT 5;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
  AND table_schema = 'public'
  AND column_name IN ('pdfUrl', 'pdf_urls')
ORDER BY column_name;
