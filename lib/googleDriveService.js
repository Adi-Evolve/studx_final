// Google Drive Service for StudX
// This replaces Supabase Storage for PDF uploads

const { google } = require('googleapis');

class GoogleDriveService {
    constructor() {
        // Initialize Google Drive API
        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        this.drive = google.drive({ version: 'v3', auth: this.auth });
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // StudX uploads folder
    }

    /**
     * Upload PDF file to Google Drive
     * @param {File} file - The PDF file to upload
     * @param {string} fileName - Custom filename
     * @returns {Promise<{id: string, url: string}>} File ID and shareable URL
     */
    async uploadPDF(file, fileName) {
        try {
            // console.log(`📁 Uploading ${fileName} to Google Drive...`);

            // Create file metadata
            const fileMetadata = {
                name: fileName,
                parents: [this.folderId], // Upload to specific folder
            };

            // Create media object
            const media = {
                mimeType: 'application/pdf',
                body: file, // File stream or buffer
            };

            // Upload file
            const response = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            const fileId = response.data.id;
            // console.log(`✅ File uploaded successfully: ${fileId}`);

            // Make file publicly viewable
            await this.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            // Generate shareable URL
            const shareableUrl = `https://drive.google.com/file/d/${fileId}/view`;
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

            return {
                id: fileId,
                url: shareableUrl,
                downloadUrl: downloadUrl,
                fileName: fileName,
            };

        } catch (error) {
            // console.error('❌ Google Drive upload failed:', error);
            throw new Error(`Failed to upload to Google Drive: ${error.message}`);
        }
    }

    /**
     * Delete file from Google Drive
     * @param {string} fileId - Google Drive file ID
     */
    async deleteFile(fileId) {
        try {
            await this.drive.files.delete({
                fileId: fileId,
            });
            // console.log(`🗑️ File deleted: ${fileId}`);
        } catch (error) {
            // console.error('❌ Failed to delete file:', error);
            throw error;
        }
    }

    /**
     * Get file information
     * @param {string} fileId - Google Drive file ID
     */
    async getFileInfo(fileId) {
        try {
            const response = await this.drive.files.get({
                fileId: fileId,
                fields: 'id, name, size, createdTime, mimeType',
            });
            return response.data;
        } catch (error) {
            // console.error('❌ Failed to get file info:', error);
            throw error;
        }
    }

    /**
     * Create StudX folder in Google Drive (run once during setup)
     */
    async createStudXFolder() {
        try {
            const folderMetadata = {
                name: 'StudX Uploads',
                mimeType: 'application/vnd.google-apps.folder',
            };

            const response = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id',
            });

            const folderId = response.data.id;
            // console.log(`📁 StudX folder created: ${folderId}`);
            // console.log(`Add this to your .env.local: GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
            
            return folderId;
        } catch (error) {
            // console.error('❌ Failed to create folder:', error);
            throw error;
        }
    }
}

module.exports = GoogleDriveService;
