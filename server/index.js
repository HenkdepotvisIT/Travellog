const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`Data directory ready: ${DATA_DIR}`);
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// Helper functions for file-based storage
async function readJsonFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeJsonFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ============ API Routes ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ Adventures ============

app.get('/api/adventures', async (req, res) => {
  try {
    const adventures = await readJsonFile('adventures.json');
    res.json(adventures || []);
  } catch (error) {
    console.error('Failed to get adventures:', error);
    res.status(500).json({ error: 'Failed to get adventures' });
  }
});

app.post('/api/adventures', async (req, res) => {
  try {
    const adventures = req.body;
    await writeJsonFile('adventures.json', adventures);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save adventures:', error);
    res.status(500).json({ error: 'Failed to save adventures' });
  }
});

app.get('/api/adventures/:id', async (req, res) => {
  try {
    const adventures = await readJsonFile('adventures.json') || [];
    const adventure = adventures.find(a => a.id === req.params.id);
    if (adventure) {
      res.json(adventure);
    } else {
      res.status(404).json({ error: 'Adventure not found' });
    }
  } catch (error) {
    console.error('Failed to get adventure:', error);
    res.status(500).json({ error: 'Failed to get adventure' });
  }
});

app.put('/api/adventures/:id', async (req, res) => {
  try {
    const adventures = await readJsonFile('adventures.json') || [];
    const index = adventures.findIndex(a => a.id === req.params.id);
    
    if (index >= 0) {
      adventures[index] = { ...adventures[index], ...req.body, updatedAt: new Date().toISOString() };
    } else {
      adventures.push({ ...req.body, id: req.params.id, createdAt: new Date().toISOString() });
    }
    
    await writeJsonFile('adventures.json', adventures);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update adventure:', error);
    res.status(500).json({ error: 'Failed to update adventure' });
  }
});

app.delete('/api/adventures/:id', async (req, res) => {
  try {
    const adventures = await readJsonFile('adventures.json') || [];
    const filtered = adventures.filter(a => a.id !== req.params.id);
    await writeJsonFile('adventures.json', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete adventure:', error);
    res.status(500).json({ error: 'Failed to delete adventure' });
  }
});

// ============ Narratives ============

app.get('/api/narratives', async (req, res) => {
  try {
    const narratives = await readJsonFile('narratives.json');
    res.json(narratives || {});
  } catch (error) {
    console.error('Failed to get narratives:', error);
    res.status(500).json({ error: 'Failed to get narratives' });
  }
});

app.post('/api/narratives/:adventureId', async (req, res) => {
  try {
    const narratives = await readJsonFile('narratives.json') || {};
    narratives[req.params.adventureId] = req.body.narrative;
    await writeJsonFile('narratives.json', narratives);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save narrative:', error);
    res.status(500).json({ error: 'Failed to save narrative' });
  }
});

// ============ Settings ============

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readJsonFile('settings.json');
    res.json(settings || {});
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await writeJsonFile('settings.json', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ============ Favorites ============

app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await readJsonFile('favorites.json');
    res.json(favorites || []);
  } catch (error) {
    console.error('Failed to get favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    await writeJsonFile('favorites.json', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

// ============ Hidden Adventures ============

app.get('/api/hidden', async (req, res) => {
  try {
    const hidden = await readJsonFile('hidden.json');
    res.json(hidden || []);
  } catch (error) {
    console.error('Failed to get hidden:', error);
    res.status(500).json({ error: 'Failed to get hidden' });
  }
});

app.post('/api/hidden', async (req, res) => {
  try {
    await writeJsonFile('hidden.json', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save hidden:', error);
    res.status(500).json({ error: 'Failed to save hidden' });
  }
});

// ============ Connection ============

app.get('/api/connection', async (req, res) => {
  try {
    const connection = await readJsonFile('connection.json');
    res.json(connection || { serverUrl: null, isConnected: false });
  } catch (error) {
    console.error('Failed to get connection:', error);
    res.status(500).json({ error: 'Failed to get connection' });
  }
});

app.post('/api/connection', async (req, res) => {
  try {
    await writeJsonFile('connection.json', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save connection:', error);
    res.status(500).json({ error: 'Failed to save connection' });
  }
});

// ============ Sync Status ============

app.get('/api/sync-status', async (req, res) => {
  try {
    const status = await readJsonFile('sync-status.json');
    res.json(status || { lastSyncTime: null });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

app.post('/api/sync-status', async (req, res) => {
  try {
    await writeJsonFile('sync-status.json', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save sync status:', error);
    res.status(500).json({ error: 'Failed to save sync status' });
  }
});

// ============ Export/Import ============

app.get('/api/export', async (req, res) => {
  try {
    const files = ['adventures.json', 'narratives.json', 'settings.json', 'favorites.json', 'hidden.json', 'connection.json'];
    const exportData = {};
    
    for (const file of files) {
      const data = await readJsonFile(file);
      if (data) {
        exportData[file.replace('.json', '')] = data;
      }
    }
    
    res.json(exportData);
  } catch (error) {
    console.error('Failed to export data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const importData = req.body;
    
    for (const [key, value] of Object.entries(importData)) {
      await writeJsonFile(`${key}.json`, value);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to import data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

app.delete('/api/data', async (req, res) => {
  try {
    const files = ['adventures.json', 'narratives.json', 'settings.json', 'favorites.json', 'hidden.json', 'connection.json', 'sync-status.json'];
    
    for (const file of files) {
      try {
        await fs.unlink(path.join(DATA_DIR, file));
      } catch (e) {
        // Ignore if file doesn't exist
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// ============ Serve Static Files ============

// Serve the built web app
app.use(express.static(path.join(__dirname, '../dist')));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// ============ Start Server ============

ensureDataDir().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Travel Log server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
  });
});