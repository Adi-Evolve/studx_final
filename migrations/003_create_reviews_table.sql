-- migrations/003_create_reviews_table.sql

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_name TEXT, -- Denormalized for easier display
    user_avatar_url TEXT -- Denormalized for easier display
);

-- Add an index on room_id for faster review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON public.reviews(room_id);

-- Enable Row-Level Security (RLS) for the reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view reviews
CREATE POLICY "Allow public read access to reviews" ON public.reviews
FOR SELECT USING (true);

-- Policy: Allow authenticated users to insert their own reviews
CREATE POLICY "Allow authenticated users to insert their own reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON public.reviews
FOR DELETE USING (auth.uid() = user_id);
