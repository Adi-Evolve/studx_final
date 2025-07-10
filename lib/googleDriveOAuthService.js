// Google Drive OAuth PDF Upload Service for StudX
// This replaces the service account approach with OAuth

const { google } = require('googleapis');

/**
 * Upload PDF file to Google Drive using OAuth
 * @param {File} file - The PDF file to upload
 * @param {string} fileName - Custom filename (optional)
 * @returns {Promise<{url: string, fileId: string}>} Shareable URL and file ID
 */
async function uploadPdfToGoogleDrive(file, fileName = null) {
    try {
        console.log('📁 Uploading PDF to Google Drive (OAuth)...');

        // Check file size (Google Drive free tier: 15GB total, but reasonable per-file limit)
        const maxPdfSize = 100 * 1024 * 1024; // 100MB per file
        if (file.size > maxPdfSize) {
            throw new Error(`PDF file "${file.name}" is too large. Maximum size is 100MB per file. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Initialize OAuth client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Set the credentials
        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_ACCESS_TOKEN,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Sanitize filename to avoid special characters
        const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalFileName = `StudX_${Date.now()}_${sanitizedFileName}`;

        // Create file metadata
        const fileMetadata = {
            name: finalFileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Upload to StudX folder
        };

        // Convert file to stream for upload
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const { Readable } = require('stream');
        const fileStream = Readable.from(fileBuffer);

        // Upload file
        const response = await drive.files.create({
            resource: fileMetadata,
            media: {
                mimeType: 'application/pdf',
                body: fileStream,
            },
            fields: 'id',
        });

        const fileId = response.data.id;
        console.log(`✅ PDF uploaded successfully: ${fileId}`);

        // Make file publicly viewable
        await drive.permissions.create({
            fileId: fileId,
            resource: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Generate shareable URLs
        const shareableUrl = `https://drive.google.com/file/d/${fileId}/view`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        console.log(`🔗 Shareable URL: ${shareableUrl}`);

        return {
            url: shareableUrl,
            downloadUrl: downloadUrl,
            fileId: fileId,
            fileName: finalFileName,
            size: file.size,
        };

    } catch (error) {
        console.error('❌ Google Drive OAuth upload failed:', error);
        
        // Provide specific error messages
        if (error.code === 401) {
            throw new Error('Google Drive OAuth authentication failed. Token may have expired.');
        } else if (error.code === 403) {
            throw new Error('Google Drive permission denied. Check OAuth scopes.');
        } else if (error.message.includes('too large')) {
            throw error; // Re-throw size errors as-is
        } else {
            throw new Error(`Failed to upload to Google Drive: ${error.message}`);
        }
    }
}

/**
 * Delete PDF file from Google Drive
 * @param {string} fileId - Google Drive file ID
 */
async function deletePdfFromGoogleDrive(fileId) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_ACCESS_TOKEN,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
        
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        await drive.files.delete({
            fileId: fileId,
        });
        
        console.log(`🗑️ PDF deleted from Google Drive: ${fileId}`);
    } catch (error) {
        console.error('❌ Failed to delete PDF from Google Drive:', error);
        // Don't throw error for deletion failures - log and continue
    }
}

module.exports = {
    uploadPdfToGoogleDrive,
    deletePdfFromGoogleDrive,
};
