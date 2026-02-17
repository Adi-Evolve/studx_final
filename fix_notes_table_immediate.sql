-- ============================================================================
-- IMMEDIATE FIX FOR NOTES AND ROOMS TABLES - Run this first
-- ============================================================================
-- This script ensures the notes and rooms tables exist with all required columns
-- Safe to run on existing data

-- First, check if notes table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    price NUMERIC(10, 2),
    college TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all required columns safely (won't error if they already exist)
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Notes';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS course_subject TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    price NUMERIC(10, 2),
    college TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all required columns for rooms table
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Rooms';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_type TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS occupancy TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact1 TEXT;
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

-- Update any NULL values to prevent NOT NULL constraint issues
-- Notes table
UPDATE public.notes SET 
    seller_id = '00000000-0000-0000-0000-000000000000'::uuid 
    WHERE seller_id IS NULL;

UPDATE public.notes SET title = 'Untitled' WHERE title IS NULL;
UPDATE public.notes SET price = 0 WHERE price IS NULL;
UPDATE public.notes SET college = 'Unknown' WHERE college IS NULL;
UPDATE public.notes SET category = 'Notes' WHERE category IS NULL;
UPDATE public.notes SET academic_year = 'Undergraduate' WHERE academic_year IS NULL;
UPDATE public.notes SET course_subject = 'General' WHERE course_subject IS NULL;

-- Rooms table
UPDATE public.rooms SET 
    seller_id = '00000000-0000-0000-0000-000000000000'::uuid 
    WHERE seller_id IS NULL;

UPDATE public.rooms SET title = 'Untitled Room' WHERE title IS NULL;
UPDATE public.rooms SET price = 0 WHERE price IS NULL;
UPDATE public.rooms SET college = 'Unknown' WHERE college IS NULL;
UPDATE public.rooms SET category = 'Rooms' WHERE category IS NULL;
UPDATE public.rooms SET room_type = 'Single' WHERE room_type IS NULL;
UPDATE public.rooms SET occupancy = '1' WHERE occupancy IS NULL;
UPDATE public.rooms SET owner_name = 'Unknown' WHERE owner_name IS NULL;
UPDATE public.rooms SET contact1 = 'Contact seller' WHERE contact1 IS NULL;

-- Now safely add NOT NULL constraints to required columns
-- Notes table
ALTER TABLE public.notes ALTER COLUMN seller_id SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN price SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN college SET NOT NULL;

-- Rooms table
ALTER TABLE public.rooms ALTER COLUMN seller_id SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN price SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN college SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN room_type SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN occupancy SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN owner_name SET NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN contact1 SET NOT NULL;

-- Create indexes for better performance
-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_seller_id ON public.notes(seller_id);
CREATE INDEX IF NOT EXISTS idx_notes_college ON public.notes(college);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_seller_id ON public.rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_rooms_college ON public.rooms(college);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
DROP POLICY IF EXISTS "Users can view all notes" ON public.notes;
CREATE POLICY "Users can view all notes" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE 
USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE 
USING (auth.uid() = seller_id);

-- RLS Policies for rooms
DROP POLICY IF EXISTS "Users can view all rooms" ON public.rooms;
CREATE POLICY "Users can view all rooms" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own rooms" ON public.rooms;
CREATE POLICY "Users can insert their own rooms" ON public.rooms FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own rooms" ON public.rooms;
CREATE POLICY "Users can update their own rooms" ON public.rooms FOR UPDATE 
USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own rooms" ON public.rooms;
CREATE POLICY "Users can delete their own rooms" ON public.rooms FOR DELETE 
USING (auth.uid() = seller_id);

-- Migrate any existing single PDF URLs to the new array format
UPDATE public.notes 
SET pdf_urls = ARRAY[pdfUrl] 
WHERE pdfUrl IS NOT NULL 
AND (pdf_urls IS NULL OR array_length(pdf_urls, 1) IS NULL);

COMMENT ON TABLE public.notes IS 'Study materials and notes uploaded by students';
COMMENT ON TABLE public.rooms IS 'Room rentals and hostel listings posted by users';
