const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vdpmumstdxgftaaxeacx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDYwODIsImV4cCI6MjA2NzQ4MjA4Mn0.Pbfm3FebzjQAHLPfdkzky-IH9aF3Zj1ZNVBjwe-3lyw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTables() {
    console.log('🔍 Checking all tables for data...')
    
    try {
        // Check products table
        console.log('\n📊 1. Products table:')
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, seller_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        
        if (productsError) {
            console.error('❌ Products error:', productsError)
        } else {
            console.log(`Found ${products.length} products`)
            products.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}, Seller: ${item.seller_id})`)
            })
        }
        
        // Check arduino table
        console.log('\n📊 2. Arduino table:')
        const { data: arduino, error: arduinoError } = await supabase
            .from('arduino')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
        
        if (arduinoError) {
            console.error('❌ Arduino error:', arduinoError)
        } else {
            console.log(`Found ${arduino.length} arduino entries`)
            arduino.forEach((item, index) => {
                try {
                    const productInfo = JSON.parse(item.other_components || '{}')
                    console.log(`   ${index + 1}. ${productInfo.title || 'No title'} (ID: ${item.id}, Seller: ${productInfo.seller_id})`)
                } catch (e) {
                    console.log(`   ${index + 1}. Parse error: ${e.message}`)
                }
            })
        }
        
        // Check notes table
        console.log('\n📊 3. Notes table:')
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('id, title, seller_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        
        if (notesError) {
            console.error('❌ Notes error:', notesError)
        } else {
            console.log(`Found ${notes.length} notes`)
            notes.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}, Seller: ${item.seller_id})`)
            })
        }
        
        // Check rooms table
        console.log('\n📊 4. Rooms table:')
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('id, title, seller_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        
        if (roomsError) {
            console.error('❌ Rooms error:', roomsError)
        } else {
            console.log(`Found ${rooms.length} rooms`)
            rooms.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}, Seller: ${item.seller_id})`)
            })
        }
        
        // Check rentals table
        console.log('\n📊 5. Rentals table:')
        const { data: rentals, error: rentalsError } = await supabase
            .from('rentals')
            .select('id, title, seller_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        
        if (rentalsError) {
            console.error('❌ Rentals error:', rentalsError)
        } else {
            console.log(`Found ${rentals.length} rentals`)
            rentals.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}, Seller: ${item.seller_id})`)
            })
        }
        
        // Search for the specific UUID across all tables
        console.log('\n🔍 Searching for UUID e8a8f0a5-4cac-4b43-810c-5704129ee974 across all tables:')
        const targetUUID = 'e8a8f0a5-4cac-4b43-810c-5704129ee974'
        
        // Search products
        const productsWithUUID = products.filter(p => p.seller_id === targetUUID)
        if (productsWithUUID.length > 0) {
            console.log(`✅ Found in products: ${productsWithUUID.map(p => p.title).join(', ')}`)
        }
        
        // Search notes  
        const notesWithUUID = notes.filter(n => n.seller_id === targetUUID)
        if (notesWithUUID.length > 0) {
            console.log(`✅ Found in notes: ${notesWithUUID.map(n => n.title).join(', ')}`)
        }
        
        // Search rooms
        const roomsWithUUID = rooms.filter(r => r.seller_id === targetUUID)
        if (roomsWithUUID.length > 0) {
            console.log(`✅ Found in rooms: ${roomsWithUUID.map(r => r.title).join(', ')}`)
        }
        
        // Search rentals
        const rentalsWithUUID = rentals.filter(r => r.seller_id === targetUUID)
        if (rentalsWithUUID.length > 0) {
            console.log(`✅ Found in rentals: ${rentalsWithUUID.map(r => r.title).join(', ')}`)
        }
        
        console.log('\n💡 Summary:')
        if (arduino.length === 0) {
            console.log('❌ Arduino table is empty - no Arduino kits exist in database')
            console.log('💭 The user may need to:')
            console.log('   1. Upload an Arduino kit through the sell form')
            console.log('   2. Make sure to select "Arduino Kit" as the category')
            console.log('   3. Use seller_id "e8a8f0a5-4cac-4b43-810c-5704129ee974"')
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error)
    }
}

checkAllTables()