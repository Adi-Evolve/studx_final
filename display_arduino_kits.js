const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function displayArduinoKits() {
  try {
    console.log('🤖 Arduino Kits in Arduino Table:')
    console.log('=' .repeat(50))
    
    const { data: arduinoKits, error } = await supabase
      .from('arduino')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    if (arduinoKits.length === 0) {
      console.log('📭 No Arduino kits found')
      return
    }
    
    arduinoKits.forEach((kit, index) => {
      console.log(`\n🔹 Arduino Kit ${index + 1} (ID: ${kit.id})`)
      
      // Parse the product info from other_components
      try {
        const productInfo = JSON.parse(kit.other_components || '{}')
        
        console.log(`   📝 Title: ${productInfo.title || 'Unknown'}`)
        console.log(`   💰 Price: $${productInfo.price || 'N/A'}`)
        console.log(`   🏫 College: ${productInfo.college || 'N/A'}`)
        console.log(`   📍 Location: ${productInfo.location || 'N/A'}`)
        console.log(`   📊 Component Count: ${productInfo.component_count || 0}`)
        console.log(`   🔧 Condition: ${productInfo.condition || 'N/A'}`)
        console.log(`   🏷️ Category: ${productInfo.category || 'N/A'}`)
        console.log(`   💼 Sold: ${productInfo.is_sold ? 'Yes' : 'No'}`)
        
        // Show selected components
        console.log('   🧩 Components:')
        const components = []
        Object.entries(kit).forEach(([key, value]) => {
          if (key.includes('arduino') || key.includes('led') || key.includes('sensor') || 
              key.includes('resistor') || key.includes('motor') || key.includes('breadboard') ||
              key.includes('buzzer') || key.includes('display') || key.includes('wire')) {
            if (value === true) {
              components.push(key.replace(/_/g, ' ').toUpperCase())
            }
          }
        })
        
        components.forEach(comp => {
          console.log(`      ✅ ${comp}`)
        })
        
        if (productInfo.other_components_text) {
          console.log(`   🔧 Custom Components: ${productInfo.other_components_text}`)
        }
        
      } catch (parseError) {
        console.log(`   ⚠️ Could not parse product info: ${kit.other_components?.substring(0, 50)}...`)
      }
    })
    
    console.log('\n' + '=' .repeat(50))
    console.log(`📈 Total Arduino kits in Arduino table: ${arduinoKits.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

displayArduinoKits()