-- Database Diagnostic Script for StudX
-- Run this in Supabase SQL Editor to diagnose table issues

-- 1. Check what tables exist in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if specific tables exist and their structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('notes', 'rooms', 'products', 'users')
ORDER BY table_name, ordinal_position;

-- 3. Check row counts for each table
SELECT 
    'products' as table_name, 
    COUNT(*) as row_count 
FROM public.products
UNION ALL
SELECT 
    'notes' as table_name, 
    COUNT(*) as row_count 
FROM public.notes
UNION ALL
SELECT 
    'rooms' as table_name, 
    COUNT(*) as row_count 
FROM public.rooms
UNION ALL
SELECT 
    'users' as table_name, 
    COUNT(*) as row_count 
FROM public.users;

-- 4. Sample data from each table (first 3 rows)
SELECT 'PRODUCTS SAMPLE:' as info;
SELECT id, title, category, price, created_at 
FROM public.products 
LIMIT 3;

SELECT 'NOTES SAMPLE:' as info;
SELECT id, title, subject, created_at 
FROM public.notes 
LIMIT 3;

SELECT 'ROOMS SAMPLE:' as info;
SELECT id, title, location, price, created_at 
FROM public.rooms 
LIMIT 3;

-- 5. Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('notes', 'rooms', 'products')
ORDER BY tablename, policyname;

-- 6. Check table permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name IN ('notes', 'rooms', 'products')
ORDER BY table_name, grantee;

-- 7. Check if there are any foreign key constraints that might cause issues
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('notes', 'rooms', 'products')
    AND tc.constraint_type = 'FOREIGN KEY';
