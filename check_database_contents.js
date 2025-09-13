const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseContents() {
  try {
    console.log('🔍 Checking what was actually saved...')
    
    // Check products table for Arduino entries
    console.log('\n📋 Products table (last 3 entries):')
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, title, description, price, category')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (prodError) {
      console.error('❌ Products error:', prodError)
    } else {
      products.forEach(product => {
        console.log(`  - ID: ${product.id}`)
        console.log(`    Title: ${product.title}`)
        console.log(`    Category: ${product.category}`)
        console.log(`    Price: $${product.price}`)
        console.log(`    Description: ${product.description?.substring(0, 100)}...`)
        console.log('')
      })
    }
    
    // Check Arduino table entries
    console.log('\n🤖 Arduino table (last 3 entries):')
    const { data: arduino, error: ardError } = await supabase
      .from('arduino')
      .select('id, product_id, arduino_uno_r3, breadboard, other_components')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (ardError) {
      console.error('❌ Arduino error:', ardError)
    } else {
      arduino.forEach(item => {
        console.log(`  - ID: ${item.id}`)
        console.log(`    Product ID: ${item.product_id}`)
        console.log(`    Arduino Uno: ${item.arduino_uno_r3}`)
        console.log(`    Breadboard: ${item.breadboard}`)
        console.log(`    Other: ${item.other_components?.substring(0, 50)}...`)
        console.log('')
      })
    }
    
    // Check what's the issue with Arduino table access
    console.log('\n🔒 Checking Arduino table permissions...')
    const { data: tableTest, error: tableError } = await supabase
      .from('arduino')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Arduino table access error:', tableError.message)
      console.log('💡 This might be the "unrestricted label" issue')
    } else {
      console.log('✅ Arduino table is accessible')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkDatabaseContents()