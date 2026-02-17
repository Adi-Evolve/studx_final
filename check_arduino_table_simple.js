const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

console.log('🔧 Connecting to Supabase...')
console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Key:', supabaseKey ? 'Set' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArduinoTable() {
  try {
    // First check users
    console.log('👥 Checking existing users...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5)
    
    if (userError) {
      console.log('⚠️ Error checking users:', userError.message)
    } else {
      console.log('📋 Available users:', users.length)
      if (users.length > 0) {
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}`)
        })
      } else {
        console.log('⚠️ No users found')
      }
    }
    
    // Try to get table structure by attempting an insert with minimal data
    console.log('\n🔍 Testing Arduino table structure...')
    
    const testData = {
      arduino_uno_r3: true,
      other_components: 'Test component'
    }
    
    const { data, error } = await supabase
      .from('arduino')
      .insert(testData)
      .select()
    
    if (error) {
      console.log('⚠️ Current table structure issue:', error.message)
      console.log('💡 This tells us what columns are missing or have issues')
      
      // Let's see what columns are available by checking the table metadata
      const { data: emptySelect, error: selectError } = await supabase
        .from('arduino')
        .select('*')
        .limit(0)
      
      if (selectError) {
        console.log('❌ Cannot access arduino table:', selectError.message)
      } else {
        console.log('✅ Arduino table exists and is accessible')
      }
      
    } else {
      console.log('✅ Test insert successful:', data)
      
      // Clean up test data
      if (data && data[0] && data[0].id) {
        await supabase.from('arduino').delete().eq('id', data[0].id)
        console.log('🧹 Test data cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkArduinoTable()