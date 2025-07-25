// GOOGLE DRIVE SETUP SCRIPT
// Run this once to create your StudX folder and test the connection

const GoogleDriveService = require('./lib/googleDriveService');

async function setupGoogleDrive() {
    console.log('🚀 Setting up Google Drive for StudX...');
    
    try {
        const drive = new GoogleDriveService();
        
        // Step 1: Create StudX folder
        console.log('📁 Creating StudX uploads folder...');
        const folderId = await drive.createStudXFolder();
        
        console.log('✅ Setup complete!');
        console.log('');
        console.log('📋 NEXT STEPS:');
        console.log(`1. Add this to your .env.local:`);
        console.log(`   GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
        console.log('');
        console.log('2. Replace the placeholder credentials in .env.local with your JSON key values');
        console.log('3. Test the upload functionality');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('🔧 TROUBLESHOOTING:');
        console.log('1. Make sure you downloaded the JSON key file');
        console.log('2. Update GOOGLE_DRIVE_CLIENT_EMAIL and GOOGLE_DRIVE_PRIVATE_KEY in .env.local');
        console.log('3. Ensure Google Drive API is enabled in your project');
    }
}

// Run setup
setupGoogleDrive();
