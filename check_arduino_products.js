const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkArduinoProducts() {
  console.log('🔍 Checking Arduino products in database...\n');
  
  // Check all products with Arduino in title
  const { data: arduinoProducts, error } = await supabase
    .from('products')
    .select('*')
    .ilike('title', '%arduino%')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Error fetching Arduino products:', error);
    return;
  }
  
  console.log(`📦 Found ${arduinoProducts?.length || 0} Arduino products:\n`);
  
  arduinoProducts?.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title}`);
    console.log(`   📧 Seller Email: ${product.seller_email || 'NOT SET'}`);
    console.log(`   🆔 User ID: ${product.user_id || 'NOT SET'}`);
    console.log(`   📁 Category: ${product.category}`);
    console.log(`   📅 Created: ${product.created_at}`);
    console.log(`   🏷️ ID: ${product.id}\n`);
  });
  
  // Check products by your email directly
  const { data: yourProducts, error: yourError } = await supabase
    .from('products')
    .select('*')
    .eq('seller_email', 'adiinamdar888@gmail.com')
    .order('created_at', { ascending: false });
    
  if (yourError) {
    console.error('❌ Error fetching your products:', yourError);
  } else {
    console.log(`\n👤 Your products (seller_email = adiinamdar888@gmail.com): ${yourProducts?.length || 0}`);
    
    yourProducts?.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - Category: ${product.category}`);
    });
  }
  
  // Also check by user lookup
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'adiinamdar888@gmail.com')
    .single();
    
  if (userData && !userError) {
    console.log(`\n🔍 Found user ID: ${userData.id} for email: ${userData.email}`);
    
    const { data: productsByUserId, error: userProductsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
      
    if (!userProductsError && productsByUserId) {
      console.log(`\n👤 Your products by user_id: ${productsByUserId.length}`);
      productsByUserId.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - Category: ${product.category} - Seller Email: ${product.seller_email || 'NOT SET'}`);
      });
    }
  } else {
    console.log('\n❌ Could not find user in database');
  }
}

checkArduinoProducts().catch(console.error);
