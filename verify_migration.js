// Verify Migration Completion and Data Integrity
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

async function verifyMigration() {
    // console.log('🔍 Verifying migration and data integrity...\n');
    // console.log(`🎯 Database: ${supabaseUrl}\n`);

    // Load original backup for comparison
    let originalData = null;
    if (fs.existsSync('complete_database_backup.json')) {
        originalData = JSON.parse(fs.readFileSync('complete_database_backup.json', 'utf8'));
        // console.log(`📅 Comparing with backup from: ${originalData.exportDate}\n`);
    }

    const tables = ['users', 'products', 'notes', 'rooms', 'transactions', 'categories', 'wishlist', 'user_ratings'];
    const verificationResults = {};
    let allTestsPassed = true;

    // Test 1: Table Existence and Basic Counts
    // console.log('📊 TEST 1: Table Existence and Record Counts');
    // console.log('═'.repeat(60));
    
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact' });

            if (error) {
                // console.log(`❌ ${table}: Table not accessible (${error.message})`);
                verificationResults[table] = { status: 'error', error: error.message };
                allTestsPassed = false;
            } else {
                const currentCount = count || 0;
                const originalCount = originalData?.tables[table]?.length || 'unknown';
                const match = originalData ? currentCount === originalCount : true;
                
                // console.log(`${match ? '✅' : '⚠️'} ${table}: ${currentCount} records ${originalData ? `(original: ${originalCount})` : ''}`);
                
                verificationResults[table] = {
                    status: match ? 'success' : 'partial',
                    currentCount,
                    originalCount,
                    match
                };

                if (!match) allTestsPassed = false;
            }
        } catch (err) {
            // console.log(`❌ ${table}: Failed to verify (${err.message})`);
            verificationResults[table] = { status: 'error', error: err.message };
            allTestsPassed = false;
        }
    }

    // Test 2: Data Integrity Checks
    // console.log('\n🔍 TEST 2: Data Integrity Checks');
    // console.log('═'.repeat(60));

    const integrityTests = [
        {
            name: 'Users have valid IDs',
            test: async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('id')
                    .is('id', null);
                return { passed: !error && data.length === 0, details: `${data?.length || 0} users with null IDs` };
            }
        },
        {
            name: 'Products have valid seller_id',
            test: async () => {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, seller_id')
                    .is('seller_id', null);
                return { passed: !error && data.length === 0, details: `${data?.length || 0} products with null seller_id` };
            }
        },
        {
            name: 'Notes have required fields',
            test: async () => {
                const { data, error } = await supabase
                    .from('notes')
                    .select('id, title, seller_id')
                    .or('title.is.null,seller_id.is.null');
                return { passed: !error && data.length === 0, details: `${data?.length || 0} notes with missing required fields` };
            }
        },
        {
            name: 'Rooms have valid data',
            test: async () => {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('id, title, seller_id')
                    .or('title.is.null,seller_id.is.null');
                return { passed: !error && data.length === 0, details: `${data?.length || 0} rooms with missing required fields` };
            }
        }
    ];

    for (const test of integrityTests) {
        try {
            const result = await test.test();
            // console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            if (!result.passed) allTestsPassed = false;
        } catch (err) {
            // console.log(`❌ ${test.name}: Test failed (${err.message})`);
            allTestsPassed = false;
        }
    }

    // Test 3: Functional Tests
    // console.log('\n⚙️ TEST 3: Functional Tests');
    // console.log('═'.repeat(60));

    const functionalTests = [
        {
            name: 'Can query recent products',
            test: async () => {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);
                return { passed: !error, details: `Retrieved ${data?.length || 0} recent products` };
            }
        },
        {
            name: 'Can query users by college',
            test: async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, college')
                    .not('college', 'is', null)
                    .limit(5);
                return { passed: !error, details: `Found ${data?.length || 0} users with college info` };
            }
        },
        {
            name: 'Can access notes with PDF data',
            test: async () => {
                const { data, error } = await supabase
                    .from('notes')
                    .select('id, title, pdf_urls, pdfUrl')
                    .limit(5);
                return { passed: !error, details: `Retrieved ${data?.length || 0} notes records` };
            }
        },
        {
            name: 'Transaction table structure',
            test: async () => {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('id, buyer_id, seller_id, amount')
                    .limit(1);
                return { passed: !error, details: error ? error.message : 'Transaction table accessible' };
            }
        }
    ];

    for (const test of functionalTests) {
        try {
            const result = await test.test();
            // console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            if (!result.passed) allTestsPassed = false;
        } catch (err) {
            // console.log(`❌ ${test.name}: Test failed (${err.message})`);
            allTestsPassed = false;
        }
    }

    // Test 4: Authentication Test
    // console.log('\n🔐 TEST 4: Authentication & Security');
    // console.log('═'.repeat(60));

    try {
        // Test RLS policies by trying to access with anon key
        const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        const { data: publicData, error: publicError } = await anonClient
            .from('products')
            .select('id, title')
            .limit(1);
            
        // console.log(`${!publicError ? '✅' : '❌'} Public access to products: ${!publicError ? 'Working' : publicError.message}`);
        
        if (publicError) allTestsPassed = false;
    } catch (err) {
        // console.log(`❌ Authentication test failed: ${err.message}`);
        allTestsPassed = false;
    }

    // Generate verification report
    const verificationReport = {
        verificationDate: new Date().toISOString(),
        database: supabaseUrl,
        overallStatus: allTestsPassed ? 'PASSED' : 'FAILED',
        tableVerification: verificationResults,
        migrationComplete: allTestsPassed,
        recommendations: []
    };

    if (!allTestsPassed) {
        verificationReport.recommendations.push(
            'Some tests failed. Review the output above for specific issues.',
            'Consider re-running the import for failed tables.',
            'Check data integrity manually for critical records.'
        );
    } else {
        verificationReport.recommendations.push(
            'Migration verified successfully!',
            'Test your application thoroughly.',
            'Update production deployment when ready.',
            'Keep backup files until you\'re sure everything works.'
        );
    }

    fs.writeFileSync('verification_report.json', JSON.stringify(verificationReport, null, 2));

    // Final summary
    // console.log('\n🎯 VERIFICATION SUMMARY');
    // console.log('═'.repeat(60));
    // console.log(`Status: ${allTestsPassed ? '🎉 PASSED' : '⚠️ FAILED'}`);
    // console.log(`Database: ${supabaseUrl}`);
    // console.log(`Report saved: verification_report.json`);

    if (allTestsPassed) {
        // console.log('\n✅ MIGRATION VERIFIED SUCCESSFULLY!');
        // console.log('🚀 Your new database is ready for production use');
        // console.log('\nNext steps:');
        // console.log('1. Test your full application');
        // console.log('2. Update Vercel environment variables');
        // console.log('3. Deploy to production');
        // console.log('4. Update admin panel credentials');
        // console.log('5. Monitor for any issues');
    } else {
        // console.log('\n⚠️ VERIFICATION FAILED');
        // console.log('🔍 Review the test results above');
        // console.log('🛠️ Fix any issues before proceeding to production');
        // console.log('📞 Consider running import_data_to_new_supabase.js again for failed tables');
    }

    return allTestsPassed;
}

verifyMigration().catch(console.error);
