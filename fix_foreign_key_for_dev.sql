-- Quick fix: Use a fixed development user ID that we can guarantee exists
-- This avoids the foreign key constraint issue for temporary users

-- First, let's try to insert a development user directly into auth.users (if possible)
-- Or we can temporarily disable the foreign key constraint

-- Option 1: Disable the foreign key constraint for development
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Option 2: Create a fixed development user entry
INSERT INTO public.users (id, name, email, created_at, updated_at) 
VALUES (
    'dev-user-00000000-0000-0000-0000-000000000000',
    'Development User',
    'dev@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- To re-enable the constraint later (for production):
-- ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
