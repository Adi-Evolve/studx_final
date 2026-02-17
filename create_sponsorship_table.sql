-- Create sponsorship_sequences table for featured listings
CREATE TABLE IF NOT EXISTS public.sponsorship_sequences (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'note', 'room')),
    slot INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure each slot is unique (only one item per slot)
    UNIQUE(slot),
    
    -- Ensure each item can only be featured once
    UNIQUE(item_id, item_type)
);

-- Enable RLS
ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read sponsored listings
CREATE POLICY "Anyone can view sponsored listings" ON public.sponsorship_sequences
    FOR SELECT USING (true);

-- Only authenticated users can manage sponsored listings (admin only in practice)
CREATE POLICY "Authenticated users can manage sponsored listings" ON public.sponsorship_sequences
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_sequences_slot ON public.sponsorship_sequences(slot);
CREATE INDEX IF NOT EXISTS idx_sponsorship_sequences_item ON public.sponsorship_sequences(item_id, item_type);

-- Add some sample sponsored listings (using existing product/note IDs)
-- Note: You should replace these with actual item IDs from your database
INSERT INTO public.sponsorship_sequences (item_id, item_type, slot) VALUES
    (1, 'product', 1),
    (2, 'product', 2),
    (3, 'product', 3),
    (4, 'product', 4),
    (1, 'note', 5),
    (2, 'note', 6)
ON CONFLICT (slot) DO NOTHING;

COMMENT ON TABLE public.sponsorship_sequences IS 'Defines the sequence and order of sponsored/featured listings displayed on the homepage';
COMMENT ON COLUMN public.sponsorship_sequences.item_id IS 'The ID of the item being sponsored (from products, notes, or rooms table)';
COMMENT ON COLUMN public.sponsorship_sequences.item_type IS 'The type of item: product, note, or room';
COMMENT ON COLUMN public.sponsorship_sequences.slot IS 'The display order/position (1 = first, 2 = second, etc.)';
