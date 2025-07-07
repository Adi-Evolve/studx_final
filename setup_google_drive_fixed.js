// IMPROVED GOOGLE DRIVE SETUP SCRIPT
// Handles common errors and provides better debugging

const { google } = require('googleapis');

class GoogleDriveService {
    constructor() {
        console.log('🔧 Initializing Google Drive Service...');
        
        // Check environment variables
        if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL) {
            throw new Error('❌ Missing GOOGLE_DRIVE_CLIENT_EMAIL environment variable');
        }
        
        if (!process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
            throw new Error('❌ Missing GOOGLE_DRIVE_PRIVATE_KEY environment variable');
        }
        
        try {
            // Initialize Google Drive API
            this.auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
            
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            console.log('✅ Google Drive API initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Google Drive API:', error.message);
            throw error;
        }
    }

    async createStudXFolder() {
        try {
            console.log('📁 Creating StudX uploads folder...');

            const folderMetadata = {
                name: 'StudX Uploads',
                mimeType: 'application/vnd.google-apps.folder',
            };

            const response = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id',
            });

            const folderId = response.data.id;
            console.log(`✅ StudX folder created successfully!`);
            console.log(`📁 Folder ID: ${folderId}`);
            
            return folderId;
        } catch (error) {
            console.error('❌ Failed to create folder:', error.message);
            
            if (error.code === 401) {
                console.log('🔑 Authentication failed. Check your credentials.');
            } else if (error.code === 403) {
                console.log('🚫 Permission denied. Make sure Google Drive API is enabled.');
            }
            
            throw error;
        }
    }

    async testConnection() {
        try {
            console.log('🧪 Testing Google Drive connection...');
            
            const response = await this.drive.about.get({
                fields: 'user(displayName, emailAddress), storageQuota'
            });
            
            console.log('✅ Connection successful!');
            console.log(`👤 Connected as: ${response.data.user.displayName} (${response.data.user.emailAddress})`);
            console.log(`💾 Storage quota: ${JSON.stringify(response.data.storageQuota, null, 2)}`);
            
            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error.message);
            return false;
        }
    }
}

async function setupGoogleDrive() {
    console.log('🚀 Setting up Google Drive for StudX...');
    console.log('=====================================\n');
    
    try {
        // Load environment variables
        require('dotenv').config({ path: '.env.local' });
        
        console.log('🔍 Checking environment variables...');
        console.log(`✓ GOOGLE_DRIVE_CLIENT_EMAIL: ${process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? 'Set' : 'Missing'}`);
        console.log(`✓ GOOGLE_DRIVE_PRIVATE_KEY: ${process.env.GOOGLE_DRIVE_PRIVATE_KEY ? 'Set' : 'Missing'}\n`);
        
        const drive = new GoogleDriveService();
        
        // Test connection first
        const connectionOK = await drive.testConnection();
        if (!connectionOK) {
            throw new Error('Connection test failed');
        }
        
        // Create StudX folder
        const folderId = await drive.createStudXFolder();
        
        console.log('\n🎉 Setup complete!');
        console.log('==================\n');
        console.log('📋 NEXT STEPS:');
        console.log(`1. Update your .env.local file:`);
        console.log(`   GOOGLE_DRIVE_FOLDER_ID=${folderId}\n`);
        console.log('2. Your Google Drive is ready for StudX uploads!');
        console.log('3. 15GB of free storage available');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n🔧 TROUBLESHOOTING GUIDE:');
        console.log('========================');
        
        if (error.message.includes('Missing GOOGLE_DRIVE_CLIENT_EMAIL')) {
            console.log('• Make sure .env.local file exists');
            console.log('• Check GOOGLE_DRIVE_CLIENT_EMAIL is set correctly');
        } else if (error.message.includes('Missing GOOGLE_DRIVE_PRIVATE_KEY')) {
            console.log('• Check GOOGLE_DRIVE_PRIVATE_KEY is set correctly');
            console.log('• Make sure private key includes \\n for line breaks');
        } else if (error.message.includes('Authentication failed')) {
            console.log('• Check your JSON key file values');
            console.log('• Make sure you copied client_email and private_key correctly');
        } else if (error.message.includes('Permission denied')) {
            console.log('• Enable Google Drive API in Google Cloud Console');
            console.log('• Make sure service account has proper permissions');
        } else {
            console.log('• Check your internet connection');
            console.log('• Verify Google Cloud project is active');
            console.log('• Try running: npm install googleapis');
        }
        
        console.log('\n💡 Need help? Share this error message for specific guidance.');
    }
}

// Check if googleapis is installed
try {
    require('googleapis');
    setupGoogleDrive();
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log('❌ googleapis not installed');
        console.log('Run: npm install googleapis');
    } else {
        console.error('❌ Unexpected error:', error.message);
    }
}
