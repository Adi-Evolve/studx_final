// Supabase Database Usage Analysis
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function analyzeSupabaseUsage() {
    // console.log('🔍 Analyzing Current Supabase Database Usage...\n');
    
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SECRET_KEY
        );

        // console.log('📊 Database Table Analysis:');
        // console.log('═'.repeat(60));

        // Check main tables
        const tables = ['products', 'notes', 'rooms', 'users'];
        let totalRows = 0;
        
        for (const table of tables) {
            try {
                const { data, error, count } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    // console.log(`❌ ${table}: Could not access (${error.message})`);
                } else {
                    // console.log(`📋 ${table}: ${count || 0} rows`);
                    totalRows += count || 0;
                }
            } catch (err) {
                // console.log(`❌ ${table}: Error checking table`);
            }
        }

        // console.log('═'.repeat(60));
        // console.log(`📊 Total Records: ${totalRows}`);

        // Estimate storage usage
        const avgRowSize = 2; // KB per row (rough estimate)
        const estimatedUsage = (totalRows * avgRowSize) / 1024; // MB
        // console.log(`💾 Estimated Usage: ~${estimatedUsage.toFixed(1)}MB of 500MB`);
        
        if (estimatedUsage < 400) {
            // console.log('\n✅ GOOD NEWS: Database usage seems reasonable!');
            // console.log('🔧 Issue might be with file storage, not database.');
            // console.log('💡 Consider cleaning up old files instead of migrating database.');
        } else {
            // console.log('\n⚠️ Database usage is high. Migration recommended.');
        }

        // Check for large individual records
        // console.log('\n🔍 Checking for data optimization opportunities...');
        
        // Check if there are any large text fields or JSON data
        for (const table of ['products', 'notes']) {
            try {
                const { data } = await supabase
                    .from(table)
                    .select('id, title, description')
                    .limit(5);
                
                if (data && data.length > 0) {
                    const avgDescLength = data.reduce((sum, item) => 
                        sum + (item.description?.length || 0), 0) / data.length;
                    
                    if (avgDescLength > 1000) {
                        // console.log(`📝 ${table}: Average description length: ${avgDescLength.toFixed(0)} chars`);
                        // console.log(`   💡 Consider truncating long descriptions to save space`);
                    }
                }
            } catch (err) {
                // Skip if can't access
            }
        }

    } catch (error) {
        // console.error('❌ Failed to analyze database:', error.message);
        // console.log('\n🔧 Make sure your Supabase credentials are correct in .env.local');
    }
}

// Migration cost analysis
function showMigrationComparison() {
    // console.log('\n📊 Migration Effort Comparison:');
    // console.log('═'.repeat(60));
    // console.log('🔄 New Supabase Account:');
    // console.log('   ⏱️ Time: 1 hour');
    // console.log('   💰 Cost: $0/month');
    // console.log('   🔧 Effort: Low (export/import data)');
    // console.log('   ⚠️ Limitation: Still 500MB limit');
    
    // console.log('\n🔄 Neon Database:');
    // console.log('   ⏱️ Time: 4-6 hours');
    // console.log('   💰 Cost: $0/month');
    // console.log('   🔧 Effort: High (rebuild API, lose auth/realtime)');
    // console.log('   ✅ Benefit: 3GB storage');
    
    // console.log('\n🔄 Appwrite:');
    // console.log('   ⏱️ Time: 6-8 hours');
    // console.log('   💰 Cost: $0/month');
    // console.log('   🔧 Effort: Medium (similar to Supabase)');
    // console.log('   ✅ Benefit: 2GB storage + same features');
    
    // console.log('\n🔄 Clean Current Database:');
    // console.log('   ⏱️ Time: 30 minutes');
    // console.log('   💰 Cost: $0/month');
    // console.log('   🔧 Effort: Very Low (delete old data)');
    // console.log('   ✅ Benefit: Free up 50-200MB instantly');
}

// Run analysis
if (require.main === module) {
    analyzeSupabaseUsage()
        .then(() => {
            showMigrationComparison();
            // console.log('\n🎯 Recommendation: Try cleaning current database first!');
        })
        .catch((error) => {
            // console.error('Analysis failed:', error);
        });
}

module.exports = { analyzeSupabaseUsage };
