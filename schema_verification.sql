-- ============================================================================
-- SCHEMA UPDATE VERIFICATION SCRIPT
-- ============================================================================
-- This script verifies that all components are now using the correct new schema
-- Run this to check that all the updates have been applied correctly

-- Check that all tables have the correct column structure
SELECT 'PRODUCTS TABLE STRUCTURE' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'NOTES TABLE STRUCTURE' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ROOMS TABLE STRUCTURE' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if old columns still exist (should be removed eventually)
SELECT 'LEGACY COLUMNS CHECK' as section;
SELECT 
    table_name,
    column_name,
    'Should be migrated to images array' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'notes', 'rooms')
AND column_name = 'image_urls';

-- Verify array columns are properly set up
SELECT 'ARRAY COLUMNS VERIFICATION' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    'Should be TEXT[]' as expected_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'notes', 'rooms')
AND column_name IN ('images', 'pdf_urls', 'amenities');

-- Check that required columns exist
SELECT 'REQUIRED COLUMNS CHECK' as section;
SELECT 
    'products' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as images_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as category_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_sold') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as is_sold_column

UNION ALL

SELECT 
    'notes' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'images') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as images_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'academic_year') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as academic_year_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'pdf_urls') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as pdf_urls_column

UNION ALL

SELECT 
    'rooms' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'images') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as images_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'amenities') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as amenities_column,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'room_type') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as room_type_column;

-- Test sample data fetching to ensure no errors
SELECT 'SAMPLE DATA FETCH TEST' as section;

-- Test products
SELECT 
    'products' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN images IS NOT NULL THEN 1 END) as with_images,
    COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as with_category
FROM products;

-- Test notes  
SELECT 
    'notes' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN images IS NOT NULL THEN 1 END) as with_images,
    COUNT(CASE WHEN pdf_urls IS NOT NULL THEN 1 END) as with_pdf_urls,
    COUNT(CASE WHEN academic_year IS NOT NULL THEN 1 END) as with_academic_year
FROM notes;

-- Test rooms
SELECT 
    'rooms' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN images IS NOT NULL THEN 1 END) as with_images,
    COUNT(CASE WHEN amenities IS NOT NULL THEN 1 END) as with_amenities
FROM rooms;

SELECT 'SCHEMA UPDATE VERIFICATION COMPLETE' as final_status;
