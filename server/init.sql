-- Travel Log Database Schema

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    location VARCHAR(500),
    start_date VARCHAR(100),
    end_date VARCHAR(100),
    cover_photo TEXT,
    media_count INTEGER DEFAULT 0,
    distance INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    stops INTEGER DEFAULT 0,
    coordinates JSONB,
    route JSONB DEFAULT '[]'::jsonb,
    stop_points JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    narrative TEXT,
    ai_summary TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Narratives table (for custom user stories)
CREATE TABLE IF NOT EXISTS narratives (
    adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
    narrative TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Summaries table (cache for generated summaries)
CREATE TABLE IF NOT EXISTS ai_summaries (
    id SERIAL PRIMARY KEY,
    adventure_id VARCHAR(255) REFERENCES adventures(id) ON DELETE CASCADE,
    summary_type VARCHAR(50) NOT NULL, -- 'summary', 'highlights', 'story'
    content TEXT,
    model VARCHAR(100),
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adventure_id, summary_type)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hidden adventures table
CREATE TABLE IF NOT EXISTS hidden_adventures (
    adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connection settings table
CREATE TABLE IF NOT EXISTS connection (
    id INTEGER PRIMARY KEY DEFAULT 1,
    server_url TEXT,
    api_key TEXT,
    is_connected BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (id = 1)
);

-- Sync status table
CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_sync_time TIMESTAMP WITH TIME ZONE,
    CHECK (id = 1)
);

-- Proxy headers table
CREATE TABLE IF NOT EXISTS proxy_headers (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(500),
    value TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI configuration table
CREATE TABLE IF NOT EXISTS ai_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    provider VARCHAR(50) DEFAULT 'openai',
    model VARCHAR(100) DEFAULT 'gpt-4o-mini',
    api_key_encrypted TEXT,
    auto_generate BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (id = 1)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adventures_location ON adventures(location);
CREATE INDEX IF NOT EXISTS idx_adventures_start_date ON adventures(start_date);
CREATE INDEX IF NOT EXISTS idx_adventures_is_hidden ON adventures(is_hidden);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_adventure ON ai_summaries(adventure_id);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('cluster_time_window', '24'::jsonb),
    ('cluster_distance_km', '50'::jsonb),
    ('min_photos_per_adventure', '5'::jsonb),
    ('show_route_lines', 'true'::jsonb),
    ('auto_generate_summaries', 'false'::jsonb),
    ('default_view', '"map"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert default connection
INSERT INTO connection (id, is_connected) VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert default sync status
INSERT INTO sync_status (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Insert default AI config
INSERT INTO ai_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;