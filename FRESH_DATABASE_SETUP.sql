-- ============================================================================
-- STUDXCHANGE COMPLETE DATABASE SCHEMA FOR DEVELOPMENT
-- This creates all tables with proper structure and development-friendly policies
-- Can be run on existing databases - will skip existing tables
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- OPTIONAL: CLEANUP EXISTING TABLES (Uncomment if you want fresh start)
-- ============================================================================
-- DROP TABLE IF EXISTS public.sponsorship_sequences CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.user_ratings CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- DROP TABLE IF EXISTS public.wishlist CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.messages CASCADE;
-- DROP TABLE IF EXISTS public.conversations CASCADE;
-- DROP TABLE IF EXISTS public.rooms CASCADE;
-- DROP TABLE IF EXISTS public.notes CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Laptops, phones, gadgets'),
('Books', 'Textbooks, reference books'),
('Furniture', 'Chairs, tables, storage'),
('Clothing', 'Clothes and accessories'),
('Lab Equipment', 'Scientific instruments'),
('Bicycles', 'Bikes and cycling gear'),
('Sports', 'Sports equipment'),
('Stationery', 'Pens, notebooks, supplies'),
('Notes', 'Study notes and materials'),
('Rooms/Hostel', 'Room rentals and hostel sharing')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. USERS TABLE (Public users table - no foreign key to auth.users for development)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    college TEXT,
    bio TEXT,
    verified_seller BOOLEAN DEFAULT FALSE,
    average_rating NUMERIC DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition = ANY (ARRAY['New'::text, 'Used'::text, 'Refurbished'::text])),
    seller_id UUID NOT NULL,
    college TEXT NOT NULL,
    location JSONB,
    images TEXT[] DEFAULT '{}',
    category_id INTEGER, -- Removed FK constraint for development
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    is_sold BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    seller_id UUID NOT NULL,
    college TEXT NOT NULL,
    course TEXT,
    subject TEXT,
    academic_year TEXT,
    course_subject TEXT,
    images TEXT[],
    pdf_urls TEXT[],
    pdf_url TEXT,  -- Single standardized PDF URL field
    category TEXT DEFAULT 'notes',
    category_id INTEGER, -- Removed FK constraint for development
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ROOMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    seller_id UUID NOT NULL,
    college TEXT NOT NULL,
    location JSONB,
    images TEXT[],
    category TEXT DEFAULT 'rooms',
    category_id INTEGER, -- Removed FK constraint for development
    
    -- Room specific fields
    room_type TEXT NOT NULL,
    occupancy TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    contact1 TEXT NOT NULL,
    contact2 TEXT,
    distance TEXT,
    deposit NUMERIC,
    fees_include_mess BOOLEAN DEFAULT FALSE,
    mess_fees NUMERIC,
    amenities TEXT[],
    
    -- Legacy fields (for compatibility)
    fees TEXT,
    feesIncludeMess BOOLEAN,
    messType TEXT,
    ownerName TEXT,
    roomName TEXT,
    
    -- Meta fields
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL,
    participant2_id UUID NOT NULL,
    item_id UUID,
    item_type TEXT CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL, -- Removed FK constraint for development
    sender_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['message'::text, 'system'::text, 'transaction'::text, 'review'::text])),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. WISHLIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. USER_PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    average_rating NUMERIC DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    verified_seller BOOLEAN DEFAULT FALSE,
    member_since TIMESTAMPTZ DEFAULT NOW(),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. USER_RATINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rated_user_id UUID,
    rater_user_id UUID,
    listing_id UUID,
    listing_type VARCHAR DEFAULT 'product',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type VARCHAR DEFAULT 'sale',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    listing_id BIGINT NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    platform_fee NUMERIC NOT NULL DEFAULT 0,
    gateway_fee NUMERIC NOT NULL DEFAULT 0,
    seller_amount NUMERIC NOT NULL CHECK (seller_amount >= 0),
    payment_method TEXT DEFAULT 'razorpay',
    payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 13. SPONSORSHIP_SEQUENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sponsorship_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    slot INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEVELOPMENT SETUP
-- ============================================================================

-- Disable RLS on all tables for development
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_sequences DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to all roles for development
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- DEVELOPMENT DATA
-- ============================================================================

-- Create development users
INSERT INTO public.users (id, name, email, college, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Development User', 'dev@example.com', 'Test College', NOW(), NOW()),
('12345678-1234-1234-1234-123456789abc', 'Test User API', 'testapi@example.com', 'API Test College', NOW(), NOW()),
('11111111-1111-1111-1111-111111111111', 'Demo User', 'demo@example.com', 'Demo College', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample room for testing
INSERT INTO public.rooms (
    seller_id, title, description, price, college, location, 
    category, room_type, occupancy, owner_name, contact1, distance
) VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Sample Room for Testing',
    'This is a test room created during setup',
    5000,
    'Test College',
    '{"lat": 12.9716, "lng": 77.5946, "address": "Test Location"}',
    'Rooms/Hostel',
    'Single',
    '1',
    'Test Owner',
    '9876543210',
    '1 km'
) ON CONFLICT DO NOTHING;

-- Create sample product for testing
INSERT INTO public.products (
    seller_id, title, description, price, category, condition, college, location
) VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Sample Product for Testing',
    'This is a test product created during setup',
    1000,
    'Electronics',
    'Used',
    'Test College',
    '{"lat": 12.9716, "lng": 77.5946, "address": "Test Location"}'
) ON CONFLICT DO NOTHING;

-- Create sample notes for testing
INSERT INTO public.notes (
    seller_id, title, description, price, college, course, subject, academic_year
) VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Sample Notes for Testing',
    'This is a test notes entry created during setup',
    200,
    'Test College',
    'Computer Science',
    'Data Structures',
    '2023-24'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION AND SUCCESS MESSAGE
-- ============================================================================

-- Show table counts
SELECT 'Table Creation Summary:' as status;
SELECT 
    schemaname, 
    tablename, 
    'Created' as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show data counts
SELECT 'Data Summary:' as status;
SELECT 'users' as table_name, count(*) as count FROM public.users
UNION ALL
SELECT 'rooms' as table_name, count(*) as count FROM public.rooms
UNION ALL  
SELECT 'products' as table_name, count(*) as count FROM public.products
UNION ALL
SELECT 'notes' as table_name, count(*) as count FROM public.notes
UNION ALL
SELECT 'categories' as table_name, count(*) as count FROM public.categories;

-- 🗂️ STORAGE SETUP
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_pdfs', 'product_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for development (permissive)
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
CREATE POLICY "Anyone can upload product PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Users can update their own PDFs." ON storage.objects;
CREATE POLICY "Users can update their own PDFs." ON storage.objects
  FOR UPDATE USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Users can delete their own PDFs." ON storage.objects;
CREATE POLICY "Users can delete their own PDFs." ON storage.objects
  FOR DELETE USING (bucket_id = 'product_pdfs');

SELECT '🗂️ Storage buckets and policies created!' as storage_status;

-- 🔧 UTILITY FUNCTIONS
-- Function to generate UUIDs (if needed)
CREATE OR REPLACE FUNCTION generate_uuid()
RETURNS uuid AS $$
BEGIN
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Function to get current timestamp
CREATE OR REPLACE FUNCTION current_timestamp_utc()
RETURNS timestamptz AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

SELECT '🔧 Utility functions created!' as functions_status;

-- 🚀 PERFORMANCE INDEXES (Development)
-- Basic indexes for improved search and filtering performance

-- Price range filtering (skip if products table doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price) WHERE price IS NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_price ON public.notes(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(price) WHERE price IS NOT NULL;

-- College-based filtering (most common filter)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_college ON public.products(college);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_college ON public.notes(college);
CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);

-- Category filtering
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);

-- Date-based sorting (newest first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_created_desc ON public.products(created_at DESC);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_created_desc ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_created_desc ON public.rooms(created_at DESC);

-- User-based queries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_seller_id ON public.notes(seller_id);
CREATE INDEX IF NOT EXISTS idx_rooms_seller_id ON public.rooms(seller_id);

SELECT '🚀 Performance indexes created!' as indexes_status;

-- 🔍 VERIFICATION SECTION
-- Check that all tables, policies, and configurations are correct

-- Verify all tables exist
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  hasindexes as has_indexes
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'categories', 'products', 'notes', 'rooms')
ORDER BY tablename;

-- Verify storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'product_pdfs';

-- Verify RLS is disabled (should show 'f' for all tables)
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'categories', 'products', 'notes', 'rooms');

-- Check sample data was inserted
SELECT 
  'Sample data verification:' as info,
  (SELECT count(*) FROM public.categories) as categories_count,
  (SELECT count(*) FROM public.users) as users_count;

-- Verify indexes were created
SELECT 
  indexname, 
  tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'notes', 'rooms')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Final success message
SELECT '🎉 Database setup completed successfully!' as status;
SELECT '✅ All tables created without foreign key constraints' as info;
SELECT '✅ RLS disabled for development' as info;
SELECT '✅ Sample data inserted for testing' as info;
SELECT '✅ Storage buckets configured' as storage;
SELECT '✅ Utility functions available' as functions;
SELECT '✅ Ready for room/product/notes submissions!' as info;
