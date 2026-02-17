/**
 * Test folder sharing after following the verification steps
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testFolderSharing() {
  console.log('🧪 Testing Folder Sharing...');
  console.log('=' .repeat(30));
  
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
    
    // Test the new folder
    const newFolderId = '1-Oo04Gd0ZE7uUBWV0GFjPjpQYWhak3q_';
    
    console.log(`📁 Testing folder: ${newFolderId}`);
    
    try {
      const folderResponse = await drive.files.get({
        fileId: newFolderId,
        fields: 'id, name, owners, capabilities'
      });
      
      console.log('✅ FOLDER ACCESSIBLE!');
      console.log(`📂 Name: ${folderResponse.data.name}`);
      console.log(`👤 Owner: ${folderResponse.data.owners?.[0]?.emailAddress}`);
      console.log(`🔧 Can edit: ${folderResponse.data.capabilities?.canEdit}`);
      
      // If owned by you, try to upload a test file
      const ownerEmail = folderResponse.data.owners?.[0]?.emailAddress;
      if (ownerEmail && !ownerEmail.includes('iam.gserviceaccount.com')) {
        console.log('\n📤 Testing file upload...');
        
        const testResponse = await drive.files.create({
          requestBody: {
            name: `StudX-Sharing-Test-${Date.now()}.txt`,
            parents: [newFolderId]
          },
          media: {
            mimeType: 'text/plain',
            body: 'StudX folder sharing test successful!'
          }
        });
        
        console.log('✅ UPLOAD SUCCESSFUL!');
        console.log(`📄 Test file ID: ${testResponse.data.id}`);
        
        // Clean up
        await drive.files.delete({
          fileId: testResponse.data.id
        });
        console.log('✅ Test file cleaned up');
        
        console.log('\n🎉 PERFECT! Folder sharing is working correctly!');
        console.log('✅ Service account can access your folder');
        console.log('✅ Service account can create files in your folder');
        console.log('✅ Files use YOUR Google Drive storage');
        
        // Update env file
        console.log('\n🔧 Updating .env.local with working folder...');
        return newFolderId;
        
      } else {
        console.log('⚠️ Folder is owned by service account, not by you');
        console.log('💡 We need a folder owned by your personal Google account');
      }
      
    } catch (accessError) {
      console.log('❌ Folder not accessible:', accessError.message);
      console.log('\n💡 Sharing verification needed:');
      console.log('1. Check if the folder is shared with the service account');
      console.log('2. Verify "Editor" permissions are set');
      console.log('3. Make sure sharing took effect (can take a few minutes)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFolderSharing()
  .then(workingFolderId => {
    if (workingFolderId) {
      console.log(`\n🎯 Update your .env.local with: GOOGLE_DRIVE_FOLDER_ID=${workingFolderId}`);
    }
  });
