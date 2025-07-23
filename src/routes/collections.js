const express = require('express');
const router = express.Router();
const collectionService = require('../services/collectionService');

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await collectionService.getCollections();
    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collections'
    });
  }
});

// Create new collection
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Collection name is required'
      });
    }

    const collection = await collectionService.createCollection({ name, description });
    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
});

// Get collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await collectionService.getCollectionById(req.params.id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection'
    });
  }
});

// Update collection
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const collection = await collectionService.updateCollection(req.params.id, { name, description });
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collection'
    });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const success = await collectionService.deleteCollection(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collection'
    });
  }
});

// Add card to collection
router.post('/:id/cards', async (req, res) => {
  try {
    const { cardId, quantity = 1 } = req.body;
    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'Card ID is required'
      });
    }

    const collection = await collectionService.addCardToCollection(req.params.id, cardId, quantity);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error adding card to collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add card to collection'
    });
  }
});

// Remove card from collection
router.delete('/:id/cards/:cardId', async (req, res) => {
  try {
    const collection = await collectionService.removeCardFromCollection(req.params.id, req.params.cardId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection or card not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove card from collection'
    });
  }
});

module.exports = router;