-- ============================================================================
-- CHECK AUTHENTICATION STATUS IN SUPABASE
-- ============================================================================
-- Run this in Supabase SQL Editor to see actual auth status

-- 1. Check auth.users table
SELECT 
    'Auth Users' as table_name,
    id,
    email,
    created_at,
    last_sign_in_at,
    app_metadata->>'provider' as provider,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check public.users table
SELECT 
    'Public Users' as table_name,
    id,
    name,
    email,
    college,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if auth users exist in public users
SELECT 
    'Missing in Public' as status,
    a.id,
    a.email,
    a.created_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

-- 4. Create missing public users (if any)
INSERT INTO public.users (id, name, email, created_at)
SELECT 
    a.id,
    COALESCE(
        a.raw_user_meta_data->>'name',
        a.raw_user_meta_data->>'full_name',
        split_part(a.email, '@', 1)
    ) as name,
    a.email,
    a.created_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Verify sync
SELECT 
    'Sync Status' as check_type,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM public.users) as public_users_count,
    (SELECT COUNT(*) FROM auth.users a INNER JOIN public.users p ON a.id = p.id) as synced_count;
