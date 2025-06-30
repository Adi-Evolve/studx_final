-- Query to check where passwords are actually stored in Supabase
-- Run these queries in your Supabase SQL Editor

-- 1. Check the auth.users table (system table where passwords are stored)
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check your public.users table (your custom user data)
SELECT 
    id,
    email,
    name,
    phone,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Join both tables to see the complete picture
SELECT 
    au.id,
    au.email,
    au.encrypted_password IS NOT NULL as password_stored_in_auth,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.name,
    pu.phone,
    au.created_at as auth_created,
    pu.created_at as profile_created
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC 
LIMIT 10;

-- 4. Check authentication methods for users
SELECT 
    au.id,
    au.email,
    -- Password authentication
    CASE 
        WHEN au.encrypted_password IS NOT NULL THEN 'Password ✅'
        ELSE 'No Password ❌'
    END as password_auth,
    -- OAuth providers
    COALESCE(
        string_agg(ai.provider, ', '), 
        'No OAuth'
    ) as oauth_providers,
    au.created_at
FROM auth.users au
LEFT JOIN auth.identities ai ON au.id = ai.user_id
GROUP BY au.id, au.email, au.encrypted_password, au.created_at
ORDER BY au.created_at DESC
LIMIT 10;
