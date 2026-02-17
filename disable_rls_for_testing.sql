-- ============================================================================
-- QUICK AUTH DEBUG SCRIPT
-- ============================================================================
-- Run this to temporarily disable RLS for testing uploads

-- Temporarily disable RLS on all tables to test if it's an RLS issue
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Make storage completely permissive
DROP POLICY IF EXISTS "Allow all PDF operations" ON storage.objects;
DROP POLICY IF EXISTS "Allow all image operations" ON storage.objects;

CREATE POLICY "Allow everything on storage" ON storage.objects
FOR ALL USING (true);

-- Check current auth setup
SELECT 'Current Auth Status' as check_type, 
       EXISTS(SELECT 1 FROM auth.users LIMIT 1) as has_users,
       COUNT(*) as total_auth_users
FROM auth.users;

-- Check public users table
SELECT 'Public Users' as check_type, COUNT(*) as total_public_users
FROM public.users;

-- Re-enable RLS after testing (uncomment these lines after testing)
-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
