-- migrations/004_add_location_to_listings.sql

-- Add latitude and longitude to the rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add latitude and longitude to the products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Note: You will need to populate these new columns with data for existing listings.
-- Example of how to update an existing room:
-- UPDATE public.rooms SET latitude = 28.6139, longitude = 77.2090 WHERE id = 'your-room-id';
