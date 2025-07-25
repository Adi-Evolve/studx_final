-- Check profile page database issues
-- 1. Check if current user exists in users table
SELECT 
    'users table' as table_name,
    id, email, name, phone
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check seller_id columns in listing tables
SELECT 'products' as table_name, seller_id, title, created_at 
FROM public.products 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'notes' as table_name, seller_id, title, created_at 
FROM public.notes 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'rooms' as table_name, seller_id, title, created_at 
FROM public.rooms 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Check if there are any foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('products', 'notes', 'rooms')
    AND kcu.column_name = 'seller_id';

-- 4. Check RLS policies for listing tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('products', 'notes', 'rooms')
ORDER BY tablename, policyname;
