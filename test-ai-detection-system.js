// 🧪 Test Script for AI Detection API
// Run this to validate the fixed detection system

const fs = require('fs');
const path = require('path');

async function testAIDetection() {
    console.log('🧪 Testing AI Detection API...\n');
    
    try {
        // Test the hybrid-detect endpoint
        const testImagePath = path.join(__dirname, 'test-thali-image.jpg');
        
        // Check if we have a test image
        if (!fs.existsSync(testImagePath)) {
            console.log('⚠️  No test image found at:', testImagePath);
            console.log('📝 To test properly:');
            console.log('   1. Add a thali image named "test-thali-image.jpg" to the project root');
            console.log('   2. Upload an image through the web interface');
            console.log('   3. Check the terminal for detailed dish detection logs\n');
            
            // Test API endpoint availability
            const response = await fetch('http://localhost:3000/api/ai/hybrid-detect', {
                method: 'POST',
                body: new FormData() // Empty form data to test error handling
            });
            
            console.log('📡 API Endpoint Test:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Expected: 400 (Bad Request - no image)`);
            
            if (response.status === 400) {
                console.log('   ✅ API endpoint is working correctly\n');
                
                const result = await response.json();
                console.log('📋 Error Response:', result);
            }
            
            return;
        }
        
        // If test image exists, upload it
        const imageBuffer = fs.readFileSync(testImagePath);
        const formData = new FormData();
        formData.append('image', new Blob([imageBuffer]), 'test-thali-image.jpg');
        
        console.log('📤 Uploading test image...');
        
        const response = await fetch('http://localhost:3000/api/ai/hybrid-detect', {
            method: 'POST',
            body: formData
        });
        
        console.log(`📡 Response Status: ${response.status}\n`);
        
        if (response.ok) {
            const result = await response.json();
            
            console.log('✅ Detection Successful!');
            console.log('📊 Results Summary:');
            console.log(`   🍽️  Dishes Found: ${result.dishes_found}`);
            console.log(`   🎯 Confidence: ${result.confidence_score}%`);
            console.log(`   ⚡ Processing Time: ${result.processing_time}`);
            console.log(`   🤖 Model: ${result.model_version}`);
            console.log(`   🔍 Method: ${result.detection_method}\n`);
            
            if (result.detected_dishes && result.detected_dishes.length > 0) {
                console.log('📋 Detected Dishes:');
                result.detected_dishes.forEach((dish, index) => {
                    console.log(`   ${index + 1}. ${dish.name} (₹${dish.price})`);
                });
            }
            
        } else {
            const error = await response.text();
            console.log('❌ Detection Failed:');
            console.log('   Error:', error);
        }
        
    } catch (error) {
        console.error('🚨 Test Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. Next.js dev server is running (npm run dev)');
        console.log('   2. GEMINI_API_KEY is set in .env.local');
        console.log('   3. You have internet connection for Gemini API\n');
    }
}

// Instructions for manual testing
console.log('🔧 AI Detection System Test Instructions:\n');
console.log('1. 🚀 Start your Next.js app: npm run dev');
console.log('2. 🌐 Open http://localhost:3000/profile/mess');
console.log('3. 📸 Upload a thali/food image');
console.log('4. 👀 Check the terminal for detailed detection logs');
console.log('5. 📊 You should see a detailed breakdown of detected dishes\n');

console.log('📋 What to expect in terminal:');
console.log('🔍 =========================');
console.log('🍽️  DETECTED DISHES ANALYSIS');
console.log('🔍 =========================');
console.log('📊 Total dishes found: 5');
console.log('⚡ Processing time: 2.1s');
console.log('🎯 Detection method: gemini-1.5-flash');
console.log('🎯 Overall confidence: 78%');
console.log('');
console.log('📋 DETECTED DISHES LIST:');
console.log('  1. 🍽️  Dal Tadka');
console.log('     📂 Category: main_dish');
console.log('     💰 Price: ₹45');
console.log('     🎯 Confidence: 85%');
console.log('     📝 Description: Delicious Dal Tadka');
console.log('     ✅ Available: Yes');
console.log('     🔍 Source: gemini-1.5-flash');
console.log('🔍 =========================\n');

console.log('🎯 Key Fixes Applied:');
console.log('✅ Updated deprecated gemini-pro-vision to gemini-1.5-flash');
console.log('✅ Added comprehensive terminal logging for testing');
console.log('✅ Improved error handling and validation');
console.log('✅ Fixed syntax errors in docstrings');
console.log('✅ Enhanced image processing validation\n');

// Auto-run test if running in Node.js environment
if (typeof window === 'undefined' && require.main === module) {
    testAIDetection();
}

module.exports = { testAIDetection };