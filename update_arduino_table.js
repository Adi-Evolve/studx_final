// Update Arduino table structure to support standalone Arduino kit listings
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateArduinoTableStructure() {
  try {
    console.log('🔧 Updating Arduino table structure...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'update_arduino_table_structure.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📄 Executing SQL updates...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    })
    
    if (error) {
      console.error('❌ SQL execution error:', error)
      
      // Try alternative method - execute each statement separately
      console.log('🔄 Trying alternative method...')
      
      // Add columns one by one
      const alterStatements = [
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS seller_id INTEGER',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS title VARCHAR(255)',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS description TEXT',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'electronics\'',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT \'Used\'',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS college VARCHAR(255)',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS location VARCHAR(255)',
        'ALTER TABLE arduino ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE'
      ]
      
      for (const statement of alterStatements) {
        try {
          const { error: alterError } = await supabase.rpc('exec_sql', { 
            sql_query: statement 
          })
          if (alterError) {
            console.log(`⚠️ ${statement} - ${alterError.message}`)
          } else {
            console.log(`✅ ${statement} - Success`)
          }
        } catch (err) {
          console.log(`⚠️ ${statement} - ${err.message}`)
        }
      }
    } else {
      console.log('✅ SQL executed successfully:', data)
    }
    
    // Verify the table structure
    console.log('🔍 Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('arduino')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError)
    } else {
      console.log('✅ Arduino table is accessible')
      
      // Try a test insert to see what columns are available
      const testData = {
        title: 'Test Arduino Kit',
        description: 'Test description',
        price: 99.99,
        arduino_uno_r3: true
      }
      
      const { data: testInsert, error: testError } = await supabase
        .from('arduino')
        .insert(testData)
        .select()
      
      if (testError) {
        console.log('⚠️ Test insert failed (this helps us see available columns):', testError.message)
      } else {
        console.log('✅ Test insert successful:', testInsert)
        
        // Clean up test data
        if (testInsert && testInsert[0]) {
          await supabase.from('arduino').delete().eq('id', testInsert[0].id)
          console.log('🧹 Test data cleaned up')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating Arduino table:', error)
  }
}

// Run the update
updateArduinoTableStructure()