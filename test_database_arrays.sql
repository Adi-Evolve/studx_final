-- Check the exact schema of the notes table
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
ORDER BY ordinal_position;

-- Check if there are any text array columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
AND data_type = 'ARRAY';

-- Try a simple array insertion test
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Test inserting a simple note with arrays
    INSERT INTO public.notes (
        seller_id,
        title,
        description,
        price,
        college,
        course_subject,
        academic_year,
        category
    ) VALUES (
        '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a',
        'Test Array Note ' || NOW(),
        'Testing array insertion',
        10.00,
        'Test College',
        'Test Subject',
        'Test Year',
        'notes'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Inserted base note with ID: %', test_id;
    
    -- Now try to update with arrays
    UPDATE public.notes 
    SET 
        images = ARRAY['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
        pdf_urls = ARRAY['https://example.com/test1.pdf', 'https://example.com/test2.pdf']
    WHERE id = test_id;
    
    RAISE NOTICE 'Successfully updated arrays for ID: %', test_id;
    
    -- Clean up
    DELETE FROM public.notes WHERE id = test_id;
    RAISE NOTICE 'Cleaned up test record';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error during test: %', SQLERRM;
END $$;
