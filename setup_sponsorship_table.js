const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

async function setupSponsorshipTable() {
    console.log('🚀 Setting up sponsorship_sequences table...');

    try {
        console.log('📋 Checking if table exists...');
        
        // Check if table already exists
        const { data: existingTable, error: checkError } = await supabase
            .from('sponsorship_sequences')
            .select('id')
            .limit(1);

        if (!checkError) {
            console.log('✅ Table already exists, skipping creation');
        } else {
            console.log('📋 Table does not exist, you need to create it manually in Supabase Dashboard');
            console.log('📋 Please run the SQL from create_sponsorship_table.sql in your Supabase SQL editor');
            return;
        }

        console.log('✅ Table verified successfully');

        // Get some existing products to feature
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, price')
            .eq('is_sold', false)
            .limit(4);

        if (productsError) {
            console.error('❌ Error fetching products:', productsError);
        } else {
            console.log(`📦 Found ${products?.length || 0} products to feature`);
        }

        // Get some existing notes to feature
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('id, title, price')
            .limit(2);

        if (notesError) {
            console.error('❌ Error fetching notes:', notesError);
        } else {
            console.log(`📝 Found ${notes?.length || 0} notes to feature`);
        }

        // Clear existing sponsorship data
        const { error: clearError } = await supabase
            .from('sponsorship_sequences')
            .delete()
            .neq('id', 0); // Delete all

        if (clearError) {
            console.warn('⚠️ Could not clear existing sponsorship data:', clearError.message);
        }

        // Insert featured items
        const sponsorshipData = [];
        let slot = 1;

        // Add products to featured list
        if (products && products.length > 0) {
            products.forEach(product => {
                sponsorshipData.push({
                    item_id: product.id,
                    item_type: 'product',
                    slot: slot++
                });
            });
        }

        // Add notes to featured list
        if (notes && notes.length > 0) {
            notes.forEach(note => {
                sponsorshipData.push({
                    item_id: note.id,
                    item_type: 'note',
                    slot: slot++
                });
            });
        }

        if (sponsorshipData.length > 0) {
            const { data: insertData, error: insertError } = await supabase
                .from('sponsorship_sequences')
                .insert(sponsorshipData)
                .select();

            if (insertError) {
                console.error('❌ Error inserting sponsorship data:', insertError);
            } else {
                console.log(`✅ Successfully added ${insertData.length} featured items:`);
                insertData.forEach(item => {
                    console.log(`   - Slot ${item.slot}: ${item.item_type} #${item.item_id}`);
                });
            }
        } else {
            console.log('⚠️ No items found to feature');
        }

        // Test fetching sponsored listings
        console.log('\n🧪 Testing fetchSponsoredListings...');
        
        const { data: sequenceItems, error: sequenceError } = await supabase
            .from('sponsorship_sequences')
            .select('item_id, item_type, slot')
            .order('slot', { ascending: true });

        if (sequenceError) {
            console.error('❌ Error fetching sponsorship sequence:', sequenceError);
            return;
        }

        console.log(`✅ Found ${sequenceItems.length} sponsored items in sequence`);
        
        // Fetch the actual item details
        for (const item of sequenceItems) {
            const tableName = `${item.item_type}s`;
            
            let selectColumns;
            if (tableName === 'products') {
                selectColumns = 'id, title, description, price, category, condition, college, location, images, is_sold, seller_id, created_at';
            } else if (tableName === 'notes') {
                selectColumns = 'id, title, description, price, category, college, academic_year, course_subject, images, pdf_urls, pdfUrl, seller_id, created_at';
            } else if (tableName === 'rooms') {
                selectColumns = 'id, title, description, price, category, college, location, images, room_type, occupancy, distance, deposit, fees_include_mess, mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at';
            }

            const { data: itemData, error: itemError } = await supabase
                .from(tableName)
                .select(selectColumns)
                .eq('id', item.item_id)
                .single();

            if (itemError) {
                console.error(`❌ Error fetching ${item.item_type} #${item.item_id}:`, itemError.message);
            } else {
                console.log(`✅ Slot ${item.slot}: ${itemData.title} (${item.item_type}) - $${itemData.price}`);
            }
        }

        console.log('\n🎉 Sponsorship table setup complete!');
        console.log('✨ The homepage will now display featured items from the sponsorship_sequences table');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setupSponsorshipTable();
