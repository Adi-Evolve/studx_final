-- Quick schema verification and array test for notes table
-- Run this in your Supabase SQL editor to check the exact column types

-- 1. Check the exact column definitions
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND column_name IN ('images', 'pdf_urls', 'image_urls')
ORDER BY column_name;

-- 2. Check if there are any existing records and their data types
SELECT 
    'images' as field_name,
    pg_typeof(images) as postgres_type,
    array_length(images, 1) as array_length,
    images
FROM public.notes 
WHERE images IS NOT NULL 
LIMIT 2;

SELECT 
    'pdf_urls' as field_name,
    pg_typeof(pdf_urls) as postgres_type,
    array_length(pdf_urls, 1) as array_length,
    pdf_urls
FROM public.notes 
WHERE pdf_urls IS NOT NULL 
LIMIT 2;

-- 3. Test simple array insertion to see what works
DO $$
DECLARE
    test_seller_id UUID := '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a'; -- Use existing user ID
    test_id UUID;
BEGIN
    -- Insert base record first
    INSERT INTO public.notes (
        seller_id, title, description, price, college, course_subject, academic_year, category
    ) VALUES (
        test_seller_id, 'Array Test Record', 'Testing arrays', 10.00, 
        'Test College', 'Test Subject', 'Test Year', 'notes'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Created test record with ID: %', test_id;
    
    -- Try different array update methods
    BEGIN
        -- Method 1: Direct array assignment
        UPDATE public.notes 
        SET images = ARRAY['https://example.com/test1.jpg', 'https://example.com/test2.jpg']
        WHERE id = test_id;
        RAISE NOTICE 'Method 1 (direct ARRAY) succeeded for images';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Method 1 failed for images: %', SQLERRM;
    END;
    
    BEGIN
        -- Method 2: String array literal
        UPDATE public.notes 
        SET pdf_urls = '{"https://example.com/test1.pdf", "https://example.com/test2.pdf"}'::text[]
        WHERE id = test_id;
        RAISE NOTICE 'Method 2 (string literal) succeeded for pdf_urls';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Method 2 failed for pdf_urls: %', SQLERRM;
    END;
    
    -- Check what was actually saved
    DECLARE
        saved_images text[];
        saved_pdfs text[];
    BEGIN
        SELECT images, pdf_urls INTO saved_images, saved_pdfs
        FROM public.notes WHERE id = test_id;
        
        RAISE NOTICE 'Saved images: %', saved_images;
        RAISE NOTICE 'Saved PDFs: %', saved_pdfs;
    END;
    
    -- Clean up
    DELETE FROM public.notes WHERE id = test_id;
    RAISE NOTICE 'Cleaned up test record';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;
