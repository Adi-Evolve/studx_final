-- Migration: Fix table structure inconsistencies for rooms table
-- This adds missing columns and ensures consistency

-- Add images column to rooms table for consistency
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Migrate existing data from image_urls to images
UPDATE public.rooms 
SET images = image_urls 
WHERE image_urls IS NOT NULL AND images IS NULL;
