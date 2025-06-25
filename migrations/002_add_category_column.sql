-- Add category column to regular_products table
ALTER TABLE public.regular_products
ADD COLUMN category TEXT;

-- Add category column to notes table
ALTER TABLE public.notes
ADD COLUMN category TEXT;

-- Add category column to rooms table
ALTER TABLE public.rooms
ADD COLUMN category TEXT;
