# Google OAuth Fix Guide

## Current Issue
Google OAuth is rejecting the sign-in with error: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"

## Root Cause
The redirect URI in Google Cloud Console doesn't match the Supabase callback URL.

## Required Redirect URI
```
https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
```

## Step-by-Step Fix

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (StudX or the project containing your OAuth client)

### 2. Navigate to OAuth Settings
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (likely named "StudX" or similar)
3. Click on it to edit

### 3. Update Authorized Redirect URIs
1. In the **Authorized redirect URIs** section, add:
   ```
   https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
   ```
2. Remove any old/incorrect redirect URIs if present
3. For development, you might also want to add:
   ```
   http://localhost:3000/auth/callback
   ```

### 4. Save Changes
1. Click **Save**
2. Wait 5-10 minutes for changes to propagate

### 5. Update Supabase OAuth Settings
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vdpmumstdxgftaaxeacx
2. Navigate to **Authentication** → **Providers**
3. Click on **Google**
4. Ensure these are correctly configured:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
   - **Redirect URL**: Should show `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`

### 6. Verify App Configuration
Your app is already correctly configured to use the Supabase callback URL.

## Testing
1. Open your app: http://localhost:3000
2. Go to login page
3. Click "Continue with Google"
4. Should now work without the compliance error

## Common Issues

### If you get "This app isn't verified"
1. In Google Cloud Console, go to **OAuth consent screen**
2. Make sure the app is configured for your user type
3. Add test users if needed

### If you get "Access blocked"
1. Check that the OAuth consent screen is properly configured
2. Verify the scopes are appropriate
3. Make sure you're using the correct Google account

### If the redirect URI still doesn't work
1. Double-check the exact URL in Google Cloud Console
2. Make sure there are no extra spaces or characters
3. Verify the Supabase project ID is correct

## Alternative: Create New OAuth Client
If the above doesn't work, you can create a new OAuth 2.0 Client ID:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name it "StudX New"
5. Add the redirect URI: `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`
6. Copy the new Client ID and Secret to Supabase

## Current Environment Details
- **Supabase URL**: https://vdpmumstdxgftaaxeacx.supabase.co
- **Required Redirect URI**: https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
- **App Development URL**: http://localhost:3000
- **App Callback Route**: /auth/callback (handled by Next.js, then calls Supabase)
