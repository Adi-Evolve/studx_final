-- Check users table structure and fix user sync issues

-- 1. Check if users table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 4. Check current users in auth.users vs public.users
SELECT 
    'auth.users' as source,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as source,
    COUNT(*) as count
FROM public.users;

-- 5. Show sample auth user data
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
LIMIT 3;

-- 6. Show sample public users data
SELECT 
    id,
    email,
    name,
    avatar_url,
    created_at
FROM public.users 
LIMIT 3;
