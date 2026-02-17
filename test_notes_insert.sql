-- Test script to verify notes upload will work
-- Run this to check if all required columns exist and data can be inserted

-- Step 1: Check table structure
-- === NOTES TABLE STRUCTURE ===
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

-- Step 2: Test sample insert (this will help identify missing columns)
-- === TESTING SAMPLE INSERT ===
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a real user ID from the users table, or create a temporary one
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        -- No users exist, so let's test the structure without the foreign key constraint
        RAISE NOTICE 'No users found, testing structure without foreign key...';
        
        -- Temporarily disable the foreign key constraint for testing
        ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey;
        ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey1;
        
        -- Test insert with dummy UUID
        INSERT INTO public.notes (
            seller_id,
            title,
            college,
            academic_year,
            course_subject,
            category,
            price,
            description,
            images,
            pdf_urls,
            pdfUrl
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            'Test Notes Title',
            'Test College',
            '12th',
            'Mathematics',
            'Notes',
            99.99,
            'Test description for notes',
            ARRAY['http://example.com/image1.jpg']::TEXT[],
            ARRAY['http://example.com/file1.pdf']::TEXT[],
            'http://example.com/file1.pdf'
        );
        
        RAISE NOTICE '✅ Sample insert successful - table structure is correct';
        
        -- Clean up test record
        DELETE FROM public.notes WHERE title = 'Test Notes Title';
        
        -- Re-add the foreign key constraint
        ALTER TABLE public.notes 
        ADD CONSTRAINT notes_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
    ELSE
        -- Use real user ID for testing
        RAISE NOTICE 'Using real user ID for test: %', test_user_id;
        
        INSERT INTO public.notes (
            seller_id,
            title,
            college,
            academic_year,
            course_subject,
            category,
            price,
            description,
            images,
            pdf_urls,
            pdfUrl
        ) VALUES (
            test_user_id,
            'Test Notes Title',
            'Test College',
            '12th',
            'Mathematics',
            'Notes',
            99.99,
            'Test description for notes',
            ARRAY['http://example.com/image1.jpg']::TEXT[],
            ARRAY['http://example.com/file1.pdf']::TEXT[],
            'http://example.com/file1.pdf'
        );
        
        RAISE NOTICE '✅ Sample insert successful - table structure is correct';
        
        -- Clean up test record
        DELETE FROM public.notes WHERE title = 'Test Notes Title';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
    -- Clean up any partial inserts
    DELETE FROM public.notes WHERE title = 'Test Notes Title';
END $$;

-- Step 3: Check for any problematic constraints
-- === CHECKING CONSTRAINTS ===
SELECT 
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

-- Step 4: Check if seller_id constraint is reasonable
-- === CHECKING USER REFERENCE ===
SELECT 
    '=== CHECKING USER REFERENCE ===' as section,
    'Users table exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users' AND table_schema = 'public'
    ) THEN 'YES' ELSE 'NO' END as users_table_status;

-- === ALL CHECKS COMPLETE ===
SELECT '=== ALL CHECKS COMPLETE ===' as final_status;
