-- Fix the pdfUrl column type issue
-- The pdfUrl column is incorrectly set as an array when it should be a simple text field

-- First, let's see what data is currently in the pdfUrl column
SELECT id, title, "pdfUrl", pg_typeof("pdfUrl") as current_type
FROM public.notes 
WHERE "pdfUrl" IS NOT NULL 
LIMIT 5;

-- Fix the pdfUrl column by dropping and recreating it as TEXT
DO $$
BEGIN
    -- Check if pdfUrl exists and is an array
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'pdfUrl' 
        AND data_type = 'ARRAY'
    ) THEN
        RAISE NOTICE 'Found pdfUrl as array type, fixing it...';
        
        -- Create a backup column first
        ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl_backup text[];
        UPDATE public.notes SET pdfUrl_backup = "pdfUrl" WHERE "pdfUrl" IS NOT NULL;
        
        -- Drop the incorrect array column
        ALTER TABLE public.notes DROP COLUMN IF EXISTS "pdfUrl";
        
        -- Recreate as simple text column
        ALTER TABLE public.notes ADD COLUMN "pdfUrl" TEXT;
        
        -- Migrate data back (take first element if it was an array)
        UPDATE public.notes 
        SET "pdfUrl" = pdfUrl_backup[1] 
        WHERE pdfUrl_backup IS NOT NULL AND array_length(pdfUrl_backup, 1) > 0;
        
        -- Drop the backup column
        ALTER TABLE public.notes DROP COLUMN IF EXISTS pdfUrl_backup;
        
        RAISE NOTICE 'Successfully fixed pdfUrl column as TEXT type';
    ELSE
        RAISE NOTICE 'pdfUrl column is already correct type or does not exist';
    END IF;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error fixing pdfUrl column: %', SQLERRM;
END $$;

-- Verify the fix
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND column_name = 'pdfUrl';

-- Test inserting a record with the fixed schema
DO $$
DECLARE
    test_seller_id UUID;
    test_id UUID;
BEGIN
    -- Get an existing user ID
    SELECT id INTO test_seller_id FROM public.users LIMIT 1;
    
    IF test_seller_id IS NULL THEN
        RAISE NOTICE 'No users found, cannot test';
        RETURN;
    END IF;
    
    -- Test inserting with pdfUrl as text
    INSERT INTO public.notes (
        seller_id, title, description, price, college, course_subject, academic_year, category, "pdfUrl"
    ) VALUES (
        test_seller_id,
        'Test Fixed pdfUrl',
        'Testing pdfUrl as text field',
        15.00,
        'Test College',
        'Test Subject',
        'Test Year',
        'notes',
        'https://example.com/test.pdf'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Successfully inserted record with pdfUrl as text, ID: %', test_id;
    
    -- Verify what was saved
    DECLARE
        saved_pdfUrl text;
        saved_type text;
    BEGIN
        SELECT "pdfUrl", pg_typeof("pdfUrl") INTO saved_pdfUrl, saved_type
        FROM public.notes WHERE id = test_id;
        
        RAISE NOTICE 'Saved pdfUrl: %, Type: %', saved_pdfUrl, saved_type;
    END;
    
    -- Clean up
    DELETE FROM public.notes WHERE id = test_id;
    RAISE NOTICE 'Cleaned up test record';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Test insertion failed: %', SQLERRM;
END $$;

-- Show final column structure
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND column_name IN ('pdfUrl', 'images', 'pdf_urls')
ORDER BY column_name;
