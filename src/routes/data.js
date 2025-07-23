const express = require('express');
const multer = require('multer');
const router = express.Router();
const dataService = require('../services/dataService');

// Configure multer for file uploads
const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

// Import cards data
router.post('/import/cards', upload.single('cardsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Cards file is required'
      });
    }

    const result = await dataService.importCards(req.file.path);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error importing cards:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import cards'
    });
  }
});

// Import sets data
router.post('/import/sets', upload.single('setsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Sets file is required'
      });
    }

    const result = await dataService.importSets(req.file.path);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error importing sets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import sets'
    });
  }
});

// Import prices data
router.post('/import/prices', upload.single('pricesFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Prices file is required'
      });
    }

    const result = await dataService.importPrices(req.file.path);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error importing prices:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import prices'
    });
  }
});

// Export all data
router.get('/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const exportPath = await dataService.exportData(format);
    
    res.download(exportPath, `lorcana-data-${new Date().toISOString().split('T')[0]}.${format}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

// Get data statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await dataService.getDataStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching data stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data statistics'
    });
  }
});

// Backup data
router.post('/backup', async (req, res) => {
  try {
    const backupPath = await dataService.createBackup();
    res.json({
      success: true,
      data: {
        backupPath,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup'
    });
  }
});

// Restore from backup
router.post('/restore', upload.single('backupFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Backup file is required'
      });
    }

    const result = await dataService.restoreFromBackup(req.file.path);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore from backup'
    });
  }
});

module.exports = router;