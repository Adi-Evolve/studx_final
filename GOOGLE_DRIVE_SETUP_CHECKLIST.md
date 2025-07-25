# Google Drive API Setup Checklist

## 🎯 Complete Setup Guide

### Phase 1: Google Cloud Console Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project named `studx-drive-api`
- [ ] Select the new project

### Phase 2: Enable API
- [ ] Navigate to APIs & Services → Library
- [ ] Search for "Google Drive API"
- [ ] Click on Google Drive API and enable it

### Phase 3: Service Account Creation
- [ ] Go to APIs & Services → Credentials
- [ ] Click "Create Credentials" → "Service Account"
- [ ] Enter name: `studx-drive-service`
- [ ] Enter description: `Service account for StudX PDF uploads`
- [ ] Click "Create and Continue"
- [ ] Skip optional steps and click "Done"

### Phase 4: Generate Private Key
- [ ] Click on the service account email in the credentials list
- [ ] Go to the "Keys" tab
- [ ] Click "Add Key" → "Create new key"
- [ ] Select "JSON" format
- [ ] Click "Create"
- [ ] **IMPORTANT**: Save the downloaded JSON file securely
- [ ] **IMPORTANT**: Note the service account email from the JSON file

### Phase 5: Google Drive Folder Setup
- [ ] Go to [Google Drive](https://drive.google.com/)
- [ ] Create a new folder named `StudX-PDFs`
- [ ] Right-click the folder → "Share"
- [ ] Add the service account email (from JSON file)
- [ ] Set permissions to "Editor"
- [ ] Click "Send"

### Phase 6: Get Folder ID
- [ ] Open the `StudX-PDFs` folder
- [ ] Copy the folder ID from the URL (the part after `/folders/`)
- [ ] Example: `https://drive.google.com/drive/folders/1ABC123...` → copy `1ABC123...`

### Phase 7: Update Environment Variables
- [ ] Place the downloaded JSON file in your studx project folder
- [ ] Run: `node update-google-drive-env.js`
- [ ] Follow the prompts to enter:
  - JSON file name
  - Folder ID
- [ ] Delete the JSON file after successful setup (for security)

### Phase 8: Test Setup
- [ ] Run: `node test-google-drive-enhanced.js`
- [ ] Verify all tests pass:
  - ✅ Environment variables present
  - ✅ Authentication successful
  - ✅ Folder access successful
  - ✅ File upload successful
  - ✅ File made publicly accessible
  - ✅ Test file deleted

### Phase 9: Test PDF Uploads
- [ ] Go to your StudX application
- [ ] Navigate to the Notes form
- [ ] Try uploading a PDF file
- [ ] Check that the form submission succeeds
- [ ] Verify the PDF URL is saved in your Supabase database
- [ ] Test that the PDF URL is accessible

## 🔧 Troubleshooting

### Common Issues and Solutions

**403 Forbidden Error:**
- Service account not shared with folder
- Incorrect permissions (should be "Editor")
- Google Drive API not enabled

**404 Not Found Error:**
- Incorrect folder ID
- Folder not accessible to service account
- Folder doesn't exist

**Private Key Issues:**
- Newlines not preserved in environment variables
- JSON file corrupted
- Re-run `node update-google-drive-env.js`

**Upload Failures:**
- Check file size limits
- Verify file type is supported
- Check internet connection
- Verify service account permissions

## 📝 Important Notes

1. **Security**: Always delete the service account JSON file after setup
2. **Permissions**: Service account needs "Editor" access to the folder
3. **API Limits**: Google Drive API has usage limits
4. **File Access**: Uploaded files are made publicly accessible for StudX users
5. **Backup**: Consider setting up folder backups in Google Drive

## 🎉 Success Indicators

When everything is working correctly:
- ✅ Test script passes all checks
- ✅ PDF uploads work through NotesForm
- ✅ PDF URLs are saved in Supabase
- ✅ PDFs are accessible via the URLs
- ✅ No console errors during uploads

## 🚀 Next Steps After Setup

1. Test all forms with file uploads
2. Monitor Google Drive API usage
3. Set up error monitoring for file uploads
4. Consider implementing file size limits
5. Test with different file types and sizes
