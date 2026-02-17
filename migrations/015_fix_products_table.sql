-- Migration: Fix table structure inconsistencies for products table
-- This adds missing columns and ensures consistency

-- Add images column to products table for consistency
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add category column to products table (might already exist from migration 002)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Migrate existing data from image_urls to images
UPDATE public.products 
SET images = image_urls 
WHERE image_urls IS NOT NULL AND images IS NULL;

-- Check if is_sold column exists, add if not
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
