-- Database Diagnosis Script for StudXchange Notes Upload Issue
-- Run this in your Supabase SQL editor to check the current state

-- 1. Check if notes table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if storage buckets exist
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('product_pdfs', 'notes_pdfs');

-- 3. Check storage policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 4. Test a sample insert to see what fails
-- (Comment out the next part - just for reference)
/*
INSERT INTO public.notes (
    seller_id,
    title,
    description,
    price,
    image_urls,
    college,
    course_subject,
    academic_year,
    category,
    pdf_urls
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- Replace with actual user ID
    'Test Note',
    'Test Description',
    100.00,
    ARRAY['http://example.com/image1.jpg']::text[],
    'Test College',
    'Test Subject',
    'Undergraduate',
    'Notes',
    ARRAY['http://example.com/pdf1.pdf']::text[]
);
*/
