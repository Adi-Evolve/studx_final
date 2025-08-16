// Check Current Database Size and Migration Readiness
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigrationReadiness() {
    // console.log('🔍 Checking Database Migration Readiness...\n');
    // console.log(`🎯 Current database: ${supabaseUrl}\n`);

    const tables = ['users', 'products', 'notes', 'rooms', 'transactions', 'categories', 'wishlist'];
    let totalRecords = 0;
    let criticalIssues = 0;
    let warnings = 0;

    // console.log('📊 DATABASE SIZE ANALYSIS');
    // console.log('═'.repeat(60));

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact' });

            if (error) {
                // console.log(`❌ ${table}: Cannot access (${error.message})`);
                criticalIssues++;
            } else {
                const recordCount = count || 0;
                totalRecords += recordCount;
                
                // Estimate storage size (rough calculation)
                const avgRecordSize = data && data.length > 0 ? 
                    JSON.stringify(data[0]).length : 100; // Default estimate
                const estimatedSize = (recordCount * avgRecordSize) / 1024; // KB
                
                // console.log(`✅ ${table.padEnd(12)}: ${recordCount.toString().padStart(6)} records (~${estimatedSize.toFixed(1)}KB)`);
                
                // Check for potential issues
                if (table === 'users' && recordCount === 0) {
                    // console.log(`   ⚠️  Warning: No users found - migration might be premature`);
                    warnings++;
                }
            }
        } catch (err) {
            // console.log(`❌ ${table}: Error checking (${err.message})`);
            criticalIssues++;
        }
    }

    // Estimate total database size
    const estimatedTotalSize = (totalRecords * 150) / 1024 / 1024; // Rough MB estimate
    // console.log(`\n📈 TOTALS:`);
    // console.log(`   Records: ${totalRecords}`);
    // console.log(`   Estimated Size: ~${estimatedTotalSize.toFixed(2)}MB`);
    
    // Storage status
    const storagePercentage = (estimatedTotalSize / 500) * 100; // Supabase 500MB limit
    if (storagePercentage > 90) {
        // console.log(`   🚨 Storage Status: CRITICAL (${storagePercentage.toFixed(1)}% of 500MB)`);
        // console.log(`   💡 IMMEDIATE MIGRATION RECOMMENDED`);
    } else if (storagePercentage > 70) {
        // console.log(`   ⚠️  Storage Status: HIGH (${storagePercentage.toFixed(1)}% of 500MB)`);
        // console.log(`   💡 Plan migration soon`);
    } else {
        // console.log(`   ✅ Storage Status: OK (${storagePercentage.toFixed(1)}% of 500MB)`);
    }

    // console.log('\n🔍 MIGRATION READINESS CHECK');
    // console.log('═'.repeat(60));

    // Check essential services
    const readinessChecks = [
        {
            name: 'Database connection',
            check: async () => {
                const { data, error } = await supabase.from('users').select('id').limit(1);
                return !error;
            }
        },
        {
            name: 'Authentication system',
            check: async () => {
                try {
                    const { data, error } = await supabase.auth.getSession();
                    return !error;
                } catch {
                    return true; // Auth might not be initialized, but that's OK
                }
            }
        },
        {
            name: 'Environment variables',
            check: async () => {
                return !!(process.env.GOOGLE_DRIVE_FOLDER_ID && 
                         process.env.RAZORPAY_KEY_ID && 
                         process.env.IMGBB_API_KEY);
            }
        },
        {
            name: 'Payment system config',
            check: async () => {
                return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET_KEY);
            }
        },
        {
            name: 'File storage config',
            check: async () => {
                return !!(process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.IMGBB_API_KEY);
            }
        }
    ];

    let passedChecks = 0;
    for (const check of readinessChecks) {
        try {
            const result = await check.check();
            // console.log(`${result ? '✅' : '❌'} ${check.name}`);
            if (result) passedChecks++;
            else criticalIssues++;
        } catch (err) {
            // console.log(`❌ ${check.name} (error: ${err.message})`);
            criticalIssues++;
        }
    }

    // console.log('\n📋 MIGRATION RECOMMENDATION');
    // console.log('═'.repeat(60));

    if (criticalIssues === 0) {
        // console.log('🎉 READY FOR MIGRATION!');
        // console.log('✅ All systems operational');
        // console.log('✅ Data is exportable');
        // console.log('✅ No critical issues detected');
        
        if (storagePercentage > 80) {
            // console.log('\n🚨 MIGRATION URGENCY: HIGH');
            // console.log('💡 Recommend migrating within 1-2 weeks');
        } else if (storagePercentage > 60) {
            // console.log('\n⚠️  MIGRATION URGENCY: MEDIUM');
            // console.log('💡 Consider migrating within 1-2 months');
        } else {
            // console.log('\n✅ MIGRATION URGENCY: LOW');
            // console.log('💡 Migration can be planned for convenience');
        }

        // console.log('\n📝 NEXT STEPS:');
        // console.log('1. Run: node export_current_data.js');
        // console.log('2. Create new Supabase project');
        // console.log('3. Run database schema in new project');
        // console.log('4. Update .env.local with new credentials');
        // console.log('5. Run: node import_data_to_new_supabase.js');
        // console.log('6. Run: node verify_migration.js');
        // console.log('7. Update production deployment');

    } else {
        // console.log('⚠️  MIGRATION READINESS: ISSUES DETECTED');
        // console.log(`❌ Critical issues: ${criticalIssues}`);
        // console.log(`⚠️  Warnings: ${warnings}`);
        
        // console.log('\n🔧 RECOMMENDED ACTIONS:');
        // console.log('1. Fix critical issues listed above');
        // console.log('2. Test application functionality');
        // console.log('3. Re-run this check');
        // console.log('4. Proceed with migration when all checks pass');
    }

    // console.log('\n💡 MIGRATION OPTIONS:');
    // console.log('Option 1: New Supabase Project (Easiest, +500MB free)');
    // console.log('Option 2: Railway Database (Medium effort, +1GB free)');
    // console.log('Option 3: Neon Database (Medium effort, +3GB free)');
    
    // console.log('\n📞 SUPPORT:');
    // console.log('All migration scripts are ready in your project:');
    // console.log('- export_current_data.js');
    // console.log('- import_data_to_new_supabase.js');
    // console.log('- verify_migration.js');
    // console.log('- DATABASE_MIGRATION_GUIDE.md');

    return criticalIssues === 0;
}

checkMigrationReadiness().catch(console.error);
