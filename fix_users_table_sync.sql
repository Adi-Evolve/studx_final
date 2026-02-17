-- Fix users table to properly sync all data from Supabase Auth
-- This addresses the issue where email, name, and avatar_url are not being updated

-- First, add the email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to users table';
    ELSE
        RAISE NOTICE 'Email column already exists in users table';
    END IF;
END $$;

-- Create or replace the user creation trigger to capture all auth data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, phone, updated_at)
    VALUES (
        new.id,
        new.email, -- Email from auth.users
        COALESCE(
            new.raw_user_meta_data->>'name',
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'display_name',
            SPLIT_PART(new.email, '@', 1) -- Fallback to email prefix
        ),
        COALESCE(
            new.raw_user_meta_data->>'picture',     -- Google profile picture
            new.raw_user_meta_data->>'avatar_url',  -- Generic OAuth avatar  
            new.raw_user_meta_data->>'photo',       -- Alternative photo field
            new.raw_user_meta_data->>'image'        -- Another alternative
        ),
        new.phone, -- Phone from auth.users
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = NOW();
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a trigger for when auth.users is updated (email confirmations, profile updates, etc.)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the public.users table when auth.users is updated
    UPDATE public.users SET
        email = NEW.email,
        name = COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'display_name',
            users.name,
            SPLIT_PART(NEW.email, '@', 1)
        ),
        avatar_url = COALESCE(
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'photo',
            NEW.raw_user_meta_data->>'image',
            users.avatar_url
        ),
        phone = COALESCE(NEW.phone, users.phone),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers and recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create the triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated  
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Backfill existing users with missing data from auth.users
UPDATE public.users 
SET 
    email = auth.email,
    name = COALESCE(
        users.name,
        auth.raw_user_meta_data->>'name',
        auth.raw_user_meta_data->>'full_name',
        auth.raw_user_meta_data->>'display_name',
        SPLIT_PART(auth.email, '@', 1)
    ),
    avatar_url = COALESCE(
        users.avatar_url,
        auth.raw_user_meta_data->>'picture',
        auth.raw_user_meta_data->>'avatar_url',
        auth.raw_user_meta_data->>'photo',
        auth.raw_user_meta_data->>'image'
    ),
    phone = COALESCE(users.phone, auth.phone),
    updated_at = NOW()
FROM auth.users auth
WHERE users.id = auth.id
AND (
    users.email IS NULL 
    OR users.name IS NULL 
    OR users.avatar_url IS NULL
    OR (users.phone IS NULL AND auth.phone IS NOT NULL)
);

-- Show the results
SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    COUNT(name) as users_with_name,
    COUNT(avatar_url) as users_with_avatar,
    COUNT(phone) as users_with_phone
FROM public.users;

-- Show sample of updated data (first 5 users)
SELECT 
    id,
    email,
    name,
    CASE WHEN avatar_url IS NOT NULL THEN 'Has Avatar' ELSE 'No Avatar' END as avatar_status,
    phone,
    updated_at
FROM public.users 
ORDER BY updated_at DESC 
LIMIT 5;
