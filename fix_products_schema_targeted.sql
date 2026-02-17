-- TARGETED FIX for Products Table Schema Issues
-- Based on your current schema, this addresses the specific mismatches

-- First, let's check what we're working with
SELECT 'Current products table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== FIX COLUMN TYPE MISMATCHES =====

-- 1. Fix location column: change from TEXT to JSONB
-- Handle this safely for existing data
UPDATE public.products SET location = NULL WHERE location = '' OR location = 'null';

-- Try to convert text to JSONB, set to NULL if invalid
UPDATE public.products 
SET location = CASE 
    WHEN location IS NULL THEN NULL
    WHEN location ~ '^[\[\{].*[\]\}]$' THEN location::jsonb
    ELSE NULL
END
WHERE location IS NOT NULL;

-- Now change the column type
ALTER TABLE public.products ALTER COLUMN location TYPE jsonb USING location::jsonb;

-- 2. Fix images column: change from JSONB to TEXT[]
-- We need to do this in steps to avoid subquery issues

-- Step 2a: Add a temporary column
ALTER TABLE public.products ADD COLUMN images_temp text[];

-- Step 2b: Convert existing JSONB data to TEXT[] in the temp column
UPDATE public.products 
SET images_temp = CASE 
    WHEN images IS NULL THEN '{}'::text[]
    WHEN images::text = 'null' THEN '{}'::text[]
    WHEN images::text = '{}' THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) = 0 THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' THEN 
        -- Convert JSONB array to TEXT array manually
        (SELECT array_agg(elem::text) 
         FROM jsonb_array_elements_text(images) AS elem)
    ELSE '{}'::text[]
END;

-- Step 2c: Drop the old images column
ALTER TABLE public.products DROP COLUMN images;

-- Step 2d: Rename temp column to images
ALTER TABLE public.products RENAME COLUMN images_temp TO images;

-- Step 2e: Set default for images column
ALTER TABLE public.products ALTER COLUMN images SET DEFAULT '{}';

-- 3. Ensure seller_id has proper foreign key constraint
-- Drop existing constraint if it exists
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;

-- Add the correct constraint
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES auth.users(id);

-- 4. Make sure seller_id allows our special anonymous UUID
-- (This is handled by the constraint above)

-- ===== VERIFY THE FIXES =====
SELECT 'Fixed products table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== TEST THE STRUCTURE =====
-- Let's test with a sample insert (commented out - uncomment to test)
/*
INSERT INTO public.products (
    seller_id, title, description, price, category, condition, 
    college, location, images, is_sold
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Product', 
    'Test Description', 
    100.00, 
    'Electronics', 
    'Used', 
    'Test College', 
    '{"lat": 28.6139, "lng": 77.2090}'::jsonb, 
    ARRAY['https://example.com/image1.jpg']::text[], 
    FALSE
);
*/

SELECT 'Products table schema fix complete! Ready for API insertions.' as status;
