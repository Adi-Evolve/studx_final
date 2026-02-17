-- Comprehensive foreign key constraint removal for development
-- This script removes all foreign key constraints that would prevent development testing

-- Remove foreign key constraint on users table
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Remove foreign key constraint on rooms table
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_seller_id_fkey;
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_seller_id_fkey1;

-- Remove foreign key constraint on notes table
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey1;

-- Remove foreign key constraint on products table
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;

-- Verify constraints have been removed
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'rooms', 'notes', 'products');

-- Insert a development user now that constraints are removed
INSERT INTO public.users (id, name, email, created_at, updated_at) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Development User',
    'dev@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- To re-enable constraints later (for production):
-- ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE public.rooms ADD CONSTRAINT rooms_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE public.notes ADD CONSTRAINT notes_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;
