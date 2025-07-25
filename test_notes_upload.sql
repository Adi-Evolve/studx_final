-- Test script to verify notes upload and data storage
-- Run this after uploading a test note to check if URLs are saved

-- 1. Check the latest note uploaded
SELECT 
  id,
  title,
  images,
  pdf_urls,
  "pdfUrl",
  course_subject,
  academic_year,
  created_at
FROM notes 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if any notes have empty arrays that should have data
SELECT 
  id,
  title,
  CASE 
    WHEN images IS NULL THEN 'NULL'
    WHEN array_length(images, 1) IS NULL THEN 'EMPTY_ARRAY'
    ELSE 'HAS_DATA (' || array_length(images, 1) || ' images)'
  END as images_status,
  CASE 
    WHEN pdf_urls IS NULL THEN 'NULL'
    WHEN array_length(pdf_urls, 1) IS NULL THEN 'EMPTY_ARRAY'
    ELSE 'HAS_DATA (' || array_length(pdf_urls, 1) || ' PDFs)'
  END as pdf_urls_status,
  CASE 
    WHEN "pdfUrl" IS NULL THEN 'NULL'
    ELSE 'HAS_DATA'
  END as pdfUrl_status,
  created_at
FROM notes 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check the table structure to ensure all required columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test inserting a sample note with arrays (to verify the schema works)
-- This will help us understand if the issue is in the schema or the API logic
INSERT INTO notes (
  seller_id,
  title,
  description,
  price,
  images,
  pdf_urls,
  "pdfUrl",
  college,
  course_subject,
  academic_year,
  category
) VALUES (
  (SELECT id FROM users LIMIT 1), -- Use any existing user
  'Test Note Upload',
  'Testing if arrays work',
  15.00,
  ARRAY['https://example.com/test-image.jpg'],
  ARRAY['https://example.com/test.pdf'],
  'https://example.com/test.pdf',
  'Test College',
  'Computer Science',
  '2nd Year',
  'notes'
);

-- 5. Verify the test insert worked
SELECT 
  id,
  title,
  images,
  pdf_urls,
  "pdfUrl"
FROM notes 
WHERE title = 'Test Note Upload';
