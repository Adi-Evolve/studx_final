const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetArduinoSellers() {
  console.log('🔄 Resetting Arduino products to have mixed sellers...\n');
  
  const adminUserId = '5d6e6776-4e15-4dff-8233-d02616d1880a';
  const otherUserId1 = 'adc0f003-4683-45f6-8a75-bdbf7646693f';
  const otherUserId2 = '84ce1d7f-ff41-4423-9d9d-cfcd3c5a56dc';
  const otherUserId3 = 'e63933cd-f1dc-454f-a046-0d3ab7c2e511';
  
  // Get all Arduino products
  const { data: arduinoProducts } = await supabase
    .from('products')
    .select('id, title, category')
    .ilike('title', '%arduino%')
    .order('created_at', { ascending: false });
    
  console.log(`Found ${arduinoProducts.length} Arduino products to reassign\n`);
  
  // Assign sellers: keep first 3 as yours, distribute others to different sellers
  for (let i = 0; i < arduinoProducts.length; i++) {
    const product = arduinoProducts[i];
    let newSellerId, status;
    
    if (i < 3) {
      newSellerId = adminUserId; // First 3 are yours
      status = '✅ YOURS (will be highlighted)';
    } else if (i < 5) {
      newSellerId = otherUserId1; // Next 2 to user 1
      status = '❌ OTHER SELLER (no highlighting)';
    } else if (i < 7) {
      newSellerId = otherUserId2; // Next 2 to user 2  
      status = '❌ OTHER SELLER (no highlighting)';
    } else {
      newSellerId = otherUserId3; // Rest to user 3
      status = '❌ OTHER SELLER (no highlighting)';
    }
    
    const { error } = await supabase
      .from('products')
      .update({ seller_id: newSellerId })
      .eq('id', product.id);
      
    if (error) {
      console.error(`❌ Error updating ${product.title}:`, error);
    } else {
      console.log(`${i+1}. ${product.title} → ${status}`);
    }
  }
  
  console.log('\n🎯 RESULT:');
  console.log('✅ First 3 Arduino products are yours and will show highlighting');
  console.log('❌ Remaining Arduino products belong to others and will NOT show highlighting');
  console.log('\n🔄 Refresh your browser to see the changes!');
}

resetArduinoSellers().catch(console.error);
