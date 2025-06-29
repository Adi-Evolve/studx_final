-- Create storage buckets for the StudXchange app
-- Run this in your Supabase SQL editor to ensure proper storage setup

-- Create product_pdfs bucket (for notes PDFs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_pdfs', 'product_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for product_pdfs bucket
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Anyone can upload product PDFs." ON storage.objects;
CREATE POLICY "Anyone can upload product PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Users can update their own PDFs." ON storage.objects;
CREATE POLICY "Users can update their own PDFs." ON storage.objects
  FOR UPDATE USING (bucket_id = 'product_pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own PDFs." ON storage.objects;
CREATE POLICY "Users can delete their own PDFs." ON storage.objects
  FOR DELETE USING (bucket_id = 'product_pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'product_pdfs';
