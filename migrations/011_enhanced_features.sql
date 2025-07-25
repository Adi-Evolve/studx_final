-- Enhanced Features Database Schema
-- Run this migration in your Supabase SQL editor

-- 1. Notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'system', -- 'message', 'wishlist', 'price_drop', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User ratings table for seller reputation
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rater_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type VARCHAR(20) DEFAULT 'sale', -- 'sale', 'purchase', 'room_rental'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rated_user_id, rater_user_id, listing_id)
);

-- 3. Price history table for tracking price changes
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    changed_by UUID REFERENCES auth.users(id),
    change_reason VARCHAR(100), -- 'price_update', 'discount', 'market_adjustment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enhanced wishlist with price alerts
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS price_alert_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS target_price DECIMAL(10,2);
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS alert_frequency VARCHAR(20) DEFAULT 'immediate'; -- 'immediate', 'daily', 'weekly'

-- 5. User profiles extension for seller reputation
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    college VARCHAR(100),
    graduation_year INTEGER,
    phone_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    telegram_username VARCHAR(50),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    verified_seller BOOLEAN DEFAULT FALSE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Search suggestions table for autocomplete
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query VARCHAR(100) UNIQUE,
    frequency INTEGER DEFAULT 1,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Bulk upload sessions for sellers
CREATE TABLE IF NOT EXISTS bulk_upload_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(100),
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    upload_data JSONB,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_college ON user_profiles(college);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX IF NOT EXISTS idx_bulk_upload_user_id ON bulk_upload_sessions(user_id);

-- 9. RLS (Row Level Security) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_upload_sessions ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User ratings policies
CREATE POLICY "Users can view all ratings" ON user_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for others" ON user_ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_user_id AND auth.uid() != rated_user_id);

-- Price history policies
CREATE POLICY "Users can view price history" ON price_history
    FOR SELECT USING (true);

CREATE POLICY "System can insert price history" ON price_history
    FOR INSERT WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Search suggestions policies (public read, system write)
CREATE POLICY "Anyone can view search suggestions" ON search_suggestions
    FOR SELECT USING (true);

CREATE POLICY "System can manage search suggestions" ON search_suggestions
    FOR ALL USING (true);

-- Bulk upload policies
CREATE POLICY "Users can view own bulk uploads" ON bulk_upload_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bulk uploads" ON bulk_upload_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bulk uploads" ON bulk_upload_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Functions and Triggers
-- Function to update user rating average
CREATE OR REPLACE FUNCTION update_user_rating_average()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM user_ratings 
            WHERE rated_user_id = NEW.rated_user_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM user_ratings 
            WHERE rated_user_id = NEW.rated_user_id
        ),
        updated_at = NOW()
    WHERE user_id = NEW.rated_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS update_rating_average_trigger ON user_ratings;
CREATE TRIGGER update_rating_average_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating_average();

-- Function to track price changes
CREATE OR REPLACE FUNCTION track_price_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if price actually changed
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (listing_id, old_price, new_price, changed_by, change_reason)
        VALUES (NEW.id, OLD.price, NEW.price, auth.uid(), 'price_update');
        
        -- Create notifications for users with price alerts
        INSERT INTO notifications (user_id, type, title, message, action_url)
        SELECT 
            w.user_id,
            'price_drop',
            'Price Drop Alert!',
            'The price of "' || NEW.name || '" dropped from ₹' || OLD.price || ' to ₹' || NEW.price,
            '/products/' || NEW.type || '/' || NEW.id
        FROM wishlist w
        WHERE w.product_id = NEW.id 
        AND w.price_alert_enabled = true
        AND NEW.price < OLD.price
        AND (w.target_price IS NULL OR NEW.price <= w.target_price);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for price tracking
DROP TRIGGER IF EXISTS track_price_changes_trigger ON products;
CREATE TRIGGER track_price_changes_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION track_price_changes();

-- Function to update search suggestions
CREATE OR REPLACE FUNCTION update_search_suggestions(search_query TEXT, search_category TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_suggestions (query, frequency, category)
    VALUES (LOWER(TRIM(search_query)), 1, search_category)
    ON CONFLICT (query) 
    DO UPDATE SET 
        frequency = search_suggestions.frequency + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 11. Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE price_history;