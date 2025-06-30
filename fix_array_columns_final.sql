-- Ensure the notes table has proper array columns
-- This will fix any column type mismatches

-- First, check what columns exist
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
AND column_name IN ('images', 'pdf_urls', 'image_urls');

-- Add the correct array columns if they don't exist
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images text[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls text[];

-- If old columns exist with wrong types, we need to handle the conversion
DO $$
BEGIN
    -- Check if images column exists but is not an array
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'images' 
        AND data_type != 'ARRAY'
    ) THEN
        -- Drop and recreate as array
        ALTER TABLE public.notes DROP COLUMN IF EXISTS images;
        ALTER TABLE public.notes ADD COLUMN images text[];
        RAISE NOTICE 'Recreated images column as text array';
    END IF;
    
    -- Check if pdf_urls column exists but is not an array
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'pdf_urls' 
        AND data_type != 'ARRAY'
    ) THEN
        -- Drop and recreate as array
        ALTER TABLE public.notes DROP COLUMN IF EXISTS pdf_urls;
        ALTER TABLE public.notes ADD COLUMN pdf_urls text[];
        RAISE NOTICE 'Recreated pdf_urls column as text array';
    END IF;
    
    -- Migrate data from old image_urls column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'image_urls'
    ) THEN
        -- Copy data from image_urls to images if images is empty
        UPDATE public.notes 
        SET images = image_urls 
        WHERE images IS NULL AND image_urls IS NOT NULL;
        
        RAISE NOTICE 'Migrated data from image_urls to images';
    END IF;
    
END $$;

-- Verify the final column types
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
AND column_name IN ('images', 'pdf_urls', 'image_urls')
ORDER BY column_name;

-- Test inserting with arrays using an existing user
DO $$
DECLARE
    existing_user_id UUID;
    test_note_id UUID;
BEGIN
    -- Get an existing user ID
    SELECT id INTO existing_user_id 
    FROM public.users 
    LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No users found in users table, skipping array insertion test';
    ELSE
        -- Test array insertion
        INSERT INTO public.notes (
            seller_id, title, description, price, images, pdf_urls,
            college, course_subject, academic_year, category
        ) VALUES (
            existing_user_id,
            'Test Array Columns',
            'Testing proper array insertion',
            15.00,
            ARRAY['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
            ARRAY['https://example.com/test1.pdf', 'https://example.com/test2.pdf'],
            'Test College',
            'Test Subject', 
            'Test Year',
            'notes'
        ) RETURNING id INTO test_note_id;
        
        RAISE NOTICE 'Successfully inserted test note with ID: % and arrays', test_note_id;
        
        -- Verify the arrays were saved correctly
        DECLARE
            saved_images text[];
            saved_pdfs text[];
        BEGIN
            SELECT images, pdf_urls INTO saved_images, saved_pdfs
            FROM public.notes WHERE id = test_note_id;
            
            RAISE NOTICE 'Saved images array: %', saved_images;
            RAISE NOTICE 'Saved PDF URLs array: %', saved_pdfs;
        END;
        
        -- Clean up test record
        DELETE FROM public.notes WHERE id = test_note_id;
        RAISE NOTICE 'Cleaned up test record';
    END IF;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Array insertion test failed: %', SQLERRM;
END $$;
