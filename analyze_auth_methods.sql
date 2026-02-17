-- DETAILED PASSWORD ANALYSIS - Understanding Different Auth Methods
-- Run this in your Supabase SQL Editor

-- 1. Check the actual auth.users table structure to see available columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 2. Detailed analysis of password storage patterns
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    phone IS NOT NULL as has_phone,
    created_at,
    updated_at,
    -- Check if there are other auth-related columns
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'Email/Password Auth'
        WHEN phone IS NOT NULL THEN 'Possible Phone Auth'
        ELSE 'Other Auth Method'
    END as likely_auth_method
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Count different authentication patterns
SELECT 
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'Has Password (Email Auth)'
        WHEN phone IS NOT NULL THEN 'Has Phone (Phone Auth)'
        ELSE 'No Password/Phone (OAuth/Other)'
    END as auth_type,
    COUNT(*) as user_count
FROM auth.users 
GROUP BY 
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'Has Password (Email Auth)'
        WHEN phone IS NOT NULL THEN 'Has Phone (Phone Auth)'
        ELSE 'No Password/Phone (OAuth/Other)'
    END
ORDER BY user_count DESC;

-- 4. Check for any OAuth-related columns (common in Supabase)
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    phone IS NOT NULL as has_phone,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if users without passwords might be OAuth users
SELECT 
    'Users with passwords' as category,
    COUNT(*) as count
FROM auth.users 
WHERE encrypted_password IS NOT NULL
UNION ALL
SELECT 
    'Users without passwords' as category,
    COUNT(*) as count
FROM auth.users 
WHERE encrypted_password IS NULL
UNION ALL
SELECT 
    'Total users' as category,
    COUNT(*) as count
FROM auth.users;

-- 6. For users without passwords, check their metadata for clues
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    raw_app_meta_data::text as app_metadata,
    raw_user_meta_data::text as user_metadata,
    created_at
FROM auth.users 
WHERE encrypted_password IS NULL
ORDER BY created_at DESC
LIMIT 5;
