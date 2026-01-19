require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const ai = require('./ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============ Health Check ============
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ============ Adventures ============
app.get('/api/adventures', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, title, location, start_date, end_date, cover_photo,
        media_count, distance, duration, stops, coordinates,
        route, stop_points, photos, narrative, ai_summary,
        highlights, is_favorite, is_hidden, created_at, updated_at
      FROM adventures 
      WHERE is_hidden = FALSE
      ORDER BY start_date DESC
    `);
    
    const adventures = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      startDate: row.start_date,
      endDate: row.end_date,
      coverPhoto: row.cover_photo,
      mediaCount: row.media_count,
      distance: row.distance,
      duration: row.duration,
      stops: row.stops,
      coordinates: row.coordinates,
      route: row.route || [],
      stopPoints: row.stop_points || [],
      photos: row.photos || [],
      narrative: row.narrative,
      aiSummary: row.ai_summary,
      highlights: row.highlights || [],
      isFavorite: row.is_favorite,
      isHidden: row.is_hidden,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    res.json(adventures);
  } catch (error) {
    console.error('Failed to get adventures:', error);
    res.status(500).json({ error: 'Failed to get adventures' });
  }
});

app.post('/api/adventures', async (req, res) => {
  try {
    const adventures = req.body;
    
    for (const adventure of adventures) {
      await db.query(`
        INSERT INTO adventures (
          id, title, location, start_date, end_date, cover_photo,
          media_count, distance, duration, stops, coordinates,
          route, stop_points, photos, narrative, ai_summary,
          highlights, is_favorite, is_hidden
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          location = EXCLUDED.location,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          cover_photo = EXCLUDED.cover_photo,
          media_count = EXCLUDED.media_count,
          distance = EXCLUDED.distance,
          duration = EXCLUDED.duration,
          stops = EXCLUDED.stops,
          coordinates = EXCLUDED.coordinates,
          route = EXCLUDED.route,
          stop_points = EXCLUDED.stop_points,
          photos = EXCLUDED.photos,
          narrative = EXCLUDED.narrative,
          ai_summary = EXCLUDED.ai_summary,
          highlights = EXCLUDED.highlights,
          is_favorite = EXCLUDED.is_favorite,
          is_hidden = EXCLUDED.is_hidden,
          updated_at = NOW()
      `, [
        adventure.id,
        adventure.title,
        adventure.location,
        adventure.startDate,
        adventure.endDate,
        adventure.coverPhoto,
        adventure.mediaCount,
        adventure.distance,
        adventure.duration,
        adventure.stops,
        JSON.stringify(adventure.coordinates),
        JSON.stringify(adventure.route || []),
        JSON.stringify(adventure.stopPoints || []),
        JSON.stringify(adventure.photos || []),
        adventure.narrative,
        adventure.aiSummary,
        JSON.stringify(adventure.highlights || []),
        adventure.isFavorite || false,
        adventure.isHidden || false,
      ]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save adventures:', error);
    res.status(500).json({ error: 'Failed to save adventures' });
  }
});

app.get('/api/adventures/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM adventures WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      location: row.location,
      startDate: row.start_date,
      endDate: row.end_date,
      coverPhoto: row.cover_photo,
      mediaCount: row.media_count,
      distance: row.distance,
      duration: row.duration,
      stops: row.stops,
      coordinates: row.coordinates,
      route: row.route || [],
      stopPoints: row.stop_points || [],
      photos: row.photos || [],
      narrative: row.narrative,
      aiSummary: row.ai_summary,
      highlights: row.highlights || [],
      isFavorite: row.is_favorite,
      isHidden: row.is_hidden,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Failed to get adventure:', error);
    res.status(500).json({ error: 'Failed to get adventure' });
  }
});

app.put('/api/adventures/:id', async (req, res) => {
  try {
    const adventure = req.body;
    
    await db.query(`
      UPDATE adventures SET
        title = COALESCE($2, title),
        location = COALESCE($3, location),
        narrative = COALESCE($4, narrative),
        ai_summary = COALESCE($5, ai_summary),
        highlights = COALESCE($6, highlights),
        is_favorite = COALESCE($7, is_favorite),
        updated_at = NOW()
      WHERE id = $1
    `, [
      req.params.id,
      adventure.title,
      adventure.location,
      adventure.narrative,
      adventure.aiSummary,
      adventure.highlights ? JSON.stringify(adventure.highlights) : null,
      adventure.isFavorite,
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update adventure:', error);
    res.status(500).json({ error: 'Failed to update adventure' });
  }
});

app.delete('/api/adventures/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM adventures WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete adventure:', error);
    res.status(500).json({ error: 'Failed to delete adventure' });
  }
});

// ============ AI Endpoints ============
app.get('/api/ai/config', async (req, res) => {
  try {
    const config = await ai.getAIConfig();
    res.json({
      provider: config.provider,
      model: config.model,
      autoGenerate: config.auto_generate,
      isConfigured: !!process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.error('Failed to get AI config:', error);
    res.status(500).json({ error: 'Failed to get AI config' });
  }
});

app.post('/api/ai/config', async (req, res) => {
  try {
    const { provider, model, autoGenerate } = req.body;
    
    await db.query(`
      UPDATE ai_config SET
        provider = COALESCE($1, provider),
        model = COALESCE($2, model),
        auto_generate = COALESCE($3, auto_generate),
        updated_at = NOW()
      WHERE id = 1
    `, [provider, model, autoGenerate]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update AI config:', error);
    res.status(500).json({ error: 'Failed to update AI config' });
  }
});

app.post('/api/ai/generate-summary/:adventureId', async (req, res) => {
  try {
    const adventureResult = await db.query('SELECT * FROM adventures WHERE id = $1', [req.params.adventureId]);
    
    if (adventureResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }
    
    const adventure = adventureResult.rows[0];
    const result = await ai.generateSummary({
      id: adventure.id,
      title: adventure.title,
      location: adventure.location,
      start_date: adventure.start_date,
      end_date: adventure.end_date,
      duration: adventure.duration,
      distance: adventure.distance,
      stops: adventure.stops,
      media_count: adventure.media_count,
      stop_points: adventure.stop_points,
    });
    
    // Update the adventure with the new summary
    await db.query('UPDATE adventures SET ai_summary = $1, updated_at = NOW() WHERE id = $2', 
      [result.summary, req.params.adventureId]);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

app.post('/api/ai/generate-highlights/:adventureId', async (req, res) => {
  try {
    const adventureResult = await db.query('SELECT * FROM adventures WHERE id = $1', [req.params.adventureId]);
    
    if (adventureResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }
    
    const adventure = adventureResult.rows[0];
    const result = await ai.generateHighlights({
      id: adventure.id,
      title: adventure.title,
      location: adventure.location,
      start_date: adventure.start_date,
      end_date: adventure.end_date,
      duration: adventure.duration,
      distance: adventure.distance,
      stops: adventure.stops,
      media_count: adventure.media_count,
      stop_points: adventure.stop_points,
    });
    
    // Update the adventure with the new highlights
    await db.query('UPDATE adventures SET highlights = $1, updated_at = NOW() WHERE id = $2', 
      [JSON.stringify(result.highlights), req.params.adventureId]);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to generate highlights:', error);
    res.status(500).json({ error: error.message || 'Failed to generate highlights' });
  }
});

app.post('/api/ai/generate-story/:adventureId', async (req, res) => {
  try {
    const { style } = req.body;
    const adventureResult = await db.query('SELECT * FROM adventures WHERE id = $1', [req.params.adventureId]);
    
    if (adventureResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }
    
    const adventure = adventureResult.rows[0];
    const result = await ai.generateStory({
      id: adventure.id,
      title: adventure.title,
      location: adventure.location,
      start_date: adventure.start_date,
      end_date: adventure.end_date,
      duration: adventure.duration,
      distance: adventure.distance,
      stops: adventure.stops,
      media_count: adventure.media_count,
      stop_points: adventure.stop_points,
    }, style);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to generate story:', error);
    res.status(500).json({ error: error.message || 'Failed to generate story' });
  }
});

app.post('/api/ai/regenerate-all/:adventureId', async (req, res) => {
  try {
    const adventureResult = await db.query('SELECT * FROM adventures WHERE id = $1', [req.params.adventureId]);
    
    if (adventureResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }
    
    const adventure = adventureResult.rows[0];
    const result = await ai.regenerateAll({
      id: adventure.id,
      title: adventure.title,
      location: adventure.location,
      start_date: adventure.start_date,
      end_date: adventure.end_date,
      duration: adventure.duration,
      distance: adventure.distance,
      stops: adventure.stops,
      media_count: adventure.media_count,
      stop_points: adventure.stop_points,
    });
    
    // Update the adventure with new AI content
    if (result.summary || result.highlights) {
      await db.query(`
        UPDATE adventures SET 
          ai_summary = COALESCE($1, ai_summary),
          highlights = COALESCE($2, highlights),
          updated_at = NOW()
        WHERE id = $3
      `, [result.summary, result.highlights ? JSON.stringify(result.highlights) : null, req.params.adventureId]);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Failed to regenerate all:', error);
    res.status(500).json({ error: error.message || 'Failed to regenerate' });
  }
});

// ============ Settings ============
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Get proxy headers
    const headersResult = await db.query('SELECT id, key, value, enabled FROM proxy_headers');
    settings.proxyHeaders = headersResult.rows;
    
    res.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      if (key === 'proxyHeaders') continue;
      
      await db.query(`
        INSERT INTO settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
      `, [key, JSON.stringify(value)]);
    }
    
    // Handle proxy headers separately
    if (settings.proxyHeaders) {
      // Clear existing headers
      await db.query('DELETE FROM proxy_headers');
      
      // Insert new headers
      for (const header of settings.proxyHeaders) {
        await db.query(`
          INSERT INTO proxy_headers (id, key, value, enabled)
          VALUES ($1, $2, $3, $4)
        `, [header.id, header.key, header.value, header.enabled]);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ============ Favorites ============
app.get('/api/favorites', async (req, res) => {
  try {
    const result = await db.query('SELECT adventure_id FROM favorites');
    res.json(result.rows.map(r => r.adventure_id));
  } catch (error) {
    console.error('Failed to get favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const favorites = req.body;
    
    await db.query('DELETE FROM favorites');
    
    for (const adventureId of favorites) {
      await db.query(`
        INSERT INTO favorites (adventure_id) VALUES ($1)
        ON CONFLICT DO NOTHING
      `, [adventureId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

// ============ Hidden Adventures ============
app.get('/api/hidden', async (req, res) => {
  try {
    const result = await db.query('SELECT adventure_id FROM hidden_adventures');
    res.json(result.rows.map(r => r.adventure_id));
  } catch (error) {
    console.error('Failed to get hidden:', error);
    res.status(500).json({ error: 'Failed to get hidden' });
  }
});

app.post('/api/hidden', async (req, res) => {
  try {
    const hidden = req.body;
    
    await db.query('DELETE FROM hidden_adventures');
    
    for (const adventureId of hidden) {
      await db.query(`
        INSERT INTO hidden_adventures (adventure_id) VALUES ($1)
        ON CONFLICT DO NOTHING
      `, [adventureId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save hidden:', error);
    res.status(500).json({ error: 'Failed to save hidden' });
  }
});

// ============ Connection ============
app.get('/api/connection', async (req, res) => {
  try {
    const result = await db.query('SELECT server_url, api_key, is_connected FROM connection WHERE id = 1');
    const conn = result.rows[0] || { server_url: null, api_key: null, is_connected: false };
    res.json({
      serverUrl: conn.server_url,
      apiKey: conn.api_key,
      isConnected: conn.is_connected,
    });
  } catch (error) {
    console.error('Failed to get connection:', error);
    res.status(500).json({ error: 'Failed to get connection' });
  }
});

app.post('/api/connection', async (req, res) => {
  try {
    const { serverUrl, apiKey, isConnected } = req.body;
    
    await db.query(`
      UPDATE connection SET
        server_url = $1,
        api_key = $2,
        is_connected = $3,
        updated_at = NOW()
      WHERE id = 1
    `, [serverUrl, apiKey, isConnected]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save connection:', error);
    res.status(500).json({ error: 'Failed to save connection' });
  }
});

// ============ Sync Status ============
app.get('/api/sync-status', async (req, res) => {
  try {
    const result = await db.query('SELECT last_sync_time FROM sync_status WHERE id = 1');
    res.json({ lastSyncTime: result.rows[0]?.last_sync_time || null });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

app.post('/api/sync-status', async (req, res) => {
  try {
    const { lastSyncTime } = req.body;
    
    await db.query('UPDATE sync_status SET last_sync_time = $1 WHERE id = 1', [lastSyncTime]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save sync status:', error);
    res.status(500).json({ error: 'Failed to save sync status' });
  }
});

// ============ Narratives ============
app.get('/api/narratives', async (req, res) => {
  try {
    const result = await db.query('SELECT adventure_id, narrative FROM narratives');
    const narratives = {};
    result.rows.forEach(row => {
      narratives[row.adventure_id] = row.narrative;
    });
    res.json(narratives);
  } catch (error) {
    console.error('Failed to get narratives:', error);
    res.status(500).json({ error: 'Failed to get narratives' });
  }
});

app.post('/api/narratives/:adventureId', async (req, res) => {
  try {
    const { narrative } = req.body;
    
    await db.query(`
      INSERT INTO narratives (adventure_id, narrative, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (adventure_id) DO UPDATE SET narrative = $2, updated_at = NOW()
    `, [req.params.adventureId, narrative]);
    
    // Also update the adventures table
    await db.query('UPDATE adventures SET narrative = $1, updated_at = NOW() WHERE id = $2',
      [narrative, req.params.adventureId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save narrative:', error);
    res.status(500).json({ error: 'Failed to save narrative' });
  }
});

// ============ Serve Static Files ============
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// ============ Start Server ============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Travel Log server running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Not configured'}`);
  console.log(`🤖 AI: ${process.env.OPENAI_API_KEY ? 'OpenAI configured' : 'Not configured'}`);
});