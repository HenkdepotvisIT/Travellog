-- Travel Log Database Schema

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    location VARCHAR(255),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Narratives table (for user-written stories)
CREATE TABLE IF NOT EXISTS narratives (
    adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
    narrative TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Summaries cache
CREATE TABLE IF NOT EXISTS ai_summaries (
    id SERIAL PRIMARY KEY,
    adventure_id VARCHAR(255) REFERENCES adventures(id) ON DELETE CASCADE,
    summary_type VARCHAR(50) NOT NULL, -- 'summary', 'highlights', 'story'
    content TEXT,
    model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(adventure_id, summary_type)
);

-- AI Configuration
CREATE TABLE IF NOT EXISTS ai_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    provider VARCHAR(50) DEFAULT 'openai', -- 'openai' or 'vertex'
    model VARCHAR(100) DEFAULT 'gpt-4o-mini',
    auto_generate BOOLEAN DEFAULT FALSE,
    vertex_project VARCHAR(255),
    vertex_location VARCHAR(100) DEFAULT 'us-central1',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default AI config if not exists
INSERT INTO ai_config (id, provider, model, auto_generate, vertex_project, vertex_location)
VALUES (1, 'openai', 'gpt-4o-mini', FALSE, NULL, 'us-central1')
ON CONFLICT (id) DO NOTHING;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    adventure_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hidden adventures
CREATE TABLE IF NOT EXISTS hidden_adventures (
    adventure_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Immich connection
CREATE TABLE IF NOT EXISTS connection (
    id INTEGER PRIMARY KEY DEFAULT 1,
    server_url TEXT,
    api_key TEXT,
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT single_connection CHECK (id = 1)
);

-- Insert default connection row
INSERT INTO connection (id, is_connected) VALUES (1, FALSE) ON CONFLICT (id) DO NOTHING;

-- Sync status
CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_sync_time TIMESTAMP,
    CONSTRAINT single_sync CHECK (id = 1)
);

-- Insert default sync status
INSERT INTO sync_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Proxy headers for Cloudflare/reverse proxy auth
CREATE TABLE IF NOT EXISTS proxy_headers (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adventures_location ON adventures(location);
CREATE INDEX IF NOT EXISTS idx_adventures_start_date ON adventures(start_date);
CREATE INDEX IF NOT EXISTS idx_adventures_is_hidden ON adventures(is_hidden);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_adventure ON ai_summaries(adventure_id);