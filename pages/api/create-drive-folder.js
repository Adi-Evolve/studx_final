import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { access_token, folderName, parentFolderId } = req.body;
  if (!access_token || !folderName) return res.status(400).json({ error: 'Missing required fields' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : undefined,
  };

  try {
    const response = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name',
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
