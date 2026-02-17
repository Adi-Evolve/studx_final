-- Transaction Fees System Database Schema
-- Run this in your Supabase SQL Editor

-- Create transactions table for tracking all payments and fees
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Transaction parties
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Related listing
    listing_id BIGINT NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('product', 'note', 'room')),
    
    -- Financial details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    gateway_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    seller_amount DECIMAL(10,2) NOT NULL CHECK (seller_amount >= 0),
    
    -- Payment details
    payment_method TEXT DEFAULT 'razorpay',
    payment_id TEXT, -- Payment gateway transaction ID
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_amount_split CHECK (amount = platform_fee + gateway_fee + seller_amount)
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own transactions (as buyer or seller)
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id
    );

-- Only authenticated users can create transactions (through API)
CREATE POLICY "Authenticated users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only system can update transactions (no direct user updates)
CREATE POLICY "System can update transactions" ON public.transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_listing ON public.transactions(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON public.transactions(payment_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE
    ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
-- INSERT INTO public.transactions (
--     buyer_id, seller_id, listing_id, listing_type, 
--     amount, platform_fee, gateway_fee, seller_amount,
--     payment_method, status
-- ) VALUES (
--     'buyer-uuid-here', 'seller-uuid-here', 1, 'product',
--     1000.00, 30.00, 20.00, 950.00,
--     'razorpay', 'completed'
-- );

-- Create view for admin revenue dashboard
CREATE OR REPLACE VIEW public.revenue_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_volume,
    SUM(platform_fee) as platform_revenue,
    SUM(gateway_fee) as gateway_fees,
    SUM(platform_fee) - SUM(gateway_fee) as net_revenue,
    AVG(amount) as avg_transaction_value
FROM public.transactions 
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Grant access to service role for API operations
GRANT ALL ON public.transactions TO service_role;
GRANT SELECT ON public.revenue_summary TO service_role;
