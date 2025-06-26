-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('message', 'system', 'transaction')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for enhanced user data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    college VARCHAR(200),
    phone VARCHAR(20),
    location VARCHAR(200),
    avatar_url TEXT,
    verified_seller BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rater_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type VARCHAR(20) DEFAULT 'sale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rated_user_id, rater_user_id, listing_id)
);

-- Create bulk_upload_sessions table
CREATE TABLE IF NOT EXISTS bulk_upload_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'completed_with_errors', 'failed')),
    upload_data JSONB,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_comparisons table
CREATE TABLE IF NOT EXISTS product_comparisons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_ids UUID[] NOT NULL,
    comparison_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_views table for analytics
CREATE TABLE IF NOT EXISTS product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    filters JSONB,
    notifications_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_user ON user_ratings(rater_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_listing ON user_ratings(listing_id);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_upload_user ON bulk_upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_upload_status ON bulk_upload_sessions(status);

-- Create triggers to update user ratings
CREATE OR REPLACE FUNCTION update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles 
        SET 
            average_rating = (
                SELECT AVG(rating::DECIMAL) 
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
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles 
        SET 
            average_rating = COALESCE((
                SELECT AVG(rating::DECIMAL) 
                FROM user_ratings 
                WHERE rated_user_id = OLD.rated_user_id
            ), 0),
            total_ratings = (
                SELECT COUNT(*) 
                FROM user_ratings 
                WHERE rated_user_id = OLD.rated_user_id
            ),
            updated_at = NOW()
        WHERE user_id = OLD.rated_user_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_rating_stats ON user_ratings;
CREATE TRIGGER trigger_update_user_rating_stats
    AFTER INSERT OR DELETE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating_stats();

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User ratings are viewable by everyone" ON user_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can rate others but not themselves" ON user_ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_user_id AND auth.uid() != rated_user_id);

CREATE POLICY "Users can view their own bulk upload sessions" ON bulk_upload_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bulk upload sessions" ON bulk_upload_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own comparisons" ON product_comparisons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comparisons" ON product_comparisons
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Product views are insertable by anyone" ON product_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Product views are viewable for analytics" ON product_views
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own saved searches" ON saved_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved searches" ON saved_searches
    FOR ALL USING (auth.uid() = user_id);