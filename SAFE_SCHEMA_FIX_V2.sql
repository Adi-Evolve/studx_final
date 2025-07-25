-- SAFE SCHEMA FIX - Handles all edge cases step by step
-- Run this in your Supabase SQL Editor

-- 1. Create anonymous user in auth.users (if not exists)
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

-- 2. Create anonymous user in public.users (if not exists)
INSERT INTO public.users (
    id,
    email,
    name
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'anonymous@studx.com',
    'Anonymous User'
) ON CONFLICT (id) DO NOTHING;

-- 3. Check current products table structure
SELECT 'Current products table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Fix location column step by step
-- First, clean up invalid data without conversion
UPDATE public.products SET location = NULL 
WHERE location = '' OR location = 'null' OR location IS NULL;

-- Add a new JSONB column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_new JSONB;

-- Convert only valid JSON data
UPDATE public.products SET location_new = 
  CASE 
    WHEN location IS NULL THEN NULL
    WHEN LENGTH(location) < 2 THEN NULL
    WHEN LEFT(location, 1) IN ('{', '[') AND RIGHT(location, 1) IN ('}', ']') THEN
      -- Only try to convert if it looks like valid JSON
      (location::jsonb)
    ELSE NULL
  END;

-- Drop old location column and rename new one
ALTER TABLE public.products DROP COLUMN location;
ALTER TABLE public.products RENAME COLUMN location_new TO location;

-- 5. Fix images column step by step
-- Add new TEXT[] column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images_new TEXT[] DEFAULT '{}';

-- Convert existing images data
UPDATE public.products SET images_new = 
  CASE 
    WHEN images IS NULL THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'null' THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) = 0 THEN '{}'::text[]
    WHEN jsonb_typeof(images) = 'array' THEN 
      (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(images) AS elem)
    ELSE '{}'::text[]
  END;

-- Drop old images column and rename new one
ALTER TABLE public.products DROP COLUMN IF EXISTS images;
ALTER TABLE public.products RENAME COLUMN images_new TO images;

-- 6. Fix foreign key constraints
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES auth.users(id);

-- 7. Verify the final structure
SELECT 'Fixed products table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Schema fix completed successfully!' as status;
