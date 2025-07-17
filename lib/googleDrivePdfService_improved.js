// Improved Google Drive PDF Upload Service for StudX
// This version has better error handling and authentication

const { google } = require('googleapis');

/**
 * Upload PDF file to Google Drive with improved error handling
 * @param {File} file - The PDF file to upload
 * @param {string} fileName - Custom filename (optional)
 * @returns {Promise<{url: string, fileId: string}>} Shareable URL and file ID
 */
async function uploadPdfToGoogleDrive(file, fileName = null) {
    try {
        // console.log('📁 Uploading PDF to Google Drive...');

        // Validate environment variables
        if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
            throw new Error('Google Drive API credentials not configured. Check GOOGLE_DRIVE_CLIENT_EMAIL and GOOGLE_DRIVE_PRIVATE_KEY environment variables.');
        }

        // Check file size (Google Drive free tier: 15GB total, but reasonable per-file limit)
        const maxPdfSize = 100 * 1024 * 1024; // 100MB per file
        if (file.size > maxPdfSize) {
            throw new Error(`PDF file "${file.name}" is too large. Maximum size is 100MB per file. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Initialize Google Drive API with better error handling
        let auth, drive;
        try {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
            
            drive = google.drive({ version: 'v3', auth });
            
            // Test authentication by getting user info
            await drive.about.get({ fields: 'user' });
            // console.log('✅ Google Drive authentication successful');
            
        } catch (authError) {
            // console.error('❌ Google Drive authentication failed:', authError);
            throw new Error(`Google Drive authentication failed: ${authError.message}. Please check your service account credentials.`);
        }

        // Sanitize filename to avoid special characters
        const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalFileName = `StudX_${Date.now()}_${sanitizedFileName}`;

        // Create file metadata
        const fileMetadata = {
            name: finalFileName,
        };

        // Add folder if specified and valid
        if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
            try {
                // Test if folder exists and is accessible
                await drive.files.get({ fileId: process.env.GOOGLE_DRIVE_FOLDER_ID });
                fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
                // console.log('✅ Using specified Google Drive folder');
            } catch (folderError) {
                // console.warn('⚠️ Cannot access specified folder, uploading to root:', folderError.message);
                // Continue without folder - will upload to root
            }
        }

        // Convert file to stream for upload
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const { Readable } = require('stream');
        const fileStream = Readable.from(fileBuffer);

        // Upload file with retry logic
        let uploadResponse;
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // console.log(`📤 Upload attempt ${attempt}/${maxRetries}...`);
                
                uploadResponse = await drive.files.create({
                    resource: fileMetadata,
                    media: {
                        mimeType: 'application/pdf',
                        body: fileStream,
                    },
                    fields: 'id',
                });
                
                break; // Success, exit retry loop
                
            } catch (uploadError) {
                // console.error(`❌ Upload attempt ${attempt} failed:`, uploadError.message);
                
                if (attempt === maxRetries) {
                    throw uploadError; // Last attempt failed
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        const fileId = uploadResponse.data.id;
        // console.log(`✅ PDF uploaded successfully: ${fileId}`);

        // Make file publicly viewable with error handling
        try {
            await drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            // console.log('✅ File permissions set to public');
        } catch (permissionError) {
            // console.warn('⚠️ Could not set public permissions:', permissionError.message);
            // Continue anyway - file is uploaded, just not public
        }

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
        
        // Provide specific error messages based on error type
        if (error.code === 401 || error.message.includes('authentication')) {
            throw new Error('Google Drive authentication failed. Please check your service account credentials.');
        } else if (error.code === 403 || error.message.includes('permission')) {
            throw new Error('Google Drive permission denied. Check that the Drive API is enabled and the service account has proper permissions.');
        } else if (error.code === 404) {
            throw new Error('Google Drive folder not found. Check your GOOGLE_DRIVE_FOLDER_ID.');
        } else if (error.message.includes('too large')) {
            throw error; // Re-throw size errors as-is
        } else if (error.message.includes('quota')) {
            throw new Error('Google Drive quota exceeded. Please check your storage usage.');
        } else {
            throw new Error(`Failed to upload to Google Drive: ${error.message}`);
        }
    }
}

module.exports = { uploadPdfToGoogleDrive };
