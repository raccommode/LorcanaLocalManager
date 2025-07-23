const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for JSON parsing
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./data/settings.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📦 Connected to SQLite database');
    
    // Create settings table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Settings table ready');
      }
    });
  }
});

// Add middleware for debugging (must be first)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

// API Routes for settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching settings:', err.message);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  });
});

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;
  
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Key and value are required' });
  }
  
  db.run(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [key, value],
    function(err) {
      if (err) {
        console.error('❌ Error saving setting:', err.message);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      res.json({ success: true, key, value });
    }
  );
});

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cartes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cartes.html'));
});

app.get('/parametre', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'parametre.html'));
});

// Redirect disabled pages for now
app.get('/produits', (req, res) => {
  res.redirect('/?message=soon');
});

app.get('/mes-achats', (req, res) => {
  res.redirect('/?message=soon');
});

app.get('/mes-ventes', (req, res) => {
  res.redirect('/?message=soon');
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 LorcanaLocalManager running on port ${PORT}`);
  console.log(`🌐 Server listening on 0.0.0.0:${PORT}`);
  console.log(`🔧 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📡 Server ready to accept connections`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});