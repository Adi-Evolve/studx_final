import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCorrectTables() {
  console.log('🔍 Checking correct table names...\n')
  
  try {
    // Check for rooms table
    console.log('🏠 Checking rooms table...')
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1)

    if (roomError) {
      console.log('❌ rooms table error:', roomError.message)
    } else {
      console.log('✅ rooms table exists')
      console.log('   Sample data structure:', roomData[0] || 'No data')
    }

    // Check for products table
    console.log('\n📦 Checking products table...')
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productError) {
      console.log('❌ products table error:', productError.message)
    } else {
      console.log('✅ products table exists')
      console.log('   Sample data structure:', productData[0] || 'No data')
    }

    // Check for notes table
    console.log('\n📝 Checking notes table...')
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1)

    if (notesError) {
      console.log('❌ notes table error:', notesError.message)
    } else {
      console.log('✅ notes table exists')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkCorrectTables()
