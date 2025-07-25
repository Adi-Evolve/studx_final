const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:1501/oauth/callback'
);

// Define the scopes we need
const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
];

console.log('🚀 Google Drive OAuth Token Generator');
console.log('====================================');

// Check if we have client credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Missing Google OAuth credentials!');
  console.log('Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file');
  process.exit(1);
}

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // This ensures we get a refresh token
});

console.log('1. Opening your browser to authenticate with Google...');
console.log('2. Grant permission to access your Google Drive');
console.log('3. You will be redirected to a localhost page');
console.log('4. The tokens will be automatically generated');
console.log('');

// Create a server to handle the callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/oauth/callback') {
    const code = parsedUrl.query.code;
    
    if (code) {
      try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getAccessToken(code);
        
        // Success page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h1 style="color: #28a745;">✅ Authentication Successful!</h1>
              <p>Your Google Drive OAuth tokens have been generated successfully.</p>
              <p><strong>Next steps:</strong></p>
              <ol>
                <li>Check your terminal for the generated tokens</li>
                <li>Copy the tokens to your .env.local file</li>
                <li>Close this window and return to your development environment</li>
              </ol>
              <p style="color: #666; font-size: 14px;">You can now close this window.</p>
            </body>
          </html>
        `);
        
        // Display tokens in console
        console.log('');
        console.log('🎉 SUCCESS! Your OAuth tokens have been generated:');
        console.log('===============================================');
        console.log('');
        console.log('Copy these values to your .env.local file:');
        console.log('');
        console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('');
        console.log('📋 Your updated .env.local should look like:');
        console.log('');
        console.log(`GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}`);
        console.log(`GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET}`);
        console.log(`GOOGLE_REDIRECT_URI=http://localhost:1501/oauth/callback`);
        console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log(`GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID_HERE`);
        console.log('');
        console.log('🗂️  Don\'t forget to:');
        console.log('1. Create a folder in your Google Drive');
        console.log('2. Copy the folder ID from its URL');
        console.log('3. Add it as GOOGLE_DRIVE_FOLDER_ID in .env.local');
        console.log('');
        console.log('✅ Once you\'ve updated .env.local, you can test PDF uploads!');
        
        // Close server
        server.close();
        
      } catch (error) {
        console.error('❌ Error getting tokens:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h1 style="color: #dc3545;">❌ Authentication Failed</h1>
              <p>There was an error getting your tokens. Please check the console for details.</p>
              <p>Common issues:</p>
              <ul>
                <li>Make sure your OAuth credentials are correct</li>
                <li>Check that the redirect URI is properly configured</li>
                <li>Ensure you've added yourself as a test user</li>
              </ul>
            </body>
          </html>
        `);
        server.close();
      }
    } else {
      console.error('❌ No authorization code received');
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1 style="color: #dc3545;">❌ Authorization Failed</h1>
            <p>No authorization code was received. Please try again.</p>
          </body>
        </html>
      `);
      server.close();
    }
  }
});

// Start server on port 1501
server.listen(1501, () => {
  console.log('🌐 Local server started on http://localhost:1501');
  console.log('⏳ Waiting for OAuth callback...');
  console.log('');
  
  // Open browser automatically
  open(authUrl).catch(err => {
    console.log('Could not open browser automatically. Please visit:');
    console.log(authUrl);
  });
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('❌ Port 1501 is already in use!');
    console.log('Please stop any other services running on port 1501 and try again.');
  } else {
    console.error('❌ Server error:', err);
  }
});
