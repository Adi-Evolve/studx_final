-- Temporarily disable foreign key constraint for development testing
-- This allows us to insert test users without them existing in auth.users

-- Check current constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND tc.table_schema = 'public';

-- Remove the foreign key constraint temporarily
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Verify it's been removed
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND tc.table_schema = 'public';

-- To re-enable later (uncomment when needed for production):
-- ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
