-- Create a PostgreSQL function to handle array insertion for notes
-- This function will properly handle array parameters and casting

CREATE OR REPLACE FUNCTION public.insert_note_with_arrays(
    p_seller_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_price NUMERIC,
    p_images TEXT,
    p_pdf_urls TEXT,
    p_college TEXT,
    p_course_subject TEXT,
    p_academic_year TEXT,
    p_category TEXT,
    p_pdf_url TEXT
) 
RETURNS TABLE(id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
BEGIN
    -- Insert the note with proper array casting
    INSERT INTO public.notes (
        seller_id, 
        title, 
        description, 
        price, 
        images, 
        pdf_urls,
        college, 
        course_subject, 
        academic_year, 
        category, 
        "pdfUrl"
    ) VALUES (
        p_seller_id,
        p_title,
        p_description,
        p_price,
        p_images::text[],  -- Cast string to text array
        p_pdf_urls::text[], -- Cast string to text array
        p_college,
        p_course_subject,
        p_academic_year,
        p_category,
        p_pdf_url
    ) RETURNING notes.id INTO new_id;
    
    -- Return the ID
    RETURN QUERY SELECT new_id;
END;
$$;

-- Also create a simpler function that just executes raw SQL (as backup)
CREATE OR REPLACE FUNCTION public.execute_sql(query TEXT, params JSON DEFAULT '[]')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- This is a simplified version - in production you'd want more security
    -- For now, just return an error since we can't safely execute arbitrary SQL
    RAISE EXCEPTION 'Direct SQL execution not implemented for security reasons';
END;
$$;

-- Test the function with sample data
-- SELECT * FROM public.insert_note_with_arrays(
--     '018f7ff4-dfe0-7e59-8e44-6e8d2b1a3f7a',
--     'Test Function Note',
--     'Testing the PostgreSQL function',
--     25.00,
--     '{"https://example.com/image1.jpg","https://example.com/image2.jpg"}',
--     '{"https://example.com/pdf1.pdf","https://example.com/pdf2.pdf"}',
--     'Test College',
--     'Computer Science',
--     'Year 2',
--     'notes',
--     'https://example.com/pdf1.pdf'
-- );

-- Clean up test data
-- DELETE FROM public.notes WHERE title = 'Test Function Note';
