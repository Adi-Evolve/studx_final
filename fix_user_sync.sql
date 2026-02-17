-- Fix User Synchronization - Create trigger to auto-sync auth.users to public.users

-- 1. First, ensure users table has correct structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, phone, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'photo',
            NEW.raw_user_meta_data->>'image'
        ),
        NEW.phone,
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(
            EXCLUDED.name,
            users.name
        ),
        avatar_url = COALESCE(
            EXCLUDED.avatar_url,
            users.avatar_url
        ),
        phone = COALESCE(
            EXCLUDED.phone,
            users.phone
        ),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Set up RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Manually sync existing auth users to public.users
INSERT INTO public.users (id, email, name, avatar_url, phone, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'display_name',
        split_part(au.email, '@', 1)
    ) as name,
    COALESCE(
        au.raw_user_meta_data->>'picture',
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'photo',
        au.raw_user_meta_data->>'image'
    ) as avatar_url,
    au.phone,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- Only insert users that don't exist yet
ON CONFLICT (id) DO NOTHING;

-- 6. Verify the sync worked
SELECT 
    'Total auth users' as description,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total public users' as description,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Users missing from public.users' as description,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
