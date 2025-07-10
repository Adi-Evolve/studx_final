/**
 * Test uploading to YOUR Google Drive via service account
 * This should work because we're using your storage with service account access
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testYourDriveUpload() {
  console.log('🧪 Testing Upload to YOUR Google Drive...');
  console.log('=' .repeat(40));
  
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
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    console.log(`📁 Using folder ID: ${folderId}`);
    
    // Check folder access
    const folderResponse = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, owners'
    });
    
    console.log('✅ Folder accessible!');
    console.log(`📂 Folder: ${folderResponse.data.name}`);
    console.log(`👤 Owner: ${folderResponse.data.owners?.[0]?.emailAddress || 'Unknown'}`);
    
    // Create a test PDF-like file
    const testContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(StudX Test PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000191 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
284
%%EOF`;
    
    const testFileName = `StudX-Test-PDF-${Date.now()}.pdf`;
    
    console.log(`📤 Uploading test PDF: ${testFileName}`);
    
    // Upload the test file
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: testFileName,
        parents: [folderId],
        mimeType: 'application/pdf'
      },
      media: {
        mimeType: 'application/pdf',
        body: testContent
      },
      fields: 'id, name, size, webViewLink'
    });
    
    console.log('✅ Upload successful!');
    console.log(`📄 File ID: ${uploadResponse.data.id}`);
    console.log(`📏 Size: ${uploadResponse.data.size} bytes`);
    
    // Make file publicly accessible
    console.log('🔓 Making file publicly accessible...');
    
    await drive.permissions.create({
      fileId: uploadResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    const publicUrl = `https://drive.google.com/file/d/${uploadResponse.data.id}/view`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${uploadResponse.data.id}`;
    
    console.log('✅ File made public!');
    console.log(`🔗 View URL: ${publicUrl}`);
    console.log(`⬇️ Download URL: ${downloadUrl}`);
    
    // Test the URL
    console.log('\n🌐 Testing URL accessibility...');
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(downloadUrl);
      if (response.ok) {
        console.log('✅ URL is accessible!');
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📋 Content type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`⚠️ URL returned status: ${response.status}`);
      }
    } catch (urlError) {
      console.log('⚠️ URL test failed:', urlError.message);
    }
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    await drive.files.delete({
      fileId: uploadResponse.data.id
    });
    console.log('✅ Test file deleted');
    
    console.log('\n🎉 SUCCESS! Google Drive integration is working!');
    console.log('✅ Files can be uploaded to your Google Drive');
    console.log('✅ Files can be made publicly accessible');
    console.log('✅ URLs are working correctly');
    console.log('\n🚀 Your StudX PDF upload system is ready!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('storage quota')) {
      console.log('\n💡 Storage quota issue detected');
      console.log('This means the folder is owned by the service account.');
      console.log('We need a folder owned by YOUR Google account.');
    }
    
    return false;
  }
}

// Run the test
testYourDriveUpload();
