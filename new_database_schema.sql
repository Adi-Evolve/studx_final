-- StudX Complete Database Schema for New Supabase Account
-- Run this in your new Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS transactions_id_seq;

-- Categories table
CREATE TABLE public.categories (
    id INTEGER NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Users table (references auth.users)
CREATE TABLE public.users (
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
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Products table
CREATE TABLE public.products (
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
    images TEXT[] DEFAULT '{}'::text[],
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
    CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id)
);

-- Notes table
CREATE TABLE public.notes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    images TEXT[],
    college TEXT NOT NULL,
    course TEXT,
    subject TEXT,
    category TEXT DEFAULT 'notes'::text,
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
    pdfUrl TEXT,
    CONSTRAINT notes_pkey PRIMARY KEY (id),
    CONSTRAINT notes_seller_id_fkey1 FOREIGN KEY (seller_id) REFERENCES public.users(id),
    CONSTRAINT fk_notes_seller FOREIGN KEY (seller_id) REFERENCES public.users(id),
    CONSTRAINT notes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
    CONSTRAINT notes_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);

-- Rooms table
CREATE TABLE public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    images TEXT[],
    college TEXT NOT NULL,
    location TEXT,
    category TEXT DEFAULT 'rooms'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seller_id UUID NOT NULL,
    amenities TEXT[],
    contact1 TEXT NOT NULL,
    contact2 TEXT,
    deposit TEXT,
    distance TEXT,
    fees TEXT,
    feesIncludeMess BOOLEAN,
    messType TEXT,
    occupancy TEXT NOT NULL,
    ownerName TEXT,
    roomName TEXT,
    roomType TEXT,
    category_id INTEGER,
    fees_include_mess BOOLEAN DEFAULT FALSE,
    mess_fees NUMERIC,
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    room_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    CONSTRAINT rooms_pkey PRIMARY KEY (id),
    CONSTRAINT rooms_seller_id_fkey1 FOREIGN KEY (seller_id) REFERENCES public.users(id),
    CONSTRAINT rooms_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- Sponsorship sequences table
CREATE TABLE public.sponsorship_sequences (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    slot INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT sponsorship_sequences_pkey PRIMARY KEY (id)
);

-- Transactions table
CREATE TABLE public.transactions (
    id BIGINT NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    listing_id BIGINT NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    amount NUMERIC NOT NULL CHECK (amount > 0::numeric),
    platform_fee NUMERIC NOT NULL DEFAULT 0,
    gateway_fee NUMERIC NOT NULL DEFAULT 0,
    seller_amount NUMERIC NOT NULL CHECK (seller_amount >= 0::numeric),
    payment_method TEXT DEFAULT 'razorpay'::text,
    payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id),
    CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id)
);

-- User profiles table
CREATE TABLE public.user_profiles (
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
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- User ratings table
CREATE TABLE public.user_ratings (
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
    CONSTRAINT user_ratings_pkey PRIMARY KEY (id),
    CONSTRAINT user_ratings_rated_user_id_fkey FOREIGN KEY (rated_user_id) REFERENCES auth.users(id),
    CONSTRAINT user_ratings_rater_user_id_fkey FOREIGN KEY (rater_user_id) REFERENCES auth.users(id)
);

-- Conversations table
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL,
    participant2_id UUID NOT NULL,
    item_id UUID,
    item_type TEXT CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id),
    CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['message'::text, 'system'::text, 'transaction'::text, 'review'::text])),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Wishlist table
CREATE TABLE public.wishlist (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type = ANY (ARRAY['product'::text, 'note'::text, 'room'::text])),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wishlist_pkey PRIMARY KEY (id),
    CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create indexes for better performance
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

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for product owners" ON public.products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Enable read access for all users" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for note owners" ON public.notes FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Enable read access for all users" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for room owners" ON public.rooms FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Enable read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable update for own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for sponsorship sequences" ON public.sponsorship_sequences FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.sponsorship_sequences FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Enable insert for authenticated users" ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.user_ratings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Enable insert for authenticated users" ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for conversation participants" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
);
CREATE POLICY "Enable insert for authenticated users" ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.wishlist FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES
    ('Electronics', 'Laptops, phones, and electronic gadgets'),
    ('Books', 'Textbooks and academic materials'),
    ('Furniture', 'Room furniture and decor'),
    ('Clothing', 'Apparel and accessories'),
    ('Sports', 'Sports equipment and gear'),
    ('Other', 'Miscellaneous items')
ON CONFLICT (name) DO NOTHING;

-- Storage buckets (create these in Supabase Storage section)
-- 1. product_pdfs
-- 2. product_images  
-- 3. avatars

-- Storage policies (run these after creating buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product_pdfs', 'product_pdfs', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
