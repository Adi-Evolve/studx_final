const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArduinoTableStructure() {
  try {
    console.log('🔍 Testing Arduino table structure for standalone storage...')
    
    // Try to insert minimal data to see what columns are available
    const testData = {
      arduino_uno_r3: true,
      breadboard: true,
      other_components: 'Structure test'
    }
    
    const { data, error } = await supabase
      .from('arduino')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Insert error:', error.message)
    } else {
      console.log('✅ Current Arduino table structure:')
      console.log(Object.keys(data))
      
      // Clean up
      await supabase.from('arduino').delete().eq('id', data.id)
      console.log('🧹 Test data cleaned up')
    }
    
    // Try to add missing columns directly via INSERT with expected columns
    console.log('\n🔧 Testing if we can add missing columns...')
    
    const extendedTestData = {
      arduino_uno_r3: true,
      title: 'Test Kit',
      description: 'Test description',
      price: 99.99,
      seller_id: '9c289acc-6d32-484a-8cee-b2d355f44598' // Using existing user ID
    }
    
    const { data: extendedData, error: extendedError } = await supabase
      .from('arduino')
      .insert(extendedTestData)
      .select()
      .single()
    
    if (extendedError) {
      console.error('❌ Extended test failed:', extendedError.message)
      console.log('💡 Arduino table needs additional columns for standalone storage')
    } else {
      console.log('✅ Arduino table supports extended data!')
      console.log('Columns:', Object.keys(extendedData))
      
      // Clean up
      await supabase.from('arduino').delete().eq('id', extendedData.id)
      console.log('🧹 Extended test data cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkArduinoTableStructure()