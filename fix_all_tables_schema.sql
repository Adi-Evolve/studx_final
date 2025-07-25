-- Comprehensive schema fix for all tables (products, notes, rooms)
-- This script will align the database schema with the API expectations

-- ===== PRODUCTS TABLE FIXES =====
-- Add missing columns and fix column names
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- Migrate data from old columns to new columns (only if they exist)
DO $$
BEGIN
    -- Check if image_urls column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_urls') THEN
        UPDATE public.products SET images = image_urls WHERE images IS NULL AND image_urls IS NOT NULL;
    END IF;
END $$;

-- Add default category if missing
UPDATE public.products SET category = 'General' WHERE category IS NULL OR category = '';

-- ===== NOTES TABLE FIXES =====
-- Ensure the notes table has the correct columns (should already be done from previous fixes)
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category TEXT;

-- Migrate data from old columns if they exist
DO $$
BEGIN
    -- Check if image_urls column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'image_urls') THEN
        UPDATE public.notes SET images = image_urls WHERE images IS NULL AND image_urls IS NOT NULL;
    END IF;
END $$;

-- Set default category for notes
UPDATE public.notes SET category = 'notes' WHERE category IS NULL OR category = '';

-- ===== ROOMS TABLE FIXES =====
-- Add missing columns that the API expects
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_type TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS occupancy TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS distance TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS deposit NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS fees_include_mess BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS mess_fees NUMERIC(10, 2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact1 TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS contact2 TEXT;

-- Migrate data from old columns to new columns (only if they exist)
DO $$
BEGIN
    -- Check if image_urls column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'image_urls') THEN
        UPDATE public.rooms SET images = image_urls WHERE images IS NULL AND image_urls IS NOT NULL;
    END IF;
    
    -- Check if hostel_name column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hostel_name') THEN
        UPDATE public.rooms SET title = hostel_name WHERE title IS NULL AND hostel_name IS NOT NULL;
    END IF;
    
    -- Check if fees column exists and migrate data (with type conversion)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'fees') THEN
        UPDATE public.rooms SET price = CASE 
            WHEN fees ~ '^[0-9]+\.?[0-9]*$' THEN fees::NUMERIC 
            ELSE NULL 
        END 
        WHERE price IS NULL AND fees IS NOT NULL AND fees != '';
    END IF;
    
    -- Check if distance_from_college column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'distance_from_college') THEN
        UPDATE public.rooms SET distance = distance_from_college WHERE distance IS NULL AND distance_from_college IS NOT NULL;
    END IF;
    
    -- Check if deposit_amount column exists and migrate data (with type conversion)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'deposit_amount') THEN
        UPDATE public.rooms SET deposit = CASE 
            WHEN deposit_amount ~ '^[0-9]+\.?[0-9]*$' THEN deposit_amount::NUMERIC 
            ELSE NULL 
        END 
        WHERE deposit IS NULL AND deposit_amount IS NOT NULL AND deposit_amount != '';
    END IF;
    
    -- Check if mess_included column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'mess_included') THEN
        UPDATE public.rooms SET fees_include_mess = mess_included WHERE fees_include_mess IS NULL AND mess_included IS NOT NULL;
    END IF;
    
    -- Check if contact_primary column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'contact_primary') THEN
        UPDATE public.rooms SET contact1 = contact_primary WHERE contact1 IS NULL AND contact_primary IS NOT NULL;
    END IF;
    
    -- Check if contact_secondary column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'contact_secondary') THEN
        UPDATE public.rooms SET contact2 = contact_secondary WHERE contact2 IS NULL AND contact_secondary IS NOT NULL;
    END IF;
END $$;

-- Set default values
UPDATE public.rooms SET category = 'rooms' WHERE category IS NULL OR category = '';
UPDATE public.rooms SET description = '' WHERE description IS NULL;

-- ===== VERIFICATION =====
-- Check the updated structures
SELECT 
    '=== PRODUCTS TABLE STRUCTURE ===' as section,
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'category', 'is_sold')
ORDER BY ordinal_position;

SELECT 
    '=== NOTES TABLE STRUCTURE ===' as section,
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'pdf_urls', 'pdfUrl', 'category')
ORDER BY ordinal_position;

SELECT 
    '=== ROOMS TABLE STRUCTURE ===' as section,
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'title', 'price', 'category', 'contact1', 'contact2')
ORDER BY ordinal_position;

-- ===== SUCCESS MESSAGE =====
SELECT 'Schema alignment complete! All tables should now work with the API.' as completion_status;
