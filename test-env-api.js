// Test if Next.js environment is loading API keys
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔧 Environment Test for API Keys');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

if (process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY preview:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
    
    // Test Gemini API
    async function testGemini() {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            
            console.log('\n🧪 Testing Gemini API...');
            const result = await model.generateContent("Hello, can you respond with just 'AI Working'?");
            const response = await result.response;
            console.log('✅ Gemini Response:', response.text());
            
        } catch (error) {
            console.log('❌ Gemini Error:', error.message);
        }
    }
    
    testGemini();
} else {
    console.log('❌ GEMINI_API_KEY not found!');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
}