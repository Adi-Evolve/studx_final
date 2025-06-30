-- Optional: Add password column to users table for reference
-- Note: This is NOT recommended for security reasons, but adding as backup
-- Supabase Auth already handles password storage securely

-- Add password_hash column (optional, for reference only)
ALTER TABLE public.users 
ADD COLUMN password_hash TEXT;

-- Add email confirmation status tracking
ALTER TABLE public.users 
ADD COLUMN email_confirmed BOOLEAN DEFAULT FALSE;

-- Add signup source tracking
ALTER TABLE public.users 
ADD COLUMN signup_method TEXT DEFAULT 'email';

-- Update the trigger to sync email confirmation status
CREATE OR REPLACE FUNCTION sync_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email confirmation status when user data changes
    UPDATE public.users 
    SET 
        email_confirmed = (NEW.email_confirmed_at IS NOT NULL),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auth.users changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email_confirmation();

-- Check current state
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at as auth_created,
    pu.name,
    pu.email_confirmed,
    pu.created_at as public_created
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC
LIMIT 10;
