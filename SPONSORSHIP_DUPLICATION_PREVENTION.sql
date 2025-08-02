-- 🚫 SPONSORSHIP DUPLICATION PREVENTION SYSTEM
-- This file ensures that duplicate sponsorships cannot occur in the system

-- 1. Verify the unique constraint exists (should already be there)
DO $$
BEGIN
    -- Check if the unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sponsorship_sequences_item_id_item_type_key' 
        AND table_name = 'sponsorship_sequences'
    ) THEN
        -- Add the unique constraint if it doesn't exist
        ALTER TABLE public.sponsorship_sequences 
        ADD CONSTRAINT sponsorship_sequences_item_id_item_type_key 
        UNIQUE (item_id, item_type);
        
        RAISE NOTICE 'Added unique constraint to prevent duplicate sponsorships';
    ELSE
        RAISE NOTICE 'Unique constraint already exists - duplicate sponsorships are prevented';
    END IF;
END $$;

-- 2. Add a function to safely insert sponsorships without duplicates
CREATE OR REPLACE FUNCTION public.safe_insert_sponsorship(
    p_item_id BIGINT,
    p_item_type TEXT,
    p_title TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_existing_count INT;
    v_next_slot INT;
    v_new_sponsorship_id BIGINT;
BEGIN
    -- Check if item is already sponsored
    SELECT COUNT(*) INTO v_existing_count
    FROM public.sponsorship_sequences
    WHERE item_id = p_item_id AND item_type = p_item_type;
    
    IF v_existing_count > 0 THEN
        -- Item is already sponsored
        v_result := jsonb_build_object(
            'success', false,
            'error', 'DUPLICATE_SPONSORSHIP',
            'message', 'This item is already sponsored',
            'item_id', p_item_id,
            'item_type', p_item_type
        );
        RETURN v_result;
    END IF;
    
    -- Get the next available slot
    SELECT COALESCE(MAX(slot), 0) + 1 INTO v_next_slot
    FROM public.sponsorship_sequences;
    
    -- Insert the new sponsorship
    INSERT INTO public.sponsorship_sequences (item_id, item_type, slot, title, is_active)
    VALUES (p_item_id, p_item_type, v_next_slot, p_title, true)
    RETURNING id INTO v_new_sponsorship_id;
    
    -- Return success result
    v_result := jsonb_build_object(
        'success', true,
        'sponsorship_id', v_new_sponsorship_id,
        'slot', v_next_slot,
        'item_id', p_item_id,
        'item_type', p_item_type,
        'message', 'Sponsorship added successfully'
    );
    
    RETURN v_result;
    
EXCEPTION 
    WHEN unique_violation THEN
        -- Handle race condition where another process inserted the same item
        v_result := jsonb_build_object(
            'success', false,
            'error', 'DUPLICATE_SPONSORSHIP',
            'message', 'This item is already sponsored (race condition detected)',
            'item_id', p_item_id,
            'item_type', p_item_type
        );
        RETURN v_result;
    WHEN OTHERS THEN
        -- Handle any other errors
        v_result := jsonb_build_object(
            'success', false,
            'error', 'DATABASE_ERROR',
            'message', SQLERRM,
            'item_id', p_item_id,
            'item_type', p_item_type
        );
        RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add a function to safely bulk insert sponsorships
CREATE OR REPLACE FUNCTION public.safe_bulk_insert_sponsorships(
    sponsorship_data JSONB
) RETURNS JSONB AS $$
DECLARE
    v_item JSONB;
    v_result JSONB;
    v_results JSONB[] := '{}';
    v_success_count INT := 0;
    v_duplicate_count INT := 0;
    v_error_count INT := 0;
    v_individual_result JSONB;
BEGIN
    -- Process each item in the sponsorship data array
    FOR v_item IN SELECT * FROM jsonb_array_elements(sponsorship_data)
    LOOP
        -- Call the safe insert function for each item
        SELECT public.safe_insert_sponsorship(
            (v_item->>'item_id')::BIGINT,
            v_item->>'item_type',
            v_item->>'title'
        ) INTO v_individual_result;
        
        -- Add to results array
        v_results := array_append(v_results, v_individual_result);
        
        -- Count results
        IF (v_individual_result->>'success')::BOOLEAN THEN
            v_success_count := v_success_count + 1;
        ELSIF v_individual_result->>'error' = 'DUPLICATE_SPONSORSHIP' THEN
            v_duplicate_count := v_duplicate_count + 1;
        ELSE
            v_error_count := v_error_count + 1;
        END IF;
    END LOOP;
    
    -- Return summary result
    v_result := jsonb_build_object(
        'success', v_success_count > 0,
        'total_items', jsonb_array_length(sponsorship_data),
        'success_count', v_success_count,
        'duplicate_count', v_duplicate_count,
        'error_count', v_error_count,
        'results', array_to_json(v_results),
        'message', 
            CASE 
                WHEN v_success_count = 0 AND v_duplicate_count > 0 THEN 'All items were already sponsored'
                WHEN v_success_count > 0 AND v_duplicate_count > 0 THEN 
                    format('%s items added, %s duplicates skipped', v_success_count, v_duplicate_count)
                WHEN v_success_count > 0 THEN 
                    format('%s items added successfully', v_success_count)
                ELSE 'No items were added'
            END
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add a view to easily check for duplicate sponsorships
CREATE OR REPLACE VIEW public.sponsorship_duplicates AS
SELECT 
    item_id,
    item_type,
    COUNT(*) as duplicate_count,
    array_agg(id) as sponsorship_ids,
    array_agg(slot) as slots
FROM public.sponsorship_sequences
GROUP BY item_id, item_type
HAVING COUNT(*) > 1;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_sequences_active 
ON public.sponsorship_sequences(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sponsorship_sequences_type_active 
ON public.sponsorship_sequences(item_type, is_active) 
WHERE is_active = true;

-- 6. Grant permissions for the functions
GRANT EXECUTE ON FUNCTION public.safe_insert_sponsorship(BIGINT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_bulk_insert_sponsorships(JSONB) TO authenticated;
GRANT SELECT ON public.sponsorship_duplicates TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.safe_insert_sponsorship IS 'Safely inserts a sponsorship without creating duplicates. Returns JSON with success status and details.';
COMMENT ON FUNCTION public.safe_bulk_insert_sponsorships IS 'Safely inserts multiple sponsorships in bulk, handling duplicates gracefully. Returns JSON summary.';
COMMENT ON VIEW public.sponsorship_duplicates IS 'Shows any duplicate sponsorships that may exist (should be empty if constraints work properly)';

-- Test the constraint by trying to insert a duplicate (this should fail)
DO $$
BEGIN
    -- This should work
    INSERT INTO public.sponsorship_sequences (item_id, item_type, slot, title) 
    VALUES (99999, 'product', 999, 'Test Item') 
    ON CONFLICT (item_id, item_type) DO NOTHING;
    
    -- This should be prevented by the unique constraint
    BEGIN
        INSERT INTO public.sponsorship_sequences (item_id, item_type, slot, title) 
        VALUES (99999, 'product', 1000, 'Test Item Duplicate');
        RAISE NOTICE 'ERROR: Duplicate sponsorship was allowed! Constraint is not working!';
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE NOTICE 'SUCCESS: Duplicate sponsorship was properly prevented by database constraint';
    END;
    
    -- Clean up test data
    DELETE FROM public.sponsorship_sequences WHERE item_id = 99999 AND item_type = 'product';
    
END $$;

-- Final verification
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'WARNING: Duplicate sponsorships found!'
        ELSE 'SUCCESS: No duplicate sponsorships found'
    END as status,
    COUNT(*) as duplicate_groups
FROM public.sponsorship_duplicates;
