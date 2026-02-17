-- First check current table structures before making changes
-- This will help us understand what columns already exist

-- Check all columns in products table
SELECT 
    '=== CURRENT PRODUCTS TABLE STRUCTURE ===' as section,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all columns in notes table
SELECT 
    '=== CURRENT NOTES TABLE STRUCTURE ===' as section,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all columns in rooms table  
SELECT 
    '=== CURRENT ROOMS TABLE STRUCTURE ===' as section,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if these tables actually exist
SELECT 
    '=== TABLE EXISTENCE CHECK ===' as section,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'notes', 'rooms')
ORDER BY table_name;
