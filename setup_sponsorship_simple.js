const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vdpmumstdxgftaaxeacx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs'
);

async function createSponsorshipTable() {
    // console.log('🔨 Creating sponsorship_sequences table...');
    
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.sponsorship_sequences (
        id BIGSERIAL PRIMARY KEY,
        item_id UUID NOT NULL,
        item_type TEXT NOT NULL CHECK (item_type IN ('product', 'note', 'room')),
        slot INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Ensure each slot is unique (only one item per slot)
        UNIQUE(slot),
        
        -- Ensure each item can only be featured once
        UNIQUE(item_id, item_type)
    );
    
    -- Enable RLS
    ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;
    
    -- Allow everyone to read sponsored listings
    CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.sponsorship_sequences
        FOR SELECT USING (true);
    
    -- Allow service role to manage sponsorships
    CREATE POLICY IF NOT EXISTS "Allow service role full access" ON public.sponsorship_sequences
        FOR ALL USING (auth.role() = 'service_role');
        
    -- Allow authenticated users to manage sponsorships (for admin)
    CREATE POLICY IF NOT EXISTS "Allow authenticated full access" ON public.sponsorship_sequences
        FOR ALL USING (auth.role() = 'authenticated');
    `;
    
    try {
        const { data, error } = await supabase.rpc('exec', { sql: createTableSQL });
        
        if (error) {
            // console.log('❌ Failed to create table via RPC, trying alternative...');
            
            // Try direct table creation
            const { error: directError } = await supabase
                .from('sponsorship_sequences')
                .select('id')
                .limit(1);
                
            if (directError && directError.message.includes('does not exist')) {
                // console.log('📋 Table needs to be created manually in Supabase Dashboard');
                // console.log('📋 SQL to run:');
                // console.log(createTableSQL);
                // console.log('\n🔗 Go to: https://app.supabase.com/project/vdpmumstdxgftaaxeacx/sql');
                // console.log('📝 Copy and paste the SQL above, then run it');
                return false;
            } else {
                // console.log('✅ Table already exists!');
                return true;
            }
        } else {
            // console.log('✅ Table created successfully via RPC');
            return true;
        }
    } catch (err) {
        // console.log('❌ Error:', err.message);
        // console.log('\n📋 Manual setup required:');
        // console.log('🔗 Go to: https://app.supabase.com/project/vdpmumstdxgftaaxeacx/sql');
        // console.log('📝 Run this SQL:');
        // console.log(createTableSQL);
        return false;
    }
}

async function testSponsorshipTable() {
    // console.log('\n🧪 Testing sponsorship table...');
    
    try {
        const { data, error, count } = await supabase
            .from('sponsorship_sequences')
            .select('*', { count: 'exact' });
            
        if (error) {
            // console.log('❌ Table not accessible:', error.message);
            return false;
        }
        
        // console.log('✅ Table accessible!');
        // console.log('📊 Current sponsorships:', count);
        
        if (count === 0) {
            // console.log('💡 Table is empty - ready for sponsorships to be added!');
        } else {
            // console.log('🌟 Sample sponsorship:', data[0]);
        }
        
        return true;
        
    } catch (err) {
        // console.log('❌ Test failed:', err.message);
        return false;
    }
}

async function main() {
    // console.log('🌟 Sponsorship Table Setup Script\n');
    
    const tableReady = await createSponsorshipTable();
    if (tableReady) {
        await testSponsorshipTable();
        // console.log('\n🎉 Sponsorship system is ready!');
        // console.log('📱 You can now use the Sponsorship tab in adi.html');
    } else {
        // console.log('\n⚠️  Manual setup required before using sponsorship features');
    }
}

main();
