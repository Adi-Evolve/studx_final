// Google Drive PDF Upload Service for StudX
// This replaces Supabase Storage uploads

const { google } = require('googleapis');

/**
 * Upload PDF file to Google Drive
 * @param {File} file - The PDF file to upload
 * @param {string} fileName - Custom filename (optional)
 * @returns {Promise<{url: string, fileId: string}>} Shareable URL and file ID
 */
async function uploadPdfToGoogleDrive(file, fileName = null) {
    try {
        // console.log('📁 Uploading PDF to Google Drive...');

        // Check file size (Google Drive free tier: 15GB total, but reasonable per-file limit)
        const maxPdfSize = 100 * 1024 * 1024; // 100MB per file (much more generous than Supabase)
        if (file.size > maxPdfSize) {
            throw new Error(`PDF file "${file.name}" is too large. Maximum size is 100MB per file. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Initialize Google Drive API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                project_id: process.env.GOOGLE_PROJECT_ID,
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        const drive = google.drive({ version: 'v3', auth });

        // Sanitize filename to avoid special characters
        const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalFileName = `StudX_${Date.now()}_${sanitizedFileName}`;

        // Create file metadata
        const fileMetadata = {
            name: finalFileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Upload to StudX folder
        };

        // Convert file to stream for upload (Google Drive API expects a readable stream)
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
        // console.log(`✅ PDF uploaded successfully: ${fileId}`);

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

        // console.log(`🔗 Shareable URL: ${shareableUrl}`);

        return {
            url: shareableUrl,
            downloadUrl: downloadUrl,
            fileId: fileId,
            fileName: finalFileName,
            size: file.size,
        };

    } catch (error) {
        // console.error('❌ Google Drive upload failed:', error);
        
        // Provide specific error messages
        if (error.code === 401) {
            throw new Error('Google Drive authentication failed. Check your credentials.');
        } else if (error.code === 403) {
            throw new Error('Google Drive permission denied. Check API is enabled.');
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
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                project_id: process.env.GOOGLE_PROJECT_ID,
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        const drive = google.drive({ version: 'v3', auth });

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
