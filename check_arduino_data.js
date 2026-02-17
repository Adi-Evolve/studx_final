const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xfdghpokzahmwbktmhdi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGdocG9remFobXdia3RtaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTk5MDYsImV4cCI6MjA0ODczNTkwNn0.i5w8iO9n6hcX5dOTnNmgjFNj0nFQDlYoNvCmNhQGWHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArduinoData() {
  try {
    console.log('Checking for Arduino kits...\n');
    
    // Check Arduino table
    const { data: arduinoData, error: arduinoError } = await supabase
      .from('arduino')
      .select('*')
      .limit(10);
    
    console.log('=== ARDUINO TABLE ===');
    console.log('Count:', arduinoData?.length || 0);
    if (arduinoError) console.log('Error:', arduinoError.message);
    
    if (arduinoData && arduinoData.length > 0) {
      console.log('Sample Arduino kits:');
      arduinoData.slice(0, 3).forEach((item, i) => {
        try {
          const productInfo = JSON.parse(item.other_components || '{}');
          console.log(`  ${i+1}. ${productInfo.title || 'No title'} (ID: ${item.id})`);
        } catch (e) {
          console.log(`  ${i+1}. Parse error (ID: ${item.id})`);
        }
      });
    }
    
    // Check for Arduino-related items in products table
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .or('title.ilike.%arduino%, description.ilike.%arduino%, category.ilike.%project equipment%')
      .limit(10);
      
    console.log('\n=== PRODUCTS TABLE (Arduino-related) ===');
    console.log('Count:', productsData?.length || 0);
    if (productsError) console.log('Error:', productsError.message);
    
    if (productsData && productsData.length > 0) {
      console.log('Arduino-related products found in products table:');
      productsData.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.title} (Category: ${item.category}) (ID: ${item.id})`);
        if (item.description && item.description.toLowerCase().includes('arduino')) {
          console.log(`     📝 Description mentions Arduino`);
        }
      });
    }
    
    // Check total counts for perspective
    const [totalProducts, totalNotes, totalRooms, totalRentals, totalArduino] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('notes').select('id', { count: 'exact', head: true }),
      supabase.from('rooms').select('id', { count: 'exact', head: true }),
      supabase.from('rentals').select('id', { count: 'exact', head: true }),
      supabase.from('arduino').select('id', { count: 'exact', head: true })
    ]);
    
    console.log('\n=== TOTAL COUNTS ===');
    console.log('Products:', totalProducts.count || 0);
    console.log('Notes:', totalNotes.count || 0);
    console.log('Rooms:', totalRooms.count || 0);
    console.log('Rentals:', totalRentals.count || 0);
    console.log('Arduino:', totalArduino.count || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkArduinoData();