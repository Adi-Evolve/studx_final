// Supabase Storage Cleanup Tool
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function cleanupSupabaseStorage() {
    console.log('🧹 Supabase Storage Cleanup Tool\n');
    
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SECRET_KEY
        );

        console.log('📊 Analyzing Supabase Storage Usage...\n');

        // List all storage buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Could not access storage buckets:', bucketsError.message);
            return;
        }

        console.log(`📦 Found ${buckets.length} storage bucket(s):`);
        buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
        });

        let totalFiles = 0;
        let totalSize = 0;
        let oldFiles = [];

        // Analyze each bucket
        for (const bucket of buckets) {
            console.log(`\n🔍 Analyzing bucket: "${bucket.name}"`);
            
            try {
                const { data: files, error } = await supabase.storage
                    .from(bucket.name)
                    .list('', {
                        limit: 1000,
                        sortBy: { column: 'created_at', order: 'desc' }
                    });

                if (error) {
                    console.log(`   ❌ Could not access bucket: ${error.message}`);
                    continue;
                }

                console.log(`   📁 Files found: ${files.length}`);
                
                let bucketSize = 0;
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                files.forEach(file => {
                    const fileSize = file.metadata?.size || 0;
                    bucketSize += fileSize;
                    totalFiles++;
                    totalSize += fileSize;

                    // Check if file is older than 30 days
                    const fileDate = new Date(file.created_at);
                    if (fileDate < thirtyDaysAgo) {
                        oldFiles.push({
                            bucket: bucket.name,
                            name: file.name,
                            size: fileSize,
                            created: fileDate,
                            ageInDays: Math.floor((now - fileDate) / (1000 * 60 * 60 * 24))
                        });
                    }
                });

                console.log(`   💾 Bucket size: ${(bucketSize / 1024 / 1024).toFixed(2)} MB`);
                
                // Show largest files in this bucket
                const largeFiles = files
                    .filter(f => f.metadata?.size > 1024 * 1024) // Files > 1MB
                    .sort((a, b) => (b.metadata?.size || 0) - (a.metadata?.size || 0))
                    .slice(0, 5);

                if (largeFiles.length > 0) {
                    console.log('   📋 Largest files:');
                    largeFiles.forEach(file => {
                        const size = (file.metadata?.size || 0) / 1024 / 1024;
                        console.log(`      - ${file.name} (${size.toFixed(2)} MB)`);
                    });
                }

            } catch (err) {
                console.log(`   ❌ Error accessing bucket: ${err.message}`);
            }
        }

        // Summary
        console.log('\n📊 Storage Summary:');
        console.log('═'.repeat(50));
        console.log(`📁 Total files: ${totalFiles}`);
        console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB / 500MB`);
        console.log(`📅 Old files (30+ days): ${oldFiles.length}`);
        
        const oldFilesSize = oldFiles.reduce((sum, f) => sum + f.size, 0);
        console.log(`🗑️ Potential cleanup: ${(oldFilesSize / 1024 / 1024).toFixed(2)} MB`);

        // Show cleanup opportunities
        if (oldFiles.length > 0) {
            console.log('\n🗑️ Files that can be deleted (30+ days old):');
            console.log('═'.repeat(50));
            
            // Sort by size (largest first)
            oldFiles.sort((a, b) => b.size - a.size);
            
            oldFiles.slice(0, 10).forEach(file => {
                const size = (file.size / 1024 / 1024).toFixed(2);
                console.log(`   📄 ${file.name}`);
                console.log(`      💾 Size: ${size} MB`);
                console.log(`      📅 Age: ${file.ageInDays} days`);
                console.log(`      📦 Bucket: ${file.bucket}`);
                console.log('');
            });

            if (oldFiles.length > 10) {
                console.log(`   ... and ${oldFiles.length - 10} more old files`);
            }

            console.log('\n🚀 Cleanup Options:');
            console.log('1. Delete all files older than 30 days');
            console.log('2. Delete all files older than 60 days');
            console.log('3. Delete specific large files');
            console.log('4. Clean specific bucket');
            console.log('5. Manual review and delete');
        } else {
            console.log('\n✅ No old files found. Storage might be full of recent files.');
            console.log('💡 Consider moving recent files to Google Drive instead.');
        }

        return {
            totalFiles,
            totalSize,
            oldFiles,
            buckets
        };

    } catch (error) {
        console.error('❌ Cleanup analysis failed:', error.message);
        console.log('\n🔧 Make sure your Supabase credentials are correct in .env.local');
    }
}

// Interactive cleanup function
async function performCleanup(option, data) {
    console.log('\n🧹 Starting cleanup...');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );

    let filesToDelete = [];

    switch (option) {
        case '1': // Delete files older than 30 days
            filesToDelete = data.oldFiles.filter(f => f.ageInDays >= 30);
            break;
        case '2': // Delete files older than 60 days
            filesToDelete = data.oldFiles.filter(f => f.ageInDays >= 60);
            break;
        default:
            console.log('❌ Invalid option');
            return;
    }

    if (filesToDelete.length === 0) {
        console.log('✅ No files to delete with selected criteria');
        return;
    }

    console.log(`🗑️ Will delete ${filesToDelete.length} files...`);
    
    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of filesToDelete) {
        try {
            const { error } = await supabase.storage
                .from(file.bucket)
                .remove([file.name]);

            if (error) {
                console.log(`❌ Failed to delete ${file.name}: ${error.message}`);
            } else {
                deletedCount++;
                freedSpace += file.size;
                console.log(`✅ Deleted: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        } catch (err) {
            console.log(`❌ Error deleting ${file.name}: ${err.message}`);
        }
    }

    console.log('\n🎉 Cleanup Complete!');
    console.log(`📄 Files deleted: ${deletedCount}/${filesToDelete.length}`);
    console.log(`💾 Space freed: ${(freedSpace / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🆓 Remaining space: ~${((500 * 1024 * 1024 - data.totalSize + freedSpace) / 1024 / 1024).toFixed(2)} MB`);
}

// Main execution
if (require.main === module) {
    cleanupSupabaseStorage()
        .then((data) => {
            if (data && data.oldFiles.length > 0) {
                console.log('\n❓ Do you want to perform cleanup now?');
                console.log('Run: node cleanup_supabase_storage.js --cleanup [option]');
                console.log('Example: node cleanup_supabase_storage.js --cleanup 1');
            }
        })
        .catch((error) => {
            console.error('Analysis failed:', error);
        });
}

module.exports = { cleanupSupabaseStorage, performCleanup };
