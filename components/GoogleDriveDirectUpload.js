import React, { useState } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_DRIVE_FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

export default function GoogleDriveDirectUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load Google API script
  React.useEffect(() => {
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.onload = () => {
        window.gapi.load('client:auth2', () => {});
      };
      document.body.appendChild(script);
    }
  }, []);

  const authenticate = async () => {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        await window.gapi.client.init({
          clientId: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
        });
        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        GoogleAuth.signIn().then(user => {
          resolve(user.getAuthResponse().access_token);
        }).catch(reject);
      });
    });
  };

  const uploadFileToDrive = async (file, accessToken) => {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : [],
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  };

  const handleFileChange = async (e) => {
    setError(null);
    setSuccess(false);
    setUploading(true);
    try {
      const file = e.target.files[0];
      if (!file) throw new Error('No file selected');
      if (file.size > 100 * 1024 * 1024) throw new Error('File too large (max 100MB)');
      const accessToken = await authenticate();
      const result = await uploadFileToDrive(file, accessToken);
      setSuccess(true);
      if (onUpload) onUpload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} />
      {uploading && <div>Uploading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {success && <div style={{ color: 'green' }}>Upload successful!</div>}
    </div>
  );
}
