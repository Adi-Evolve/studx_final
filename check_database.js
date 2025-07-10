require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize new Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n');

  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');

    if (tablesError) {
      console.log('Using manual table check...');
      
      // Try to query each table to see if it exists
      const tableNames = ['users', 'sponsorship_sequences', 'products', 'notes', 'rooms'];
      
      for (const tableName of tableNames) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`❌ Table '${tableName}': ${error.message}`);
          } else {
            console.log(`✅ Table '${tableName}': exists and accessible`);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}': ${err.message}`);
        }
      }
    }

    // Check sponsorship_sequences table specifically
    console.log('\n🔍 Checking sponsorship_sequences table...');
    try {
      const { data, error } = await supabase
        .from('sponsorship_sequences')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Error:', error.message);
        console.log('This suggests the table might not exist or have different structure');
      } else {
        console.log('✅ Table exists and is queryable');
        console.log('Sample data:', data);
      }
    } catch (err) {
      console.log('❌ Catch error:', err.message);
    }

    // Let's try to create a simple record to see what columns exist
    console.log('\n🧪 Testing sponsorship_sequences insert...');
    try {
      const { data, error } = await supabase
        .from('sponsorship_sequences')
        .insert({
          slot: 1,
          item_type: 'note'
        })
        .select();
      
      if (error) {
        console.log('❌ Insert error:', error.message);
        if (error.message.includes('item_id')) {
          console.log('💡 This confirms item_id column is required but might not exist');
        }
      } else {
        console.log('✅ Insert successful:', data);
      }
    } catch (err) {
      console.log('❌ Insert catch error:', err.message);
    }

    // Check what the table structure actually is
    console.log('\n📋 Let\'s check if the table was created with different name...');
    
    // Try some possible variations
    const possibleNames = ['sponsorship_sequence', 'sponsorships', 'featured_listings'];
    
    for (const name of possibleNames) {
      try {
        const { data, error } = await supabase
          .from(name)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Found table: ${name}`);
        }
      } catch (err) {
        // Silent fail for non-existent tables
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

// Run the check
checkDatabase();
