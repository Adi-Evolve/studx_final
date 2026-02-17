-- ULTRA SAFE SCHEMA FIX - Completely avoids JSON conversion issues
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

-- 3. Fix location column by completely replacing it
ALTER TABLE public.products ADD COLUMN location_new JSONB;
-- Don't try to convert existing data - just set all to NULL
UPDATE public.products SET location_new = NULL;
-- Drop old column and rename
ALTER TABLE public.products DROP COLUMN location;
ALTER TABLE public.products RENAME COLUMN location_new TO location;

-- 4. Fix images column by completely replacing it  
ALTER TABLE public.products ADD COLUMN images_new TEXT[] DEFAULT '{}';
-- Set all existing rows to empty array
UPDATE public.products SET images_new = '{}';
-- Drop old column and rename
ALTER TABLE public.products DROP COLUMN images;
ALTER TABLE public.products RENAME COLUMN images_new TO images;

-- 5. Fix foreign key constraints
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES auth.users(id);

-- 6. Verify the final structure
SELECT 'Fixed products table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Schema fix completed successfully!' as status;
SELECT 'Note: All existing location and images data was cleared for safety' as note;
