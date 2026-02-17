-- Fix Profile Page Data Access Issues

-- 1. Check current RLS policies for listing tables
SELECT 
    'Current RLS Policies' as info,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('products', 'notes', 'rooms')
ORDER BY tablename, policyname;

-- 2. Ensure proper RLS policies for authenticated users to read their own listings
-- Products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Users can view own products" ON public.products
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notes;

CREATE POLICY "Enable read access for all users" ON public.notes
    FOR SELECT USING (true);

CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can insert notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Rooms table
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can view own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.rooms;

CREATE POLICY "Enable read access for all users" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Users can view own rooms" ON public.rooms
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can update own rooms" ON public.rooms
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- 3. Check if seller_id columns have proper UUID type and indexes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('products', 'notes', 'rooms') 
    AND column_name = 'seller_id';

-- 4. Create indexes for better performance on seller_id lookups
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_notes_seller_id ON public.notes(seller_id);
CREATE INDEX IF NOT EXISTS idx_rooms_seller_id ON public.rooms(seller_id);

-- 5. Test query to see what data exists
SELECT 
    'products' as table_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT seller_id) as unique_sellers
FROM public.products
UNION ALL
SELECT 
    'notes' as table_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT seller_id) as unique_sellers
FROM public.notes
UNION ALL
SELECT 
    'rooms' as table_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT seller_id) as unique_sellers
FROM public.rooms;

-- 6. Show sample data to verify seller_id format
SELECT 'products' as table_name, id, title, seller_id, created_at 
FROM public.products 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'notes' as table_name, id, title, seller_id, created_at 
FROM public.notes 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'rooms' as table_name, id, title, seller_id, created_at 
FROM public.rooms 
ORDER BY created_at DESC 
LIMIT 3;
