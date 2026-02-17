-- ============================================================================
-- DIAGNOSTIC SCRIPT - Run this to check current auth setup
-- ============================================================================

-- 1. Check if storage buckets exist
SELECT 'Storage Buckets' as check_type, name, public, created_at 
FROM storage.buckets 
WHERE name IN ('product_pdfs', 'product_images');

-- 2. Check storage policies
SELECT 'Storage Policies' as check_type, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND (qual LIKE '%product_pdfs%' OR qual LIKE '%product_images%');

-- 3. Check notes table structure
SELECT 'Notes Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notes'
ORDER BY ordinal_position;

-- 4. Check RLS status
SELECT 'RLS Status' as check_type, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notes', 'products', 'rooms', 'users');

-- 5. Check RLS policies for notes
SELECT 'Notes Policies' as check_type, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'notes';

-- 6. Check if there are any users in the users table
SELECT 'User Count' as check_type, COUNT(*) as total_users
FROM public.users;

-- 7. Check if there's a handle_new_user function
SELECT 'Functions' as check_type, proname, prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 8. Check auth triggers
SELECT 'Triggers' as check_type, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Sample test query (will fail if auth is not working)
-- SELECT 'Auth Test' as check_type, auth.uid() as current_user_id;
