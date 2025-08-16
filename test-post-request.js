// Test script to reproduce the 500 error
const FormData = require('form-data');

async function testPostRequest() {
    try {
        // console.log('Testing POST request to /api/sell...');
        
        const formData = new FormData();
        formData.append('type', 'room');
        formData.append('userEmail', 'test@example.com');
        formData.append('title', 'Test Room');
        formData.append('user', JSON.stringify({email: 'test@example.com'}));
        
        const response = await fetch('http://localhost:1501/api/sell', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders ? formData.getHeaders() : {}
        });
        
        // console.log('Response status:', response.status);
        const result = await response.text();
        // console.log('Response body:', result);
        
    } catch (error) {
        // console.error('Request failed:', error.message);
        // console.error('Stack:', error.stack);
    }
}

testPostRequest();
