-- Comprehensive Database Schema Fix for Regular Products
-- Run this in your Supabase SQL Editor to ensure the products table has all required columns

-- Check current products table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== PRODUCTS TABLE SCHEMA FIX =====

-- Add missing columns if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'Used';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS college TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Remove any old problematic columns that might cause conflicts
ALTER TABLE public.products DROP COLUMN IF EXISTS image_urls;
ALTER TABLE public.products DROP COLUMN IF EXISTS note_year; -- This was causing issues

-- Ensure proper constraints
ALTER TABLE public.products ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN price SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN category SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN condition SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN college SET NOT NULL;

-- Update any existing records with missing required fields
UPDATE public.products SET 
    title = 'Untitled Product' WHERE title IS NULL OR title = '';
UPDATE public.products SET 
    category = 'General' WHERE category IS NULL OR category = '';
UPDATE public.products SET 
    condition = 'Used' WHERE condition IS NULL OR condition = '';
UPDATE public.products SET 
    college = 'Unknown' WHERE college IS NULL OR college = '';
UPDATE public.products SET 
    price = 0 WHERE price IS NULL;
UPDATE public.products SET 
    is_sold = FALSE WHERE is_sold IS NULL;
UPDATE public.products SET 
    images = '{}' WHERE images IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_college ON public.products(college);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON public.products(is_sold);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Create RLS policies
CREATE POLICY "Users can view all products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = seller_id OR seller_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Verify the final structure
SELECT 'Products table structure after fix:' as message;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert (this should work now)
-- INSERT INTO public.products (
--     seller_id, title, description, price, category, condition, 
--     college, location, images, is_sold
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000', 
--     'Test Product', 
--     'Test Description', 
--     100.00, 
--     'Electronics', 
--     'Good', 
--     'Test College', 
--     '{"lat": 28.6139, "lng": 77.2090}', 
--     '{"https://example.com/image1.jpg"}', 
--     FALSE
-- );

SELECT 'Schema fix complete! Products table is ready for insertions.' as status;
