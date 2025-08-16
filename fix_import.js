require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize new Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function fixDataImport() {
  // console.log('🔧 Fixing data import issues...\n');

  try {
    // Read export file
    const exportData = JSON.parse(fs.readFileSync('supabase_export_1751909981983.json', 'utf8'));

    // 1. Handle sponsorship sequences manually
    // console.log('⭐ Fixing sponsorship sequences...');
    if (exportData.sponsorship_sequences && exportData.sponsorship_sequences.length > 0) {
      
      for (const sequence of exportData.sponsorship_sequences) {
        try {
          const { data, error } = await supabase
            .from('sponsorship_sequences')
            .insert({
              id: sequence.id,
              item_id: sequence.item_id,
              item_type: sequence.item_type,
              slot: sequence.slot,
              created_at: sequence.created_at
            });

          if (error) {
            // console.log(`⚠️ Could not insert sequence ${sequence.id}:`, error.message);
          } else {
            // console.log(`✅ Inserted sponsorship sequence ${sequence.slot}`);
          }
        } catch (err) {
          // console.log(`❌ Error with sequence ${sequence.id}:`, err.message);
        }
      }
    }

    // 2. Handle users - only insert into public.users, not auth.users
    // console.log('\n👥 Fixing user profiles...');
    if (exportData.users && exportData.users.length > 0) {
      
      // First, get all existing auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        // console.log('⚠️ Could not fetch auth users:', authError.message);
      } else {
        // console.log(`📋 Found ${authUsers.users.length} auth users`);
        
        // For each exported user, try to create a profile in public.users
        for (const user of exportData.users) {
          try {
            // Check if this user exists in auth
            const authUser = authUsers.users.find(au => au.email === user.email);
            
            if (authUser) {
              // Insert into public.users with auth user ID
              const { data, error } = await supabase
                .from('users')
                .upsert({
                  id: authUser.id, // Use auth user ID
                  name: user.name,
                  email: user.email,
                  avatar_url: user.avatar_url,
                  phone: user.phone,
                  college: user.college,
                  bio: user.bio,
                  verified_seller: user.verified_seller,
                  average_rating: user.average_rating,
                  total_ratings: user.total_ratings,
                  created_at: user.created_at,
                  updated_at: user.updated_at
                });

              if (error) {
                // console.log(`⚠️ Could not upsert user ${user.email}:`, error.message);
              } else {
                // console.log(`✅ Updated profile for ${user.email}`);
              }
            } else {
              // console.log(`⚠️ User ${user.email} not found in auth, skipping profile`);
            }
          } catch (err) {
            // console.log(`❌ Error with user ${user.email}:`, err.message);
          }
        }
      }
    }

    // 3. Test the setup
    // console.log('\n🧪 Testing the setup...');
    
    // Check if sponsorship sequences were inserted
    const { data: sequences, error: seqError } = await supabase
      .from('sponsorship_sequences')
      .select('*');
    
    if (seqError) {
      // console.log('⚠️ Could not fetch sponsorship sequences:', seqError.message);
    } else {
      // console.log(`✅ Found ${sequences.length} sponsorship sequences`);
    }

    // Check if users table has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);
    
    if (usersError) {
      // console.log('⚠️ Could not fetch users:', usersError.message);
    } else {
      // console.log(`✅ Found ${users.length} user profiles`);
      users.forEach(user => {
        // console.log(`   - ${user.name} (${user.email})`);
      });
    }

    // console.log('\n🎉 DATA IMPORT FIXES COMPLETE!');
    // console.log('===============================');
    // console.log('✅ Sponsorship sequences fixed');
    // console.log('✅ User profiles linked to auth users');
    // console.log('✅ Database is ready for testing');
    
    // console.log('\n📋 NEXT STEPS:');
    // console.log('1. Test your application with the new database');
    // console.log('2. Check that authentication works');
    // console.log('3. Verify that featured listings appear');
    // console.log('4. Make sure all functionality works as expected');

  } catch (error) {
    // console.error('❌ Fix failed:', error.message);
    // console.log('\nMake sure:');
    // console.log('- Your .env.local has the NEW Supabase credentials');
    // console.log('- The database schema was created successfully');
    // console.log('- The export file exists');
  }
}

// Run the fixes
fixDataImport();
