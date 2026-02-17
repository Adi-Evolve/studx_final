require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// This will use your NEW Supabase credentials after you update .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function importData(exportFileName) {
  // console.log('📥 Starting data import to new Supabase account...\n');

  try {
    // Read export file
    if (!fs.existsSync(exportFileName)) {
      // console.error(`❌ Export file not found: ${exportFileName}`);
      // console.log('Make sure you run export_data.js first!');
      return;
    }

    const exportData = JSON.parse(fs.readFileSync(exportFileName, 'utf8'));
    // console.log('✅ Loaded export file');
    // console.log(`📅 Exported on: ${exportData.timestamp}`);

    // Import users first (since other tables reference them)
    if (exportData.users && exportData.users.length > 0) {
      // console.log('\n👥 Importing users...');
      
      // Remove sensitive fields and prepare for import
      const usersToImport = exportData.users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        college: user.college,
        phone: user.phone,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      const { data: insertedUsers, error: usersError } = await supabase
        .from('users')
        .insert(usersToImport);

      if (usersError) {
        // console.log('⚠️ Error importing users:', usersError.message);
        // console.log('This might be because users already exist or auth restrictions');
      } else {
        // console.log(`✅ Imported ${usersToImport.length} users`);
      }
    }

    // Import listings
    if (exportData.listings && exportData.listings.length > 0) {
      // console.log('\n📋 Importing listings...');
      
      const listingsToImport = exportData.listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        college: listing.college,
        images: listing.images,
        pdf_urls: listing.pdf_urls,
        academic_year: listing.academic_year,
        course_subject: listing.course_subject,
        seller_id: listing.seller_id,
        is_sold: listing.is_sold,
        created_at: listing.created_at,
        updated_at: listing.updated_at
      }));

      const { data: insertedListings, error: listingsError } = await supabase
        .from('listings')
        .insert(listingsToImport);

      if (listingsError) {
        // console.log('⚠️ Error importing listings:', listingsError.message);
      } else {
        // console.log(`✅ Imported ${listingsToImport.length} listings`);
      }
    }

    // Import sponsorship sequences
    if (exportData.sponsorship_sequences && exportData.sponsorship_sequences.length > 0) {
      // console.log('\n⭐ Importing sponsorship sequences...');
      
      const { data: insertedSponsorships, error: sponsorshipsError } = await supabase
        .from('sponsorship_sequences')
        .insert(exportData.sponsorship_sequences);

      if (sponsorshipsError) {
        // console.log('⚠️ Error importing sponsorship sequences:', sponsorshipsError.message);
      } else {
        // console.log(`✅ Imported ${exportData.sponsorship_sequences.length} sponsorship sequences`);
      }
    }

    // Import transactions
    if (exportData.transactions && exportData.transactions.length > 0) {
      // console.log('\n💳 Importing transactions...');
      
      const { data: insertedTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .insert(exportData.transactions);

      if (transactionsError) {
        // console.log('⚠️ Error importing transactions:', transactionsError.message);
      } else {
        // console.log(`✅ Imported ${exportData.transactions.length} transactions`);
      }
    }

    // Import user ratings
    if (exportData.user_ratings && exportData.user_ratings.length > 0) {
      // console.log('\n⭐ Importing user ratings...');
      
      const { data: insertedRatings, error: ratingsError } = await supabase
        .from('user_ratings')
        .insert(exportData.user_ratings);

      if (ratingsError) {
        // console.log('⚠️ Error importing user ratings:', ratingsError.message);
      } else {
        // console.log(`✅ Imported ${exportData.user_ratings.length} user ratings`);
      }
    }

    // console.log('\n📊 IMPORT SUMMARY');
    // console.log('=================');
    // console.log('✅ Data import completed!');
    
    if (exportData.storage_files) {
      // console.log('\n📁 STORAGE FILES');
      // console.log('================');
      Object.entries(exportData.storage_files).forEach(([bucket, files]) => {
        if (files.length > 0) {
          // console.log(`⚠️ ${bucket}: ${files.length} files need manual migration`);
          // console.log(`   Files: ${files.slice(0, 3).map(f => f.name).join(', ')}${files.length > 3 ? '...' : ''}`);
        }
      });
      
      if (Object.values(exportData.storage_files).some(files => files.length > 0)) {
        // console.log('\n💡 Storage files need to be manually migrated:');
        // console.log('1. Download files from old Supabase storage');
        // console.log('2. Upload to new Supabase storage buckets');
        // console.log('3. Update file URLs in your application');
      }
    }

    // console.log('\n🎉 MIGRATION COMPLETE!');
    // console.log('======================');
    // console.log('✅ Database migration successful');
    // console.log('⚠️ Storage files need manual migration (if any)');
    // console.log('🔧 Update your .env.local with new credentials');
    // console.log('🧪 Test your application thoroughly');

  } catch (error) {
    // console.error('❌ Import failed:', error.message);
    // console.log('\nTroubleshooting:');
    // console.log('1. Make sure you updated .env.local with NEW Supabase credentials');
    // console.log('2. Ensure the database schema was created in new project');
    // console.log('3. Check that RLS policies allow data insertion');
  }
}

// Get export filename from command line or use latest
const exportFileName = process.argv[2] || (() => {
  const files = fs.readdirSync('.').filter(f => f.startsWith('supabase_export_') && f.endsWith('.json'));
  return files.sort().pop(); // Get the latest export file
})();

if (!exportFileName) {
  // console.error('❌ No export file found. Run export_data.js first!');
  process.exit(1);
}

// console.log(`📁 Using export file: ${exportFileName}`);
importData(exportFileName);
