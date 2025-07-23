const fs = require('fs-extra');
const path = require('path');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../data');

class CardService {
  constructor() {
    this.cardsPath = path.join(DATA_PATH, 'cards.json');
    this.setsPath = path.join(DATA_PATH, 'sets.json');
    this.pricesPath = path.join(DATA_PATH, 'prices.json');
    this.metadataPath = path.join(DATA_PATH, 'metadata.json');
  }

  async ensureDataFiles() {
    await fs.ensureDir(DATA_PATH);
    
    if (!await fs.pathExists(this.cardsPath)) {
      await fs.writeJson(this.cardsPath, []);
    }
    if (!await fs.pathExists(this.setsPath)) {
      await fs.writeJson(this.setsPath, []);
    }
    if (!await fs.pathExists(this.pricesPath)) {
      await fs.writeJson(this.pricesPath, {});
    }
    if (!await fs.pathExists(this.metadataPath)) {
      await fs.writeJson(this.metadataPath, { 
        last_update: new Date().toISOString(),
        version: '1.0.0'
      });
    }
  }

  async getCards(filters = {}) {
    try {
      await this.ensureDataFiles();
      
      let cards = await fs.readJson(this.cardsPath);
      
      // Apply filters
      if (filters.set) {
        cards = cards.filter(card => card.setCode === filters.set);
      }
      
      if (filters.color) {
        cards = cards.filter(card => card.color === filters.color);
      }
      
      if (filters.rarity) {
        cards = cards.filter(card => card.rarity === filters.rarity);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        cards = cards.filter(card => 
          card.fullName?.toLowerCase().includes(searchTerm) ||
          card.name?.toLowerCase().includes(searchTerm)
        );
      }

      // Add pricing information
      const prices = await this.getPrices();
      cards = cards.map(card => ({
        ...card,
        price: prices[card.id] || null
      }));

      return cards;
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  async getCardById(id) {
    try {
      const cards = await this.getCards();
      return cards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  }

  async getSets(language = 'fr') {
    try {
      await this.ensureDataFiles();
      const sets = await fs.readJson(this.setsPath);
      
      // Filter by language if needed
      return sets.map(set => ({
        ...set,
        name: set.name || `Extension ${set.code}`
      }));
    } catch (error) {
      console.error('Error getting sets:', error);
      return [];
    }
  }

  async getPrices() {
    try {
      await this.ensureDataFiles();
      return await fs.readJson(this.pricesPath);
    } catch (error) {
      console.error('Error getting prices:', error);
      return {};
    }
  }

  async getStats() {
    try {
      const cards = await this.getCards();
      const sets = await this.getSets();
      const prices = await this.getPrices();

      // Calculate statistics
      const stats = {
        totalCards: cards.length,
        totalSets: sets.length,
        totalPrices: Object.keys(prices).length,
        byColor: {},
        byRarity: {},
        bySet: {}
      };

      // Count by color
      cards.forEach(card => {
        if (card.color) {
          stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1;
        }
      });

      // Count by rarity
      cards.forEach(card => {
        if (card.rarity) {
          stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
        }
      });

      // Count by set
      cards.forEach(card => {
        if (card.setCode) {
          stats.bySet[card.setCode] = (stats.bySet[card.setCode] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalCards: 0,
        totalSets: 0,
        totalPrices: 0,
        byColor: {},
        byRarity: {},
        bySet: {}
      };
    }
  }

  async updateCard(id, cardData) {
    try {
      await this.ensureDataFiles();
      const cards = await fs.readJson(this.cardsPath);
      
      const cardIndex = cards.findIndex(card => card.id === id);
      if (cardIndex === -1) {
        return null;
      }

      cards[cardIndex] = { ...cards[cardIndex], ...cardData };
      await fs.writeJson(this.cardsPath, cards, { spaces: 2 });

      return cards[cardIndex];
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  async addCard(cardData) {
    try {
      await this.ensureDataFiles();
      const cards = await fs.readJson(this.cardsPath);
      
      const newCard = {
        id: cardData.id || this.generateId(),
        ...cardData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      cards.push(newCard);
      await fs.writeJson(this.cardsPath, cards, { spaces: 2 });

      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  }

  async deleteCard(id) {
    try {
      await this.ensureDataFiles();
      const cards = await fs.readJson(this.cardsPath);
      
      const filteredCards = cards.filter(card => card.id !== id);
      if (filteredCards.length === cards.length) {
        return false; // Card not found
      }

      await fs.writeJson(this.cardsPath, filteredCards, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  generateId() {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new CardService();