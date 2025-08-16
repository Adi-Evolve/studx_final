const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkFeesPeriodColumn() {
  // console.log('🔍 Checking if fees_period column exists in rooms table...\n')
  
  try {
    // Check column existence
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default, is_nullable')
      .eq('table_name', 'rooms')
      .eq('column_name', 'fees_period')

    if (error) {
      // console.error('❌ Error checking column:', error)
      return
    }

    if (data && data.length > 0) {
      // console.log('✅ fees_period column exists!')
      // console.log('Column details:', data[0])
      
      // Check sample data
      const { data: sampleData, error: sampleError } = await supabase
        .from('rooms')
        .select('id, title, fees_period')
        .limit(5)
        
      if (sampleError) {
        // console.error('❌ Error fetching sample data:', sampleError)
      } else {
        // console.log('\n📊 Sample room data with fees_period:')
        console.table(sampleData)
      }
      
    } else {
      // console.log('❌ fees_period column does NOT exist in rooms table')
      // console.log('💡 You need to run the SQL to add this column')
    }
    
  } catch (err) {
    // console.error('❌ Unexpected error:', err)
  }
}

checkFeesPeriodColumn()
