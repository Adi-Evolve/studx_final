-- Create a table for public user profiles
CREATE TABLE public.users (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    -- you can add other user-specific data here
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

create policy "Users can insert their own profile." on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Regular Products Table
CREATE TABLE public.regular_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    college TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    condition TEXT NOT NULL, -- e.g., 'New', 'Used', 'Refurbished'
    image_urls TEXT[], -- Array of URLs
    location JSONB, -- For storing GeoJSON, e.g., { "type": "Point", "coordinates": [lng, lat] }
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes Table
CREATE TABLE public.notes (
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms/Hostel Table
CREATE TABLE public.rooms (
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for product tables as well
alter table public.regular_products enable row level security;
alter table public.notes enable row level security;
alter table public.rooms enable row level security;

-- Policies for regular_products
create policy "Products are viewable by everyone." on public.regular_products for select using (true);
create policy "Users can insert their own products." on public.regular_products for insert with check (auth.uid() = seller_id);
create policy "Users can update their own products." on public.regular_products for update using (auth.uid() = seller_id);
create policy "Users can delete their own products." on public.regular_products for delete using (auth.uid() = seller_id);

-- Policies for notes
create policy "Notes are viewable by everyone." on public.notes for select using (true);
create policy "Users can insert their own notes." on public.notes for insert with check (auth.uid() = seller_id);
create policy "Users can update their own notes." on public.notes for update using (auth.uid() = seller_id);
create policy "Users can delete their own notes." on public.notes for delete using (auth.uid() = seller_id);

-- Policies for rooms
create policy "Rooms are viewable by everyone." on public.rooms for select using (true);
create policy "Users can insert their own room listings." on public.rooms for insert with check (auth.uid() = seller_id);
create policy "Users can update their own room listings." on public.rooms for update using (auth.uid() = seller_id);
create policy "Users can delete their own room listings." on public.rooms for delete using (auth.uid() = seller_id);


-- Create Storage buckets
-- Bucket for product images
insert into storage.buckets (id, name, public) 
values ('product_images', 'product_images', true);

-- Bucket for notes PDFs
insert into storage.buckets (id, name, public) 
values ('notes_pdfs', 'notes_pdfs', true);

-- Policies for storage
create policy "Product images are publicly accessible." on storage.objects
  for select using (bucket_id = 'product_images');

create policy "Anyone can upload product images." on storage.objects
  for insert with check (bucket_id = 'product_images');

create policy "Notes PDFs are publicly accessible." on storage.objects
  for select using (bucket_id = 'notes_pdfs');

create policy "Anyone can upload notes PDFs." on storage.objects
  for insert with check (bucket_id = 'notes_pdfs');
