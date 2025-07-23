const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

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

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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