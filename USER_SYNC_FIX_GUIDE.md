# User Sync Fix Guide

## Issue
Users can log in successfully via Google OAuth, but they don't appear in the `public.users` table, causing the sell page to ask them to sign in again.

## Root Cause
The authentication callback is trying to sync users to the `public.users` table, but there might be:
1. Missing database trigger to auto-sync auth users
2. RLS (Row Level Security) policies blocking the sync
3. Table structure issues

## Solution

### Step 1: Run SQL Fix in Supabase
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vdpmumstdxgftaaxeacx
2. Go to **SQL Editor**
3. Copy and paste the entire content from `fix_user_sync.sql`
4. Click **Run** to execute

This will:
- Ensure proper table structure
- Create an automatic trigger to sync auth.users → public.users
- Set up proper RLS policies
- Sync any existing auth users to the public.users table

### Step 2: Verify the Fix
After running the SQL:

1. **Check user count**:
   ```sql
   SELECT 'auth.users' as table_name, COUNT(*) FROM auth.users
   UNION ALL
   SELECT 'public.users' as table_name, COUNT(*) FROM public.users;
   ```

2. **Check your specific user**:
   ```sql
   SELECT u.email, u.name, u.phone, u.avatar_url 
   FROM public.users u 
   WHERE u.email = 'your-email@gmail.com';
   ```

### Step 3: Test the App
1. Open your app: http://localhost:1501
2. Go to login and sign in with Google
3. After successful login, go to `/sell`
4. Should now work without asking to sign in again

### Step 4: Monitor Console Logs
The improved auth callback now has detailed logging. Check browser console for:
- ✅ User sync successful
- ❌ Any sync errors

## Files Updated
- `app/auth/callback/route.js` - Improved user sync with better error handling
- `app/sell/page.js` - Enhanced user checking with auto-creation fallback
- `fix_user_sync.sql` - Complete database fix with trigger and policies

## What the Fix Does

### Database Trigger
Creates `handle_new_user()` function that automatically:
- Syncs new auth users to public.users table
- Updates existing users with new data (avatar, name, etc.)
- Handles Google OAuth metadata properly

### RLS Policies
- Allows authenticated users to read all profiles
- Allows users to update their own profile
- Allows authenticated users to insert their own record
- Allows general read access for the app

### Improved Auth Flow
- Better error handling and logging
- Fallback user creation if sync fails
- More robust user verification

## Testing
To test if everything is working:
1. Log out and log back in
2. Check browser console for sync messages
3. Visit the sell page - should work immediately
4. Check Supabase Users table in dashboard

## Troubleshooting

### If users still don't sync:
1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Check if trigger was created properly:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### If sell page still fails:
1. Check browser console for specific errors
2. Verify user exists in public.users table
3. Check if phone number is required but missing

## Manual User Creation
If automatic sync fails, users can be manually created:
```sql
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT id, email, 
       COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
       created_at, NOW()
FROM auth.users 
WHERE id = 'user-uuid-here';
```
