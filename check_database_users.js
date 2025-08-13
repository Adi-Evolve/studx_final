// Check users in the database
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('🔍 Checking users in database...\n');
    
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name')
            .limit(10);
            
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }
        
        if (!users || users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        console.log('✅ Found users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Name: ${user.name || 'No name set'}`);
            console.log(`   ID: ${user.id}`);
            console.log('');
        });
        
        console.log(`Total users: ${users.length}`);
        
        // Return the first user for testing
        return users[0];
        
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

async function checkUserItems(userId) {
    if (!userId) return;
    
    console.log(`🔍 Checking items for user ${userId}...\n`);
    
    try {
        const [products, notes, rooms] = await Promise.all([
            supabase.from('products').select('id, title, seller_id').eq('seller_id', userId).limit(5),
            supabase.from('notes').select('id, title, seller_id').eq('seller_id', userId).limit(5),
            supabase.from('rooms').select('id, title, seller_id').eq('seller_id', userId).limit(5)
        ]);
        
        console.log('📦 Products:', products.data?.length || 0);
        products.data?.forEach(item => console.log(`  - ${item.title} (ID: ${item.id})`));
        
        console.log('📝 Notes:', notes.data?.length || 0);
        notes.data?.forEach(item => console.log(`  - ${item.title} (ID: ${item.id})`));
        
        console.log('🏠 Rooms:', rooms.data?.length || 0);
        rooms.data?.forEach(item => console.log(`  - ${item.title} (ID: ${item.id})`));
        
        // Return first available item for testing
        const allItems = [
            ...(products.data || []).map(item => ({ ...item, type: 'product' })),
            ...(notes.data || []).map(item => ({ ...item, type: 'note' })),
            ...(rooms.data || []).map(item => ({ ...item, type: 'room' }))
        ];
        
        return allItems[0] || null;
        
    } catch (err) {
        console.error('Error checking user items:', err);
    }
}

async function main() {
    const user = await checkUsers();
    if (user) {
        const testItem = await checkUserItems(user.id);
        
        console.log('\n🎯 FOR TESTING:');
        console.log(`Use this email: ${user.email}`);
        
        if (testItem) {
            console.log(`Test with this item: ${testItem.title} (ID: ${testItem.id}, Type: ${testItem.type})`);
        }
    }
}

main().catch(console.error);
