/**
 * Test script to verify Google Drive API setup
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testGoogleDriveSetup() {
  // console.log('🧪 Testing Google Drive API Setup...');
  // console.log('=' .repeat(40));
  
  try {
    // Check environment variables
    const requiredVars = [
      'GOOGLE_DRIVE_FOLDER_ID',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL', 
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_PROJECT_ID'
    ];
    
    // console.log('📋 Checking environment variables...');
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      // console.error('❌ Missing environment variables:', missingVars);
      // console.log('\nPlease run: node update-google-drive-env.js');
      return;
    }
    
    // console.log('✅ All environment variables present');
    // console.log(`📧 Service account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
    // console.log(`🆔 Project ID: ${process.env.GOOGLE_PROJECT_ID}`);
    // console.log(`📁 Folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
    
    // Initialize Google Drive API
    // console.log('\n🔧 Initializing Google Drive API...');
    
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
    // console.log('🔐 Testing authentication...');
    const authClient = await auth.getClient();
    // console.log('✅ Authentication successful');
    
    // Test folder access
    // console.log('\n📁 Testing folder access...');
    
    const folderResponse = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, permissions, owners'
    });
    
    // console.log('✅ Folder access successful');
    // console.log(`📂 Folder name: ${folderResponse.data.name}`);
    // console.log(`🆔 Folder ID: ${folderResponse.data.id}`);
    
    // Test file upload
    // console.log('\n📤 Testing file upload...');
    
    const testFileContent = 'This is a test file created by StudX Google Drive API test';
    const testFileName = `studx-test-${Date.now()}.txt`;
    
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: testFileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: 'text/plain',
        body: testFileContent
      }
    });
    
    // console.log('✅ File upload successful');
    // console.log(`📄 Test file ID: ${uploadResponse.data.id}`);
    
    // Make file publicly accessible
    // console.log('\n🔓 Making test file publicly accessible...');
    
    await drive.permissions.create({
      fileId: uploadResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    const testFileUrl = `https://drive.google.com/file/d/${uploadResponse.data.id}/view`;
    // console.log('✅ File made publicly accessible');
    // console.log(`🔗 Test file URL: ${testFileUrl}`);
    
    // Clean up test file
    // console.log('\n🧹 Cleaning up test file...');
    await drive.files.delete({
      fileId: uploadResponse.data.id
    });
    // console.log('✅ Test file deleted');
    
    // console.log('\n🎉 Google Drive API setup is working correctly!');
    // console.log('✅ You can now upload PDFs through your StudX forms');
    // console.log('\n📋 Next steps:');
    // console.log('1. Test PDF uploads through your NotesForm');
    // console.log('2. Check that PDF URLs are saved in your Supabase database');
    // console.log('3. Verify that uploaded PDFs are accessible from the URLs');
    
  } catch (error) {
    // console.error('❌ Test failed:', error.message);
    
    if (error.code === 403) {
      // console.log('\n💡 Troubleshooting tips for 403 Forbidden:');
      // console.log('1. Make sure the service account email is shared with the folder');
      // console.log('2. Check if the service account has "Editor" permissions on the folder');
      // console.log('3. Verify that Google Drive API is enabled in your project');
      // console.log('4. Try sharing the folder again with the service account');
    }
    
    if (error.code === 404) {
      // console.log('\n💡 Troubleshooting tips for 404 Not Found:');
      // console.log('1. Check if the folder ID is correct');
      // console.log('2. Make sure the folder exists in Google Drive');
      // console.log('3. Verify the folder is shared with the service account');
    }
    
    if (error.message.includes('private_key')) {
      // console.log('\n💡 Troubleshooting tips for private key issues:');
      // console.log('1. Make sure the private key is properly formatted');
      // console.log('2. Check that newlines are preserved in the private key');
      // console.log('3. Re-run: node update-google-drive-env.js');
    }
    
    // console.log('\n🔧 For more help, check the service account JSON file and folder sharing settings');
  }
}

// Run the test
testGoogleDriveSetup();
