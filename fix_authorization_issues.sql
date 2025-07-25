-- ============================================================================
-- FIX AUTHORIZATION ISSUES FOR NOTES UPLOAD
-- ============================================================================
-- This script fixes RLS policies and storage policies to allow proper uploads

-- ============================================================================
-- 1. ENSURE STORAGE BUCKETS EXIST
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('product_pdfs', 'product_pdfs', true),
('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. FIX STORAGE POLICIES (Most permissive for uploads)
-- ============================================================================

-- Remove all existing storage policies to start fresh
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own PDFs." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own PDFs." ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images." ON storage.objects;

-- Create permissive storage policies
-- PDFs bucket policies
CREATE POLICY "Allow all PDF operations" ON storage.objects
FOR ALL USING (bucket_id = 'product_pdfs');

-- Images bucket policies  
CREATE POLICY "Allow all image operations" ON storage.objects
FOR ALL USING (bucket_id = 'product_images');

-- ============================================================================
-- 3. FIX RLS POLICIES FOR NOTES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;

-- Create more permissive policies for notes
CREATE POLICY "Allow all to view notes" ON public.notes 
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert notes" ON public.notes 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own notes" ON public.notes 
FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Allow users to delete their own notes" ON public.notes 
FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- 4. FIX RLS POLICIES FOR OTHER TABLES (Products, Rooms)
-- ============================================================================

-- Products table policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;

CREATE POLICY "Allow all to view products" ON public.products 
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON public.products 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own products" ON public.products 
FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Allow users to delete their own products" ON public.products 
FOR DELETE USING (auth.uid() = seller_id);

-- Rooms table policies
DROP POLICY IF EXISTS "Rooms are viewable by everyone." ON public.rooms;
DROP POLICY IF EXISTS "Users can insert their own room listings." ON public.rooms;
DROP POLICY IF EXISTS "Users can update their own room listings." ON public.rooms;
DROP POLICY IF EXISTS "Users can delete their own room listings." ON public.rooms;

CREATE POLICY "Allow all to view rooms" ON public.rooms 
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert rooms" ON public.rooms 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own rooms" ON public.rooms 
FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Allow users to delete their own rooms" ON public.rooms 
FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- 5. ENSURE USERS TABLE HAS PROPER POLICIES
-- ============================================================================

-- Users table policies (ensure users can be created)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;

CREATE POLICY "Allow all to view user profiles" ON public.users 
FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 6. VERIFY TABLES HAVE RLS ENABLED
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CHECK FOR MISSING COLUMNS AND ADD THEM
-- ============================================================================

-- Ensure notes table has all required columns
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS course_subject TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Notes';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set default values for existing NULL records
UPDATE public.notes SET category = 'Notes' WHERE category IS NULL;
UPDATE public.notes SET academic_year = 'Undergraduate' WHERE academic_year IS NULL;
UPDATE public.notes SET course_subject = 'General' WHERE course_subject IS NULL;

-- ============================================================================
-- 8. TEMPORARILY DISABLE RLS FOR TESTING (OPTIONAL)
-- ============================================================================
-- Uncomment the lines below if you want to test without RLS first
-- ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check storage buckets
SELECT name, public FROM storage.buckets WHERE name IN ('product_pdfs', 'product_images');

-- Check storage policies
SELECT policyname, cmd, qual FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check table policies
SELECT schemaname, tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('notes', 'products', 'rooms', 'users')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notes', 'products', 'rooms', 'users');

-- Script complete - Authorization fix for StudXchange upload issues
