import React, { useState } from 'react';
import { createDriveFolder, uploadPdfToDrive } from '../utils/drive';

export default function DriveUploadButton({ accessToken }) {
  const [status, setStatus] = useState('');

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Creating folder...');
    // Create folder
    const folder = await createDriveFolder(accessToken, 'Studx Notes', undefined);
    setStatus('Uploading PDF...');
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const result = await uploadPdfToDrive(accessToken, file.name, base64, folder.id);
      setStatus('Uploaded! Link: ' + result.webViewLink);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      <div>{status}</div>
    </div>
  );
}
