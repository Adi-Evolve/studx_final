-- Check ALL columns in the notes table to see what's causing the array literal error
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
ORDER BY ordinal_position;

-- Specifically check for any columns that might be incorrectly set as arrays
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND (data_type = 'ARRAY' OR udt_name LIKE '%[]')
ORDER BY column_name;

-- Check if pdfUrl column has the wrong type
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND column_name = 'pdfUrl';

-- Test what columns accept which data types
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
    
    -- Test inserting minimal record to isolate the problem
    BEGIN
        INSERT INTO public.notes (
            seller_id, title, description, price, college, course_subject, academic_year, category
        ) VALUES (
            test_seller_id,
            'Minimal Test Record',
            'Testing minimal insertion',
            10.00,
            'Test College',
            'Test Subject',
            'Test Year',
            'notes'
        ) RETURNING id INTO test_id;
        
        RAISE NOTICE 'Minimal record inserted successfully with ID: %', test_id;
        
        -- Now test adding pdfUrl
        BEGIN
            UPDATE public.notes 
            SET "pdfUrl" = 'https://example.com/test.pdf'
            WHERE id = test_id;
            RAISE NOTICE 'pdfUrl updated successfully';
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'pdfUrl update failed: %', SQLERRM;
        END;
        
        -- Clean up
        DELETE FROM public.notes WHERE id = test_id;
        RAISE NOTICE 'Cleaned up test record';
        
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Minimal insertion failed: %', SQLERRM;
    END;
    
END $$;
