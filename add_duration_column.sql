-- Add duration column to rooms table for fees period (monthly/yearly)

-- Add the duration column to the rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'monthly';

-- Add a check constraint to ensure only valid values are stored
-- First drop constraint if it exists, then create it
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    BEGIN
        ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_duration_check;
    EXCEPTION
        WHEN undefined_object THEN
            -- Constraint doesn't exist, continue
            NULL;
    END;
    
    -- Add the constraint
    ALTER TABLE public.rooms 
    ADD CONSTRAINT rooms_duration_check 
    CHECK (duration IN ('monthly', 'yearly'));
END $$;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_duration ON public.rooms(duration);

-- Update existing records to have a default value (optional)
UPDATE public.rooms 
SET duration = 'monthly' 
WHERE duration IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN public.rooms.duration IS 'Fee payment duration: monthly or yearly';

-- Verify the column was added successfully
-- You can run this to check:
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'rooms' AND column_name = 'duration';
