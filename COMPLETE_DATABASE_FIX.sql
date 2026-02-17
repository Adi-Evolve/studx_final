-- ============================================================================
-- COMPLETE DATABASE FIX FOR DEVELOPMENT
-- Copy and paste this entire script into your Supabase SQL Editor
-- This will fix foreign key constraints AND RLS policies
-- ============================================================================

-- Step 1: Remove ALL foreign key constraints for development
DO $$
BEGIN
    -- Remove users table foreign key constraint
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_id_fkey' AND table_name = 'users') THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped users_id_fkey constraint';
    END IF;
    
    -- Remove rooms table foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'rooms_seller_id_fkey' AND table_name = 'rooms') THEN
        ALTER TABLE public.rooms DROP CONSTRAINT rooms_seller_id_fkey;
        RAISE NOTICE 'Dropped rooms_seller_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'rooms_seller_id_fkey1' AND table_name = 'rooms') THEN
        ALTER TABLE public.rooms DROP CONSTRAINT rooms_seller_id_fkey1;
        RAISE NOTICE 'Dropped rooms_seller_id_fkey1 constraint';
    END IF;
    
    -- Remove notes table foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notes_seller_id_fkey' AND table_name = 'notes') THEN
        ALTER TABLE public.notes DROP CONSTRAINT notes_seller_id_fkey;
        RAISE NOTICE 'Dropped notes_seller_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notes_seller_id_fkey1' AND table_name = 'notes') THEN
        ALTER TABLE public.notes DROP CONSTRAINT notes_seller_id_fkey1;
        RAISE NOTICE 'Dropped notes_seller_id_fkey1 constraint';
    END IF;
    
    -- Remove products table foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'products_seller_id_fkey' AND table_name = 'products') THEN
        ALTER TABLE public.products DROP CONSTRAINT products_seller_id_fkey;
        RAISE NOTICE 'Dropped products_seller_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'products_seller_id_fkey1' AND table_name = 'products') THEN
        ALTER TABLE public.products DROP CONSTRAINT products_seller_id_fkey1;
        RAISE NOTICE 'Dropped products_seller_id_fkey1 constraint';
    END IF;
END $$;

-- Step 2: Disable RLS on all tables for development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Handle tables that might not exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
        ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 3: Drop ALL existing policies (they might be blocking operations)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy % on table %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- Step 4: Grant comprehensive permissions to all roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Step 5: Create a development user that can be used for testing
INSERT INTO public.users (id, name, email, created_at, updated_at) 
VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Development User',
    'dev@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 6: Test the setup with a sample room insertion
INSERT INTO public.rooms (
    seller_id, title, description, price, images, college, location, 
    category, owner_name, contact1, occupancy, room_type, distance
) VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Test Room',
    'Test room for development',
    5000,
    ARRAY['test.jpg'],
    'Test College',
    '{"lat": 12.9716, "lng": 77.5946}',
    'Rooms/Hostel',
    'Test Owner',
    '9876543210',
    '1',
    'Single',
    '1 km'
) ON CONFLICT DO NOTHING;

-- Step 7: Verification queries
SELECT 'Foreign Key Constraints Check' as check_type;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'rooms', 'notes', 'products')
ORDER BY tc.table_name;

SELECT 'RLS Status Check' as check_type;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'rooms', 'notes', 'products', 'categories')
ORDER BY tablename;

SELECT 'Data Test' as check_type;
SELECT 'users' as table_name, count(*) as count FROM public.users
UNION ALL
SELECT 'rooms' as table_name, count(*) as count FROM public.rooms
UNION ALL  
SELECT 'notes' as table_name, count(*) as count FROM public.notes
UNION ALL
SELECT 'products' as table_name, count(*) as count FROM public.products;

-- Success message
SELECT '✅ Database configuration completed for development!' as status;
SELECT '⚠️  Remember to re-enable constraints and RLS for production' as warning;
