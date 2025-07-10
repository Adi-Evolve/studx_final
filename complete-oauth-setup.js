/**
 * Complete Google OAuth Setup Guide
 * Step-by-step instructions for creating OAuth credentials
 */

console.log('🔐 Complete Google OAuth Setup Guide');
console.log('=' .repeat(50));

console.log('\n📋 STEP 1: OAuth Consent Screen (REQUIRED FIRST)');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select project: studx-storage-465518');
console.log('3. Navigate to "APIs & Services" → "OAuth consent screen"');
console.log('4. Choose "External" (unless you have Google Workspace)');
console.log('5. Fill out the required fields:');
console.log('   ✅ App name: StudX');
console.log('   ✅ User support email: your email address');
console.log('   ✅ Developer contact information: your email address');
console.log('6. Click "Save and Continue"');
console.log('7. On Scopes page: Click "Add or Remove Scopes"');
console.log('8. Search for and add: "https://www.googleapis.com/auth/drive.file"');
console.log('9. Click "Update" then "Save and Continue"');
console.log('10. On Test Users: Add your email address');
console.log('11. Click "Save and Continue"');

console.log('\n📋 STEP 2: Create OAuth Client ID');
console.log('1. Go to "APIs & Services" → "Credentials"');
console.log('2. Click "Create Credentials" → "OAuth 2.0 Client IDs"');
console.log('3. Application type: "Web application"');
console.log('4. Name: "StudX OAuth Client"');
console.log('5. Authorized redirect URIs: Add these URLs:');
console.log('   - http://localhost:3000/auth/google/callback');
console.log('   - http://localhost:1501/auth/google/callback');
console.log('6. Click "Create"');
console.log('7. Copy the Client ID and Client Secret from the popup');

console.log('\n📋 STEP 3: Add to Environment Variables');
console.log('Add these lines to your .env.local file:');
console.log('GOOGLE_CLIENT_ID=your_client_id_here');
console.log('GOOGLE_CLIENT_SECRET=your_client_secret_here');
console.log('GOOGLE_REDIRECT_URI=http://localhost:1501/auth/google/callback');

console.log('\n💡 About the message you saw:');
console.log('The message about "multiple platforms" is just informational.');
console.log('For our web application, we only need ONE client ID.');
console.log('This is normal and expected for web applications.');

console.log('\n🚨 IMPORTANT NOTES:');
console.log('- You MUST complete the OAuth Consent Screen BEFORE creating credentials');
console.log('- The consent screen is required even for testing');
console.log('- Use "External" user type unless you have Google Workspace');
console.log('- Add your email as a test user');

console.log('\n🎯 After completing both steps:');
console.log('1. Update your .env.local file with the credentials');
console.log('2. Run: node generate-oauth-token.js');
console.log('3. Follow the authentication flow');

console.log('\n📞 Need help? Complete Step 1 (OAuth Consent Screen) first!');
