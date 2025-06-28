-- Update the user creation trigger to properly capture Google profile pictures
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, avatar_url, phone)
    VALUES (
        new.id, 
        COALESCE(
            new.raw_user_meta_data->>'name',
            new.raw_user_meta_data->>'full_name'
        ),
        COALESCE(
            new.raw_user_meta_data->>'picture',     -- Google profile picture
            new.raw_user_meta_data->>'avatar_url',  -- Generic OAuth avatar
            new.raw_user_meta_data->>'photo'        -- Alternative Google field
        ),
        new.phone -- Copy the phone number from the auth record
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users who might have Google profile pictures in their metadata
-- but don't have avatar_url set in the users table
UPDATE public.users 
SET avatar_url = COALESCE(
    (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE auth.users.id = public.users.id),
    (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE auth.users.id = public.users.id),
    (SELECT raw_user_meta_data->>'photo' FROM auth.users WHERE auth.users.id = public.users.id)
)
WHERE avatar_url IS NULL 
AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = public.users.id 
    AND (
        raw_user_meta_data->>'picture' IS NOT NULL 
        OR raw_user_meta_data->>'avatar_url' IS NOT NULL 
        OR raw_user_meta_data->>'photo' IS NOT NULL
    )
);
