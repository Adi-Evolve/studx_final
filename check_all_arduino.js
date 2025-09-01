const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkAllArduino() {
  const adminUserId = '5d6e6776-4e15-4dff-8233-d02616d1880a';
  
  const { data, error } = await supabase
    .from('products')
    .select('id, title, category, seller_id')
    .ilike('title', '%arduino%')
    .order('created_at', { ascending: false });
    
  console.log('🔍 All Arduino products in database:\n');
  data?.forEach((p, i) => {
    const isYours = p.seller_id === adminUserId;
    const isProjectEquipment = p.category === 'Project Equipment';
    const shouldHighlight = isYours && isProjectEquipment;
    console.log(`${i+1}. ${p.title}`);
    console.log(`   Category: ${p.category}`);
    console.log(`   Seller ID: ${p.seller_id}`);
    console.log(`   Is Yours: ${isYours ? '✅ YES' : '❌ NO'}`);
    console.log(`   Should Highlight: ${shouldHighlight ? '🌟 YES' : '❌ NO'}`);
    console.log('');
  });
  
  // Count statistics
  const yourProducts = data?.filter(p => p.seller_id === adminUserId) || [];
  const otherProducts = data?.filter(p => p.seller_id !== adminUserId) || [];
  
  console.log('📊 SUMMARY:');
  console.log(`Total Arduino products: ${data?.length || 0}`);
  console.log(`Your Arduino products: ${yourProducts.length}`);
  console.log(`Other people's Arduino products: ${otherProducts.length}`);
  
  if (otherProducts.length > 0) {
    console.log('\n⚠️  WARNING: Found Arduino products from other sellers:');
    otherProducts.forEach(p => {
      console.log(`- ${p.title} (Seller: ${p.seller_id})`);
    });
  }
}

checkAllArduino().catch(console.error);
