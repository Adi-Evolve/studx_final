// Utility functions for fetching Arduino kits from Arduino table
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Arduino Utils: Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Function to parse Arduino kit data from other_components JSON
function parseArduinoKitData(arduinoRow) {
  try {
    if (!arduinoRow.other_components) {
      return null
    }

    const productInfo = JSON.parse(arduinoRow.other_components)
    
    // Format Arduino kit as a standard product
    return {
      id: arduinoRow.id,
      title: productInfo.title || 'Arduino Kit',
      description: productInfo.description || 'Arduino development kit',
      price: productInfo.price || 0,
      category: productInfo.category || 'electronics',
      condition: productInfo.condition || 'Used',
      college: productInfo.college || '',
      location: productInfo.location || '',
      is_sold: productInfo.is_sold || false,
      seller_id: productInfo.seller_id,
      created_at: arduinoRow.created_at,
      updated_at: arduinoRow.updated_at,
      // Arduino specific fields
      type: 'arduino_kit',
      table_type: 'arduino',
      component_count: productInfo.component_count || 0,
      is_arduino_kit: true,
      // Include component information
      arduino_components: Object.keys(arduinoRow)
        .filter(key => 
          key.includes('arduino') || key.includes('led') || key.includes('sensor') || 
          key.includes('resistor') || key.includes('motor') || key.includes('breadboard') ||
          key.includes('buzzer') || key.includes('display') || key.includes('wire') ||
          key.includes('switch') || key.includes('diode') || key.includes('transistor')
        )
        .reduce((acc, key) => {
          if (arduinoRow[key] === true) {
            acc[key] = true
          }
          return acc
        }, {}),
      other_components_text: productInfo.other_components_text || ''
    }
  } catch (error) {
    console.error('Error parsing Arduino kit data:', error)
    return null
  }
}

// Function to fetch Arduino kits with various filters
async function fetchArduinoKits(options = {}) {
  const {
    limit = 10,
    sellerId = null,
    searchTerm = null,
    category = null,
    orderBy = 'created_at',
    ascending = false
  } = options

  try {
    let query = supabase
      .from('arduino')
      .select('*')
      .order(orderBy, { ascending })

    // Apply filters
    if (sellerId) {
      // For seller filter, we need to filter by seller_id in the JSON
      // This is more complex, so we'll fetch all and filter in JS
      const { data, error } = await query
      
      if (error) {
        console.error('Arduino fetch error:', error)
        return []
      }

      const filtered = (data || [])
        .map(parseArduinoKitData)
        .filter(kit => kit && kit.seller_id === sellerId)
        .slice(0, limit)

      return filtered
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Arduino fetch error:', error)
      return []
    }

    // Parse and filter Arduino kits
    let arduinoKits = (data || [])
      .map(parseArduinoKitData)
      .filter(kit => kit !== null)

    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      arduinoKits = arduinoKits.filter(kit => 
        kit.title.toLowerCase().includes(term) ||
        kit.description.toLowerCase().includes(term) ||
        kit.category.toLowerCase().includes(term) ||
        kit.other_components_text.toLowerCase().includes(term)
      )
    }

    // Apply category filter if provided
    if (category && category !== 'all') {
      arduinoKits = arduinoKits.filter(kit => kit.category === category)
    }

    return arduinoKits

  } catch (error) {
    console.error('Error fetching Arduino kits:', error)
    return []
  }
}

module.exports = {
  parseArduinoKitData,
  fetchArduinoKits
}