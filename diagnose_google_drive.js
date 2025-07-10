// Google Drive API Diagnostic and Fix
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function diagnoseGoogleDriveAPI() {
    console.log('🔍 Diagnosing Google Drive API Configuration...\n');
    
    try {
        // 1. Check environment variables
        console.log('1. Checking environment variables:');
        console.log('   GOOGLE_DRIVE_CLIENT_EMAIL:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
        console.log('   GOOGLE_DRIVE_PRIVATE_KEY:', process.env.GOOGLE_DRIVE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
        console.log('   GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? '✅ Set' : '❌ Missing');
        
        if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
            console.error('❌ Missing required environment variables');
            return;
        }
        
        // 2. Test authentication
        console.log('\n2. Testing Google Drive API authentication:');
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        const drive = google.drive({ version: 'v3', auth });
        
        // 3. Test basic API access
        console.log('   Testing API access...');
        const aboutResponse = await drive.about.get({ fields: 'user' });
        console.log('   ✅ API access successful');
        console.log('   Service account email:', aboutResponse.data.user?.emailAddress);
        
        // 4. Test folder access
        if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
            console.log('\n3. Testing folder access:');
            try {
                const folderResponse = await drive.files.get({
                    fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
                    fields: 'id, name, permissions'
                });
                console.log('   ✅ Folder access successful');
                console.log('   Folder name:', folderResponse.data.name);
            } catch (folderError) {
                console.error('   ❌ Folder access failed:', folderError.message);
                console.log('   💡 The service account might not have access to this folder');
            }
        }
        
        // 5. Test upload capability
        console.log('\n4. Testing upload capability:');
        try {
            const testFileMetadata = {
                name: 'StudX_Test_File.txt',
                parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
            };
            
            const testMedia = {
                mimeType: 'text/plain',
                body: 'This is a test file from StudX',
            };
            
            const uploadResponse = await drive.files.create({
                resource: testFileMetadata,
                media: testMedia,
                fields: 'id',
            });
            
            console.log('   ✅ Upload test successful');
            console.log('   Test file ID:', uploadResponse.data.id);
            
            // Clean up test file
            await drive.files.delete({ fileId: uploadResponse.data.id });
            console.log('   ✅ Test file cleaned up');
            
        } catch (uploadError) {
            console.error('   ❌ Upload test failed:', uploadError.message);
            console.log('   💡 Check service account permissions');
        }
        
        console.log('\n✅ Google Drive API diagnosis complete!');
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error);
        console.log('\n💡 Common issues:');
        console.log('   - Service account key is invalid or expired');
        console.log('   - Google Drive API is not enabled in the project');
        console.log('   - Service account lacks permissions to the folder');
        console.log('   - Private key format is incorrect (check \\n escaping)');
    }
}

// Export for use
module.exports = { diagnoseGoogleDriveAPI };

// Run if called directly
if (require.main === module) {
    diagnoseGoogleDriveAPI();
}
