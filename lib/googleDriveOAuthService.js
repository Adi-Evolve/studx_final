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

        // Initialize OAuth client
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

        // Create file metadata
        const fileMetadata = {
            name: finalFileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

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
        console.log(`[Drive Upload] PDF uploaded successfully: ${fileId}`);

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
        console.log(`[Drive Upload] Shareable URL: ${shareableUrl}`);

        return {
            url: shareableUrl,
            downloadUrl: downloadUrl,
            fileId: fileId,
            fileName: finalFileName,
            size: fileSize,
        };

    } catch (error) {
        console.error('[Drive Upload] Google Drive upload failed:', error);
        if (error.code === 401) {
            throw new Error('Google Drive OAuth authentication failed. Token may have expired.');
        } else if (error.code === 403) {
            throw new Error('Google Drive permission denied. Check OAuth scopes.');
        } else if (error.message.includes('too large')) {
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
        
        // console.log(`🗑️ PDF deleted from Google Drive: ${fileId}`);
    } catch (error) {
        // console.error('❌ Failed to delete PDF from Google Drive:', error);
        // Don't throw error for deletion failures - log and continue
    }
}

module.exports = {
    uploadPdfToGoogleDrive,
    deletePdfFromGoogleDrive,
};
