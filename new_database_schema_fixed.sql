-- StudX Complete Database Schema for New Supabase Account
-- This handles existing tables and matches your database structure exactly
-- Run this in your new Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS transactions_id_seq;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id INTEGER NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Users table (extends auth.users) - use IF NOT EXISTS to avoid conflicts
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    phone TEXT,
    college TEXT,
    bio TEXT,
    verified_seller BOOLEAN DEFAULT FALSE,
    average_rating NUMERIC DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition = ANY (ARRAY['New'::text, 'Used'::text, 'Refurbished'::text])),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seller_id UUID,
    pdf_url TEXT,
    is_sold BOOLEAN DEFAULT FALSE,
    college TEXT NOT NULL,
    category_id INTEGER,
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location JSONB,
    images TEXT[] DEFAULT '{}',
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    images TEXT[],
    college TEXT NOT NULL,
    course TEXT,
    subject TEXT,
    category TEXT DEFAULT 'notes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seller_id UUID NOT NULL,
    category_id INTEGER,
    pdfurl TEXT,
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pdf_urls TEXT[],
    academic_year TEXT,
    course_subject TEXT,
    CONSTRAINT notes_pkey PRIMARY KEY (id)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    images TEXT[],
    college TEXT NOT NULL,
    location TEXT,
    category TEXT DEFAULT 'rooms',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seller_id UUID NOT NULL,
    amenities TEXT[],
    contact1 TEXT NOT NULL,
    contact2 TEXT,
    deposit TEXT,
    distance TEXT,
    fees TEXT,
    fees_include_mess BOOLEAN DEFAULT FALSE,
    mess_fees NUMERIC,
    mess_type TEXT,
    occupancy TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    room_name TEXT,
    room_type TEXT NOT NULL,
    category_id INTEGER,
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT rooms_pkey PRIMARY KEY (id)
);

-- Sponsorship sequences table
CREATE TABLE IF NOT EXISTS public.sponsorship_sequences (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    slot INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT sponsorship_sequences_pkey PRIMARY KEY (id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGINT NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    average_rating NUMERIC DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    verified_seller BOOLEAN DEFAULT FALSE,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- User ratings table
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    rated_user_id UUID,
    rater_user_id UUID,
    listing_id UUID,
    listing_type CHARACTER VARYING DEFAULT 'product'::character varying,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type CHARACTER VARYING DEFAULT 'sale'::character varying,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_ratings_pkey PRIMARY KEY (id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL,
    participant2_id UUID NOT NULL,
    item_id UUID,
    item_type TEXT CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['message'::text, 'system'::text, 'transaction'::text, 'review'::text])),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wishlist_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints only if they don't exist
DO $$
BEGIN
    -- Products foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_category_id_fkey' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_seller_id_fkey' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id);
    END IF;

    -- Notes foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notes_seller_id_fkey1' AND table_name = 'notes') THEN
        ALTER TABLE public.notes ADD CONSTRAINT notes_seller_id_fkey1 FOREIGN KEY (seller_id) REFERENCES public.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notes_category_id_fkey' AND table_name = 'notes') THEN
        ALTER TABLE public.notes ADD CONSTRAINT notes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;

    -- Rooms foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'rooms_seller_id_fkey1' AND table_name = 'rooms') THEN
        ALTER TABLE public.rooms ADD CONSTRAINT rooms_seller_id_fkey1 FOREIGN KEY (seller_id) REFERENCES public.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'rooms_category_id_fkey' AND table_name = 'rooms') THEN
        ALTER TABLE public.rooms ADD CONSTRAINT rooms_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;

    -- Transactions foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'transactions_buyer_id_fkey' AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions ADD CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'transactions_seller_id_fkey' AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions ADD CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id);
    END IF;

    -- User profiles foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_profiles_user_id_fkey' AND table_name = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;

    -- User ratings foreign keys (skip due to potential table conflicts)
    -- Note: These may be added automatically by Supabase or need manual creation
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_ratings_rated_user_id_fkey' AND table_name = 'user_ratings') THEN
    --     ALTER TABLE public.user_ratings ADD CONSTRAINT user_ratings_rated_user_id_fkey FOREIGN KEY (rated_user_id) REFERENCES auth.users(id);
    -- END IF;
    
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_ratings_rater_user_id_fkey' AND table_name = 'user_ratings') THEN
    --     ALTER TABLE public.user_ratings ADD CONSTRAINT user_ratings_rater_user_id_fkey FOREIGN KEY (rater_user_id) REFERENCES auth.users(id);
    -- END IF;

    -- Conversations foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'conversations_participant1_id_fkey' AND table_name = 'conversations') THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'conversations_participant2_id_fkey' AND table_name = 'conversations') THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id);
    END IF;

    -- Messages foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_conversation_id_fkey' AND table_name = 'messages') THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_sender_id_fkey' AND table_name = 'messages') THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);
    END IF;

    -- Notifications foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_user_id_fkey' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
    END IF;

    -- Wishlist foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'wishlist_user_id_fkey' AND table_name = 'wishlist') THEN
        ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_products_college ON public.products(college);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_college ON public.notes(college);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
    -- Products policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'products') THEN
        CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for authenticated users' AND tablename = 'products') THEN
        CREATE POLICY "Enable insert for authenticated users" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for product owners' AND tablename = 'products') THEN
        CREATE POLICY "Enable update for product owners" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
    END IF;

    -- Notes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'notes') THEN
        CREATE POLICY "Enable read access for all users" ON public.notes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for authenticated users' AND tablename = 'notes') THEN
        CREATE POLICY "Enable insert for authenticated users" ON public.notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Rooms policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'rooms') THEN
        CREATE POLICY "Enable read access for all users" ON public.rooms FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for authenticated users' AND tablename = 'rooms') THEN
        CREATE POLICY "Enable insert for authenticated users" ON public.rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for users' AND tablename = 'users') THEN
        CREATE POLICY "Enable read access for users" ON public.users FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for own profile' AND tablename = 'users') THEN
        CREATE POLICY "Enable update for own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Conversations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable access for participants' AND tablename = 'conversations') THEN
        CREATE POLICY "Enable access for participants" ON public.conversations FOR ALL USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
    END IF;

    -- Messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable access for conversation participants' AND tablename = 'messages') THEN
        CREATE POLICY "Enable access for conversation participants" ON public.messages FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.conversations 
                WHERE conversations.id = messages.conversation_id 
                AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
            )
        );
    END IF;

    -- Notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable access for notification owner' AND tablename = 'notifications') THEN
        CREATE POLICY "Enable access for notification owner" ON public.notifications FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Wishlist policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable access for wishlist owner' AND tablename = 'wishlist') THEN
        CREATE POLICY "Enable access for wishlist owner" ON public.wishlist FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Note: No storage buckets needed since you're using:
-- - Google Drive for PDF storage
-- - ImgBB for image storage
