-- DIRECT PASSWORD STORAGE CHECK
-- Run this in your Supabase SQL Editor to check existing users

-- 1. Quick overview of all users and their password status
SELECT 'Password Storage Overview' as check_type;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    LENGTH(encrypted_password) as password_hash_length,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Count users with and without passwords
SELECT 'Password Storage Counts' as check_type;
SELECT 
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'HAS PASSWORD'
        ELSE 'NO PASSWORD'
    END as password_status,
    COUNT(*) as user_count
FROM auth.users 
GROUP BY (encrypted_password IS NOT NULL)
ORDER BY user_count DESC;

-- 3. Check specific recent users (non-anonymous)
SELECT 'Recent Non-Anonymous Users' as check_type;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    LENGTH(encrypted_password) as hash_length,
    created_at,
    raw_app_meta_data::text as metadata_snippet
FROM auth.users 
WHERE email NOT LIKE '%anonymous%'
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Show sample of users WITHOUT passwords (to identify the issue)
SELECT 'Users Without Passwords (Sample)' as check_type;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    raw_app_meta_data::text as app_metadata,
    raw_user_meta_data::text as user_metadata,
    created_at
FROM auth.users 
WHERE encrypted_password IS NULL
AND email IS NOT NULL
AND email NOT LIKE '%anonymous%'
ORDER BY created_at DESC
LIMIT 3;

-- 5. Check if any users DO have passwords (to confirm it works sometimes)
SELECT 'Users WITH Passwords (Sample)' as check_type;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    LENGTH(encrypted_password) as hash_length,
    created_at
FROM auth.users 
WHERE encrypted_password IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;
