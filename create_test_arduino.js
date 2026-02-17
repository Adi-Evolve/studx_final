const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfdghpokzahmwbktmhdi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGdocG9remFobXdia3RtaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTk5MDYsImV4cCI6MjA0ODczNTkwNn0.i5w8iO9n6hcX5dOTnNmgjFNj0nFQDlYoNvCmNhQGWHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestArduinoKit() {
  try {
    console.log('Creating test Arduino kit...\n');
    
    const testKitData = {
      breadboard: true,
      motor: true,
      led: true,
      resistor: true,
      other_components: JSON.stringify({
        title: "Complete Arduino Starter Kit",
        description: "Comprehensive Arduino kit with breadboard, motors, LEDs, resistors, and more. Perfect for electronics projects and learning.",
        price: 2500,
        category: "Project Equipment",
        college: "MIT",
        location: JSON.stringify({ lat: 12.9716, lng: 77.5946 }),
        images: ["https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400"],
        is_sold: false,
        seller_id: "test-seller-123",
        component_count: 25
      })
    };
    
    const { data, error } = await supabase
      .from('arduino')
      .insert(testKitData)
      .select();
    
    if (error) {
      console.error('❌ Error creating Arduino kit:', error.message);
      return;
    }
    
    console.log('✅ Successfully created test Arduino kit!');
    console.log('Kit ID:', data[0].id);
    console.log('Components:', {
      breadboard: data[0].breadboard,
      motor: data[0].motor,
      led: data[0].led,
      resistor: data[0].resistor
    });
    
    // Parse and display the product info
    const productInfo = JSON.parse(data[0].other_components);
    console.log('Product Info:');
    console.log(`  Title: ${productInfo.title}`);
    console.log(`  Price: ₹${productInfo.price}`);
    console.log(`  Category: ${productInfo.category}`);
    console.log(`  Description: ${productInfo.description.substring(0, 60)}...`);
    
    console.log('\n🎉 Test Arduino kit created successfully!');
    console.log('Now check the homepage to see if it appears in the explore listings.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestArduinoKit();