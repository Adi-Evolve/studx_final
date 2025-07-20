-- Add fees_period column to rooms table to store whether fees are monthly or yearly
-- This column will store 'Monthly' or 'Yearly' values (matching the form convention)

-- Add the fees_period column with default value 'Monthly'
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS fees_period TEXT DEFAULT 'Monthly' 
CHECK (fees_period IN ('Monthly', 'Yearly'));

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.rooms.fees_period IS 'Specifies whether the room fees are charged Monthly or Yearly. Valid values: Monthly, Yearly';

-- Update existing records to have the default Monthly fee period
UPDATE public.rooms 
SET fees_period = 'Monthly' 
WHERE fees_period IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.rooms 
ALTER COLUMN fees_period SET NOT NULL;
