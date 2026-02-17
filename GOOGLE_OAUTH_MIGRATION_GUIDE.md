# 🔑 GOOGLE OAUTH SETUP FOR NEW SUPABASE ACCOUNT

## New Callback URL
**Your new Supabase callback URL**: `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`

## 🎯 Required Updates

### 1. Google Cloud Console Setup

#### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Select your project (or the one used for StudX)
3. Go to **APIs & Services** → **Credentials**

#### **Step 2: Update OAuth 2.0 Client IDs**
1. Find your **OAuth 2.0 Client IDs** (usually named like "Web client" or "StudX")
2. Click on the client ID to edit it
3. In **"Authorized redirect URIs"** section:
   - **Remove old URL**: `https://lhiajxruajiarghlphkf.supabase.co/auth/v1/callback`
   - **Add new URL**: `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`
4. Click **"Save"**

#### **Step 3: Update Authorized Origins (if needed)**
If you have "Authorized JavaScript origins" configured:
1. **Remove old**: `https://lhiajxruajiarghlphkf.supabase.co`
2. **Add new**: `https://vdpmumstdxgftaaxeacx.supabase.co`

### 2. Supabase Authentication Setup

#### **Step 1: Configure Google Provider in New Supabase**
1. Go to your **new Supabase dashboard**: https://vdpmumstdxgftaaxeacx.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. **Save** the configuration

#### **Step 2: Verify Callback URL**
In your Supabase Auth settings, verify the callback URL is:
```
https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
```

### 3. Local Development Setup

For local testing, also add your localhost callback:
- **Local callback**: `http://localhost:1501/auth/callback`
- **Or if using 3000**: `http://localhost:3000/auth/callback`

## 🧪 Testing the Setup

### **Test Google OAuth Flow:**
1. Open your app: http://localhost:1501
2. Go to login page
3. Click "Continue with Google"
4. Complete Google sign-in
5. Verify you're redirected back to your app successfully

### **Expected Flow:**
```
User clicks "Sign in with Google"
    ↓
Redirects to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects to: https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
    ↓
Supabase processes the authentication
    ↓
User redirected back to your app (logged in)
```

## ⚠️ Important Notes

### **DNS Propagation**
- Changes to Google OAuth may take 5-10 minutes to propagate
- If sign-in fails initially, wait a few minutes and try again

### **Testing Checklist**
- [ ] Google Cloud Console updated with new callback URL
- [ ] Supabase Google provider configured
- [ ] Local testing works
- [ ] Production domain (if you have one) also updated

### **Common Issues & Solutions**

#### **Error: "redirect_uri_mismatch"**
- **Cause**: Google OAuth callback URL not updated
- **Fix**: Double-check Google Cloud Console has the correct callback URL

#### **Error: "Invalid client"**
- **Cause**: Client ID/Secret not configured in new Supabase
- **Fix**: Add Google OAuth credentials in Supabase Auth settings

#### **Error: "Provider not enabled"**
- **Cause**: Google provider not enabled in new Supabase
- **Fix**: Enable Google provider in Supabase Authentication → Providers

## 🚨 TROUBLESHOOTING: "OAuth 2.0 policy" Error

### **Error Message:**
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the redirect URI in the Google Cloud Console.
Request details: redirect_uri=https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback
```

### **Root Cause:**
Your new Supabase account needs Google OAuth configured from scratch.

## 🔧 COMPLETE GOOGLE OAUTH SETUP (Step-by-Step)

### **Step 1: Google Cloud Console Setup**

#### **1.1 Create/Select Project**
1. Go to: https://console.cloud.google.com/
2. **Create new project** or select existing StudX project
3. Note the project name for reference

#### **1.2 Enable Google+ API**
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" 
3. Click **Enable** (required for OAuth)

#### **1.3 Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public app)
3. Fill required fields:
   - **App name**: StudX Marketplace
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **App domain**: http://localhost:1501 (for testing)
4. **Save and Continue**
5. **Scopes**: Skip for now, click **Save and Continue**
6. **Test users**: Add your email for testing
7. **Save and Continue**

#### **1.4 Create OAuth 2.0 Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client IDs**
3. **Application type**: Web application
4. **Name**: StudX Web Client
5. **Authorized JavaScript origins**:
   - `http://localhost:1501`
   - `https://vdpmumstdxgftaaxeacx.supabase.co`
6. **Authorized redirect URIs**:
   - `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`
   - `http://localhost:1501/auth/callback` (for local testing)
7. Click **Create**
8. **Copy Client ID and Client Secret** (you'll need these)

### **Step 2: Supabase Configuration**

#### **2.1 Configure Google Provider**
1. Go to your new Supabase dashboard: https://vdpmumstdxgftaaxeacx.supabase.co
2. Navigate to **Authentication** → **Providers**
3. **Enable Google provider**
4. Enter the credentials from Google Cloud Console:
   - **Client ID**: (from step 1.4)
   - **Client Secret**: (from step 1.4)
5. **Save**

#### **2.2 Configure Site URL**
1. Still in **Authentication** → **Settings**
2. Set **Site URL**: `http://localhost:1501` (for development)
3. **Add redirect URLs**:
   - `http://localhost:1501`
   - `http://localhost:1501/**`
4. **Save**

### **Step 3: Test the Setup**

#### **3.1 Verify Configuration**
Before testing, double-check:
- [ ] OAuth consent screen configured
- [ ] Web application credentials created
- [ ] Correct redirect URIs added
- [ ] Google provider enabled in Supabase
- [ ] Client ID/Secret added to Supabase

#### **3.2 Test Authentication**
1. Open your app: http://localhost:1501
2. Go to login page
3. Click "Continue with Google"
4. Should redirect to Google OAuth (no error)
5. Complete authentication
6. Should redirect back to your app

## 🎯 QUICK FIX CHECKLIST

If you're still getting the error, verify:

### **Google Cloud Console:**
- [ ] Project selected/created
- [ ] OAuth consent screen configured
- [ ] Web application credentials created
- [ ] Redirect URI: `https://vdpmumstdxgftaaxeacx.supabase.co/auth/v1/callback`

### **Supabase Dashboard:**
- [ ] Google provider enabled
- [ ] Client ID entered correctly
- [ ] Client Secret entered correctly
- [ ] Site URL configured

### **Common Mistakes:**
- ❌ Using wrong project in Google Cloud
- ❌ Not enabling Google+ API
- ❌ Missing OAuth consent screen setup
- ❌ Wrong redirect URI format
- ❌ Not enabling Google provider in Supabase

## 🎉 After Setup

Once Google OAuth is working:
1. **Test user registration** - New users can sign up with Google
2. **Test user login** - Existing Google users will create new accounts (fresh start)
3. **Verify user data** - Check that user profiles are created properly

## 📞 Need Help?

If you encounter issues:
1. Check Google Cloud Console configuration
2. Verify Supabase Auth provider settings
3. Check browser developer console for error messages
4. Test with different Google accounts

Your migration will be complete once Google OAuth is working! 🚀
