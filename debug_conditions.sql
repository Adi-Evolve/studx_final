-- ============================================================================
-- DEBUG: Check invalid condition values in products table
-- Run this first to see what condition values exist in your database
-- ============================================================================

-- Check all unique condition values in the products table
SELECT 
    condition,
    COUNT(*) as count
FROM public.products 
GROUP BY condition
ORDER BY count DESC;

-- Check specifically for problematic conditions
SELECT 
    id,
    title,
    condition,
    created_at
FROM public.products 
WHERE condition IS NULL 
   OR condition NOT IN ('New', 'Used', 'Refurbished')
LIMIT 10;

-- Check if the constraint already exists
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'products' 
  AND constraint_name = 'products_condition_check';
