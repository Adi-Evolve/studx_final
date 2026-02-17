// Export Current Supabase Data for Migration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportCurrentData() {
    // console.log('🔄 Starting data export from current Supabase...\n');
    
    const tables = ['users', 'products', 'notes', 'rooms', 'transactions', 'categories', 'wishlist', 'user_ratings'];
    const exportData = {};
    let totalRecords = 0;

    for (const table of tables) {
        try {
            // console.log(`📊 Exporting ${table}...`);
            
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact' });

            if (error) {
                // console.log(`⚠️  ${table}: ${error.message}`);
                exportData[table] = [];
            } else {
                exportData[table] = data || [];
                totalRecords += data?.length || 0;
                // console.log(`✅ ${table}: ${data?.length || 0} records`);
            }
        } catch (err) {
            // console.log(`❌ ${table}: Failed to export (${err.message})`);
            exportData[table] = [];
        }
    }

    // Save individual table backups
    for (const [table, data] of Object.entries(exportData)) {
        const filename = `backup_${table}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        // console.log(`💾 Saved ${filename} (${data.length} records)`);
    }

    // Save complete backup
    const completeBackup = {
        exportDate: new Date().toISOString(),
        sourceUrl: supabaseUrl,
        totalRecords,
        tables: exportData
    };

    fs.writeFileSync('complete_database_backup.json', JSON.stringify(completeBackup, null, 2));
    
    // console.log('\n🎉 Export completed successfully!');
    // console.log(`📈 Total records exported: ${totalRecords}`);
    // console.log('📁 Files created:');
    // console.log('   - complete_database_backup.json (all data)');
    tables.forEach(table => {
        // console.log(`   - backup_${table}.json (${exportData[table].length} records)`);
    });
    
    // Generate migration summary
    const migrationSummary = {
        exportDate: new Date().toISOString(),
        sourceDatabase: supabaseUrl,
        tablesExported: Object.keys(exportData).length,
        totalRecords,
        tableBreakdown: Object.fromEntries(
            Object.entries(exportData).map(([table, data]) => [table, data.length])
        ),
        migrationReadiness: {
            hasUsers: exportData.users.length > 0,
            hasProducts: exportData.products.length > 0,
            hasNotes: exportData.notes.length > 0,
            hasRooms: exportData.rooms.length > 0,
            estimatedNewDatabaseSize: `${Math.round(totalRecords * 0.001)}MB (estimated)`
        }
    };

    fs.writeFileSync('migration_summary.json', JSON.stringify(migrationSummary, null, 2));
    // console.log('   - migration_summary.json (migration info)');
    
    // console.log('\n🔍 Migration Summary:');
    // console.log(`📊 Tables: ${migrationSummary.tablesExported}`);
    // console.log(`👥 Users: ${migrationSummary.tableBreakdown.users}`);
    // console.log(`📦 Products: ${migrationSummary.tableBreakdown.products}`);
    // console.log(`📝 Notes: ${migrationSummary.tableBreakdown.notes}`);
    // console.log(`🏠 Rooms: ${migrationSummary.tableBreakdown.rooms}`);
    // console.log(`💳 Transactions: ${migrationSummary.tableBreakdown.transactions}`);
    
    // console.log('\n✅ Ready for migration! Next steps:');
    // console.log('1. Create new Supabase project');
    // console.log('2. Run FRESH_DATABASE_SETUP.sql in new project');
    // console.log('3. Update .env.local with new credentials');
    // console.log('4. Run: node import_data_to_new_supabase.js');
}

exportCurrentData().catch(console.error);
