const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function updateArduinoProducts() {
  console.log('🔧 Updating Arduino products to have correct seller_id...\n');
  
  const adminUserId = '5d6e6776-4e15-4dff-8233-d02616d1880a'; // Your user ID from the previous check
  
  // Update all Arduino products in Project Equipment category
  const { data: updatedProducts, error } = await supabase
    .from('products')
    .update({ seller_id: adminUserId })
    .eq('category', 'Project Equipment')
    .ilike('title', '%arduino%')
    .select();
    
  if (error) {
    console.error('❌ Error updating Arduino products:', error);
    return;
  }
  
  console.log(`✅ Updated ${updatedProducts?.length || 0} Arduino products with your seller_id\n`);
  
  // Also update any other Arduino products (not just Project Equipment)
  const { data: allArduinoUpdates, error: allError } = await supabase
    .from('products')
    .update({ seller_id: adminUserId })
    .ilike('title', '%arduino%')
    .select();
    
  if (allError) {
    console.error('❌ Error updating all Arduino products:', allError);
    return;
  }
  
  console.log(`✅ Updated ${allArduinoUpdates?.length || 0} total Arduino products\n`);
  
  // List the updated products
  allArduinoUpdates?.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - Category: ${product.category} - Seller ID: ${product.seller_id}`);
  });
}

updateArduinoProducts().catch(console.error);
