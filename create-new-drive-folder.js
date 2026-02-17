/**
 * Create a new Google Drive folder directly via API
 * This will create a folder that the service account owns
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function createNewDriveFolder() {
  // console.log('🆕 Creating new Google Drive folder...');
  // console.log('=' .repeat(40));
  
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
    
    // Create a new folder
    const folderName = `StudX-PDFs-${Date.now()}`;
    
    // console.log(`📁 Creating folder: ${folderName}`);
    
    const folderResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id, name, webViewLink'
    });
    
    const folderId = folderResponse.data.id;
    const folderUrl = folderResponse.data.webViewLink;
    
    // console.log('✅ Folder created successfully!');
    // console.log(`📁 Folder Name: ${folderName}`);
    // console.log(`🆔 Folder ID: ${folderId}`);
    // console.log(`🔗 Folder URL: ${folderUrl}`);
    
    // Make folder publicly accessible
    // console.log('\n🔓 Making folder publicly accessible...');
    
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        role: 'writer',
        type: 'anyone'
      }
    });
    
    // console.log('✅ Folder is now publicly accessible');
    
    // Test upload to the new folder
    // console.log('\n📤 Testing file upload to new folder...');
    
    const testContent = 'This is a test file for StudX Google Drive integration';
    const testFileName = `test-${Date.now()}.txt`;
    
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: testFileName,
        parents: [folderId]
      },
      media: {
        mimeType: 'text/plain',
        body: testContent
      }
    });
    
    // console.log('✅ Test file uploaded successfully');
    // console.log(`📄 Test file ID: ${uploadResponse.data.id}`);
    
    // Clean up test file
    await drive.files.delete({
      fileId: uploadResponse.data.id
    });
    // console.log('✅ Test file cleaned up');
    
    // console.log('\n🎉 SUCCESS! New folder is working');
    // console.log('\n📋 UPDATE YOUR .env.local FILE:');
    // console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
    // console.log('\n📝 Instructions:');
    // console.log('1. Copy the folder ID above');
    // console.log('2. Update GOOGLE_DRIVE_FOLDER_ID in your .env.local file');
    // console.log('3. Run: node test-google-drive-enhanced.js');
    // console.log('4. Test PDF uploads in your app');
    
    return folderId;
    
  } catch (error) {
    // console.error('❌ Failed to create folder:', error.message);
    
    if (error.code === 403) {
      // console.log('\n💡 This might be because:');
      // console.log('1. Google Drive API is not enabled');
      // console.log('2. Service account lacks permissions');
      // console.log('3. Authentication credentials are incorrect');
    }
    
    throw error;
  }
}

// Run the folder creation
createNewDriveFolder()
  .then(folderId => {
    // console.log(`\n🎯 New folder ID: ${folderId}`);
  })
  .catch(error => {
    // console.error('❌ Setup failed:', error.message);
  });
