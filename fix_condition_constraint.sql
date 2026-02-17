-- ============================================================================
-- SAFE FIX: Handle products condition constraint issue
-- This script safely fixes condition values and adds the constraint
-- ============================================================================

-- Step 1: Remove the constraint if it exists (to start fresh)
DO $$ 
BEGIN
    ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_condition_check;
EXCEPTION
    WHEN undefined_object THEN 
        NULL; -- Constraint doesn't exist, continue
END $$;

-- Step 2: Fix all problematic condition values
-- Handle NULL values
UPDATE public.products 
SET condition = 'Used' 
WHERE condition IS NULL;

-- Handle empty strings
UPDATE public.products 
SET condition = 'Used' 
WHERE condition = '';

-- Handle whitespace-only strings
UPDATE public.products 
SET condition = 'Used' 
WHERE trim(condition) = '';

-- Handle common variations (case insensitive)
UPDATE public.products 
SET condition = 'New' 
WHERE lower(trim(condition)) IN ('new', 'brand new', 'mint', 'excellent');

UPDATE public.products 
SET condition = 'Used' 
WHERE lower(trim(condition)) IN ('used', 'good', 'fair', 'working', 'functional', 'ok', 'okay');

UPDATE public.products 
SET condition = 'Refurbished' 
WHERE lower(trim(condition)) IN ('refurbished', 'refurb', 'renewed', 'restored');

-- Step 3: Handle any remaining invalid values
UPDATE public.products 
SET condition = 'Used' 
WHERE condition NOT IN ('New', 'Used', 'Refurbished');

-- Step 4: Verify all conditions are now valid
SELECT 
    'Invalid conditions remaining:' as status,
    COUNT(*) as count
FROM public.products 
WHERE condition NOT IN ('New', 'Used', 'Refurbished');

-- Step 5: Add the constraint
ALTER TABLE public.products 
ADD CONSTRAINT products_condition_check 
CHECK (condition IN ('New', 'Used', 'Refurbished'));

-- Step 6: Verify constraint was added successfully
SELECT 
    'Constraint added successfully' as status,
    constraint_name
FROM information_schema.table_constraints 
WHERE table_name = 'products' 
  AND constraint_name = 'products_condition_check';
