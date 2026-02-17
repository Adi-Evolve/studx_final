const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findArduinoKits() {
  console.log('🔍 Finding Arduino kits in database...\n');
  
  try {
    const { data, error } = await supabase
      .from('arduino')
      .select('id, other_components')
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('Arduino kits in database:');
    data.forEach(kit => {
      try {
        const info = JSON.parse(kit.other_components || '{}');
        console.log(`ID: ${kit.id}, Title: ${info.title || 'Untitled'}`);
        if (info.title && info.title.includes('FIXED')) {
          console.log('*** This looks like your kit! Use ID: ' + kit.id + ' ***');
        }
      } catch (e) {
        console.log(`ID: ${kit.id}, Parse Error`);
      }
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

findArduinoKits();