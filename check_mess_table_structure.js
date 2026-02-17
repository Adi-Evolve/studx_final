require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMessTableStructure() {
  try {
    console.log('🔍 Checking Mess Table Structure...\n');

    // Get a sample mess record to see available columns
    const { data: messData, error: messError } = await supabase
      .from('mess')
      .select('*')
      .limit(1);

    if (messError) {
      console.log('❌ Error:', messError.message);
      return;
    }

    if (messData && messData.length > 0) {
      console.log('✅ Mess table columns:');
      const sampleMess = messData[0];
      Object.keys(sampleMess).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleMess[key]} (${sampleMess[key]})`);
      });

      console.log('\n📊 Sample mess data:');
      console.log(JSON.stringify(sampleMess, null, 2));
    } else {
      console.log('❌ No mess data found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMessTableStructure();