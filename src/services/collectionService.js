const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../data');

class CollectionService {
  constructor() {
    this.collectionsPath = path.join(DATA_PATH, 'collections.json');
  }

  async ensureDataFiles() {
    await fs.ensureDir(DATA_PATH);
    
    if (!await fs.pathExists(this.collectionsPath)) {
      await fs.writeJson(this.collectionsPath, []);
    }
  }

  async getCollections() {
    try {
      await this.ensureDataFiles();
      return await fs.readJson(this.collectionsPath);
    } catch (error) {
      console.error('Error getting collections:', error);
      return [];
    }
  }

  async getCollectionById(id) {
    try {
      const collections = await this.getCollections();
      return collections.find(collection => collection.id === id) || null;
    } catch (error) {
      console.error('Error getting collection by ID:', error);
      return null;
    }
  }

  async createCollection(collectionData) {
    try {
      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const newCollection = {
        id: uuidv4(),
        name: collectionData.name,
        description: collectionData.description || '',
        cards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      collections.push(newCollection);
      await fs.writeJson(this.collectionsPath, collections, { spaces: 2 });

      return newCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async updateCollection(id, collectionData) {
    try {
      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const collectionIndex = collections.findIndex(collection => collection.id === id);
      if (collectionIndex === -1) {
        return null;
      }

      collections[collectionIndex] = {
        ...collections[collectionIndex],
        ...collectionData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      await fs.writeJson(this.collectionsPath, collections, { spaces: 2 });
      return collections[collectionIndex];
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  async deleteCollection(id) {
    try {
      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const filteredCollections = collections.filter(collection => collection.id !== id);
      if (filteredCollections.length === collections.length) {
        return false; // Collection not found
      }

      await fs.writeJson(this.collectionsPath, filteredCollections, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  async addCardToCollection(collectionId, cardId, quantity = 1) {
    try {
      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const collectionIndex = collections.findIndex(collection => collection.id === collectionId);
      if (collectionIndex === -1) {
        return null;
      }

      const collection = collections[collectionIndex];
      
      // Check if card already exists in collection
      const existingCardIndex = collection.cards.findIndex(card => card.cardId === cardId);
      
      if (existingCardIndex !== -1) {
        // Update quantity
        collection.cards[existingCardIndex].quantity += quantity;
        if (collection.cards[existingCardIndex].quantity <= 0) {
          collection.cards.splice(existingCardIndex, 1);
        }
      } else {
        // Add new card
        if (quantity > 0) {
          collection.cards.push({
            cardId,
            quantity,
            addedAt: new Date().toISOString()
          });
        }
      }

      collection.updatedAt = new Date().toISOString();
      await fs.writeJson(this.collectionsPath, collections, { spaces: 2 });

      return collection;
    } catch (error) {
      console.error('Error adding card to collection:', error);
      throw error;
    }
  }

  async removeCardFromCollection(collectionId, cardId) {
    try {
      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const collectionIndex = collections.findIndex(collection => collection.id === collectionId);
      if (collectionIndex === -1) {
        return null;
      }

      const collection = collections[collectionIndex];
      const initialLength = collection.cards.length;
      
      collection.cards = collection.cards.filter(card => card.cardId !== cardId);
      
      if (collection.cards.length === initialLength) {
        return null; // Card not found in collection
      }

      collection.updatedAt = new Date().toISOString();
      await fs.writeJson(this.collectionsPath, collections, { spaces: 2 });

      return collection;
    } catch (error) {
      console.error('Error removing card from collection:', error);
      throw error;
    }
  }

  async updateCardQuantity(collectionId, cardId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeCardFromCollection(collectionId, cardId);
      }

      await this.ensureDataFiles();
      const collections = await fs.readJson(this.collectionsPath);
      
      const collectionIndex = collections.findIndex(collection => collection.id === collectionId);
      if (collectionIndex === -1) {
        return null;
      }

      const collection = collections[collectionIndex];
      const cardIndex = collection.cards.findIndex(card => card.cardId === cardId);
      
      if (cardIndex === -1) {
        return null; // Card not found in collection
      }

      collection.cards[cardIndex].quantity = quantity;
      collection.updatedAt = new Date().toISOString();
      
      await fs.writeJson(this.collectionsPath, collections, { spaces: 2 });
      return collection;
    } catch (error) {
      console.error('Error updating card quantity:', error);
      throw error;
    }
  }

  async getCollectionStats(collectionId) {
    try {
      const collection = await this.getCollectionById(collectionId);
      if (!collection) {
        return null;
      }

      const stats = {
        totalCards: collection.cards.length,
        totalQuantity: collection.cards.reduce((sum, card) => sum + card.quantity, 0),
        lastUpdated: collection.updatedAt,
        createdAt: collection.createdAt
      };

      return stats;
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return null;
    }
  }
}

module.exports = new CollectionService();