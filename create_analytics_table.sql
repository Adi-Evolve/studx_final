-- Analytics Table Creation Script for Supabase
-- Run this in your Supabase SQL Editor

-- Create analytics_views table for real-time view tracking
CREATE TABLE IF NOT EXISTS public.analytics_views (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL,       -- 'product', 'note', 'room'
    item_id UUID NOT NULL,               -- ID of the item being tracked
    item_title TEXT,                     -- Title for reference
    view_count INTEGER DEFAULT 1,       -- Number of views
    last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Last access time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),   -- First view time
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),   -- Last update time
    UNIQUE(item_type, item_id)          -- Prevent duplicate entries
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_views_type_id ON public.analytics_views(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_last_viewed ON public.analytics_views(last_viewed);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analytics_views_updated_at
    BEFORE UPDATE ON public.analytics_views
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) if needed
ALTER TABLE public.analytics_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read/write analytics
CREATE POLICY "Allow authenticated users to manage analytics" ON public.analytics_views
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.analytics_views TO authenticated;
GRANT ALL ON public.analytics_views TO service_role;

-- Add some sample data to test (optional)
INSERT INTO public.analytics_views (item_type, item_id, item_title, view_count) 
VALUES 
    ('product', gen_random_uuid(), 'Sample Product View', 5),
    ('note', gen_random_uuid(), 'Sample Note View', 3),
    ('room', gen_random_uuid(), 'Sample Room View', 7)
ON CONFLICT (item_type, item_id) DO NOTHING;

-- Verify the table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'analytics_views' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
