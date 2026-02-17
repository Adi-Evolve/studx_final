-- Create a wishlist table to store user's favorite items
CREATE TABLE public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.regular_products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Ensures a user can only wishlist a product once
);

-- Enable RLS for the wishlist table
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for wishlist
CREATE POLICY "Users can view their own wishlist." ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist." ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist." ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);
