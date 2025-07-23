const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');

const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collections');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 1923;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../data');

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Ensure data directory exists
fs.ensureDirSync(DATA_PATH);

// API Routes
app.use('/api/cards', cardRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// Serve main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 LorcanaLocalManager running on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_PATH}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

module.exports = app;