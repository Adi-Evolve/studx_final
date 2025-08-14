#!/usr/bin/env node

/**
 * StudX Google Maps API Setup Checker
 * This script checks your current environment and guides you through Google Maps API setup
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  STUDX GOOGLE MAPS API SETUP CHECKER');
console.log('=' .repeat(60));

// Check current .env.local file
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('   Please create .env.local file first');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
console.log('✅ .env.local file found');

// Parse environment variables
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        env[key.trim()] = valueParts.join('=').trim();
    }
});

console.log('\n📊 CURRENT ENVIRONMENT STATUS:');
console.log('-'.repeat(40));

// Check Supabase (Required)
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (supabaseUrl && supabaseKey) {
    console.log('✅ Supabase: CONFIGURED');
    console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
} else {
    console.log('❌ Supabase: NOT CONFIGURED');
}

// Check Google Maps API
const googleMapsKey = env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];
const googleMapsKeyServer = env['GOOGLE_MAPS_API_KEY'];

console.log('\n🗺️  GOOGLE MAPS API STATUS:');
console.log('-'.repeat(40));

if (googleMapsKey && googleMapsKey !== 'your_google_maps_api_key_here') {
    console.log('✅ Google Maps API: CONFIGURED');
    console.log(`   Client Key: ${googleMapsKey.substring(0, 20)}...`);
    if (googleMapsKeyServer && googleMapsKeyServer !== 'your_google_maps_api_key_here') {
        console.log(`   Server Key: ${googleMapsKeyServer.substring(0, 20)}...`);
    }
} else {
    console.log('❌ Google Maps API: NOT CONFIGURED');
    console.log('   Current value: "your_google_maps_api_key_here"');
}

// Check regional settings
const mapsRegion = env['NEXT_PUBLIC_GOOGLE_MAPS_REGION'];
const mapsLanguage = env['NEXT_PUBLIC_GOOGLE_MAPS_LANGUAGE'];

if (mapsRegion && mapsLanguage) {
    console.log(`✅ Regional Settings: ${mapsRegion}, ${mapsLanguage}`);
} else {
    console.log('⚠️  Regional Settings: Using defaults');
}

console.log('\n🎯 CURRENT LOCATION SYSTEM STATUS:');
console.log('-'.repeat(40));

if (googleMapsKey && googleMapsKey !== 'your_google_maps_api_key_here') {
    console.log('🚀 ENHANCED LOCATION MODE');
    console.log('   ✅ Google Maps Geolocation API');
    console.log('   ✅ High-precision GPS (10-50m accuracy)');
    console.log('   ✅ Local area detection (Kasarwadi, etc.)');
    console.log('   ✅ WiFi + Cell tower assistance');
    console.log('   ✅ IP-based fallback');
} else {
    console.log('⚡ BASIC LOCATION MODE');
    console.log('   ✅ IP-based location detection');
    console.log('   ✅ Browser GPS fallback');
    console.log('   ⚠️  Limited accuracy (~5km)');
    console.log('   ⚠️  City-level only (Pune, India)');
}

console.log('\n💡 WHAT TO DO NEXT:');
console.log('=' .repeat(60));

if (!googleMapsKey || googleMapsKey === 'your_google_maps_api_key_here') {
    console.log('📋 TO GET PRECISE KASARWADI LOCATION DETECTION:');
    console.log('');
    console.log('1️⃣  SET UP GOOGLE CLOUD PROJECT:');
    console.log('   • Go to: https://console.cloud.google.com/');
    console.log('   • Create new project: "StudX-Location"');
    console.log('');
    console.log('2️⃣  ENABLE REQUIRED APIs:');
    console.log('   • APIs & Services → Library');
    console.log('   • Enable "Geolocation API"');
    console.log('   • Enable "Geocoding API"');
    console.log('');
    console.log('3️⃣  CREATE API KEY:');
    console.log('   • APIs & Services → Credentials');
    console.log('   • Create Credentials → API Key');
    console.log('   • Copy the key (starts with "AIzaSy...")');
    console.log('');
    console.log('4️⃣  SECURE THE KEY:');
    console.log('   • Click "Restrict Key"');
    console.log('   • Application restrictions: "HTTP referrer"');
    console.log('   • Add: http://localhost:1501/*');
    console.log('   • API restrictions: Select both APIs');
    console.log('');
    console.log('5️⃣  UPDATE .ENV.LOCAL:');
    console.log('   • Replace "your_google_maps_api_key_here"');
    console.log('   • With your actual API key');
    console.log('   • Restart your dev server');
    console.log('');
} else {
    console.log('🎉 GOOGLE MAPS API IS CONFIGURED!');
    console.log('');
    console.log('🧪 TO TEST ENHANCED LOCATION:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Go to: http://localhost:1501/sell/new?category=rooms');
    console.log('   3. Click "🎯 Get Precise Location"');
    console.log('   4. Allow browser location access');
    console.log('   5. Check if it detects Kasarwadi area!');
    console.log('');
}

console.log('💰 COST: FREE up to 40,000 requests/month per API');
console.log('📊 Your usage: ~100-500 requests/month (well within limits)');

console.log('\n🔧 ALTERNATIVE OPTIONS:');
console.log('-'.repeat(40));
console.log('1. Continue using current IP-based system (works fine)');
console.log('2. Use manual location selection in MapPicker');
console.log('3. Set up Google Maps API for maximum accuracy');

console.log('\n✨ Current system works well! Google Maps is just for extra precision.');
console.log('🎯 Your choice: Enhanced accuracy vs current simplicity');

console.log('\nSetup checker completed! 🚀');
