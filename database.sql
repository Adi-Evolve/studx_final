-- Create a table for public user profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT, 
    avatar_url TEXT,
    phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level  security;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
create policy "Users can insert their own profile." on public.users
  for insert with check (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, avatar_url, phone)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'avatar_url',
        new.phone -- Copy the phone number from the auth record
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    college TEXT NOT NULL,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL,
    condition TEXT NOT NULL, -- e.g., 'New', 'Used', 'Refurbished'
    image_urls TEXT[], -- Array of URLs
    location JSONB, -- For storing GeoJSON, e.g., { "type": "Point", "coordinates": [lng, lat] }
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample categories
INSERT INTO public.categories (name) VALUES
('Electronics'),
('Furniture'),
('Books'),
('Clothing'),
('Lab Coats & Scrubs'),
('Bicycles')
ON CONFLICT (name) DO NOTHING;

-- Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    college TEXT NOT NULL,
    title TEXT NOT NULL,
    academic_year TEXT NOT NULL, -- e.g., '8th', 'PhD'
    course_subject TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_urls TEXT[],
    pdf_urls TEXT[], -- Array of PDF URLs
    description TEXT,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms/Hostel Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    college TEXT NOT NULL,
    hostel_name TEXT NOT NULL,
    room_type TEXT NOT NULL, -- e.g., 'Single', 'Double', '1BHK'
    deposit_amount NUMERIC(10, 2),
    fees NUMERIC(10, 2) NOT NULL,
    fees_period TEXT NOT NULL, -- 'Monthly' or 'Yearly'
    mess_included BOOLEAN DEFAULT FALSE,
    mess_fees NUMERIC(10, 2),
    description TEXT,
    distance_from_college TEXT, -- e.g., '500m', '1km'
    occupancy TEXT, -- e.g., 'Single', 'Shared'
    image_urls TEXT[],
    owner_name TEXT NOT NULL,
    contact_primary TEXT NOT NULL,
    contact_secondary TEXT,
    amenities TEXT[], -- e.g., ['AC', 'WiFi', 'Parking']
    location JSONB,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
alter table public.products enable row level security;
alter table public.notes enable row level security;
alter table public.rooms enable row level security;

-- Policies for products
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
create policy "Products are viewable by everyone." on public.products for select using (true);
DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
create policy "Users can insert their own products." on public.products for insert with check (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
create policy "Users can update their own products." on public.products for update using (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;
create policy "Users can delete their own products." on public.products for delete using (auth.uid() = seller_id);

-- Policies for notes
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON public.notes;
create policy "Notes are viewable by everyone." on public.notes for select using (true);
DROP POLICY IF EXISTS "Users can insert their own notes." ON public.notes;
create policy "Users can insert their own notes." on public.notes for insert with check (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
create policy "Users can update their own notes." on public.notes for update using (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;
create policy "Users can delete their own notes." on public.notes for delete using (auth.uid() = seller_id);

-- Policies for rooms
DROP POLICY IF EXISTS "Rooms are viewable by everyone." ON public.rooms;
create policy "Rooms are viewable by everyone." on public.rooms for select using (true);
DROP POLICY IF EXISTS "Users can insert their own room listings." ON public.rooms;
create policy "Users can insert their own room listings." on public.rooms for insert with check (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can update their own room listings." ON public.rooms;
create policy "Users can update their own room listings." on public.rooms for update using (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can delete their own room listings." ON public.rooms;
create policy "Users can delete their own room listings." on public.rooms for delete using (auth.uid() = seller_id);

-- Create Storage buckets
insert into storage.buckets (id, name, public) 
values ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

insert into storage.buckets (id, name, public) 
values ('notes_pdfs', 'notes_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
DROP POLICY IF EXISTS "Product images are publicly accessible." ON storage.objects;
create policy "Product images are publicly accessible." on storage.objects
  for select using (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Anyone can upload product images." ON storage.objects;
create policy "Anyone can upload product images." on storage.objects
  for insert with check (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Notes PDFs are publicly accessible." ON storage.objects;
create policy "Notes PDFs are publicly accessible." on storage.objects
  for select using (bucket_id = 'notes_pdfs');

DROP POLICY IF EXISTS "Anyone can upload notes PDFs." ON storage.objects;
create policy "Anyone can upload notes PDFs." on storage.objects
  for insert with check (bucket_id = 'notes_pdfs');
