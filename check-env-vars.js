/**
 * Test environment variables for Google Drive
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Check:');
console.log('=' .repeat(40));

const requiredVars = {
    'GOOGLE_DRIVE_FOLDER_ID': process.env.GOOGLE_DRIVE_FOLDER_ID,
    'GOOGLE_SERVICE_ACCOUNT_EMAIL': process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    'GOOGLE_PRIVATE_KEY': process.env.GOOGLE_PRIVATE_KEY ? '***SET***' : 'MISSING',
    'GOOGLE_PROJECT_ID': process.env.GOOGLE_PROJECT_ID
};

for (const [key, value] of Object.entries(requiredVars)) {
    console.log(`${key}: ${value || 'MISSING'}`);
}

console.log('\n🔧 Google Drive API Status:');
console.log('Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('Project ID:', process.env.GOOGLE_PROJECT_ID);
console.log('Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
console.log('Private Key:', process.env.GOOGLE_PRIVATE_KEY ? 'Configured' : 'Missing');

console.log('\n📋 Next Steps:');
console.log('1. Share the Google Drive folder with the service account');
console.log('2. Run: node test-google-drive-enhanced.js');
console.log('3. Test PDF upload through your app');
