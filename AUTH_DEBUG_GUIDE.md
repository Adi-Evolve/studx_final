# 🔧 Authentication Debugging Guide

## Current Issue
You've logged in with Google but the notes form is still showing an authentication error.

## Step-by-Step Debugging

### 1. **Check Your Profile Page First**
Open a new browser tab and go to: http://localhost:1501/profile

**What to look for:**
- ✅ **Success**: Shows your name, email, and profile picture
- ❌ **Problem**: Shows login button or error

### 2. **Test Browser Authentication**
1. Go to: http://localhost:1501/sell/new?type=notes
2. Open browser console (Press F12 → Console tab)
3. Paste and run this code:

```javascript
// Test authentication in browser
const testAuth = async () => {
    try {
        console.log('🔍 Testing browser authentication...');
        
        // Test the sync endpoint
        const response = await fetch('/api/sync-user');
        const result = await response.json();
        
        console.log('Auth Status:', result.authStatus);
        console.log('Current User:', result.currentUser?.email || 'None');
        
        // Test Supabase client directly
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
            '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
            '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
        );
        
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log('Supabase Direct Test:', {
            hasSession: !!session,
            hasUser: !!user,
            email: user?.email || session?.user?.email || 'None',
            provider: user?.app_metadata?.provider
        });
        
        console.log('Cookies:', document.cookie.includes('supabase') ? 'Has Supabase cookies' : 'No Supabase cookies');
        
    } catch (error) {
        console.error('❌ Auth test failed:', error);
    }
};

testAuth();
```

### 3. **Check What You See**

**If browser test shows you're authenticated:**
- Click the "Refresh Auth" button on the notes form
- Try clicking "Reload Page" button

**If browser test shows not authenticated:**
- Your login session may have expired
- Try the login troubleshooting steps below

### 4. **Login Troubleshooting**

**Option A: Re-login**
1. Go to: http://localhost:1501/login
2. Click "Sign in with Google"
3. Complete the Google login flow
4. Make sure you're redirected back to the app

**Option B: Clear Browser Data**
1. Press F12 → Application tab → Storage
2. Clear all cookies for localhost:1501
3. Clear localStorage for localhost:1501
4. Refresh page and login again

**Option C: Check Login Flow**
1. Open browser dev tools (F12) → Network tab
2. Go to login page and sign in with Google
3. Watch for successful redirect to /auth/callback
4. Should end up at /home or /profile page

### 5. **Common Issues & Solutions**

**Issue**: "Auth session missing!" 
**Solution**: Session expired, login again

**Issue**: Form shows old/wrong email
**Solution**: Clear browser cache and login again

**Issue**: Stuck on authentication check
**Solution**: Reload the page or clear browser data

### 6. **Manual Verification**

After logging in successfully, these should work:
- http://localhost:1501/profile → Shows your profile
- http://localhost:1501/sell/new → Forms should show ✅ Authenticated: your-email@gmail.com

### 7. **If Still Not Working**

Try this sequence:
1. Close all browser tabs for localhost:1501
2. Clear cookies and localStorage for localhost:1501
3. Open new tab → http://localhost:1501
4. Click Login → Sign in with Google
5. After redirect, go to notes form and check auth status

---

## Quick Test Commands

**In browser console on localhost:1501:**
```javascript
// Quick auth check
fetch('/api/sync-user').then(r => r.json()).then(console.log);

// Check current page auth
window.location.href; // Should show current page
```

Let me know what you see in Step 1 (profile page) and Step 2 (browser console test)!
