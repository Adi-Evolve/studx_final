-- Complete Rating System Database Schema
-- Run this in your Supabase SQL Editor

-- 1. User profiles table (enhanced)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    verified_seller BOOLEAN DEFAULT FALSE,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rater_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID, -- Can reference products, notes, or rooms
    listing_type VARCHAR(20) DEFAULT 'product', -- 'product', 'note', 'room'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    transaction_type VARCHAR(20) DEFAULT 'sale', -- 'sale', 'purchase', 'rental'
    is_verified BOOLEAN DEFAULT FALSE, -- If transaction was completed
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rated_user_id, rater_user_id, listing_id) -- Prevent duplicate ratings
);

-- 3. Rating helpfulness table (for "helpful" votes on reviews)
CREATE TABLE IF NOT EXISTS rating_helpfulness (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES user_ratings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rating_id, user_id)
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_user_id ON user_ratings(rater_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_listing_id ON user_ratings(listing_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 5. Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_helpfulness ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Users can view all profiles (public data)
CREATE POLICY "Anyone can view user profiles" ON user_profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Users can view all ratings (public reviews)
CREATE POLICY "Anyone can view ratings" ON user_ratings
    FOR SELECT USING (true);

-- Users can create ratings for others (not themselves)
CREATE POLICY "Users can rate others" ON user_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = rater_user_id AND 
        auth.uid() != rated_user_id
    );

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON user_ratings
    FOR UPDATE USING (auth.uid() = rater_user_id);

-- Users can mark reviews as helpful
CREATE POLICY "Users can mark reviews helpful" ON rating_helpfulness
    FOR ALL USING (auth.uid() = user_id);

-- 7. Functions for automatic rating calculations

-- Function to update user average rating
CREATE OR REPLACE FUNCTION update_user_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the rated user's profile
    UPDATE user_profiles 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0.00)
            FROM user_ratings 
            WHERE rated_user_id = COALESCE(NEW.rated_user_id, OLD.rated_user_id)
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM user_ratings 
            WHERE rated_user_id = COALESCE(NEW.rated_user_id, OLD.rated_user_id)
        ),
        updated_at = NOW()
    WHERE user_id = COALESCE(NEW.rated_user_id, OLD.rated_user_id);
    
    -- Create profile if it doesn't exist
    INSERT INTO user_profiles (user_id) 
    VALUES (COALESCE(NEW.rated_user_id, OLD.rated_user_id))
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers
DROP TRIGGER IF EXISTS trigger_update_user_rating ON user_ratings;
CREATE TRIGGER trigger_update_user_rating
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_user_average_rating();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_rating_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_ratings 
    SET helpful_count = (
        SELECT COUNT(*)
        FROM rating_helpfulness 
        WHERE rating_id = COALESCE(NEW.rating_id, OLD.rating_id) 
        AND is_helpful = true
    )
    WHERE id = COALESCE(NEW.rating_id, OLD.rating_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON rating_helpfulness;
CREATE TRIGGER trigger_update_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON rating_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_rating_helpful_count();
