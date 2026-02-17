require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize new Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function recreateTable() {
  // console.log('🔧 Recreating sponsorship_sequences table...\n');

  try {
    // Drop the existing table
    // console.log('1. Dropping existing table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS public.sponsorship_sequences CASCADE;'
    });

    if (dropError) {
      // console.log('⚠️ Could not drop table (might not exist):', dropError.message);
    } else {
      // console.log('✅ Table dropped');
    }

    // Recreate the table with correct structure
    // console.log('2. Creating table with correct structure...');
    const createSQL = `
      CREATE TABLE public.sponsorship_sequences (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        item_id UUID NOT NULL,
        item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
        slot INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT sponsorship_sequences_pkey PRIMARY KEY (id)
      );
      
      -- Enable RLS
      ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for read access
      CREATE POLICY "Enable read access for all users" ON public.sponsorship_sequences
      FOR SELECT USING (true);
      
      -- Create policy for insert (authenticated users only)
      CREATE POLICY "Enable insert for authenticated users" ON public.sponsorship_sequences
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createSQL
    });

    if (createError) {
      // console.log('❌ Could not create table:', createError.message);
      
      // Try alternative approach - direct SQL execution might not work
      // console.log('Trying alternative approach...');
      // console.log('\n📋 MANUAL STEPS NEEDED:');
      // console.log('Please go to your Supabase SQL Editor and run this SQL:');
      // console.log('========================================================');
      // console.log(createSQL);
      // console.log('========================================================');
      
    } else {
      // console.log('✅ Table created successfully');
    }

    // Test the new table
    // console.log('\n3. Testing the new table...');
    const { data, error } = await supabase
      .from('sponsorship_sequences')
      .insert({
        item_id: '12345678-1234-1234-1234-123456789012',
        item_type: 'note',
        slot: 1
      })
      .select();

    if (error) {
      // console.log('❌ Test insert failed:', error.message);
    } else {
      // console.log('✅ Test insert successful:', data);
      
      // Clean up test data
      await supabase
        .from('sponsorship_sequences')
        .delete()
        .eq('item_id', '12345678-1234-1234-1234-123456789012');
      // console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    // console.error('❌ Recreation failed:', error.message);
    
    // console.log('\n🔧 MANUAL FIX REQUIRED:');
    // console.log('Please go to your Supabase dashboard and:');
    // console.log('1. Go to SQL Editor');
    // console.log('2. Run: DROP TABLE IF EXISTS public.sponsorship_sequences CASCADE;');
    // console.log('3. Run the CREATE TABLE statement shown above');
  }
}

// Run the recreation
recreateTable();
