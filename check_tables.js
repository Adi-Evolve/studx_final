import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  // console.log('🔍 Checking database tables...\n')
  
  try {
    // Check for room_listings table
    // console.log('📋 Checking room_listings table...')
    const { data: roomData, error: roomError } = await supabase
      .from('room_listings')
      .select('*')
      .limit(1)

    if (roomError) {
      // console.log('❌ room_listings table error:', roomError.message)
    } else {
      // console.log('✅ room_listings table exists')
      // console.log('   Sample data structure:', roomData[0] || 'No data')
    }

    // Check for product_listings table
    // console.log('\n📦 Checking product_listings table...')
    const { data: productData, error: productError } = await supabase
      .from('product_listings')
      .select('*')
      .limit(1)

    if (productError) {
      // console.log('❌ product_listings table error:', productError.message)
    } else {
      // console.log('✅ product_listings table exists')
      // console.log('   Sample data structure:', productData[0] || 'No data')
    }

    // Check for notes table
    // console.log('\n📝 Checking notes table...')
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1)

    if (notesError) {
      // console.log('❌ notes table error:', notesError.message)
    } else {
      // console.log('✅ notes table exists')
      // console.log('   Sample data structure:', notesData[0] || 'No data')
    }

    // List all tables (this might not work depending on RLS policies)
    // console.log('\n🗃️  Attempting to list all accessible tables...')
    try {
      const { data: tableList, error: listError } = await supabase
        .rpc('get_table_list')

      if (listError) {
        // console.log('⚠️  Cannot list tables (this is normal):', listError.message)
      } else {
        // console.log('📊 Available tables:', tableList)
      }
    } catch (e) {
      // console.log('⚠️  Table listing not available (this is normal)')
    }

  } catch (error) {
    // console.error('💥 Unexpected error:', error)
  }
}

checkTables()
