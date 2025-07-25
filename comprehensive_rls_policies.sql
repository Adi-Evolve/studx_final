-- ============================================================================
-- COMPREHENSIVE RLS POLICIES FOR DEVELOPMENT
-- This script creates permissive RLS policies for all tables to allow development
-- ============================================================================

-- First, check current RLS status
SELECT schemaname, tablename, rowsecurity, forcerls 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'rooms', 'notes', 'products', 'categories', 'favorites', 'reviews');

-- ============================================================================
-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT (Option 1 - Most Permissive)
-- ============================================================================
-- This completely disables RLS for development - use this for easier debugging

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- OR: ENABLE RLS WITH PERMISSIVE POLICIES (Option 2 - More Secure)
-- Comment out the DISABLE commands above and use this instead
-- ============================================================================

-- Enable RLS on all tables
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for all users" ON public.users;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.users;

-- Create permissive policies for users table
-- CREATE POLICY "Allow all operations for development" ON public.users
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- ROOMS TABLE POLICIES
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can update own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.rooms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.rooms;
DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON public.rooms;
DROP POLICY IF EXISTS "Enable delete for users based on seller_id" ON public.rooms;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.rooms;

-- Create permissive policies for rooms table
-- CREATE POLICY "Allow all operations for development" ON public.rooms
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- NOTES TABLE POLICIES
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.notes;
DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON public.notes;
DROP POLICY IF EXISTS "Enable delete for users based on seller_id" ON public.notes;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.notes;

-- Create permissive policies for notes table
-- CREATE POLICY "Allow all operations for development" ON public.notes
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can insert products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on seller_id" ON public.products;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.products;

-- Create permissive policies for products table
-- CREATE POLICY "Allow all operations for development" ON public.products
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.categories;

-- Create permissive policies for categories table
-- CREATE POLICY "Allow all operations for development" ON public.categories
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FAVORITES TABLE POLICIES (if exists)
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.favorites;

-- Create permissive policies for favorites table
-- CREATE POLICY "Allow all operations for development" ON public.favorites
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- REVIEWS TABLE POLICIES (if exists)
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.reviews;

-- Create permissive policies for reviews table
-- CREATE POLICY "Allow all operations for development" ON public.reviews
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================================================

-- Grant all permissions to anon role (for development)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant all permissions to authenticated role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant all permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS status after changes
SELECT schemaname, tablename, rowsecurity, forcerls 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'rooms', 'notes', 'products', 'categories', 'favorites', 'reviews');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test basic operations (these should all work now)
-- SELECT 'Testing SELECT on users' as test, count(*) as count FROM public.users;
-- SELECT 'Testing SELECT on rooms' as test, count(*) as count FROM public.rooms;
-- SELECT 'Testing SELECT on notes' as test, count(*) as count FROM public.notes;
-- SELECT 'Testing SELECT on products' as test, count(*) as count FROM public.products;

-- ============================================================================
-- TO RE-ENABLE PRODUCTION RLS LATER
-- ============================================================================
-- Uncomment these when moving to production:

/*
-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create production-ready policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public listings" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own listings" ON public.rooms
    FOR UPDATE USING (auth.uid() = seller_id);

-- Add similar policies for notes and products...
*/
