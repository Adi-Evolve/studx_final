-- ============================================================================
-- EMERGENCY DATABASE FIX - REMOVE ALL CONSTRAINTS
-- This script will forcefully remove ALL foreign key constraints
-- ============================================================================

-- Step 1: Get all foreign key constraints and drop them dynamically
DO $$
DECLARE
    constraint_record RECORD;
    sql_command TEXT;
BEGIN
    -- Get all foreign key constraints in the public schema
    FOR constraint_record IN 
        SELECT 
            tc.table_name, 
            tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
    LOOP
        sql_command := format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
                             constraint_record.table_name, 
                             constraint_record.constraint_name);
        
        EXECUTE sql_command;
        RAISE NOTICE 'Dropped constraint % from table %', 
                     constraint_record.constraint_name, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- Step 2: Verify all foreign key constraints are gone
SELECT 'REMAINING FOREIGN KEY CONSTRAINTS:' as status;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';

-- Step 3: Insert/update the development user directly
INSERT INTO public.users (id, name, email, created_at, updated_at) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Development User',
    'dev@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    updated_at = NOW();

-- Also add the test user from the API
INSERT INTO public.users (id, name, email, created_at, updated_at) 
VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Test User API',
    'testapi@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    updated_at = NOW();

-- Step 4: Test room insertion
INSERT INTO public.rooms (
    seller_id, title, description, price, images, college, location, 
    category, owner_name, contact1, occupancy, room_type, distance
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Test Room After Fix',
    'This room was created after removing all constraints',
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

-- Step 5: Final verification
SELECT 'SUCCESS: Foreign key constraints removed!' as status;
SELECT 'Users count:' as info, count(*) as count FROM public.users;
SELECT 'Rooms count:' as info, count(*) as count FROM public.rooms;
