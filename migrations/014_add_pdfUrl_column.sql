-- Migration: Add pdfUrl and images columns to notes table
-- This migrates from pdf_urls array to single pdfUrl field and adds images alias

-- Add the new pdfUrl column
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS pdfUrl TEXT;

-- Add the images column as alias for image_urls for consistency
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Migrate existing data from pdf_urls[1] to pdfUrl
UPDATE public.notes 
SET pdfUrl = pdf_urls[1] 
WHERE pdf_urls IS NOT NULL AND array_length(pdf_urls, 1) > 0 AND pdfUrl IS NULL;

-- Migrate existing data from image_urls to images
UPDATE public.notes 
SET images = image_urls 
WHERE image_urls IS NOT NULL AND images IS NULL;

-- You can optionally drop the old columns after migration is complete
-- ALTER TABLE public.notes DROP COLUMN pdf_urls;
-- ALTER TABLE public.notes DROP COLUMN image_urls;
