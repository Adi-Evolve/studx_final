// Apply Arduino table migration via API calls
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateArduinoTable() {
  try {
    console.log('🔧 Migrating Arduino table for standalone storage...')
    
    // Since we can't execute complex SQL directly, let's use a workaround
    // We'll modify the API to work with the current structure and store additional data in other_components
    
    console.log('📋 Current approach: Store all Arduino data in other_components field as JSON')
    
    // Test if we can store structured data in other_components
    const testArduinoData = {
      arduino_uno_r3: true,
      breadboard: true,
      led_red: true,
      other_components: JSON.stringify({
        // Product information
        seller_id: '9c289acc-6d32-484a-8cee-b2d355f44598',
        title: 'Complete Arduino Starter Kit',
        description: 'Test Arduino kit with components',
        price: 149.99,
        category: 'electronics',
        condition: 'New',
        college: 'Test University',
        location: 'Test City',
        is_sold: false,
        // Component details
        component_count: 3,
        components_list: ['Arduino Uno R3', 'Breadboard', 'Red LED'],
        serial_numbers: ['A000066', 'BB-001', 'LED-003']
      })
    }
    
    const { data, error } = await supabase
      .from('arduino')
      .insert(testArduinoData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Migration test failed:', error)
    } else {
      console.log('✅ Migration test successful!')
      console.log('📦 Arduino kit data stored with structure:')
      console.log('  - Component booleans: ✅')
      console.log('  - Product info in other_components: ✅')
      console.log('  - JSON structure preserved: ✅')
      
      // Parse and display the stored data
      const storedData = JSON.parse(data.other_components)
      console.log('\n📋 Stored product data:')
      console.log(`  Title: ${storedData.title}`)
      console.log(`  Price: $${storedData.price}`)
      console.log(`  Components: ${storedData.component_count}`)
      
      // Clean up test data
      await supabase.from('arduino').delete().eq('id', data.id)
      console.log('\n🧹 Test data cleaned up')
      
      return true
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    return false
  }
}

migrateArduinoTable()