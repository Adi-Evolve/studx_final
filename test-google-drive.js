const { uploadPdfToGoogleDrive } = require('./lib/googleDrivePdfService');

async function testGoogleDriveConnection() {
    // console.log('🧪 Testing Google Drive API Connection...');
    // console.log('📧 Client Email:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL);
    // console.log('🔐 Private Key:', process.env.GOOGLE_DRIVE_PRIVATE_KEY ? 'Set ✅' : 'Not Set ❌');
    // console.log('📁 Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    
    try {
        // Create a simple test file
        const testContent = 'This is a test PDF upload from StudX!';
        const testFile = {
            name: 'test-upload.txt',
            type: 'text/plain',
            arrayBuffer: () => Promise.resolve(new TextEncoder().encode(testContent).buffer),
            size: testContent.length
        };
        
        // console.log('\n📤 Attempting to upload test file...');
        const result = await uploadPdfToGoogleDrive(testFile);
        
        // console.log('✅ SUCCESS! Google Drive API is working correctly!');
        // console.log('📋 Uploaded file URL:', result);
        
        return true;
    } catch (error) {
        // console.error('❌ FAILED! Google Drive API test failed:');
        // console.error('Error:', error.message);
        
        if (error.message.includes('invalid_grant')) {
            // console.log('\n🔧 Fix: Your private key might be incorrect or expired');
        } else if (error.message.includes('403')) {
            // console.log('\n🔧 Fix: Check that the service account has access to the folder');
        } else if (error.message.includes('404')) {
            // console.log('\n🔧 Fix: Check that the folder ID is correct');
        }
        
        return false;
    }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testGoogleDriveConnection()
    .then(success => {
        if (success) {
            // console.log('\n🎉 Google Drive setup is complete and working!');
        } else {
            // console.log('\n❌ Google Drive setup needs to be fixed');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        // console.error('💥 Unexpected error:', error);
        process.exit(1);
    });
