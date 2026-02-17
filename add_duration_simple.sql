-- Simple version: Add duration column to rooms table
-- This version is compatible with all PostgreSQL versions

-- Step 1: Add the duration column
ALTER TABLE public.rooms 
ADD COLUMN duration TEXT DEFAULT 'monthly';

-- Step 2: Update existing records to have the default value
UPDATE public.rooms 
SET duration = 'monthly' 
WHERE duration IS NULL;

-- Step 3: Add check constraint (run this separately if the above works)
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_duration_check 
CHECK (duration IN ('monthly', 'yearly'));

-- Step 4: Add index for better performance
CREATE INDEX idx_rooms_duration ON public.rooms(duration);

-- Step 5: Add comment to document the column
COMMENT ON COLUMN public.rooms.duration IS 'Fee payment duration: monthly or yearly';
