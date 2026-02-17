-- ============================================================================
-- StudX: Add Flat Support to Rooms Table
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================================

-- 1. Add category column to distinguish between Rooms/Hostel and Flat
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Rooms/Hostel';

-- 2. Add title column (used by the form for property name)
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS title TEXT;

-- 3. Add flat-specific columns
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS total_floors INTEGER;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS furnished_status TEXT DEFAULT 'Unfurnished';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS area_sqft TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_balcony BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE;

-- 4. Add status and timestamp columns if missing
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS deposit NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS distance TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'monthly';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact1 TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact2 TEXT;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);
CREATE INDEX IF NOT EXISTS idx_rooms_seller_id ON public.rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_is_sold ON public.rooms(is_sold);

-- 6. Update existing records with NULL category to default
UPDATE public.rooms SET category = 'Rooms/Hostel' WHERE category IS NULL;

-- 7. Verify migration
SELECT 
    'Migration Complete!' AS status,
    COUNT(*) AS total_rooms,
    COUNT(*) FILTER (WHERE category = 'Rooms/Hostel') AS hostel_count,
    COUNT(*) FILTER (WHERE category = 'Flat') AS flat_count
FROM public.rooms;
