// Force Supabase Storage Reset and Complete Cleanup
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function forceStorageReset() {
    // console.log('🔄 Force Supabase Storage Reset\n');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );

    try {
        // console.log('Step 1: Delete all existing files...');
        
        const buckets = ['product-pdfs', 'product_pdfs'];
        let totalDeleted = 0;

        for (const bucketName of buckets) {
            // console.log(`📦 Cleaning bucket: ${bucketName}`);
            
            const { data: files, error: listError } = await supabase.storage
                .from(bucketName)
                .list('', { limit: 1000 });

            if (listError) {
                // console.log(`   ❌ Could not access bucket: ${listError.message}`);
                continue;
            }

            if (files.length === 0) {
                // console.log(`   ✅ Already empty`);
                continue;
            }

            // Delete all files
            const fileNames = files.map(f => f.name);
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove(fileNames);

            if (deleteError) {
                // console.log(`   ❌ Bulk delete failed: ${deleteError.message}`);
                
                // Try individual deletion
                for (const file of files) {
                    const { error } = await supabase.storage
                        .from(bucketName)
                        .remove([file.name]);
                    
                    if (error) {
                        // console.log(`   ❌ Failed to delete ${file.name}: ${error.message}`);
                    } else {
                        totalDeleted++;
                        // console.log(`   ✅ Deleted: ${file.name}`);
                    }
                }
            } else {
                totalDeleted += files.length;
                // console.log(`   ✅ Deleted ${files.length} files`);
            }
        }

        // console.log('\nStep 2: Force storage recalculation...');
        
        // Create and immediately delete a small file to force storage refresh
        const testFile = new Blob(['test'], { type: 'text/plain' });
        
        const { error: uploadError } = await supabase.storage
            .from('product_pdfs')
            .upload('temp_refresh_file.txt', testFile);

        if (!uploadError) {
            const { error: deleteError } = await supabase.storage
                .from('product_pdfs')
                .remove(['temp_refresh_file.txt']);
            
            if (!deleteError) {
                // console.log('✅ Storage refresh triggered');
            }
        }

        // console.log('\n🎉 STORAGE RESET COMPLETE!');
        // console.log(`📄 Files deleted: ${totalDeleted}`);
        // console.log('💾 Storage should be nearly empty now');
        // console.log('⏰ Note: Supabase may take 5-10 minutes to update storage statistics');
        
        // console.log('\n✅ NEXT STEPS:');
        // console.log('1. Your PDFs are safe in Google Drive');
        // console.log('2. New uploads automatically go to Google Drive');
        // console.log('3. Supabase storage is now free for database growth');
        // console.log('4. Check your Supabase dashboard in 10 minutes to confirm');

    } catch (error) {
        // console.error('❌ Storage reset failed:', error.message);
    }
}

// Quick status check
async function checkStorageStatus() {
    // console.log('📊 Current Storage Status Check\n');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );

    try {
        const { data: buckets } = await supabase.storage.listBuckets();
        
        let totalFiles = 0;
        let totalSize = 0;

        for (const bucket of buckets) {
            const { data: files } = await supabase.storage
                .from(bucket.name)
                .list('', { limit: 1000 });

            const bucketSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
            totalFiles += files.length;
            totalSize += bucketSize;

            // console.log(`📦 ${bucket.name}: ${files.length} files, ${(bucketSize / 1024 / 1024).toFixed(2)} MB`);
        }

        // console.log(`\n📊 Total: ${totalFiles} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        // console.log(`💾 Available: ~${(500 - (totalSize / 1024 / 1024)).toFixed(2)} MB`);

        if (totalSize < 50 * 1024 * 1024) {
            // console.log('✅ Storage usage is now reasonable!');
        } else {
            // console.log('⚠️ Still using significant storage');
        }

    } catch (error) {
        // console.error('❌ Status check failed:', error.message);
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--reset')) {
        forceStorageReset();
    } else if (args.includes('--status')) {
        checkStorageStatus();
    } else {
        // console.log('🔧 Supabase Storage Management\n');
        // console.log('Options:');
        // console.log('  --reset   : Delete all files and force storage reset');
        // console.log('  --status  : Check current storage usage');
        // console.log('\nRecommended: node force_storage_reset.js --reset');
    }
}

module.exports = { forceStorageReset, checkStorageStatus };
