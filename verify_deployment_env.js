// Environment Variables Verification Script
// Run this to check if all required environment variables are properly set

// console.log('🔍 Checking Environment Variables...\n');

// Check all required environment variables
const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SECRET_KEY': process.env.SUPABASE_SECRET_KEY,
    'IMGBB_API_KEY': process.env.IMGBB_API_KEY
};

let allGood = true;

// Check each environment variable
Object.entries(requiredEnvVars).forEach(([name, value]) => {
    const status = value ? '✅' : '❌';
    const display = value ? 
        (name.includes('SECRET') ? '***HIDDEN***' : value.substring(0, 20) + '...') : 
        'NOT SET';
    
    // console.log(`${status} ${name}: ${display}`);
    
    if (!value) {
        allGood = false;
    }
});

// console.log('\n📊 Environment Check Results:');
if (allGood) {
    // console.log('✅ All environment variables are properly set!');
    // console.log('🚀 Your app is ready for deployment.');
} else {
    // console.log('❌ Some environment variables are missing.');
    // console.log('⚠️  Please set all required environment variables before deployment.');
}

// Test ImgBB API connectivity (basic check)
async function testImgBBConnection() {
    if (!process.env.IMGBB_API_KEY) {
        // console.log('\n❌ Cannot test ImgBB - API key not set');
        return;
    }
    
    try {
        // console.log('\n🧪 Testing ImgBB API connectivity...');
        
        // Create a small test image (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: new URLSearchParams({
                image: testImageBase64
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // console.log('✅ ImgBB API is working correctly!');
            // console.log(`📷 Test image uploaded: ${result.data.url}`);
        } else {
            // console.log('❌ ImgBB API test failed:', result.error?.message || 'Unknown error');
        }
    } catch (error) {
        // console.log('❌ ImgBB API test error:', error.message);
    }
}

// Run the ImgBB test
testImgBBConnection();

// Export for use in other scripts
module.exports = {
    checkEnvironmentVariables: () => allGood,
    requiredEnvVars
};
