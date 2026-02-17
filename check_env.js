// Quick environment check for AI detection
require('dotenv').config({ path: './.env.local' });

console.log('🔍 Environment Check for AI Detection...\n');

const requiredVars = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'IMGBB_API_KEY'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isConfigured = value && value !== 'your_' + varName.toLowerCase() + '_here' && !value.includes('your_');
  
  console.log(`${isConfigured ? '✅' : '❌'} ${varName}: ${isConfigured ? 'Configured' : 'Missing or placeholder'}`);
  
  if (!isConfigured) {
    allConfigured = false;
  }
});

console.log('\n' + (allConfigured ? '🎉 All environment variables are properly configured!' : '⚠️  Some environment variables need to be set up.'));

if (allConfigured) {
  console.log('\n🚀 AI Detection should work without 500 errors!');
  console.log('📱 Camera capture functionality is ready to use!');
} else {
  console.log('\n🔧 To fix 500 errors, ensure all API keys are valid.');
  console.log('📝 Check .env.local file and replace placeholder values.');
}