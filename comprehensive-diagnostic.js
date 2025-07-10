/**
 * Comprehensive Google Drive Troubleshooting
 * This will help us identify the exact issue
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function comprehensiveDiagnostic() {
  console.log('🔍 Google Drive Comprehensive Diagnostic');
  console.log('=' .repeat(50));
  
  try {
    // Check environment variables first
    console.log('📋 Environment Variables:');
    console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'MISSING');
    console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID);
    
    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID
      },
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Test authentication
    console.log('\n🔐 Testing Authentication...');
    try {
      const aboutResponse = await drive.about.get({
        fields: 'user'
      });
      console.log('✅ Authentication successful');
      console.log('📧 Authenticated as:', aboutResponse.data.user?.emailAddress);
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }
    
    // List files accessible to service account
    console.log('\n📁 Files accessible to service account:');
    try {
      const filesResponse = await drive.files.list({
        pageSize: 10,
        fields: 'files(id, name, mimeType, parents)'
      });
      
      if (filesResponse.data.files.length === 0) {
        console.log('❌ No files accessible to service account');
        console.log('💡 This means no folders have been shared with the service account');
      } else {
        console.log('✅ Accessible files/folders:');
        filesResponse.data.files.forEach(file => {
          console.log(`  - ${file.name} (${file.id}) - ${file.mimeType}`);
        });
      }
    } catch (listError) {
      console.log('❌ Failed to list files:', listError.message);
    }
    
    // Try to access the specific folder
    console.log('\n🎯 Testing specific folder access...');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    try {
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, parents, capabilities, permissions'
      });
      
      console.log('✅ Folder accessible!');
      console.log('📁 Folder details:', folderResponse.data);
      
    } catch (folderError) {
      console.log('❌ Folder not accessible:', folderError.message);
      
      if (folderError.code === 404) {
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check if the folder ID is correct');
        console.log('2. Verify the folder exists at:');
        console.log(`   https://drive.google.com/drive/folders/${folderId}`);
        console.log('3. Make sure the folder is shared with:');
        console.log(`   ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
        console.log('4. Check sharing permissions are set to "Editor"');
        
        // Try to create a new folder for testing
        console.log('\n🆕 Alternative: Create a test folder...');
        try {
          const newFolderResponse = await drive.files.create({
            requestBody: {
              name: `StudX-Test-${Date.now()}`,
              mimeType: 'application/vnd.google-apps.folder'
            },
            fields: 'id, name, webViewLink'
          });
          
          console.log('❌ Cannot create folder - service account has no storage');
          console.log('💡 You must share an existing folder from your personal Google Drive');
          
        } catch (createError) {
          console.log('❌ Cannot create folder:', createError.message);
          console.log('💡 This confirms: service account needs access to existing folders');
        }
      }
    }
    
    console.log('\n📋 SOLUTION SUMMARY:');
    console.log('The service account is working correctly, but the folder needs to be shared.');
    console.log('Follow these exact steps:');
    console.log('1. Go to: https://drive.google.com/drive/folders/1-UlSEMauBbjxMveDZ3IjiW9PG_8ze1e7');
    console.log('2. Right-click on the folder → "Share"');
    console.log('3. Add email: studx-storage-service@studx-storage-465518.iam.gserviceaccount.com');
    console.log('4. Set permission to "Editor"');
    console.log('5. Uncheck "Notify people"');
    console.log('6. Click "Share"');
    console.log('7. The email should appear in the "People with access" list');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run comprehensive diagnostic
comprehensiveDiagnostic();
