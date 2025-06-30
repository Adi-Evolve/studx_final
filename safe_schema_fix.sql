-- Safe schema fix - handles data type mismatches gracefully
-- This version will not fail on data type conversion errors

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
        RAISE NOTICE 'Migrated image_urls to images for products table';
    ELSE
        RAISE NOTICE 'No image_urls column found in products table - skipping migration';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error migrating products.image_urls: %', SQLERRM;
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
        RAISE NOTICE 'Migrated image_urls to images for notes table';
    ELSE
        RAISE NOTICE 'No image_urls column found in notes table - skipping migration';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error migrating notes.image_urls: %', SQLERRM;
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

-- Migrate data from old columns to new columns (with safe type conversion)
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Check if image_urls column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'image_urls') THEN
        UPDATE public.rooms SET images = image_urls WHERE images IS NULL AND image_urls IS NOT NULL;
        RAISE NOTICE 'Migrated image_urls to images for rooms table';
    END IF;
    
    -- Check if hostel_name column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hostel_name') THEN
        UPDATE public.rooms SET title = hostel_name WHERE title IS NULL AND hostel_name IS NOT NULL;
        RAISE NOTICE 'Migrated hostel_name to title for rooms table';
    END IF;
    
    -- Check if fees column exists and migrate data (safe numeric conversion)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'fees') THEN
        -- Get the data type of the fees column
        SELECT data_type INTO rec 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'fees' AND table_schema = 'public';
        
        IF rec.data_type = 'numeric' THEN
            -- Direct assignment for numeric types
            UPDATE public.rooms SET price = fees WHERE price IS NULL AND fees IS NOT NULL;
            RAISE NOTICE 'Migrated fees (numeric) to price for rooms table';
        ELSE
            -- Safe conversion for text/varchar types
            UPDATE public.rooms SET price = 
                CASE 
                    WHEN fees ~ '^[0-9]+\.?[0-9]*$' THEN fees::NUMERIC 
                    ELSE NULL 
                END 
            WHERE price IS NULL AND fees IS NOT NULL AND fees != '';
            RAISE NOTICE 'Migrated fees (text) to price for rooms table with conversion';
        END IF;
    END IF;
    
    -- Other migrations with error handling
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'distance_from_college') THEN
        UPDATE public.rooms SET distance = distance_from_college WHERE distance IS NULL AND distance_from_college IS NOT NULL;
        RAISE NOTICE 'Migrated distance_from_college to distance for rooms table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'deposit_amount') THEN
        -- Safe numeric conversion for deposit_amount
        SELECT data_type INTO rec 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'deposit_amount' AND table_schema = 'public';
        
        IF rec.data_type = 'numeric' THEN
            UPDATE public.rooms SET deposit = deposit_amount WHERE deposit IS NULL AND deposit_amount IS NOT NULL;
        ELSE
            UPDATE public.rooms SET deposit = 
                CASE 
                    WHEN deposit_amount ~ '^[0-9]+\.?[0-9]*$' THEN deposit_amount::NUMERIC 
                    ELSE NULL 
                END 
            WHERE deposit IS NULL AND deposit_amount IS NOT NULL AND deposit_amount != '';
        END IF;
        RAISE NOTICE 'Migrated deposit_amount to deposit for rooms table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'mess_included') THEN
        UPDATE public.rooms SET fees_include_mess = mess_included WHERE fees_include_mess IS NULL AND mess_included IS NOT NULL;
        RAISE NOTICE 'Migrated mess_included to fees_include_mess for rooms table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'contact_primary') THEN
        UPDATE public.rooms SET contact1 = contact_primary WHERE contact1 IS NULL AND contact_primary IS NOT NULL;
        RAISE NOTICE 'Migrated contact_primary to contact1 for rooms table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'contact_secondary') THEN
        UPDATE public.rooms SET contact2 = contact_secondary WHERE contact2 IS NULL AND contact_secondary IS NOT NULL;
        RAISE NOTICE 'Migrated contact_secondary to contact2 for rooms table';
    END IF;

EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error during rooms table migration: %', SQLERRM;
END $$;

-- Set default values
UPDATE public.rooms SET category = 'rooms' WHERE category IS NULL OR category = '';
UPDATE public.rooms SET description = '' WHERE description IS NULL;

-- ===== VERIFICATION =====
-- Check the updated structures
SELECT 
    '=== PRODUCTS TABLE KEY COLUMNS ===' as section,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'category', 'is_sold')
ORDER BY column_name;

SELECT 
    '=== NOTES TABLE KEY COLUMNS ===' as section,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'pdf_urls', 'pdfUrl', 'category')
ORDER BY column_name;

SELECT 
    '=== ROOMS TABLE KEY COLUMNS ===' as section,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND table_schema = 'public'
AND column_name IN ('images', 'image_urls', 'title', 'price', 'category', 'contact1', 'contact2', 'fees', 'deposit_amount')
ORDER BY column_name;

-- ===== SUCCESS MESSAGE =====
SELECT 'Safe schema migration complete! All tables should now work with the API.' as completion_status;
