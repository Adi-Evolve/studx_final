-- Test script to verify notes display and download functionality will work
-- Run this to check that the notes data has the correct structure for display

-- Check if there are any notes in the database
SELECT 'NOTES COUNT' as section, COUNT(*) as total_notes FROM public.notes;

-- Check the structure of existing notes data
SELECT 'SAMPLE NOTES DATA' as section;
SELECT 
    id,
    title,
    college,
    academic_year,
    course_subject,
    category,
    price,
    CASE 
        WHEN images IS NULL THEN 'NULL'
        WHEN array_length(images, 1) IS NULL THEN 'EMPTY_ARRAY'
        ELSE CONCAT('ARRAY[', array_length(images, 1), ']')
    END as images_status,
    CASE 
        WHEN pdf_urls IS NULL THEN 'NULL'
        WHEN array_length(pdf_urls, 1) IS NULL THEN 'EMPTY_ARRAY'
        ELSE CONCAT('ARRAY[', array_length(pdf_urls, 1), ']')
    END as pdf_urls_status,
    CASE 
        WHEN pdfUrl IS NULL THEN 'NULL'
        WHEN pdfUrl = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as pdfUrl_status,
    created_at
FROM public.notes 
ORDER BY created_at DESC
LIMIT 5;

-- Check if any notes have images
SELECT 'NOTES WITH IMAGES' as section;
SELECT 
    COUNT(*) as notes_with_images,
    COUNT(CASE WHEN array_length(images, 1) > 0 THEN 1 END) as notes_with_non_empty_images
FROM public.notes 
WHERE images IS NOT NULL;

-- Check if any notes have PDFs
SELECT 'NOTES WITH PDFS' as section;
SELECT 
    COUNT(CASE WHEN pdfUrl IS NOT NULL AND pdfUrl != '' THEN 1 END) as notes_with_single_pdf,
    COUNT(CASE WHEN pdf_urls IS NOT NULL AND array_length(pdf_urls, 1) > 0 THEN 1 END) as notes_with_pdf_array,
    COUNT(CASE WHEN (pdfUrl IS NOT NULL AND pdfUrl != '') OR (pdf_urls IS NOT NULL AND array_length(pdf_urls, 1) > 0) THEN 1 END) as notes_with_any_pdf
FROM public.notes;

-- Show any potential data issues
SELECT 'POTENTIAL ISSUES' as section;
SELECT 
    'Notes missing images and PDFs' as issue_type,
    COUNT(*) as count
FROM public.notes 
WHERE (images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0)
AND (pdfUrl IS NULL OR pdfUrl = '')
AND (pdf_urls IS NULL OR array_length(pdf_urls, 1) IS NULL OR array_length(pdf_urls, 1) = 0)

UNION ALL

SELECT 
    'Notes missing academic_year' as issue_type,
    COUNT(*) as count
FROM public.notes 
WHERE academic_year IS NULL OR academic_year = ''

UNION ALL

SELECT 
    'Notes missing course_subject' as issue_type,
    COUNT(*) as count
FROM public.notes 
WHERE course_subject IS NULL OR course_subject = '';

-- Sample URLs for testing (first few)
SELECT 'SAMPLE URLS FOR TESTING' as section;
SELECT 
    id,
    title,
    images[1] as first_image_url,
    pdf_urls[1] as first_pdf_url,
    pdfUrl as single_pdf_url
FROM public.notes 
WHERE (images IS NOT NULL AND array_length(images, 1) > 0)
   OR (pdf_urls IS NOT NULL AND array_length(pdf_urls, 1) > 0)
   OR (pdfUrl IS NOT NULL AND pdfUrl != '')
LIMIT 3;
