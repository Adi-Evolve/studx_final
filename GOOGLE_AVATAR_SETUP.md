## 🚀 Instructions to Fix Google Profile Pictures

I've updated your system to properly fetch and display Google profile pictures from Gmail authentication. Here's what was implemented:

### ✅ **Changes Made:**

1. **Updated `getSellerInfo` function** - Now prioritizes Google profile pictures
2. **Enhanced SellerInfoModal** - Shows real Google photos or user initials (no random avatars)
3. **Updated database trigger** - Captures Google profile pics during signup
4. **Created migration script** - Updates existing users' avatars
5. **Added API endpoint** - To manually update all user avatars

### 📋 **To Complete the Setup:**

1. **Run the Avatar Update API** (One-time fix for existing users):
   - Open your browser and go to: `http://localhost:3000/api/update-google-avatars`
   - This will update all existing users with their Google profile pictures

2. **OR Run SQL Manually** in Supabase Dashboard:
   ```sql
   -- Copy and paste this in Supabase SQL Editor:
   
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
           new.phone
       );
       RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Update existing users with Google avatars
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
   ```

### 🎯 **How It Works Now:**

1. **New Users**: Google profile pictures are automatically saved during signup
2. **Existing Users**: Their Google profile pictures will be fetched and displayed
3. **Fallback**: If no Google photo exists, shows user initials instead of random avatars
4. **Debug Info**: Check browser console to see what avatar data is being fetched

### 🔍 **Testing:**

1. Open the seller info modal for any seller
2. Check browser console for detailed avatar info logs
3. You should see either:
   - Real Google profile pictures from `googleusercontent.com`
   - User initials in a colored circle (if no Google photo)

The system now prioritizes **real Google profile pictures** over random generated avatars!
