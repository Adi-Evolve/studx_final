// Quick verification script for Google OAuth setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// console.log('🔍 VERIFYING GOOGLE OAUTH SETUP...\n');

// console.log('✅ Supabase Configuration:');
// console.log(`   URL: ${supabaseUrl}`);
// console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);

// console.log('\n🔗 Expected Google OAuth Callback URL:');
// console.log(`   ${supabaseUrl}/auth/v1/callback`);

// console.log('\n📋 NEXT STEPS:');
// console.log('1. Update Google Cloud Console with the callback URL above');
// console.log('2. Remove the old callback URL from Google Cloud Console');
// console.log('3. Save changes and wait 1-2 minutes');
// console.log('4. Test Google sign-in flow');

// console.log('\n🌐 Google Cloud Console Link:');
// console.log('   https://console.cloud.google.com/apis/credentials');

// Test Supabase connection
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            // console.log('\n⚠️  Supabase Connection Issue:', error.message);
        } else {
            // console.log('\n✅ Supabase Connection: Working');
        }
    } catch (err) {
        // console.log('\n❌ Supabase Connection Error:', err.message);
    }
}

testConnection();
