const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function addArduinoColumns() {
  try {
    console.log('🔧 Adding missing columns to Arduino table...')
    
    // List of columns to add
    const alterQueries = [
      'ALTER TABLE arduino ADD COLUMN seller_id INTEGER REFERENCES users(id)',
      'ALTER TABLE arduino ADD COLUMN title VARCHAR(255)',
      'ALTER TABLE arduino ADD COLUMN description TEXT',
      'ALTER TABLE arduino ADD COLUMN price DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE arduino ADD COLUMN category VARCHAR(100) DEFAULT \'electronics\'',
      'ALTER TABLE arduino ADD COLUMN condition VARCHAR(50) DEFAULT \'Used\'',
      'ALTER TABLE arduino ADD COLUMN college VARCHAR(255)',
      'ALTER TABLE arduino ADD COLUMN location VARCHAR(255)',
      'ALTER TABLE arduino ADD COLUMN is_sold BOOLEAN DEFAULT FALSE'
    ]
    
    for (const query of alterQueries) {
      try {
        console.log(`Running: ${query}`)
        const { data, error } = await supabase.rpc('sql', { query })
        
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️ ${query} - ${error.message}`)
        } else {
          console.log(`✅ Column added successfully`)
        }
      } catch (err) {
        console.log(`⚠️ ${query} - ${err.message}`)
      }
    }
    
    // Test the new structure
    console.log('🔍 Testing new table structure...')
    const testData = {
      title: 'Test Arduino Kit',
      description: 'Test description',
      price: 99.99,
      seller_id: 1, // Assuming user ID 1 exists
      arduino_uno_r3: true
    }
    
    const { data, error } = await supabase
      .from('arduino')
      .insert(testData)
      .select()
    
    if (error) {
      console.log('⚠️ Test insert with new columns failed:', error.message)
    } else {
      console.log('✅ Test insert with new columns successful!')
      
      // Clean up
      if (data && data[0] && data[0].id) {
        await supabase.from('arduino').delete().eq('id', data[0].id)
        console.log('🧹 Test data cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addArduinoColumns()