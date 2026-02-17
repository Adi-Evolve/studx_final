# Debug Guide: 401 Unauthorized Error on Notes Upload

## Current Issue
Still getting `POST http://localhost:1501/api/sell 401 (Unauthorized)` in NotesForm.js:141

## Changes Made
1. ✅ Added authentication debugging to NotesForm
2. ✅ Added `credentials: 'include'` to fetch request
3. ✅ Added double session check before API call
4. ✅ Created auth test page at `/test-auth`

## How to Debug This Issue

### Step 1: Check Authentication State
1. **Go to** `http://localhost:1501/test-auth`
2. **Look for**: 
   - `"authenticated": true` → You're logged in
   - `"authenticated": false` → You need to log in

### Step 2: Test API Call
1. **Click** "Test API Call" button on the test page
2. **Check result**:
   - ✅ **Success**: API can read your session
   - ❌ **401 Error**: Session cookies not working

### Step 3: Check Browser Console
1. **Go to** Notes upload page
2. **Open** browser dev tools → Console
3. **Look for** authentication logs:
   ```
   🔍 Checking authentication...
   🔍 Session data: { hasSession: true, hasUser: true, userEmail: "..." }
   ✅ User authenticated: your@email.com
   ```

### Step 4: Check Network Tab
1. **Open** browser dev tools → Network
2. **Submit** the form
3. **Check** `/api/sell` request → Headers → Cookie
4. **Look for** session cookies being sent

## Common Solutions

### Solution 1: Clear Browser Data
```bash
# Clear browser cache, cookies, and localStorage
# Then log in again
```

### Solution 2: Restart Development Server
```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

### Solution 3: Check if Actually Logged In
1. Go to homepage
2. Check if you see user profile/avatar
3. If not logged in, log in via Google OAuth

### Solution 4: Manual Session Check
```javascript
// Open browser console and run:
const { createSupabaseBrowserClient } = await import('/lib/supabase/client');
const supabase = createSupabaseBrowserClient();
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

## Expected Behavior After Fix

### If Not Authenticated:
- Form should show "Authentication Required" message
- "Log In to Continue" button should appear
- Form should NOT be visible

### If Authenticated:
- Form should be visible
- Console should show authentication logs
- API call should succeed (no 401 error)

## Files Modified for Debugging
- `components/forms/NotesForm.js` - Added debugging logs
- `components/AuthTestPage.js` - Created test page
- `app/test-auth/page.js` - Test route

## Next Steps
1. **Visit** `/test-auth` to check authentication state
2. **Check** browser console for authentication logs
3. **Try** logging out and logging back in
4. **Clear** browser cache if needed
5. **Test** the Notes upload again

The debugging should help identify exactly where the authentication is failing!
