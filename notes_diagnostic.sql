-- Comprehensive notes table diagnostic
-- Check table structure and test array insertion

-- 1. Check table structure
SELECT 
    '=== NOTES TABLE STRUCTURE ===' as section,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check for any constraints that might interfere
SELECT 
    '=== TABLE CONSTRAINTS ===' as section,
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notes' 
AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Test array insertion directly in database
-- This will tell us if the issue is in the database schema or the API
DO $$
DECLARE
    test_user_id UUID;
    test_note_id UUID;
BEGIN
    -- Get a user ID
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found, creating a test user...';
        INSERT INTO public.users (id, name, email, college) 
        VALUES (
            gen_random_uuid(),
            'Test User',
            'test@example.com',
            'Test College'
        ) RETURNING id INTO test_user_id;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', test_user_id;
    
    -- Test inserting a note with arrays
    INSERT INTO public.notes (
        seller_id,
        title,
        description,
        price,
        images,
        pdf_urls,
        "pdfUrl",
        college,
        course_subject,
        academic_year,
        category
    ) VALUES (
        test_user_id,
        'Database Test Note',
        'Testing array insertion directly in database',
        15.00,
        ARRAY['https://example.com/test-image-1.jpg', 'https://example.com/test-image-2.jpg'],
        ARRAY['https://example.com/test-file-1.pdf', 'https://example.com/test-file-2.pdf'],
        'https://example.com/test-file-1.pdf',
        'Test College',
        'Computer Science',
        '3rd Year',
        'notes'
    ) RETURNING id INTO test_note_id;
    
    RAISE NOTICE '✅ Test note inserted successfully with ID: %', test_note_id;
    
    -- Verify the inserted data
    PERFORM pg_sleep(0.1); -- Small delay to ensure data is committed
    
    SELECT 
        '=== INSERTED TEST NOTE ===' as section,
        id,
        title,
        images,
        pdf_urls,
        "pdfUrl"
    FROM public.notes 
    WHERE id = test_note_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insertion failed: %', SQLERRM;
END $$;

-- 4. Show recent notes to verify structure
SELECT 
    '=== RECENT NOTES ===' as section,
    id,
    title,
    images,
    pdf_urls,
    "pdfUrl",
    created_at
FROM public.notes 
ORDER BY created_at DESC 
LIMIT 5;
