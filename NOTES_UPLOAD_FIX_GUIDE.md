# Notes Upload Error Fix Guide

## Issues Identified and Fixed ✅

### 1. **500 Internal Server Error - Main Issue**
**Problem**: 
- Cookie parsing error: `Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"...`
- RLS Policy violation: `new row violates row-level security policy for table "notes"`
- System defaulting to anonymous user (`00000000-0000-0000-0000-000000000000`)

**Solution**:
- ✅ Fixed authentication in `/api/sell` route
- ✅ Removed anonymous user fallback
- ✅ Added proper error handling for authentication
- ✅ Now requires valid authentication before allowing uploads

### 2. **Missing Icon Files (404 errors)**
**Problem**: `Failed to load resource: /icons/icon-144x144.png (404 Not Found)`

**Solution**:
- ✅ Created `/public/icons/icon-144x144.svg`
- ✅ Updated `manifest.json` to use SVG instead of PNG
- ✅ Icon errors should now be resolved

### 3. **RLS Policy Issues**
**Problem**: Database RLS policies don't allow anonymous users to insert notes

**Solution**: Run the SQL fix in Supabase to set proper RLS policies

## Steps to Fix

### Step 1: Clear Corrupted Authentication Cookies
The cookie parsing error is causing authentication to fail. You need to clear the corrupted cookies:

1. **In browser console**, run this script:
   ```javascript
   // Copy content from clear_auth_cookies.js
   ```

2. **Or manually**: 
   - Press F12 → Application → Storage → Clear site data
   - Or use Ctrl+Shift+Delete → Clear browsing data

### Step 2: Run Database Fix
In your Supabase SQL Editor, run:
```sql
-- Content from fix_profile_data_access.sql
```

This will set up proper RLS policies for the notes table.

### Step 3: Test Authentication Flow
1. After clearing cookies, go to `/login`
2. Sign in with Google
3. Verify you can access `/profile` and `/sell` pages
4. Try uploading a note again

## Code Changes Made

### API Route (`/api/sell/route.js`)
- ✅ Removed anonymous user fallback
- ✅ Added proper authentication validation
- ✅ Better error handling for auth failures
- ✅ Now returns 401 error if user not authenticated

### Icon Files
- ✅ Created SVG icon at `/public/icons/icon-144x144.svg`
- ✅ Updated `manifest.json` to use SVG

### Helper Scripts
- ✅ `clear_auth_cookies.js` - Clears corrupted cookies
- ✅ `fix_profile_data_access.sql` - Sets up RLS policies

## Testing Steps

### 1. Clear Browser Data
- Clear cookies and local storage
- Hard refresh with Ctrl+Shift+R

### 2. Fresh Login
- Go to `/login`
- Sign in with Google
- Check browser console for authentication success

### 3. Test Upload
- Go to `/sell`
- Choose "Notes" category
- Fill in the form and upload files
- Check browser console for any errors

## Expected Behavior After Fix

### Authentication
- ✅ No cookie parsing errors
- ✅ User properly authenticated
- ✅ No anonymous user fallback

### Upload Process
- ✅ Images upload to ImgBB successfully
- ✅ PDFs upload to Google Drive successfully
- ✅ Note record created in database with proper seller_id
- ✅ Success message returned

### Icons
- ✅ No 404 errors for manifest icons
- ✅ PWA icons display correctly

## Common Issues After Fix

### "Authentication required" error
- Make sure you're logged in with Google
- Clear cookies and log in again
- Check browser console for auth errors

### Still getting RLS policy errors
- Run the `fix_profile_data_access.sql` script
- Verify user exists in `public.users` table
- Check that `auth.uid()` matches your user ID

### Upload still failing
- Check file sizes (images < 32MB, PDFs < 100MB)
- Verify ImgBB API key is set
- Check Google Drive API credentials

## Verification Checklist

- [ ] Browser cookies cleared
- [ ] No cookie parsing errors in console
- [ ] User can log in with Google
- [ ] User can access profile page
- [ ] User can access sell page
- [ ] No 404 errors for icons
- [ ] RLS policies set up in database
- [ ] Notes upload works successfully
- [ ] Files appear in ImgBB and Google Drive
- [ ] Note appears in database with correct seller_id

## Next Steps

1. **Clear browser cookies** (use the script or manually)
2. **Run the database fix** in Supabase SQL Editor
3. **Log in again** with Google
4. **Test the notes upload** 
5. **Check console** for any remaining errors

The authentication and RLS policy fixes should resolve the 500 error and allow successful note uploads!
