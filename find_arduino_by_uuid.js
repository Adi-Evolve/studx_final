const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findArduinoByUUID() {
  console.log('🔍 Searching for Arduino kit with UUID: e8a8f0a5-4cac-4b43-810c-5704129ee974\n');
  
  const TARGET_UUID = 'e8a8f0a5-4cac-4b43-810c-5704129ee974';
  
  try {
    // Check all Arduino kits to find where this UUID appears
    const { data, error } = await supabase
      .from('arduino')
      .select('id, other_components')
      .limit(20);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('Searching Arduino kits for your UUID...\n');
    
    let foundKit = null;
    data.forEach(kit => {
      try {
        const info = JSON.parse(kit.other_components || '{}');
        console.log(`ID: ${kit.id}`);
        console.log(`  Title: ${info.title || 'Untitled'}`);
        console.log(`  Seller ID: ${info.seller_id || 'None'}`);
        
        // Check if this kit contains your UUID
        if (info.seller_id === TARGET_UUID || 
            kit.id === TARGET_UUID ||
            JSON.stringify(info).includes(TARGET_UUID)) {
          console.log('  *** THIS IS YOUR KIT! ***');
          foundKit = kit;
        }
        console.log('');
      } catch (e) {
        console.log(`ID: ${kit.id}, Parse Error\n`);
      }
    });

    if (foundKit) {
      console.log(`✅ Found your Arduino kit!`);
      console.log(`Database ID: ${foundKit.id}`);
      console.log(`We'll use this ID for priority positioning.`);
    } else {
      console.log(`❌ Could not find Arduino kit with UUID: ${TARGET_UUID}`);
      console.log(`Please check if the UUID is correct or if the kit exists in the database.`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

findArduinoByUUID();