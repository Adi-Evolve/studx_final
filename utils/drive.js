import axios from 'axios';

export async function createDriveFolder(access_token, folderName, parentFolderId) {
  const res = await axios.post('/api/create-drive-folder', {
    access_token,
    folderName,
    parentFolderId,
  });
  return res.data;
}

export async function uploadPdfToDrive(access_token, fileName, fileData, folderId) {
  const res = await axios.post('/api/upload-to-drive', {
    access_token,
    fileName,
    fileData,
    folderId,
  });
  return res.data;
}
