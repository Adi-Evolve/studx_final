-- COMPLETE FIX: Schema + Anonymous User Setup
-- This script fixes the products table schema and creates the anonymous user

-- ===== STEP 1: Create Anonymous User in auth.users =====
-- First, let's check if the anonymous user already exists
SELECT 'Checking for anonymous user...' as info;
SELECT id, email FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Create the anonymous user if it doesn't exist
INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'anonymous@studx.com',
    'anonymous',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "anonymous", "providers": ["anonymous"]}',
    '{"name": "Anonymous User"}'
) ON CONFLICT (id) DO NOTHING;

-- Also create entry in public.users table
INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'anonymous@studx.com',
    'Anonymous User',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ===== STEP 2: Fix Products Table Schema =====

-- Check current structure
SELECT 'Current products table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 1. Fix location column: change from TEXT to JSONB
UPDATE public.products SET location = NULL WHERE location = '' OR location = 'null';

UPDATE public.products 
SET location = CASE 
    WHEN location IS NULL THEN NULL
    WHEN location ~ '^[\[\{].*[\]\}]$' THEN location::jsonb
    ELSE NULL
END
WHERE location IS NOT NULL;

ALTER TABLE public.products ALTER COLUMN location TYPE jsonb USING location::jsonb;

-- 2. Fix images column: change from JSONB to TEXT[]
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images_temp text[];

UPDATE public.products 
SET images_temp = CASE 
    WHEN images IS NULL THEN '{}'::text[]
    WHEN images::text = 'null' THEN '{}'::text[]
    WHEN images::text = '{}' THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) = 0 THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' THEN 
        (SELECT array_agg(elem::text) 
         FROM jsonb_array_elements_text(images) AS elem)
    ELSE '{}'::text[]
END;

-- Only drop and rename if images_temp was created successfully
DO $$ 
BEGIN
    -- Check if images_temp column exists and has data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'images_temp'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products DROP COLUMN IF EXISTS images;
        ALTER TABLE public.products RENAME COLUMN images_temp TO images;
        ALTER TABLE public.products ALTER COLUMN images SET DEFAULT '{}';
    END IF;
END $$;

-- 3. Fix foreign key constraints
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;

-- Add the correct constraint that references auth.users
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES auth.users(id);

-- ===== STEP 3: Verify Everything Works =====
SELECT 'Fixed products table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that anonymous user exists
SELECT 'Anonymous user verification:' as info;
SELECT id, email, name FROM public.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Test insert (commented out - you can uncomment to test)
/*
INSERT INTO public.products (
    seller_id, title, description, price, category, condition, 
    college, location, images, is_sold
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Product Schema Fix', 
    'Test Description', 
    100.00, 
    'Electronics', 
    'Used', 
    'Test College', 
    '{"lat": 28.6139, "lng": 77.2090}'::jsonb, 
    ARRAY['https://example.com/test.jpg']::text[], 
    FALSE
);
*/

SELECT 'Schema fix complete! Anonymous user created. API should work now.' as status;
