import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function addDurationColumn() {
  // console.log('🔧 Adding duration column to rooms table...\n')
  
  try {
    // First, let's check if the column already exists
    // console.log('🔍 Checking if duration column already exists...')
    
    const { data: existingData, error: checkError } = await supabase
      .from('rooms')
      .select('duration')
      .limit(1)

    if (!checkError) {
      // console.log('✅ Duration column already exists!')
      // console.log('   Skipping column creation.')
      return
    }

    // console.log('📝 Duration column does not exist, creating it...')

    // Since we can't execute DDL directly through Supabase client,
    // we'll provide manual instructions
    // console.log('\n📋 MANUAL ACTION REQUIRED:')
    // console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    // console.log('2. Navigate to your project')
    // console.log('3. Go to SQL Editor')
    // console.log('4. Copy and paste the following SQL:')
    // console.log('\n' + '='.repeat(50))
    
    const sqlContent = fs.readFileSync('add_duration_column.sql', 'utf8')
    // console.log(sqlContent)
    
    // console.log('='.repeat(50))
    // console.log('\n5. Click "Run" to execute the SQL')
    // console.log('\n✨ This will add the duration column to store monthly/yearly fee periods.')

    // Test if we can query the column after manual creation
    // console.log('\n🧪 To verify after running the SQL, test this API call:')
    // console.log(`
POST http://localhost:1501/api/sell
Content-Type: application/json

{
  "type": "room",
  "userEmail": "studxchange05@gmail.com",
  "roomName": "Test Room with Duration",
  "price": 10000,
  "duration": "yearly",
  "description": "Test room with yearly duration"
}
`)

  } catch (error) {
    // console.error('💥 Error checking duration column:', error)
    // console.log('\n📋 Please run the SQL manually in Supabase dashboard.')
  }
}

addDurationColumn()
