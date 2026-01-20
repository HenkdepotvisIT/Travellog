-- Initialize database schema for Travel Log

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500),
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
  summary_type VARCHAR(50), -- 'summary', 'highlights', 'story'
  content TEXT,
  model VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(adventure_id, summary_type)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Proxy headers for Cloudflare/reverse proxy auth
CREATE TABLE IF NOT EXISTS proxy_headers (
  id VARCHAR(255) PRIMARY KEY,
  key VARCHAR(255),
  value TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hidden adventures
CREATE TABLE IF NOT EXISTS hidden_adventures (
  adventure_id VARCHAR(255) PRIMARY KEY REFERENCES adventures(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Immich connection settings
CREATE TABLE IF NOT EXISTS connection (
  id INTEGER PRIMARY KEY DEFAULT 1,
  server_url TEXT,
  api_key TEXT,
  is_connected BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync status
CREATE TABLE IF NOT EXISTS sync_status (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_sync_time TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Configuration
CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  provider VARCHAR(50) DEFAULT 'gemini',
  model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  auto_generate BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default records
INSERT INTO connection (id, is_connected) VALUES (1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO sync_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO ai_config (id, provider, model) VALUES (1, 'gemini', 'gemini-1.5-flash') ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('cluster_time_window', '24'),
  ('cluster_distance_km', '50'),
  ('min_photos_per_adventure', '5'),
  ('show_route_lines', 'true'),
  ('auto_generate_summaries', 'false'),
  ('default_view', '"map"')
ON CONFLICT (key) DO NOTHING;