require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAvailableFoodsData() {
  try {
    console.log('🍽️ Checking available_foods data structure...\n');

    const { data: messData, error } = await supabase
      .from('mess')
      .select('id, name, available_foods, current_menu')
      .limit(5);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    messData.forEach((mess, index) => {
      console.log(`\n${index + 1}. ${mess.name} (${mess.id})`);
      console.log('   available_foods:', JSON.stringify(mess.available_foods, null, 2));
      console.log('   current_menu:', JSON.stringify(mess.current_menu, null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAvailableFoodsData();