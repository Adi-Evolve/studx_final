# 🔧 GOOGLE DRIVE API SETUP GUIDE

## 📁 Step-by-Step Setup

### 1. Google Cloud Console Setup

1. **Go to:** https://console.developers.google.com/
2. **Create new project:** "StudX Storage"
3. **Enable Google Drive API**
4. **Create Service Account:**
   - Name: studx-storage-service
   - Role: Editor
   - Download JSON key file

### 2. Environment Variables

Add to your `.env.local`:

```bash
# Google Drive API
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

### 3. Install Dependencies

```bash
npm install googleapis multer
```

### 4. Create Google Drive Service

The service will handle:
- ✅ PDF upload to Google Drive
- ✅ Generate shareable links
- ✅ File management
- ✅ Permission handling

### 5. Integration Points

Replace these in your app:
- ❌ Supabase Storage uploads
- ✅ Google Drive uploads
- ❌ Supabase file URLs
- ✅ Google Drive shareable links

## 🎯 Benefits

- ✅ **15GB free storage** (vs 1GB Supabase)
- ✅ **Fast CDN delivery**
- ✅ **Reliable hosting**
- ✅ **Professional file sharing**
- ✅ **Unlimited bandwidth**

## 📊 Cost Comparison

```
Before (Supabase):
- Storage: 1GB (then $0.021/GB)
- Bandwidth: Limited
- Cost: $10+/month after limits

After (Google Drive):
- Storage: 15GB free
- Bandwidth: Unlimited
- Cost: $0/month
```

## 🚀 Next Steps

1. Complete Google Cloud setup
2. Install dependencies
3. Implement Google Drive service
4. Test file upload/download
5. Update your sell API
6. Deploy to production

Ready to implement? Let's start!
