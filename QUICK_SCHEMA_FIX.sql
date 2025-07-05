-- Run this script in your Supabase SQL Editor to fix the API errors
-- This creates the anonymous user and fixes the products table schema

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

-- 3. Fix products table location column (TEXT to JSONB)
-- First, safely clean up invalid location data
UPDATE public.products SET location = NULL 
WHERE location = '' OR location = 'null' OR location IS NULL;

-- Handle any other invalid JSON strings
UPDATE public.products SET location = NULL 
WHERE location IS NOT NULL 
  AND NOT (location ~ '^[\s]*[\[\{].*[\]\}][\s]*$');

-- Now safely convert to JSONB
ALTER TABLE public.products ALTER COLUMN location TYPE jsonb USING 
  CASE 
    WHEN location IS NULL THEN NULL
    WHEN location::text = '' THEN NULL
    ELSE location::jsonb
  END;

-- 4. Fix products table images column (JSONB to TEXT[])
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images_new text[] DEFAULT '{}';
UPDATE public.products SET images_new = 
  CASE 
    WHEN images IS NULL THEN '{}'
    WHEN jsonb_typeof(images) = 'array' THEN 
      (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(images) AS elem)
    ELSE '{}'
  END;
ALTER TABLE public.products DROP COLUMN IF EXISTS images;
ALTER TABLE public.products RENAME COLUMN images_new TO images;

-- 5. Fix foreign key constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES auth.users(id);

-- Verify the fix
SELECT 'Schema fix complete!' as status;
