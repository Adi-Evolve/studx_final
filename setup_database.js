import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createMissingTables() {
  // console.log('🔧 Creating missing database tables...\n')
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('create_missing_tables.sql', 'utf8')
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))

    // console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue

      // console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        })
        
        if (error) {
          // Try direct query method
          const { error: queryError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(0)
          
          // If that fails, try executing as raw SQL
          // console.log(`   ⚠️  RPC method failed, trying alternative...`)
          // Note: This would require custom function or manual execution
        } else {
          // console.log(`   ✅ Success`)
        }
      } catch (err) {
        // console.log(`   ⚠️  Statement may need manual execution:`, err.message)
      }
    }

    // console.log('\n🎯 Attempting to verify table creation...')
    
    // Test room_listings table
    const { error: roomError } = await supabase
      .from('room_listings')
      .select('*')
      .limit(1)
    
    if (roomError) {
      // console.log('❌ room_listings table still missing')
    } else {
      // console.log('✅ room_listings table created successfully!')
    }

    // Test product_listings table
    const { error: productError } = await supabase
      .from('product_listings')
      .select('*')
      .limit(1)
    
    if (productError) {
      // console.log('❌ product_listings table still missing')
    } else {
      // console.log('✅ product_listings table created successfully!')
    }

    if (roomError || productError) {
      // console.log('\n📋 MANUAL ACTION REQUIRED:')
      // console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
      // console.log('2. Navigate to your project')
      // console.log('3. Go to SQL Editor')
      // console.log('4. Copy and paste the contents of create_missing_tables.sql')
      // console.log('5. Click "Run" to execute the SQL')
      // console.log('\nThis will create the missing room_listings and product_listings tables.')
    }

  } catch (error) {
    // console.error('💥 Error creating tables:', error)
    // console.log('\n📋 MANUAL ACTION REQUIRED:')
    // console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    // console.log('2. Navigate to your project')
    // console.log('3. Go to SQL Editor')
    // console.log('4. Copy and paste the contents of create_missing_tables.sql')
    // console.log('5. Click "Run" to execute the SQL')
  }
}

createMissingTables()
