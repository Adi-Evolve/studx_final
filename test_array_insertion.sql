-- Test array insertion to verify PostgreSQL array handling
-- This script tests inserting proper array values for images and pdf_urls

-- First, check the current schema for the notes table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test inserting a note with proper array formatting
INSERT INTO public.notes (
    seller_id,
    title,
    description,
    price,
    images,
    pdf_urls,
    college,
    course_subject,
    academic_year,
    category,
    pdfUrl
) VALUES (
    '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a', -- Use an existing user ID
    'Test Array Note',
    'Testing proper array insertion',
    25.00,
    ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], -- Proper PostgreSQL array syntax
    ARRAY['https://example.com/pdf1.pdf', 'https://example.com/pdf2.pdf'], -- Proper PostgreSQL array syntax
    'Test University',
    'Computer Science',
    'Year 2',
    'notes',
    'https://example.com/pdf1.pdf'
) RETURNING id, title, images, pdf_urls;

-- Clean up test data
DELETE FROM public.notes WHERE title = 'Test Array Note';

-- Show proper array syntax examples:
-- For empty arrays: ARRAY[]::text[] or '{}'::text[]
-- For arrays with values: ARRAY['val1', 'val2'] or '{"val1", "val2"}'::text[]
