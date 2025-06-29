-- ============================================================================
-- STUDXCHANGE SAFE DATABASE MIGRATION
-- This script safely updates existing database structure without conflicts
-- Run this INSTEAD of the complete schema if you have existing data
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SAFE MIGRATION: Add missing columns to existing tables
-- ============================================================================

-- Fix users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Fix products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Others';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Used';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix notes table - THIS IS THE KEY FIX FOR YOUR ERROR
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Notes';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix rooms table
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
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- FIX DATA AND ADD CONSTRAINTS
-- ============================================================================

-- Fix any invalid condition values in products table before adding constraint
UPDATE public.products 
SET condition = 'Used' 
WHERE condition IS NOT NULL 
AND condition NOT IN ('New', 'Used', 'Refurbished');

-- Set NULL conditions to 'Used' as default
UPDATE public.products 
SET condition = 'Used' 
WHERE condition IS NULL;

-- Add constraint for condition if it doesn't exist
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
-- CREATE MISSING TABLES (if they don't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'note', 'room')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reviewed_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID,
    item_type TEXT CHECK (item_type IN ('product', 'note', 'room')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type TEXT DEFAULT 'purchase',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID,
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
-- STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('product_pdfs', 'product_pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES 
('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSERT SAFE CATEGORIES
-- ============================================================================
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

-- ============================================================================
-- BASIC RLS POLICIES (safe to run multiple times)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Basic policies for notes (the main issue)
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON public.notes;
CREATE POLICY "Notes are viewable by everyone." ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own notes." ON public.notes;
CREATE POLICY "Users can insert their own notes." ON public.notes FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
CREATE POLICY "Users can update their own notes." ON public.notes FOR UPDATE USING (auth.uid() = seller_id);

-- Basic policies for products
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
CREATE POLICY "Users can insert their own products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Basic policies for rooms
DROP POLICY IF EXISTS "Rooms are viewable by everyone." ON public.rooms;
CREATE POLICY "Rooms are viewable by everyone." ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own room listings." ON public.rooms;
CREATE POLICY "Users can insert their own room listings." ON public.rooms FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Basic policies for users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
CREATE POLICY "Anyone can upload product PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs');

-- ============================================================================
-- TRIGGERS (safe to recreate)
-- ============================================================================
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
            new.raw_user_meta_data->>'picture',
            new.raw_user_meta_data->>'avatar_url',
            new.raw_user_meta_data->>'photo'
        ),
        new.phone
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 'Migration completed successfully!' as status;

-- Check notes table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;
