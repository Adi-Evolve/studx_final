const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uqkhygdoubttkkuuztfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxa2h5Z2RvdWJ0dGtrdXV6dGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMzNTg5NzksImV4cCI6MjAzODkzNDk3OX0.EiqhXU8K6JaT1j6-JHg5w5Q2J9VzKrOKI2t0EiQ8wJs'
);

async function checkRoomsAndProducts() {
  console.log('🔍 Checking database for items with location data...\n');

  try {
    // Check rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, title, location')
      .limit(5);

    if (roomsError) {
      console.log('❌ Rooms error:', roomsError.message);
    } else {
      console.log(`🏠 Rooms found: ${rooms?.length || 0}`);
      rooms?.forEach(room => {
        console.log(`   - ${room.title} (ID: ${room.id})`);
        if (room.location) {
          try {
            const loc = typeof room.location === 'string' ? JSON.parse(room.location) : room.location;
            console.log(`     📍 Location: lat=${loc.lat}, lng=${loc.lng}`);
            console.log(`     🔗 Test URL: http://localhost:1501/products/rooms/${room.id}`);
          } catch (e) {
            console.log(`     ⚠️ Invalid location format`);
          }
        } else {
          console.log(`     ❌ No location data`);
        }
      });
    }

    console.log('');

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, location')
      .limit(5);

    if (productsError) {
      console.log('❌ Products error:', productsError.message);
    } else {
      console.log(`📦 Products found: ${products?.length || 0}`);
      products?.forEach(product => {
        console.log(`   - ${product.title} (ID: ${product.id})`);
        if (product.location) {
          try {
            const loc = typeof product.location === 'string' ? JSON.parse(product.location) : product.location;
            console.log(`     📍 Location: lat=${loc.lat}, lng=${loc.lng}`);
            console.log(`     🔗 Test URL: http://localhost:1501/products/regular/${product.id}`);
          } catch (e) {
            console.log(`     ⚠️ Invalid location format`);
          }
        } else {
          console.log(`     ❌ No location data`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRoomsAndProducts();