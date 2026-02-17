# Profile Page Fix Guide

## Issue
Profile page showing "Failed to load your listings. Please try again later." even when user is logged in.

## Root Causes Identified
1. **User Sync Issue**: User might not exist in `public.users` table
2. **RLS Policy Issues**: Row Level Security might be blocking data access
3. **Database Connection Issues**: Server-side data fetching might be failing
4. **Missing Data**: Tables might be empty or seller_id relationships broken

## Solution Steps

### Step 1: Run Database Fixes
Execute these SQL commands in your Supabase SQL Editor:

1. **Fix User Sync** (run `fix_user_sync.sql`):
   - Creates automatic user sync trigger
   - Syncs existing auth users to public.users table
   - Sets up proper RLS policies for users table

2. **Fix Data Access** (run `fix_profile_data_access.sql`):
   - Sets up proper RLS policies for products, notes, rooms tables
   - Creates indexes for better performance
   - Ensures proper data access permissions

### Step 2: Test Database Access
Run these queries to verify:

```sql
-- Check if your user exists
SELECT * FROM public.users WHERE email = 'your-email@gmail.com';

-- Check your listings
SELECT 'products' as type, COUNT(*) as count FROM public.products WHERE seller_id = 'your-user-id';
SELECT 'notes' as type, COUNT(*) as count FROM public.notes WHERE seller_id = 'your-user-id';
SELECT 'rooms' as type, COUNT(*) as count FROM public.rooms WHERE seller_id = 'your-user-id';
```

### Step 3: Code Improvements Made

1. **Enhanced Server-Side Profile Page** (`app/profile/page.js`):
   - Better error handling and logging
   - Automatic user creation if missing
   - Graceful error handling for failed data fetches
   - Detailed console logging for debugging

2. **Improved Client-Side Profile Page** (`app/profile/ProfileClientPage.js`):
   - Client-side data refresh mechanism
   - Auto-refresh if server data is empty
   - Manual refresh button
   - Better error handling

3. **Enhanced User Sync** (`lib/syncUserData.js`):
   - Already existed and working properly
   - Handles user creation and updates

### Step 4: Test the Profile Page

1. **Login and check console**:
   - Open browser developer tools
   - Go to Console tab
   - Login with Google
   - Navigate to profile page
   - Check for detailed log messages

2. **Look for these log messages**:
   - ✅ "Profile page - User sync result: success"
   - ✅ "Full user profile: {id, email, name}"
   - ✅ "Products result: {count: X}"
   - ✅ "Notes result: {count: X}"
   - ✅ "Rooms result: {count: X}"

3. **If you see errors**:
   - Check the specific error messages
   - Verify user exists in Supabase Users table
   - Check RLS policies in Supabase dashboard

### Step 5: Manual Testing Scripts

Use these JavaScript test files to debug:

1. **`test_profile_data.js`**: Tests data fetching specifically
2. **`debug_profile_listings.sql`**: SQL queries to check database state
3. **`test_auth_sync.js`**: Tests authentication and user sync

### Step 6: Features Added

1. **Auto-Refresh**: If server data is empty, client automatically tries to refresh
2. **Manual Refresh Button**: Users can manually refresh their listings
3. **Better Error Handling**: Graceful degradation instead of complete failure
4. **Detailed Logging**: Console logs help identify specific issues

## Common Issues and Solutions

### "No user found in users table"
- Run the `fix_user_sync.sql` script
- Log out and log back in
- Check Supabase Users table manually

### "RLS policy blocking access"
- Run the `fix_profile_data_access.sql` script
- Check if user is properly authenticated
- Verify seller_id matches user ID

### "Empty listings despite having data"
- Check seller_id format in database
- Verify user ID matches seller_id
- Check if data was migrated correctly from old account

### "Server-side error"
- Check Supabase logs in dashboard
- Verify database connection
- Check for table structure issues

## Verification Checklist

- [ ] User exists in `public.users` table
- [ ] RLS policies allow proper data access
- [ ] Profile page loads without errors
- [ ] Console shows successful data fetching
- [ ] Refresh button works
- [ ] Listings display correctly
- [ ] Edit profile works

## Next Steps

1. Run both SQL fix scripts
2. Test the profile page
3. Check browser console for detailed logs
4. Use manual refresh if needed
5. Report any remaining issues with specific error messages
