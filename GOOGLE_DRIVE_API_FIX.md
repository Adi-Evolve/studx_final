# Google Drive API Fix Guide

## Issue Analysis
You're seeing this error: `There was an error while loading /auth/clients/26642122071-ekdopa6ljd6orkti9j8jadaf30bqmnv2.apps.googleusercontent.com`

This suggests there's a problem with the Google Cloud Console configuration for the Drive API, specifically with client authentication.

## Root Causes

### 1. **Service Account vs OAuth Client Confusion**
- The error shows an OAuth client ID (`26642122071-...`)
- But we're using a Service Account for Google Drive API
- There might be conflicting configurations

### 2. **Google Cloud Project Issues**
- Service Account might not have proper permissions
- Google Drive API might not be enabled
- Service Account key might be expired or invalid

### 3. **Environment Configuration**
- Private key format issues
- Missing or incorrect folder permissions

## Solution Steps

### Step 1: Verify Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `studx-storage` (or the correct project)
3. **Check enabled APIs**:
   - Go to **APIs & Services** → **Enabled APIs**
   - Ensure **Google Drive API** is enabled
   - If not, search for "Google Drive API" and enable it

### Step 2: Service Account Configuration

1. **Go to Service Accounts**:
   - **APIs & Services** → **Credentials** → **Service Accounts**
   - Find: `studx-storage-service@studx-storage.iam.gserviceaccount.com`

2. **Check Service Account Permissions**:
   - Click on the service account
   - Go to **Keys** tab
   - Verify the key exists and is not expired

3. **Create New Key if Needed**:
   - Click **Add Key** → **Create New Key**
   - Choose **JSON** format
   - Download the new key

### Step 3: Update Environment Variables

If you got a new service account key, update your `.env.local`:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=studx-storage-service@studx-storage.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_NEW_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_DRIVE_FOLDER_ID=1vqbYObGemT4AUnqDx5AJxyLBcaqwnGNX
```

### Step 4: Google Drive Folder Permissions

1. **Open Google Drive**: https://drive.google.com/
2. **Find the StudX folder** (ID: `1vqbYObGemT4AUnqDx5AJxyLBcaqwnGNX`)
3. **Share with Service Account**:
   - Right-click folder → Share
   - Add: `studx-storage-service@studx-storage.iam.gserviceaccount.com`
   - Give **Editor** permissions

### Step 5: Test the Configuration

Run the diagnostic script:

```bash
node diagnose_google_drive.js
```

This will test:
- Environment variables
- Authentication
- Folder access
- Upload capability

### Step 6: Use Improved Service

Replace the current Google Drive service with the improved version:

```javascript
// In your API route, use the improved service
import { uploadPdfToGoogleDrive } from '@/lib/googleDrivePdfService_improved';
```

## Alternative Solution: Create New Google Drive Setup

If the current setup is too problematic, here's how to create a fresh one:

### Option 1: New Service Account

1. **Create New Project** (optional):
   - Go to Google Cloud Console
   - Create project: "StudX-Drive-API"

2. **Enable Google Drive API**:
   - Go to **APIs & Services** → **Library**
   - Search "Google Drive API" → Enable

3. **Create Service Account**:
   - **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
   - Name: `studx-pdf-uploader`
   - Role: **Basic** → **Editor** (or custom Drive permissions)

4. **Download Key**:
   - Go to the new service account
   - **Keys** → **Add Key** → **Create New Key** → **JSON**

5. **Create New Drive Folder**:
   - Create folder in Google Drive: "StudX PDF Uploads"
   - Share with the new service account email
   - Copy the folder ID from URL

### Option 2: Use Your Personal Drive

1. **Enable Drive API** in your personal Google Cloud project
2. **Create OAuth Client** for the app
3. **Update the service** to use OAuth instead of Service Account

## Quick Fixes to Try First

### Fix 1: Clear Browser Data
- Clear all Google-related cookies and cache
- This might resolve the OAuth client error

### Fix 2: Restart Development Server
```bash
# Kill current server
# Restart with clean environment
npm run dev
```

### Fix 3: Check Private Key Format
Ensure the private key in `.env.local` has proper `\n` escaping:
```env
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nLine1\nLine2\n...-----END PRIVATE KEY-----
```

### Fix 4: Test with Minimal Setup
Create a simple test to verify the service account works:

```javascript
const { google } = require('googleapis');

async function testDriveAPI() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    const result = await drive.about.get({ fields: 'user' });
    console.log('Success:', result.data.user?.emailAddress);
}

testDriveAPI().catch(console.error);
```

## Expected Results After Fix

- ✅ No OAuth client errors
- ✅ PDF uploads work successfully
- ✅ Files appear in Google Drive folder
- ✅ Shareable URLs are generated
- ✅ No authentication errors in console

## Troubleshooting

### If you still get OAuth errors:
1. Check if there are multiple Google Cloud projects
2. Verify you're in the correct project
3. Make sure OAuth client (for sign-in) and Service Account (for Drive) are in the same project

### If authentication fails:
1. Regenerate service account key
2. Update environment variables
3. Restart development server

### If folder access fails:
1. Share the Drive folder with service account email
2. Give Editor permissions
3. Check folder ID is correct

Let me know which approach you'd like to try first!
