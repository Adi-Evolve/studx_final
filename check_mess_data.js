require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMessData() {
  try {
    console.log('🍽️ Checking Mess Data...\n');

    // Check mess entries
    const { data: messData, error } = await supabase
      .from('mess')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error fetching mess data:', error.message);
      return;
    }

    console.log(`📊 Found ${messData.length} mess entries:`);
    
    messData.forEach((mess, index) => {
      console.log(`\n${index + 1}. ${mess.name}`);
      console.log(`   - ID: ${mess.id}`);
      console.log(`   - Location: ${mess.location_name || 'Not set'}`);
      console.log(`   - Rating: ${mess.average_rating || 0} (${mess.total_ratings || 0} reviews)`);
      console.log(`   - Menu Type: ${mess.menu_meal_type || 'Not set'}`);
      console.log(`   - Current Menu: ${mess.current_menu ? JSON.stringify(mess.current_menu).length + ' chars' : 'Not set'}`);
      console.log(`   - Created: ${new Date(mess.created_at).toLocaleDateString()}`);
    });

    if (messData.length > 0) {
      console.log(`\n📱 Test URLs:`);
      messData.forEach((mess, index) => {
        console.log(`${index + 1}. http://localhost:1501/mess/${mess.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkMessData();