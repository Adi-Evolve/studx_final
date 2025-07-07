-- CORRECTED PASSWORD STORAGE CHECK
-- Run this in your Supabase SQL Editor

-- 1. Check the actual structure of auth.users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 2. Check if passwords are stored (corrected query without 'provider' column)
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Count users with passwords
SELECT 
    COUNT(*) as total_users,
    COUNT(encrypted_password) as users_with_passwords,
    COUNT(email_confirmed_at) as confirmed_emails
FROM auth.users;

-- 4. Check the relationship between auth.users and public.users
SELECT 
    'Auth Users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as table_name,
    COUNT(*) as count
FROM public.users;

-- 5. Check if auth and public users are properly synced
SELECT 
    au.email as auth_email,
    pu.email as public_email,
    pu.name,
    au.created_at as auth_created,
    pu.created_at as public_created
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC
LIMIT 5;
