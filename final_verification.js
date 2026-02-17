const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function finalVerification() {
  console.log('🎯 FINAL VERIFICATION: Arduino Kit Highlighting\n');
  
  const adminUserId = '5d6e6776-4e15-4dff-8233-d02616d1880a';
  
  // Count your Project Equipment Arduino products (should be highlighted)
  const { data: highlightedProducts, error1 } = await supabase
    .from('products')
    .select('id, title, category, seller_id')
    .eq('seller_id', adminUserId)
    .eq('category', 'Project Equipment')
    .ilike('title', '%arduino%');
    
  console.log(`✨ HIGHLIGHTED Products (YOUR Arduino kits in Project Equipment): ${highlightedProducts?.length || 0}`);
  highlightedProducts?.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.title}`);
  });
  
  // Count your Arduino products in other categories (should NOT be highlighted)
  const { data: nonHighlightedYours, error2 } = await supabase
    .from('products')
    .select('id, title, category, seller_id')
    .eq('seller_id', adminUserId)
    .neq('category', 'Project Equipment')
    .ilike('title', '%arduino%');
    
  console.log(`\n❌ NOT HIGHLIGHTED (YOUR Arduino kits in other categories): ${nonHighlightedYours?.length || 0}`);
  nonHighlightedYours?.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.title} - Category: ${p.category}`);
  });
  
  // Count other people's Arduino products (should NOT be highlighted)
  const { data: othersArduino, error3 } = await supabase
    .from('products')
    .select('id, title, category, seller_id')
    .neq('seller_id', adminUserId)
    .ilike('title', '%arduino%');
    
  console.log(`\n❌ NOT HIGHLIGHTED (Other people's Arduino products): ${othersArduino?.length || 0}`);
  othersArduino?.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i+1}. ${p.title} - Category: ${p.category} - Seller: ${p.seller_id}`);
  });
  
  console.log('\n🎉 SUMMARY:');
  console.log(`✅ Products that WILL be highlighted: ${highlightedProducts?.length || 0}`);
  console.log(`❌ Products that will NOT be highlighted: ${(nonHighlightedYours?.length || 0) + (othersArduino?.length || 0)}`);
  console.log('\n🔧 Highlighting Conditions:');
  console.log('   1. ✅ Product seller_id must be: 5d6e6776-4e15-4dff-8233-d02616d1880a (your account)');
  console.log('   2. ✅ Product category must be: Project Equipment');
  console.log('   3. ✅ Both conditions must be true for highlighting to apply');
}

finalVerification().catch(console.error);
