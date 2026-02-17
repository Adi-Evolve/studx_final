require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize current Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function exportData() {
  // console.log('📦 Starting data export from current Supabase account...\n');

  const exportData = {
    timestamp: new Date().toISOString(),
    users: [],
    listings: [],
    sponsorship_sequences: [],
    transactions: [],
    user_ratings: [],
    metadata: {
      totalUsers: 0,
      totalListings: 0,
      exportedAt: new Date().toISOString()
    }
  };

  try {
    // Export users
    // console.log('👥 Exporting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      // console.log('⚠️ Could not export users:', usersError.message);
    } else {
      exportData.users = users || [];
      exportData.metadata.totalUsers = users?.length || 0;
      // console.log(`✅ Exported ${users?.length || 0} users`);
    }

    // Export listings
    // console.log('📋 Exporting listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*');

    if (listingsError) {
      // console.log('⚠️ Could not export listings:', listingsError.message);
    } else {
      exportData.listings = listings || [];
      exportData.metadata.totalListings = listings?.length || 0;
      // console.log(`✅ Exported ${listings?.length || 0} listings`);
    }

    // Export sponsorship sequences
    // console.log('⭐ Exporting sponsorship sequences...');
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from('sponsorship_sequences')
      .select('*');

    if (sponsorshipsError) {
      // console.log('⚠️ Could not export sponsorship sequences:', sponsorshipsError.message);
    } else {
      exportData.sponsorship_sequences = sponsorships || [];
      // console.log(`✅ Exported ${sponsorships?.length || 0} sponsorship sequences`);
    }

    // Export transactions
    // console.log('💳 Exporting transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');

    if (transactionsError) {
      // console.log('⚠️ Could not export transactions:', transactionsError.message);
    } else {
      exportData.transactions = transactions || [];
      // console.log(`✅ Exported ${transactions?.length || 0} transactions`);
    }

    // Export user ratings
    // console.log('⭐ Exporting user ratings...');
    const { data: ratings, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('*');

    if (ratingsError) {
      // console.log('⚠️ Could not export user ratings:', ratingsError.message);
    } else {
      exportData.user_ratings = ratings || [];
      // console.log(`✅ Exported ${ratings?.length || 0} user ratings`);
    }

    // Export storage file list (we can't export actual files easily)
    // console.log('📁 Checking storage files...');
    const buckets = ['product_pdfs', 'product_images', 'avatars'];
    exportData.storage_files = {};

    for (const bucketName of buckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1000 });

        if (!error && files) {
          exportData.storage_files[bucketName] = files.map(file => ({
            name: file.name,
            id: file.id,
            created_at: file.created_at,
            metadata: file.metadata
          }));
          // console.log(`✅ Found ${files.length} files in ${bucketName}`);
        } else {
          exportData.storage_files[bucketName] = [];
          // console.log(`ℹ️ No files found in ${bucketName}`);
        }
      } catch (err) {
        // console.log(`⚠️ Could not access ${bucketName}:`, err.message);
        exportData.storage_files[bucketName] = [];
      }
    }

    // Save export data
    const exportFileName = `supabase_export_${Date.now()}.json`;
    fs.writeFileSync(exportFileName, JSON.stringify(exportData, null, 2));

    // console.log('\n📊 EXPORT SUMMARY');
    // console.log('=================');
    // console.log(`👥 Users: ${exportData.metadata.totalUsers}`);
    // console.log(`📋 Listings: ${exportData.metadata.totalListings}`);
    // console.log(`⭐ Sponsorships: ${exportData.sponsorship_sequences.length}`);
    // console.log(`💳 Transactions: ${exportData.transactions.length}`);
    // console.log(`⭐ Ratings: ${exportData.user_ratings.length}`);
    
    Object.entries(exportData.storage_files).forEach(([bucket, files]) => {
      // console.log(`📁 ${bucket}: ${files.length} files`);
    });

    // console.log(`\n✅ Export complete! Saved to: ${exportFileName}`);
    // console.log('\n📋 NEXT STEPS:');
    // console.log('1. Create new Supabase account');
    // console.log('2. Run the schema setup script');
    // console.log('3. Run the import script with your export file');
    // console.log('4. Update your environment variables');

    // Generate schema for new database
    const schemaSQL = generateSchema();
    fs.writeFileSync('new_database_schema.sql', schemaSQL);
    // console.log('📄 Database schema saved to: new_database_schema.sql');

  } catch (error) {
    // console.error('❌ Export failed:', error.message);
    // console.log('\nMake sure you have:');
    // console.log('- NEXT_PUBLIC_SUPABASE_URL in .env.local');
    // console.log('- SUPABASE_SECRET_KEY in .env.local');
  }
}

function generateSchema() {
  return `-- StudX Database Schema for New Supabase Account
-- Run this in your new Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    college TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE public.listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    category TEXT,
    condition TEXT,
    college TEXT,
    images TEXT[],
    pdf_urls TEXT[],
    academic_year TEXT,
    course_subject TEXT,
    seller_id UUID REFERENCES public.users(id),
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsorship sequences table
CREATE TABLE public.sponsorship_sequences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id),
    sequence_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES public.users(id),
    seller_id UUID REFERENCES public.users(id),
    listing_id UUID REFERENCES public.listings(id),
    amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User ratings table
CREATE TABLE public.user_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rater_id UUID REFERENCES public.users(id),
    rated_user_id UUID REFERENCES public.users(id),
    listing_id UUID REFERENCES public.listings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    transaction_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_listings_college ON public.listings(college);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON public.transactions(seller_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for listing owners" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Enable read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable update for own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Storage buckets (create these in Supabase Storage section)
-- 1. product_pdfs
-- 2. product_images  
-- 3. avatars

-- Storage policies (run these after creating buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product_pdfs', 'product_pdfs', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
`;
}

// Run the export
exportData();
