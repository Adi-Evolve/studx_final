-- ============================================================================
-- STUDXCHANGE COMPLETE DATABASE SCHEMA
-- This is a comprehensive schema that creates all tables with correct columns
-- Run this to ensure your database structure matches your application needs
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE (Enhanced Profile Management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns that might not exist in existing table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description column if it doesn't exist
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Insert default categories (without description to avoid column errors)
INSERT INTO public.categories (name) VALUES
('Electronics'),
('Books'),
('Furniture'),
('Clothing'),
('Lab Equipment'),
('Bicycles'),
('Notes'),
('Rooms'),
('Others')
ON CONFLICT (name) DO NOTHING;

-- Update descriptions after ensuring column exists
UPDATE public.categories SET description = 'Laptops, phones, gadgets, etc.' WHERE name = 'Electronics' AND description IS NULL;
UPDATE public.categories SET description = 'Textbooks, novels, reference books' WHERE name = 'Books' AND description IS NULL;
UPDATE public.categories SET description = 'Chairs, tables, storage, etc.' WHERE name = 'Furniture' AND description IS NULL;
UPDATE public.categories SET description = 'Shirts, pants, accessories' WHERE name = 'Clothing' AND description IS NULL;
UPDATE public.categories SET description = 'Lab coats, goggles, instruments' WHERE name = 'Lab Equipment' AND description IS NULL;
UPDATE public.categories SET description = 'Bikes, scooters, cycling gear' WHERE name = 'Bicycles' AND description IS NULL;
UPDATE public.categories SET description = 'Study materials and notes' WHERE name = 'Notes' AND description IS NULL;
UPDATE public.categories SET description = 'Room rentals and hostel listings' WHERE name = 'Rooms' AND description IS NULL;
UPDATE public.categories SET description = 'Miscellaneous items' WHERE name = 'Others' AND description IS NULL;

-- ============================================================================
-- 3. PRODUCTS TABLE (Regular Items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    college TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns that might not exist in existing table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Others';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Fix all invalid condition values before adding constraint
UPDATE public.products 
SET condition = 'Used' 
WHERE condition IS NULL 
   OR condition NOT IN ('New', 'Used', 'Refurbished');

-- Add constraint for condition if it doesn't exist (safely)
DO $$ 
BEGIN
    -- First check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_condition_check' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_condition_check 
        CHECK (condition IN ('New', 'Used', 'Refurbished'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN 
        NULL; -- Constraint already exists
END $$;

-- ============================================================================
-- 4. NOTES TABLE (Study Materials)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    college TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    course_subject TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns that might not exist in existing table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Notes';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- ============================================================================
-- 5. ROOMS TABLE (Hostel/Room Rentals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    college TEXT NOT NULL,
    room_type TEXT NOT NULL,
    occupancy TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    contact1 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns that might not exist in existing table
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Rooms';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS distance TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS deposit NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS fees_include_mess BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS mess_fees NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact2 TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- ============================================================================
-- 6. WISHLIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID NOT NULL, -- Can reference products, notes, or rooms
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'note', 'room')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- ============================================================================
-- 7. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reviewed_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID, -- Can be null for general user reviews
    item_type TEXT CHECK (item_type IN ('product', 'note', 'room')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type TEXT DEFAULT 'purchase',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_user_id, item_id)
);

-- ============================================================================
-- 8. CHAT SYSTEM TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID, -- Related product/note/room
    item_type TEXT CHECK (item_type IN ('product', 'note', 'room')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('message', 'system', 'transaction', 'review')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. BULK UPLOAD SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bulk_upload_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_name TEXT NOT NULL,
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. SEARCH SUGGESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_suggestions (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(query, category)
);

-- ============================================================================
-- 12. STORAGE BUCKETS SETUP
-- ============================================================================
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('product_pdfs', 'product_pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES 
('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products table policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
CREATE POLICY "Users can insert their own products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
CREATE POLICY "Users can update their own products." ON public.products FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;
CREATE POLICY "Users can delete their own products." ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Notes table policies
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON public.notes;
CREATE POLICY "Notes are viewable by everyone." ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own notes." ON public.notes;
CREATE POLICY "Users can insert their own notes." ON public.notes FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
CREATE POLICY "Users can update their own notes." ON public.notes FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;
CREATE POLICY "Users can delete their own notes." ON public.notes FOR DELETE USING (auth.uid() = seller_id);

-- Rooms table policies
DROP POLICY IF EXISTS "Rooms are viewable by everyone." ON public.rooms;
CREATE POLICY "Rooms are viewable by everyone." ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own room listings." ON public.rooms;
CREATE POLICY "Users can insert their own room listings." ON public.rooms FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own room listings." ON public.rooms;
CREATE POLICY "Users can update their own room listings." ON public.rooms FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own room listings." ON public.rooms;
CREATE POLICY "Users can delete their own room listings." ON public.rooms FOR DELETE USING (auth.uid() = seller_id);

-- Wishlist policies
DROP POLICY IF EXISTS "Users can view their own wishlist." ON public.wishlist;
CREATE POLICY "Users can view their own wishlist." ON public.wishlist FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own wishlist." ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist." ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews." ON public.reviews;
CREATE POLICY "Users can create reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Chat policies
DROP POLICY IF EXISTS "Users can view their conversations." ON public.conversations;
CREATE POLICY "Users can view their conversations." ON public.conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can create conversations." ON public.conversations;
CREATE POLICY "Users can create conversations." ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can view their messages." ON public.messages;
CREATE POLICY "Users can view their messages." ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can send messages." ON public.messages;
CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications." ON public.notifications;
CREATE POLICY "Users can view their notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications." ON public.notifications;
CREATE POLICY "Users can update their notifications." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 14. STORAGE POLICIES
-- ============================================================================

-- Product PDFs policies
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
CREATE POLICY "Anyone can upload product PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Users can update their own PDFs." ON storage.objects;
CREATE POLICY "Users can update their own PDFs." ON storage.objects
  FOR UPDATE USING (bucket_id = 'product_pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own PDFs." ON storage.objects;
CREATE POLICY "Users can delete their own PDFs." ON storage.objects
  FOR DELETE USING (bucket_id = 'product_pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Product images policies
DROP POLICY IF EXISTS "Product images are publicly accessible." ON storage.objects;
CREATE POLICY "Product images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Anyone can upload product images." ON storage.objects;
CREATE POLICY "Anyone can upload product images." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_images');

-- ============================================================================
-- 15. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, avatar_url, phone)
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'name',
            new.raw_user_meta_data->>'full_name',
            'New User'
        ),
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'picture',     -- Google profile picture
            new.raw_user_meta_data->>'avatar_url',  -- Generic OAuth avatar
            new.raw_user_meta_data->>'photo'        -- Alternative Google field
        ),
        new.phone
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user ratings
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate average rating and total ratings for the reviewed user
    UPDATE public.users 
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM public.reviews 
            WHERE reviewed_user_id = NEW.reviewed_user_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE reviewed_user_id = NEW.reviewed_user_id
        )
    WHERE id = NEW.reviewed_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update ratings when new review is added
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_rating();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_conversation_timestamp();

-- ============================================================================
-- 16. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users(college);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_college ON public.products(college);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON public.products(is_sold);

-- Notes table indexes
CREATE INDEX IF NOT EXISTS idx_notes_seller_id ON public.notes(seller_id);
CREATE INDEX IF NOT EXISTS idx_notes_college ON public.notes(college);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_academic_year ON public.notes(academic_year);
CREATE INDEX IF NOT EXISTS idx_notes_course_subject ON public.notes(course_subject);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- Rooms table indexes
CREATE INDEX IF NOT EXISTS idx_rooms_seller_id ON public.rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(price);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_id_type ON public.wishlist(item_id, item_type);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON public.reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Verify table creation
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'products', 'notes', 'rooms', 'wishlist', 'reviews', 'conversations', 'messages', 'notifications')
ORDER BY tablename;

-- Verify column structure for main tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('products', 'notes', 'rooms')
ORDER BY table_name, ordinal_position;
