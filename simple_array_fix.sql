-- ============================================================================
-- SIMPLE ARRAY COLUMN FIX - No Type Changes
-- ============================================================================
-- This script fixes array issues without altering column types

-- Check current column types in notes table
SELECT 
    'Current Schema' as check_type,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'notes'
    AND column_name IN ('images', 'pdf_urls', 'pdfUrl')
ORDER BY column_name;

-- Add columns if they don't exist (safe)
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdf_urls TEXT[];
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pdfUrl TEXT;

-- Set default empty arrays for NULL values
UPDATE public.notes SET images = '{}' WHERE images IS NULL;
UPDATE public.notes SET pdf_urls = '{}' WHERE pdf_urls IS NULL;

-- Test a simple array insert
DO $$
DECLARE
    test_user_id UUID;
    test_note_id UUID;
BEGIN
    -- Get a user ID for testing
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found, creating test user';
        test_user_id := gen_random_uuid();
        INSERT INTO public.users (id, name, email) VALUES 
        (test_user_id, 'Test User', 'test@example.com');
    END IF;
    
    -- Try to insert a test record with arrays
    INSERT INTO public.notes (
        seller_id,
        title,
        price,
        college,
        course_subject,
        academic_year,
        category,
        images,
        pdf_urls
    ) VALUES (
        test_user_id,
        'Test Array Insert - Simple',
        50.00,
        'Test College',
        'Test Subject',
        'Test Year',
        'Notes',
        ARRAY['https://example.com/image1.jpg']::TEXT[],
        ARRAY['https://example.com/pdf1.pdf']::TEXT[]
    ) RETURNING id INTO test_note_id;
    
    RAISE NOTICE 'Test array insert successful! Note ID: %', test_note_id;
    
    -- Clean up test record
    DELETE FROM public.notes WHERE id = test_note_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test array insert failed: %', SQLERRM;
END $$;

-- Final verification
SELECT 
    'Final Schema Check' as check_type,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'notes'
    AND column_name IN ('images', 'pdf_urls', 'pdfUrl')
ORDER BY column_name;
