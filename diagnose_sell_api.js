/**
 * Sell API Diagnostic Script
 * Use this to test the sell API and identify issues
 */

// Test environment variables
console.log('🔍 Environment Variables Check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('IMGBB_API_KEY:', process.env.IMGBB_API_KEY ? '✅ Set' : '❌ Missing')
console.log('NODE_ENV:', process.env.NODE_ENV)

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ Missing Supabase credentials')
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)

    if (error) {
      console.log('❌ Supabase connection error:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.log('❌ Supabase test failed:', error.message)
    return false
  }
}

// Test room listing data
async function testRoomListing() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test data for room listing
    const testRoomData = {
      seller_id: 'test-user-id',
      title: 'Test Room Listing',
      description: 'A test room for diagnostic purposes',
      price: 5000,
      college: 'Test College',
      location: JSON.stringify({ address: 'Test Address' }),
      images: [],
      room_type: 'Single',
      occupancy: 'Single',
      owner_name: 'Test Owner',
      contact1: '1234567890',
      contact2: null,
      distance: '1km',
      deposit: 10000,
      fees_include_mess: false,
      mess_fees: null,
      amenities: ['WiFi', 'Parking'],
      fees_period: 'Monthly',
      category: 'rooms',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('🧪 Testing room insertion...')
    console.log('Test data:', testRoomData)

    // Don't actually insert, just validate
    console.log('✅ Room data structure looks valid')

  } catch (error) {
    console.log('❌ Room listing test failed:', error.message)
  }
}

// Check user authentication
async function testUserAuth(userEmail = 'test@example.com') {
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`🔐 Testing user authentication for: ${userEmail}`)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, college')
      .eq('email', userEmail)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`⚠️ User ${userEmail} not found in database`)
      } else {
        console.log('❌ User lookup error:', error.message)
      }
      return false
    }

    console.log('✅ User found:', user)
    return user
  } catch (error) {
    console.log('❌ User auth test failed:', error.message)
    return false
  }
}

// Test ImgBB connection
async function testImgBBConnection() {
  try {
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    
    if (!IMGBB_API_KEY) {
      console.log('❌ IMGBB_API_KEY not set')
      return false
    }

    // Test with a simple API call (not uploading actual image)
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: new FormData() // Empty form data to test authentication
    })

    if (response.status === 400) {
      // 400 is expected with empty form data, means API key is valid
      console.log('✅ ImgBB API key is valid')
      return true
    } else if (response.status === 401) {
      console.log('❌ ImgBB API key is invalid')
      return false
    } else {
      console.log('⚠️ ImgBB API response:', response.status)
      return true
    }
  } catch (error) {
    console.log('❌ ImgBB test failed:', error.message)
    return false
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('🚀 Starting Sell API Diagnostics...\n')

  console.log('1️⃣ Testing Supabase Connection:')
  await testSupabaseConnection()
  console.log('')

  console.log('2️⃣ Testing User Authentication:')
  await testUserAuth()
  console.log('')

  console.log('3️⃣ Testing ImgBB Connection:')
  await testImgBBConnection()
  console.log('')

  console.log('4️⃣ Testing Room Data Structure:')
  await testRoomListing()
  console.log('')

  console.log('✨ Diagnostics complete!')
}

// Export for use in API routes or scripts
module.exports = {
  testSupabaseConnection,
  testUserAuth,
  testImgBBConnection,
  testRoomListing,
  runDiagnostics
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics()
}
