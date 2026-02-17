// List available models first
const https = require('https');
require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔍 Listing available Gemini models...\n');
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found');
        return;
    }
    
    console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
    
    // Try different API versions
    const apiVersions = ['v1', 'v1beta'];
    
    for (const version of apiVersions) {
        console.log(`\n📋 Checking ${version} API...`);
        
        try {
            const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
            
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await makeRequest(url, options);
            
            console.log(`✅ ${version} API Response:`);
            if (response.models && response.models.length > 0) {
                console.log(`Found ${response.models.length} models:`);
                response.models.forEach(model => {
                    console.log(`- ${model.name} (${model.displayName || 'No display name'})`);
                    if (model.supportedGenerationMethods) {
                        console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                    }
                });
            } else {
                console.log('No models found');
            }
            
        } catch (error) {
            console.log(`❌ ${version} API Error:`, error.message.split('\n')[0]);
        }
    }
    
    // Also try to test with some basic model names that might work
    console.log('\n🧪 Testing basic model names...');
    const basicModels = ['text-bison-001', 'gemini-pro', 'models/gemini-pro'];
    
    for (const modelName of basicModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            
            const postData = JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Hello"
                    }]
                }]
            });
            
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const response = await makeRequest(url, options, postData);
            console.log(`✅ ${modelName} works!`);
            
            if (response.candidates && response.candidates[0]) {
                console.log('Response:', response.candidates[0].content.parts[0].text);
            }
            break; // Exit on first success
            
        } catch (error) {
            console.log(`❌ ${modelName}: ${error.message.split(':')[0]}`);
        }
    }
}

function makeRequest(url, options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(jsonData);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(jsonData)}`));
                    }
                } catch (parseError) {
                    reject(new Error(`Parse error: ${data}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

listAvailableModels();