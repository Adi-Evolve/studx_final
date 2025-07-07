-- COMPREHENSIVE PASSWORD STORAGE DIAGNOSTIC
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check if auth.users table has the encrypted_password column
SELECT 'Checking auth.users table structure' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
AND column_name IN ('email', 'encrypted_password', 'phone', 'email_confirmed_at', 'raw_app_meta_data', 'raw_user_meta_data')
ORDER BY column_name;

-- 2. Check authentication configuration
SELECT 'Checking auth configuration' as step;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    phone IS NOT NULL as has_phone,
    LENGTH(encrypted_password) as password_length,
    created_at,
    updated_at,
    SUBSTRING(raw_app_meta_data::text, 1, 100) as app_metadata_snippet,
    SUBSTRING(raw_user_meta_data::text, 1, 100) as user_metadata_snippet
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count different scenarios
SELECT 'User count analysis' as step;
SELECT 
    CASE 
        WHEN encrypted_password IS NOT NULL AND email IS NOT NULL THEN 'Email with Password'
        WHEN encrypted_password IS NULL AND email IS NOT NULL THEN 'Email without Password (OAuth?)'
        WHEN phone IS NOT NULL THEN 'Phone Auth'
        ELSE 'Unknown Auth Type'
    END as auth_type,
    COUNT(*) as user_count,
    MIN(created_at) as first_user,
    MAX(created_at) as latest_user
FROM auth.users 
GROUP BY 
    CASE 
        WHEN encrypted_password IS NOT NULL AND email IS NOT NULL THEN 'Email with Password'
        WHEN encrypted_password IS NULL AND email IS NOT NULL THEN 'Email without Password (OAuth?)'
        WHEN phone IS NOT NULL THEN 'Phone Auth'
        ELSE 'Unknown Auth Type'
    END
ORDER BY user_count DESC;

-- 4. Check recent signups specifically
SELECT 'Recent signups analysis' as step;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as confirmed,
    created_at,
    -- Check if this looks like a manual email signup vs OAuth
    CASE 
        WHEN raw_app_meta_data::text LIKE '%"provider":"email"%' THEN 'Email Signup'
        WHEN raw_app_meta_data::text LIKE '%"provider":"google"%' THEN 'Google OAuth'
        WHEN raw_app_meta_data::text LIKE '%"provider":"github"%' THEN 'GitHub OAuth'
        ELSE 'Other/Unknown'
    END as signup_method
FROM auth.users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 5. Check for any authentication policies or triggers that might interfere
SELECT 'Checking auth policies' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 6. Sample a user with no password to see their full metadata
SELECT 'Sample user without password metadata' as step;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE encrypted_password IS NULL 
AND email IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- 7. Check if there are any auth.users entries that should have passwords but don't
SELECT 'Suspicious users (should have passwords)' as step;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    raw_app_meta_data::text as metadata,
    created_at
FROM auth.users 
WHERE encrypted_password IS NULL 
AND email IS NOT NULL
AND raw_app_meta_data::text NOT LIKE '%"provider":"google"%'
AND raw_app_meta_data::text NOT LIKE '%"provider":"github"%'
AND raw_app_meta_data::text NOT LIKE '%"provider":"facebook"%'
AND raw_app_meta_data::text NOT LIKE '%"provider":"discord"%'
AND email NOT LIKE '%anonymous%'
ORDER BY created_at DESC;

SELECT '=== DIAGNOSTIC COMPLETE ===' as summary;
