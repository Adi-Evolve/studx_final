-- StudX Database Schema Fix
-- Create missing tables for room and product listings

-- Create room_listings table
CREATE TABLE IF NOT EXISTS public.room_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    location TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities TEXT[] DEFAULT '{}',
    room_type TEXT DEFAULT 'single',
    availability_status TEXT DEFAULT 'available',
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    contact_info JSONB,
    featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_listings table
CREATE TABLE IF NOT EXISTS public.product_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    condition TEXT DEFAULT 'good',
    availability_status TEXT DEFAULT 'available',
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    contact_info JSONB,
    featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_listings_user_id ON public.room_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_room_listings_location ON public.room_listings(location);
CREATE INDEX IF NOT EXISTS idx_room_listings_price ON public.room_listings(price);
CREATE INDEX IF NOT EXISTS idx_room_listings_availability ON public.room_listings(availability_status);

CREATE INDEX IF NOT EXISTS idx_product_listings_user_id ON public.product_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_product_listings_category ON public.product_listings(category);
CREATE INDEX IF NOT EXISTS idx_product_listings_price ON public.product_listings(price);
CREATE INDEX IF NOT EXISTS idx_product_listings_availability ON public.product_listings(availability_status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.room_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for room_listings
CREATE POLICY "Users can view all room listings" ON public.room_listings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own room listings" ON public.room_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room listings" ON public.room_listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own room listings" ON public.room_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for product_listings
CREATE POLICY "Users can view all product listings" ON public.product_listings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own product listings" ON public.product_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product listings" ON public.product_listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product listings" ON public.product_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.room_listings TO authenticated;
GRANT ALL ON public.product_listings TO authenticated;

-- Grant service role access (for your API)
GRANT ALL ON public.room_listings TO service_role;
GRANT ALL ON public.product_listings TO service_role;
