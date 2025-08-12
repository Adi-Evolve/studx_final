-- Analytics tracking tables for StudXchange Admin Panel
-- Run this SQL in your Supabase SQL editor

-- Table for tracking user sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    first_page VARCHAR(255),
    last_page VARCHAR(255),
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_views INTEGER DEFAULT 1,
    session_duration INTEGER DEFAULT 0, -- in seconds
    is_bounce BOOLEAN DEFAULT false,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking individual page views
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page VARCHAR(255) NOT NULL,
    page_title VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_on_page INTEGER DEFAULT 0, -- in seconds
    scroll_depth INTEGER DEFAULT 0, -- percentage
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking API calls
CREATE TABLE IF NOT EXISTS analytics_api_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time INTEGER, -- in milliseconds
    request_size INTEGER,
    response_size INTEGER,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking specific events (button clicks, form submissions, etc.)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'click', 'form_submit', 'download', etc.
    event_name VARCHAR(255) NOT NULL,
    event_data JSONB,
    page VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking content views (products, rooms, notes)
CREATE TABLE IF NOT EXISTS analytics_content_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'product', 'room', 'note'
    content_id UUID NOT NULL,
    session_id VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 1,
    unique_views INTEGER DEFAULT 1,
    time_spent INTEGER DEFAULT 0, -- in seconds
    interactions INTEGER DEFAULT 0, -- clicks, scrolls, etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, session_id)
);

-- Table for performance monitoring
CREATE TABLE IF NOT EXISTS analytics_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'load_time', 'first_paint', 'largest_contentful_paint', etc.
    metric_value INTEGER NOT NULL, -- in milliseconds
    session_id VARCHAR(255),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON analytics_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_activity ON analytics_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page ON analytics_page_views(page);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_timestamp ON analytics_page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_user_id ON analytics_page_views(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_api_calls_endpoint ON analytics_api_calls(endpoint);
CREATE INDEX IF NOT EXISTS idx_analytics_api_calls_method ON analytics_api_calls(method);
CREATE INDEX IF NOT EXISTS idx_analytics_api_calls_timestamp ON analytics_api_calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_api_calls_status_code ON analytics_api_calls(status_code);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_content_views_content ON analytics_content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content_views_session_id ON analytics_content_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content_views_timestamp ON analytics_content_views(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_performance_page ON analytics_performance(page);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_metric_type ON analytics_performance(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_timestamp ON analytics_performance(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (service role can access all)
CREATE POLICY "Admin full access" ON analytics_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access" ON analytics_page_views FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access" ON analytics_api_calls FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access" ON analytics_events FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access" ON analytics_content_views FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access" ON analytics_performance FOR ALL TO service_role USING (true);

-- Create policies for anonymous/authenticated users (can only insert)
CREATE POLICY "Insert analytics data" ON analytics_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert analytics data" ON analytics_page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert analytics data" ON analytics_api_calls FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert analytics data" ON analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert analytics data" ON analytics_content_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert analytics data" ON analytics_performance FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Create a view for easy dashboard queries
CREATE OR REPLACE VIEW analytics_dashboard_summary AS
SELECT 
    -- Today's stats
    (SELECT COUNT(*) FROM analytics_page_views WHERE DATE(timestamp) = CURRENT_DATE) as today_page_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_page_views WHERE DATE(timestamp) = CURRENT_DATE) as today_sessions,
    (SELECT COUNT(DISTINCT ip_address) FROM analytics_sessions WHERE DATE(created_at) = CURRENT_DATE) as today_unique_visitors,
    (SELECT COUNT(*) FROM analytics_api_calls WHERE DATE(timestamp) = CURRENT_DATE) as today_api_calls,
    
    -- Yesterday's stats for comparison
    (SELECT COUNT(*) FROM analytics_page_views WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as yesterday_page_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_page_views WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as yesterday_sessions,
    (SELECT COUNT(DISTINCT ip_address) FROM analytics_sessions WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day') as yesterday_unique_visitors,
    (SELECT COUNT(*) FROM analytics_api_calls WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as yesterday_api_calls,
    
    -- Weekly stats
    (SELECT COUNT(*) FROM analytics_page_views WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as week_page_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_page_views WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as week_sessions,
    (SELECT COUNT(DISTINCT ip_address) FROM analytics_sessions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_unique_visitors,
    (SELECT COUNT(*) FROM analytics_api_calls WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as week_api_calls,
    
    -- Monthly stats
    (SELECT COUNT(*) FROM analytics_page_views WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as month_page_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_page_views WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as month_sessions,
    (SELECT COUNT(DISTINCT ip_address) FROM analytics_sessions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_unique_visitors,
    (SELECT COUNT(*) FROM analytics_api_calls WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as month_api_calls;

-- Create functions for common analytics queries
CREATE OR REPLACE FUNCTION get_top_pages(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(page VARCHAR, views BIGINT, unique_sessions BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.page,
        COUNT(*) as views,
        COUNT(DISTINCT pv.session_id) as unique_sessions
    FROM analytics_page_views pv
    WHERE pv.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY pv.page
    ORDER BY views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_api_performance(days_back INTEGER DEFAULT 7)
RETURNS TABLE(endpoint VARCHAR, method VARCHAR, avg_response_time NUMERIC, total_calls BIGINT, error_rate NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.endpoint,
        ac.method,
        ROUND(AVG(ac.response_time::NUMERIC), 2) as avg_response_time,
        COUNT(*) as total_calls,
        ROUND((COUNT(*) FILTER (WHERE ac.status_code >= 400)::NUMERIC / COUNT(*)) * 100, 2) as error_rate
    FROM analytics_api_calls ac
    WHERE ac.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ac.endpoint, ac.method
    ORDER BY total_calls DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_top_pages TO service_role;
GRANT EXECUTE ON FUNCTION get_api_performance TO service_role;
