/**
 * Quick test after sharing folder
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function quickTest() {
  // console.log('🧪 Quick Google Drive Test...');
  // console.log('=' .repeat(30));
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID
      },
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Try to access the folder
    const folderResponse = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, capabilities'
    });
    
    // console.log('✅ SUCCESS! Folder is accessible');
    // console.log(`📁 Folder: ${folderResponse.data.name}`);
    // console.log(`🆔 ID: ${folderResponse.data.id}`);
    
    // Test creating a file
    const testResponse = await drive.files.create({
      requestBody: {
        name: `StudX-Test-${Date.now()}.txt`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: 'text/plain',
        body: 'StudX Google Drive test successful!'
      }
    });
    
    // console.log('✅ Test file created successfully!');
    
    // Make it public
    await drive.permissions.create({
      fileId: testResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    const publicUrl = `https://drive.google.com/file/d/${testResponse.data.id}/view`;
    // console.log(`🔗 Public URL: ${publicUrl}`);
    
    // Clean up
    await drive.files.delete({
      fileId: testResponse.data.id
    });
    
    // console.log('✅ Test file cleaned up');
    // console.log('\n🎉 Google Drive integration is working perfectly!');
    // console.log('✅ You can now upload PDFs through your StudX app');
    
  } catch (error) {
    // console.error('❌ Still not working:', error.message);
    
    if (error.code === 404) {
      // console.log('\n💡 The folder is still not shared with the service account');
      // console.log('📧 Make sure you added: studx-storage-service@studx-storage-465518.iam.gserviceaccount.com');
      // console.log('🔧 Double-check the sharing permissions');
    }
  }
}

quickTest();
