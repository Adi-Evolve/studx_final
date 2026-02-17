-- ============================================================================
-- STUDX MARKETPLACE - COMPLETE DATABASE SETUP FOR DEVELOPMENT
-- Copy and paste this entire script into your Supabase SQL Editor
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
-- 2. USERS TABLE
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
    category_id INTEGER,
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
    pdf_url TEXT,
    category TEXT DEFAULT 'notes',
    category_id INTEGER,
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
    category_id INTEGER,
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
    fees TEXT,
    feesIncludeMess BOOLEAN,
    messType TEXT,
    ownerName TEXT,
    roomName TEXT,
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
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ADDITIONAL TABLES
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

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- DEVELOPMENT CONFIGURATION
-- ============================================================================

-- Disable RLS for development
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

-- Grant permissions for development
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
-- SAMPLE DATA
-- ============================================================================

-- Create development users
INSERT INTO public.users (id, name, email, college, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Development User', 'dev@example.com', 'Test College', NOW(), NOW()),
('12345678-1234-1234-1234-123456789abc', 'Test User API', 'testapi@example.com', 'API Test College', NOW(), NOW()),
('11111111-1111-1111-1111-111111111111', 'Demo User', 'demo@example.com', 'Demo College', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_pdfs', 'product_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
CREATE POLICY "Anyone can upload product PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs');

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_college ON public.products(college);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_college ON public.notes(college);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_price ON public.notes(price);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(price);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '🎉 DATABASE SETUP COMPLETE!' as message,
       'All tables created successfully' as status,
       'RLS disabled for development' as security,
       'Storage bucket configured' as storage,
       'Performance indexes added' as performance;

-- Verify tables were created
SELECT 
    tablename,
    schemaname,
    'Created ✅' as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'users', 'products', 'notes', 'rooms')
ORDER BY tablename;
