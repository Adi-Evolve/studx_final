# 🚨 URGENT: Google OAuth Redirect URI Fix

## ❌ Current Error
```
redirect_uri_mismatch: The redirect URI in the request, https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback, does not match the ones authorized for the OAuth client.
```

## ✅ SOLUTION: Update Google Cloud Console

### Step 1: Go to Google Cloud Console
1. **Visit**: https://console.cloud.google.com/
2. **Select your project** (the one used for StudX)
3. **Navigate to**: APIs & Services → Credentials

### Step 2: Find Your OAuth 2.0 Client ID
1. Look for **"OAuth 2.0 Client IDs"** section
2. Find your client (likely named "Web client" or "StudX")
3. **Click on the client name** to edit it

### Step 3: Update Authorized Redirect URIs
In the **"Authorized redirect URIs"** section:

**❌ REMOVE OLD URL:**
```
https://lhiajxruajiarghlphkf.supabase.co/auth/v1/callback
```

**✅ ADD NEW URL:**
```
https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
```

**For local development, also add:**
```
http://localhost:3000/auth/callback
```

### Step 4: Save Changes
1. Click **"Save"** at the bottom
2. Wait 1-2 minutes for changes to propagate

## 🔧 Quick Test Commands

After updating Google Cloud Console, test the auth flow:

```bash
# Start your development server
npm run dev

# Then try Google sign-in at: http://localhost:3000
```

## 📋 Verification Checklist

- [ ] Updated Google Cloud Console redirect URIs
- [ ] Removed old Supabase URL from Google Cloud Console
- [ ] Added new Supabase URL to Google Cloud Console
- [ ] Added localhost URL for development
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 1-2 minutes for propagation
- [ ] Tested Google sign-in flow

## 🆘 If Still Not Working

1. **Check Google Cloud Console Project**: Make sure you're editing the correct project
2. **Verify OAuth Client**: Ensure you're editing the right OAuth 2.0 client ID
3. **Clear Browser Cache**: Clear cookies and try again
4. **Check Supabase Auth Provider**: Verify Google provider is enabled in your new Supabase project

## 📞 Next Steps After Fix

Once Google OAuth is working:
1. Test user registration flow
2. Test user login flow  
3. Verify user data is saved correctly
4. Test note creation/upload functionality
