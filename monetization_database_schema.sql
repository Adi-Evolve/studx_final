-- Database Schema for Advanced Monetization Features
-- Execute these SQL commands in your Supabase SQL editor

-- 1. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'plus', 'pro')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_id VARCHAR(100),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. User Credits Table (for sponsored listing credits)
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    sponsored_credit DECIMAL(10,2) DEFAULT 0,
    referral_credit DECIMAL(10,2) DEFAULT 0,
    promotional_credit DECIMAL(10,2) DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advertiser_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    ad_type VARCHAR(20) CHECK (ad_type IN ('image', 'text', 'carousel', 'video')),
    image_url VARCHAR(500),
    click_url VARCHAR(500),
    call_to_action VARCHAR(50),
    open_in_new_tab BOOLEAN DEFAULT true,
    closeable BOOLEAN DEFAULT false,
    
    -- Targeting options
    positions TEXT[] DEFAULT '{}', -- ['homepage-top', 'search-results', 'category-sidebar']
    target_categories TEXT[] DEFAULT '{}', -- ['electronics', 'books', 'notes']
    target_devices TEXT[] DEFAULT '{}', -- ['mobile', 'desktop']
    target_locations TEXT[] DEFAULT '{}', -- ['mumbai', 'delhi', 'bangalore']
    
    -- Bidding and scheduling
    bid_amount DECIMAL(10,2) DEFAULT 0,
    daily_budget DECIMAL(10,2) DEFAULT 0,
    total_budget DECIMAL(10,2) DEFAULT 0,
    priority INTEGER DEFAULT 1,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
    
    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    
    -- Carousel specific data
    carousel_items JSONB DEFAULT '[]',
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Ad Impressions Table (for analytics)
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    position VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Ad Clicks Table (for analytics)
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    position VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Transaction Commissions Table
CREATE TABLE IF NOT EXISTS transaction_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.0500 for 5%
    commission_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    payment_gateway_fee DECIMAL(10,2) DEFAULT 0,
    seller_plan_type VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'waived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Revenue Analytics Table (for admin dashboard)
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    subscription_revenue DECIMAL(10,2) DEFAULT 0,
    commission_revenue DECIMAL(10,2) DEFAULT 0,
    advertising_revenue DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(date)
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_advertisements_status_dates ON advertisements(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_advertisements_positions ON advertisements USING GIN(positions);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_timestamp ON ad_impressions(ad_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_timestamp ON ad_clicks(ad_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_transaction_commissions_seller ON transaction_commissions(seller_id, status);

-- 9. RLS (Row Level Security) Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_commissions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own credits
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only manage their own advertisements
CREATE POLICY "Users can manage own ads" ON advertisements
    FOR ALL USING (auth.uid() = advertiser_id);

-- Public can view active advertisements (for display)
CREATE POLICY "Public can view active ads" ON advertisements
    FOR SELECT USING (status = 'active' AND start_date <= now() AND end_date >= now());

-- 10. Database Functions for Efficiency

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE advertisements 
    SET impressions = impressions + 1,
        updated_at = now()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment ad clicks and update CTR
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE advertisements 
    SET clicks = clicks + 1,
        click_through_rate = CASE 
            WHEN impressions > 0 THEN (clicks + 1.0) / impressions * 100
            ELSE 0 
        END,
        updated_at = now()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user's commission rate based on subscription
CREATE OR REPLACE FUNCTION get_user_commission_rate(user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    subscription_record RECORD;
    commission_rate DECIMAL DEFAULT 0.05; -- 5% default
BEGIN
    SELECT plan_type INTO subscription_record
    FROM user_subscriptions 
    WHERE user_subscriptions.user_id = get_user_commission_rate.user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF subscription_record.plan_type IN ('plus', 'pro') THEN
        commission_rate := 0; -- No commission for premium plans
    END IF;
    
    RETURN commission_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create listing based on plan limits
CREATE OR REPLACE FUNCTION can_user_create_listing(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
    current_listing_count INTEGER;
    max_listings INTEGER DEFAULT 10; -- Free plan limit
BEGIN
    -- Get user's current subscription
    SELECT plan_type INTO subscription_record
    FROM user_subscriptions 
    WHERE user_subscriptions.user_id = can_user_create_listing.user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Set limits based on plan
    IF subscription_record.plan_type IN ('plus', 'pro') THEN
        RETURN TRUE; -- Unlimited listings
    END IF;
    
    -- Count current active listings
    SELECT COUNT(*) INTO current_listing_count
    FROM (
        SELECT id FROM products WHERE seller_id = can_user_create_listing.user_id AND status != 'sold'
        UNION ALL
        SELECT id FROM notes WHERE seller_id = can_user_create_listing.user_id AND status != 'sold'
        UNION ALL
        SELECT id FROM rooms WHERE seller_id = can_user_create_listing.user_id AND status != 'sold'
    ) AS all_listings;
    
    RETURN current_listing_count < max_listings;
END;
$$ LANGUAGE plpgsql;

-- 11. Triggers for automatic revenue calculation
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO revenue_analytics (date, commission_revenue, total_revenue)
    VALUES (CURRENT_DATE, NEW.commission_amount, NEW.commission_amount)
    ON CONFLICT (date)
    DO UPDATE SET 
        commission_revenue = revenue_analytics.commission_revenue + NEW.commission_amount,
        total_revenue = revenue_analytics.total_revenue + NEW.commission_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_commission_revenue
    AFTER INSERT ON transaction_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_revenue();

-- Sample data for testing (optional)
INSERT INTO advertisements (
    advertiser_id, title, description, ad_type, image_url, click_url,
    call_to_action, positions, target_categories, bid_amount, daily_budget
) VALUES (
    (SELECT id FROM users LIMIT 1), -- Use first user as advertiser
    'Get Premium Laptops at Best Prices!',
    'Explore our collection of gaming laptops, ultrabooks, and workstations',
    'image',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://example.com/laptops',
    'Shop Now',
    ARRAY['homepage-top', 'search-results'],
    ARRAY['electronics', 'laptops'],
    100.00,
    500.00
) ON CONFLICT DO NOTHING;

-- Commit the changes
COMMIT;
