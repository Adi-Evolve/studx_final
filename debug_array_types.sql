-- Check exact column types and constraints for the notes table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    udt_name,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any constraints on the array columns
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notes' 
AND tc.table_schema = 'public'
AND kcu.column_name IN ('images', 'pdf_urls');

-- Test inserting with different array formats to see what works
-- This will help us understand the exact format PostgreSQL expects

-- Method 1: Using PostgreSQL ARRAY syntax
SELECT 'Method 1: ARRAY syntax' as test_method;
/*
INSERT INTO public.notes (
    seller_id, title, description, price, images, pdf_urls, 
    college, course_subject, academic_year, category, "pdfUrl"
) VALUES (
    '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a',
    'Test Array Format 1',
    'Testing PostgreSQL ARRAY syntax',
    10.00,
    ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    ARRAY['https://example.com/pdf1.pdf', 'https://example.com/pdf2.pdf'],
    'Test College',
    'Test Subject',
    'Test Year',
    'notes',
    'https://example.com/pdf1.pdf'
) RETURNING id, images, pdf_urls;
*/

-- Method 2: Using string literal array syntax
SELECT 'Method 2: String literal syntax' as test_method;
/*
INSERT INTO public.notes (
    seller_id, title, description, price, images, pdf_urls, 
    college, course_subject, academic_year, category, "pdfUrl"
) VALUES (
    '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a',
    'Test Array Format 2',
    'Testing string literal array syntax',
    10.00,
    '{"https://example.com/image1.jpg", "https://example.com/image2.jpg"}',
    '{"https://example.com/pdf1.pdf", "https://example.com/pdf2.pdf"}',
    'Test College',
    'Test Subject',
    'Test Year',
    'notes',
    'https://example.com/pdf1.pdf'
) RETURNING id, images, pdf_urls;
*/

-- Clean up test records
-- DELETE FROM public.notes WHERE title LIKE 'Test Array Format%';

-- Show the current data types for debugging
SELECT 
    'images' as column_name,
    pg_typeof(images) as pg_type,
    array_length(images, 1) as array_length,
    images
FROM public.notes 
WHERE images IS NOT NULL 
LIMIT 3;

SELECT 
    'pdf_urls' as column_name,
    pg_typeof(pdf_urls) as pg_type,
    array_length(pdf_urls, 1) as array_length,
    pdf_urls
FROM public.notes 
WHERE pdf_urls IS NOT NULL 
LIMIT 3;
