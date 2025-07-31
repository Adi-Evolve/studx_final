const axios = require('axios');

// Helper to refresh Google OAuth access token
async function refreshGoogleAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('refresh_token', process.env.GOOGLE_REFRESH_TOKEN);
    params.append('grant_type', 'refresh_token');
    const url = 'https://oauth2.googleapis.com/token';
    try {
        const response = await axios.post(url, params);
        const { access_token, expires_in } = response.data;
        // Optionally update process.env (for current process only)
        process.env.GOOGLE_ACCESS_TOKEN = access_token;
        return access_token;
    } catch (err) {
        throw new Error('Failed to refresh Google OAuth access token: ' + err.message);
    }
}
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
        // Initialize OAuth client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
        );
        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_ACCESS_TOKEN,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Robust logging for debugging
        console.log('[Drive Upload] Received file:', file);
        // Support Node.js streams and buffers
        const maxPdfSize = 100 * 1024 * 1024; // 100MB per file
        let fileSize = 0;
        let fileStream;
        let finalFileName;

        const stream = require('stream');
        if (file instanceof Buffer) {
            fileSize = file.length;
            const pass = new stream.PassThrough();
            pass.end(file);
            fileStream = pass;
            finalFileName = fileName || `StudX_${Date.now()}.pdf`;
        } else if (file.path) {
            // fs.createReadStream for Node.js file uploads
            const fs = require('fs');
            const stats = fs.statSync(file.path);
            fileSize = stats.size;
            fileStream = fs.createReadStream(file.path);
            finalFileName = fileName || `StudX_${Date.now()}_${file.path.split('/').pop()}`;
        } else if (file.buffer) {
            fileSize = file.buffer.length;
            const pass = new stream.PassThrough();
            pass.end(file.buffer);
            fileStream = pass;
            finalFileName = fileName || `StudX_${Date.now()}.pdf`;
        } else if (file.size && file.name && file.type === 'application/pdf') {
            // Browser File object or FormData file, always use Buffer
            if (typeof file.arrayBuffer === 'function') {
                const buffer = Buffer.from(await file.arrayBuffer());
                fileSize = buffer.length;
                const pass = new stream.PassThrough();
                pass.end(buffer);
                fileStream = pass;
                finalFileName = fileName || file.name || `StudX_${Date.now()}.pdf`;
            } else if (file._data) {
                fileSize = file.size;
                const pass = new stream.PassThrough();
                pass.end(Buffer.from(file._data));
                fileStream = pass;
                finalFileName = fileName || file.name || `StudX_${Date.now()}.pdf`;
            } else if (file.data) {
                fileSize = file.size;
                const pass = new stream.PassThrough();
                pass.end(Buffer.from(file.data));
                fileStream = pass;
                finalFileName = fileName || file.name || `StudX_${Date.now()}.pdf`;
            } else {
                throw new Error('Unsupported browser file type for Google Drive upload');
            }
        } else {
            throw new Error('Unsupported file type for Google Drive upload');
        }

        if (fileSize > maxPdfSize) {
            throw new Error(`PDF file is too large. Maximum size is 100MB per file. Current size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
        }
        let response;
        try {
            response = await drive.files.create({
                resource: fileMetadata,
                media: {
                    mimeType: 'application/pdf',
                    body: fileStream,
                },
                fields: 'id',
            });
        } catch (err) {
            // If error is 401, refresh token and retry once
            if (err.code === 401 || (err.response && err.response.status === 401)) {
                const newAccessToken = await refreshGoogleAccessToken();
                oauth2Client.setCredentials({
                    access_token: newAccessToken,
                    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
                });
                const driveRetry = google.drive({ version: 'v3', auth: oauth2Client });
                response = await driveRetry.files.create({
                    resource: fileMetadata,
                    media: {
                        mimeType: 'application/pdf',
                        body: fileStream,
                    },
                    fields: 'id',
                });
            } else {
                throw err;
            }
        }
        // ...existing code...

        const fileId = response.data.id;

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

        return {
            url: shareableUrl,
            downloadUrl: downloadUrl,
            fileId: fileId,
            fileName: finalFileName,
            size: fileSize,
        };

    } catch (error) {
        if (error.code === 401) {
            throw new Error('Google Drive OAuth authentication failed. Token may have expired.');
        } else if (error.code === 403) {
            throw new Error('Google Drive permission denied. Check OAuth scopes.');
        } else if (error.message && error.message.includes('too large')) {
            throw error;
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
    } catch (error) {
        // console.error('❌ Failed to delete PDF from Google Drive:', error);
        // Don't throw error for deletion failures - log and continue
    }
}

module.exports = {
    uploadPdfToGoogleDrive,
    deletePdfFromGoogleDrive,
};
