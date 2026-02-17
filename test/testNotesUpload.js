// Simple test script to upload a note via the /api/sell endpoint
// Run with: node test/testNotesUpload.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testUploadNote() {
  try {
    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('type', 'notes');
    formData.append('title', 'Test Note');
    formData.append('description', 'This is a test note upload.');
    formData.append('price', 100);
    formData.append('category', 'Engineering');
    formData.append('college', 'Test College');
    formData.append('academic_year', '2025');
    formData.append('course_subject', 'Computer Science');
    formData.append('images', 'https://i.ibb.co/2dQpQkR/sample-image.png');
    formData.append('seller_id', 'test-seller-id');
    formData.append('user', JSON.stringify({
      email: 'adiinamdar888@gmail.com',
      name: 'Adi Namdar',
      id: 'adiinamdar888'
    }));

    // Attach a real PDF file
    const pdfPath = path.join(__dirname, 'sample.pdf');
    if (fs.existsSync(pdfPath)) {
      formData.append('pdfs', fs.createReadStream(pdfPath), {
        filename: 'sample.pdf',
        contentType: 'application/pdf'
      });
    } else {
      // console.error('sample.pdf not found in test directory. Please add a real PDF for testing.');
      return;
    }

    const response = await axios.post('http://localhost:1501/api/sell', formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    // console.log('Upload successful:', response.data);
  } catch (error) {
    if (error.response) {
      // console.error('Upload failed:', error.response.status, error.response.data);
    } else {
      // console.error('Error:', error.message);
    }
  }
}

testUploadNote();
