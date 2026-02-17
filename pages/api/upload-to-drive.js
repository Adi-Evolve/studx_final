import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { access_token, fileName, fileData, folderId } = req.body;
  if (!access_token || !fileName || !fileData) return res.status(400).json({ error: 'Missing required fields' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };
  const media = {
    mimeType: 'application/pdf',
    body: Buffer.from(fileData, 'base64'),
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });
    // Make file shareable
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
