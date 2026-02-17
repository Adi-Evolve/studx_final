# 🔧 GOOGLE OAUTH TROUBLESHOOTING GUIDE

## Current Error Analysis
**Error**: `redirect_uri=https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback flowName=GeneralOAuthFlow`

This error means Google Cloud Console still doesn't recognize the new callback URL. Let's fix this systematically.

## 🎯 STEP-BY-STEP TROUBLESHOOTING

### Step 1: Verify Google Cloud Console Setup

#### **Option A: Check Current OAuth Client**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Look for **OAuth 2.0 Client IDs** 
3. Click on your client (might be named "Web client 1" or similar)
4. Take a screenshot of the "Authorized redirect URIs" section
5. Verify it contains: `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`

#### **Option B: Create New OAuth Client (Recommended)**
If the above doesn't work, create a fresh OAuth client:

1. **In Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Name**: StudX New Supabase
5. **Authorized JavaScript origins**: 
   - `http://localhost:3000`
   - `http://localhost:1501`
   - `https://vdpmumstdxgftaaxeacx.supabase.co`
6. **Authorized redirect URIs**:
   - `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
7. **Click "Create"**
8. **Copy the new Client ID and Client Secret**

### Step 2: Update Supabase with New Credentials

1. **Go to**: https://vdpmumstdxgftaaxeacx.supabase.co/project/_/auth/providers
2. **Find Google provider**
3. **Enter the NEW Client ID and Client Secret** (from Step 1)
4. **Save** the configuration

### Step 3: Verify Supabase Auth Settings

Check these settings in your Supabase dashboard:

#### **Authentication → Settings → General**
- **Site URL**: Should be your app's URL (e.g., `http://localhost:1501` for dev)
- **Additional redirect URLs**: Can include your production domain

#### **Authentication → URL Configuration**
Verify the callback URL is correctly set to:
```
https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
```

## 🔍 DEBUGGING CHECKLIST

### Check #1: Google Project Selection
- [ ] Are you in the correct Google Cloud project?
- [ ] Is the Google Sign-In API enabled in this project?

### Check #2: OAuth Client Status
- [ ] Is the OAuth client published (not in testing mode)?
- [ ] Are you using the correct Client ID in Supabase?

### Check #3: Propagation Time
- [ ] Did you wait 5-10 minutes after making changes?
- [ ] Try clearing browser cache and cookies

### Check #4: Testing Environment
- [ ] Are you testing on the correct domain?
- [ ] Is your app running on the expected port?

## 🚨 COMMON SOLUTIONS

### Solution 1: Enable Google Sign-In API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google Sign-In API" 
3. Click and **Enable** it
4. Also enable "Google+ API" if available

### Solution 2: Publish OAuth App
1. In Google Cloud Console → **OAuth consent screen**
2. Click **"Publish App"** if it's in testing mode
3. Or add your email to **Test users** if keeping it in testing mode

### Solution 3: Create Completely New Google Project
If nothing works, create a fresh Google Cloud project:

1. **New Project**: https://console.cloud.google.com/projectcreate
2. **Project name**: StudX-New
3. **Enable APIs**: Google Sign-In API, Google+ API
4. **Create OAuth client** with new credentials
5. **Update Supabase** with new credentials

## 🧪 TESTING SCRIPT

Run this to test your OAuth setup:

```bash
# Test if your current setup is working
curl -I "https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback"
```

Expected response should be 200 or 302, not 404.

## 📞 IMMEDIATE NEXT STEPS

1. **Take screenshot** of your current Google Cloud Console OAuth client settings
2. **Try creating a NEW OAuth client** (most likely solution)
3. **Update Supabase** with the new credentials
4. **Test immediately** after updating

## ⚡ QUICK FIX ATTEMPT

If you want to try the fastest solution:

1. **Delete current OAuth client** in Google Cloud Console
2. **Create new one** with exact settings above
3. **Copy new Client ID/Secret**
4. **Update in Supabase**
5. **Test within 2 minutes**

The issue is definitely in the Google Cloud Console configuration. The redirect URI mismatch error is very specific - Google doesn't recognize your new Supabase callback URL.

Let me know what you find in your Google Cloud Console, and I can help you fix it!
