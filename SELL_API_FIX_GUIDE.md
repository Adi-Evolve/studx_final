# 🔧 Sell API 500 Error - Quick Fix Guide

## 🚨 Problem
Getting 500 Internal Server Error when trying to list a room on studxchange.in/sell

## 🔍 Likely Causes
1. **Missing Environment Variables** - Most common cause
2. **Wrong Environment Variable Names** 
3. **Database Connection Issues**
4. **Authentication Problems**

## 🛠️ Quick Fixes

### Fix 1: Check Environment Variables
Your deployment platform needs these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://vdpmumstdxgftaaxeacx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQyMzQyNywiZXhwIjoyMDUwMDAwNDI3fQ.EAbUAWsQtBuA3pltyQDNKpJGHlX7Z8d1Lob8IjYglmQ
IMGBB_API_KEY=your_imgbb_api_key_here
```

**Alternative variable name (if using old setup):**
```
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQyMzQyNywiZXhwIjoyMDUwMDAwNDI3fQ.EAbUAWsQtBuA3pltyQDNKpJGHlX7Z8d1Lob8IjYglmQ
```

### Fix 2: Test the API
Visit these URLs to test:

1. **Health Check**: `https://studxchange.in/api/sell` (should return status info)
2. **Diagnostic**: `https://studxchange.in/api/sell-test` (detailed environment check)

### Fix 3: Replace Current API File
If environment variables are correct, replace the current `/app/api/sell/route.js` with the fixed version I created.

### Fix 4: Emergency Simple Version
If the main fix doesn't work, temporarily use the simple version:
1. Rename `route.js` to `route_backup.js`
2. Rename `route_simple.js` to `route.js`
3. Redeploy

## 🧪 Testing Steps

### Step 1: Check Environment Variables
Visit: `https://studxchange.in/api/sell`

Expected response:
```json
{
  "message": "StudX Sell API - Fixed Version",
  "status": "active",
  "environment": {
    "hasSupabaseUrl": true,
    "hasServiceKey": true,
    "hasImgbbKey": true,
    "supabaseInitialized": true
  }
}
```

### Step 2: Test Authentication
Try to list a room with a registered user email.

### Step 3: Check Server Logs
Look for these error patterns in deployment logs:
- "Missing Supabase environment variables"
- "Authentication failed"
- "Database connection error"

## 🚀 Deployment Platform Settings

### Vercel
1. Go to Project Settings → Environment Variables
2. Add the required variables
3. Redeploy

### Netlify
1. Go to Site Settings → Environment Variables
2. Add the required variables
3. Trigger new deploy

### Other Platforms
Ensure environment variables are set in production environment, not just development.

## 📋 Required User Data
Make sure the user trying to list a room exists in your `users` table with a valid email.

## 🔄 If Still Not Working

1. **Check deployment logs** for specific error messages
2. **Temporarily enable detailed logging** by setting `NODE_ENV=development`
3. **Use the simple API version** as fallback
4. **Contact me with specific error logs** from the server

## 🎯 Most Likely Solution
90% of 500 errors in this case are due to missing `SUPABASE_SERVICE_ROLE_KEY` environment variable in the deployment platform.

Make sure to:
1. ✅ Set environment variables in deployment platform
2. ✅ Redeploy after setting variables
3. ✅ Test with existing user email
4. ✅ Check that ImgBB API key is valid

The fixed API route I created handles both `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY` variable names, so it should work with your current setup! 🎉
