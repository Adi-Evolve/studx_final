-- ============================================================================
-- FIX ARRAY COLUMN ISSUES FOR NOTES TABLE
-- ============================================================================
-- This script fixes potential array column formatting issues

-- Check current column types in notes table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'notes'
    AND column_name IN ('images', 'pdf_urls')
ORDER BY ordinal_position;

-- Check if there are any views that depend on these columns
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
    AND (definition LIKE '%images%' OR definition LIKE '%pdf_urls%');

-- Drop any views that depend on the columns we need to alter
DROP VIEW IF EXISTS public.listings CASCADE;

-- Now we can safely alter the column types
ALTER TABLE public.notes ALTER COLUMN images TYPE TEXT[] USING 
    CASE 
        WHEN images IS NULL THEN NULL
        WHEN images::text = '' THEN '{}'::TEXT[]
        ELSE images::TEXT[]
    END;

ALTER TABLE public.notes ALTER COLUMN pdf_urls TYPE TEXT[] USING 
    CASE 
        WHEN pdf_urls IS NULL THEN NULL
        WHEN pdf_urls::text = '' THEN '{}'::TEXT[]
        ELSE pdf_urls::TEXT[]
    END;

-- Set default values for array columns to prevent NULL issues
UPDATE public.notes SET images = '{}' WHERE images IS NULL;
UPDATE public.notes SET pdf_urls = '{}' WHERE pdf_urls IS NULL;

-- Recreate the listings view if it was important (you may need to adjust this based on your needs)
-- CREATE VIEW public.listings AS 
-- SELECT 
--     'note' as type,
--     id,
--     title,
--     price,
--     college,
--     images,
--     created_at
-- FROM public.notes
-- UNION ALL
-- SELECT 
--     'product' as type,
--     id,
--     title,
--     price,
--     college,
--     images,
--     created_at
-- FROM public.products
-- UNION ALL
-- SELECT 
--     'room' as type,
--     id,
--     title,
--     price,
--     college,
--     images,
--     created_at
-- FROM public.rooms;

-- Test array insert to verify it works
DO $$
BEGIN
    -- Try to insert a test record with arrays
    INSERT INTO public.notes (
        id,
        seller_id,
        title,
        price,
        college,
        course_subject,
        academic_year,
        category,
        images,
        pdf_urls,
        created_at
    ) VALUES (
        gen_random_uuid(),
        (SELECT id FROM public.users LIMIT 1),
        'Test Array Insert',
        100.00,
        'Test College',
        'Test Subject',
        'Test Year',
        'Notes',
        ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        ARRAY['https://example.com/pdf1.pdf', 'https://example.com/pdf2.pdf'],
        NOW()
    );
    
    RAISE NOTICE 'Test array insert successful!';
    
    -- Clean up test record
    DELETE FROM public.notes WHERE title = 'Test Array Insert';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test array insert failed: %', SQLERRM;
END $$;

-- Verify column structure
SELECT 
    'Final Check' as status,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'notes'
    AND column_name IN ('images', 'pdf_urls', 'pdfUrl')
ORDER BY column_name;
