/**
 * Fix Google Drive Service Account Access
 * Service accounts need explicit sharing, not public access
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function fixDriveAccess() {
  console.log('🔧 Fixing Google Drive Access...');
  console.log('=' .repeat(40));
  
  try {
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
    
    console.log('🔍 Checking service account access...');
    
    // Try to access the folder with current permissions
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    try {
      // Check if we can access the folder
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, permissions'
      });
      
      console.log('✅ Folder accessible!');
      console.log(`📁 Folder: ${folderInfo.data.name}`);
      
      // Try to create a test file
      const testContent = 'StudX service account test';
      const testResponse = await drive.files.create({
        requestBody: {
          name: `studx-test-${Date.now()}.txt`,
          parents: [folderId]
        },
        media: {
          mimeType: 'text/plain',
          body: testContent
        }
      });
      
      console.log('✅ Test file created successfully!');
      console.log(`📄 File ID: ${testResponse.data.id}`);
      
      // Clean up
      await drive.files.delete({
        fileId: testResponse.data.id
      });
      
      console.log('✅ Test file cleaned up');
      console.log('\n🎉 Google Drive is working correctly!');
      
    } catch (accessError) {
      console.log('❌ Cannot access folder:', accessError.message);
      
      if (accessError.code === 404) {
        console.log('\n🔧 SOLUTION: The folder needs to be shared with the service account');
        console.log('📧 Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        console.log('📁 Folder URL:', `https://drive.google.com/drive/folders/${folderId}`);
        console.log('\n📋 Steps to fix:');
        console.log('1. Go to the folder URL above');
        console.log('2. Click "Share" button');
        console.log('3. Add the service account email');
        console.log('4. Set permission to "Editor"');
        console.log('5. Make sure "Notify people" is UNCHECKED');
        console.log('6. Click "Share"');
        console.log('7. Run this script again');
        
        // Try to get current user info
        console.log('\n🔍 Checking service account authentication...');
        try {
          const aboutResponse = await drive.about.get({
            fields: 'user'
          });
          console.log('✅ Service account authenticated as:', aboutResponse.data.user?.emailAddress);
        } catch (authError) {
          console.log('❌ Service account authentication failed:', authError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixDriveAccess();
