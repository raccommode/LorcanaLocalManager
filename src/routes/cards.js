const express = require('express');
const router = express.Router();
const cardService = require('../services/cardService');

// Get all cards with filtering
router.get('/', async (req, res) => {
  try {
    const filters = {
      set: req.query.set,
      color: req.query.color,
      rarity: req.query.rarity,
      search: req.query.search,
      language: req.query.language || 'fr'
    };
    
    const cards = await cardService.getCards(filters);
    res.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards'
    });
  }
});

// Get card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card'
    });
  }
});

// Get available sets
router.get('/meta/sets', async (req, res) => {
  try {
    const language = req.query.language || 'fr';
    const sets = await cardService.getSets(language);
    res.json({
      success: true,
      data: sets
    });
  } catch (error) {
    console.error('Error fetching sets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sets'
    });
  }
});

// Get card statistics
router.get('/meta/stats', async (req, res) => {
  try {
    const stats = await cardService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;