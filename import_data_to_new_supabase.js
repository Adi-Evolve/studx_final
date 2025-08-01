// Import Data to New Supabase Project
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Make sure you updated .env.local with NEW Supabase project credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importDataToNewSupabase() {
    console.log('🔄 Starting data import to new Supabase...\n');
    console.log(`🎯 Target database: ${supabaseUrl}\n`);

    // Check if backup files exist
    const backupFile = 'complete_database_backup.json';
    if (!fs.existsSync(backupFile)) {
        console.error('❌ Backup file not found! Run export_current_data.js first');
        process.exit(1);
    }

    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const { tables } = backup;

    console.log(`📅 Backup from: ${backup.exportDate}`);
    console.log(`📊 Total records to import: ${backup.totalRecords}\n`);

    // Import order matters due to foreign key constraints
    const importOrder = ['users', 'categories', 'products', 'notes', 'rooms', 'wishlist', 'user_ratings', 'transactions'];
    
    let totalImported = 0;
    const importResults = {};

    for (const table of importOrder) {
        const data = tables[table] || [];
        
        if (data.length === 0) {
            console.log(`⏭️  ${table}: No data to import`);
            importResults[table] = { imported: 0, failed: 0 };
            continue;
        }

        console.log(`📥 Importing ${table} (${data.length} records)...`);

        try {
            // For large datasets, import in batches
            const batchSize = 100;
            let imported = 0;
            let failed = 0;

            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                
                const { data: insertData, error } = await supabase
                    .from(table)
                    .insert(batch)
                    .select();

                if (error) {
                    console.log(`   ⚠️  Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`);
                    failed += batch.length;
                    
                    // Try inserting records individually for this batch
                    for (const record of batch) {
                        try {
                            const { error: individualError } = await supabase
                                .from(table)
                                .insert(record);
                            
                            if (!individualError) {
                                imported++;
                            }
                        } catch (individualErr) {
                            // Skip problematic records
                        }
                    }
                } else {
                    imported += insertData.length;
                }

                // Progress indicator
                const progress = Math.min(i + batchSize, data.length);
                process.stdout.write(`\r   📊 Progress: ${progress}/${data.length} (${Math.round(progress/data.length*100)}%)`);
            }

            console.log(`\n   ✅ ${table}: ${imported} imported, ${failed} failed`);
            importResults[table] = { imported, failed };
            totalImported += imported;

        } catch (err) {
            console.log(`   ❌ ${table}: Import failed (${err.message})`);
            importResults[table] = { imported: 0, failed: data.length };
        }
    }

    console.log('\n🎉 Import completed!');
    console.log(`📈 Total records imported: ${totalImported}/${backup.totalRecords}`);
    
    console.log('\n📊 Import Summary:');
    for (const [table, result] of Object.entries(importResults)) {
        const total = result.imported + result.failed;
        const successRate = total > 0 ? Math.round((result.imported / total) * 100) : 100;
        console.log(`   ${table}: ${result.imported}/${total} (${successRate}%)`);
    }

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    
    for (const table of importOrder) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ ${table}: Cannot verify (${error.message})`);
            } else {
                const originalCount = tables[table]?.length || 0;
                const currentCount = count || 0;
                const match = currentCount === originalCount;
                console.log(`   ${match ? '✅' : '⚠️'} ${table}: ${currentCount}/${originalCount} records`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: Verification failed`);
        }
    }

    // Save import report
    const importReport = {
        importDate: new Date().toISOString(),
        targetDatabase: supabaseUrl,
        sourceBackup: backup.exportDate,
        totalImported,
        totalAttempted: backup.totalRecords,
        successRate: Math.round((totalImported / backup.totalRecords) * 100),
        results: importResults,
        migrationComplete: totalImported === backup.totalRecords
    };

    fs.writeFileSync('import_report.json', JSON.stringify(importReport, null, 2));
    console.log('\n💾 Import report saved to import_report.json');

    if (importReport.migrationComplete) {
        console.log('\n🎉 MIGRATION SUCCESSFUL!');
        console.log('✅ All data migrated successfully');
        console.log('🚀 Your app is ready to use the new database');
        console.log('\nNext steps:');
        console.log('1. Test your app: npm run dev');
        console.log('2. Verify all features work correctly');
        console.log('3. Update production deployment');
        console.log('4. Update admin panel (adi.html) with new credentials');
    } else {
        console.log('\n⚠️  PARTIAL MIGRATION');
        console.log(`📊 ${importReport.successRate}% of data migrated`);
        console.log('🔍 Check import_report.json for details');
        console.log('💡 You may need to manually fix some data inconsistencies');
    }
}

importDataToNewSupabase().catch(console.error);
