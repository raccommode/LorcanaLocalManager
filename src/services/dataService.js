const fs = require('fs-extra');
const path = require('path');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../data');

class DataService {
  constructor() {
    this.cardsPath = path.join(DATA_PATH, 'cards.json');
    this.setsPath = path.join(DATA_PATH, 'sets.json');
    this.pricesPath = path.join(DATA_PATH, 'prices.json');
    this.metadataPath = path.join(DATA_PATH, 'metadata.json');
    this.collectionsPath = path.join(DATA_PATH, 'collections.json');
    this.backupDir = path.join(DATA_PATH, 'backups');
    this.exportDir = path.join(DATA_PATH, 'exports');
  }

  async ensureDirectories() {
    await fs.ensureDir(DATA_PATH);
    await fs.ensureDir(this.backupDir);
    await fs.ensureDir(this.exportDir);
  }

  async importCards(filePath) {
    try {
      await this.ensureDirectories();
      
      const cardsData = await fs.readJson(filePath);
      
      if (!Array.isArray(cardsData)) {
        throw new Error('Cards data must be an array');
      }

      // Validate card structure
      const validatedCards = cardsData.map(card => ({
        id: card.id || this.generateCardId(),
        fullName: card.fullName || card.name || 'Unknown Card',
        name: card.name || card.fullName || 'Unknown Card',
        setCode: card.setCode || card.set_code || 'UNKNOWN',
        color: card.color || null,
        rarity: card.rarity || null,
        cost: card.cost || null,
        lore: card.lore || null,
        images: card.images || {},
        externalLinks: card.externalLinks || {},
        abilities: card.abilities || [],
        characteristics: card.characteristics || [],
        createdAt: card.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await fs.writeJson(this.cardsPath, validatedCards, { spaces: 2 });
      
      // Update metadata
      await this.updateMetadata({
        cards_imported: validatedCards.length,
        last_cards_import: new Date().toISOString()
      });

      // Clean up temp file
      await fs.remove(filePath);

      return {
        success: true,
        imported: validatedCards.length,
        message: `Successfully imported ${validatedCards.length} cards`
      };
    } catch (error) {
      console.error('Error importing cards:', error);
      throw new Error(`Failed to import cards: ${error.message}`);
    }
  }

  async importSets(filePath) {
    try {
      await this.ensureDirectories();
      
      const setsData = await fs.readJson(filePath);
      
      if (!Array.isArray(setsData)) {
        throw new Error('Sets data must be an array');
      }

      // Validate set structure
      const validatedSets = setsData.map(set => ({
        id: set.id || this.generateSetId(),
        code: set.code || set.setCode || 'UNKNOWN',
        name: set.name || `Set ${set.code || 'Unknown'}`,
        releaseDate: set.releaseDate || set.release_date || null,
        cardCount: set.cardCount || set.card_count || 0,
        languages: set.languages || ['fr'],
        createdAt: set.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await fs.writeJson(this.setsPath, validatedSets, { spaces: 2 });
      
      // Update metadata
      await this.updateMetadata({
        sets_imported: validatedSets.length,
        last_sets_import: new Date().toISOString()
      });

      // Clean up temp file
      await fs.remove(filePath);

      return {
        success: true,
        imported: validatedSets.length,
        message: `Successfully imported ${validatedSets.length} sets`
      };
    } catch (error) {
      console.error('Error importing sets:', error);
      throw new Error(`Failed to import sets: ${error.message}`);
    }
  }

  async importPrices(filePath) {
    try {
      await this.ensureDirectories();
      
      const pricesData = await fs.readJson(filePath);
      
      if (typeof pricesData !== 'object') {
        throw new Error('Prices data must be an object');
      }

      // Validate price structure
      const validatedPrices = {};
      Object.entries(pricesData).forEach(([cardId, priceInfo]) => {
        validatedPrices[cardId] = {
          price: typeof priceInfo === 'number' ? priceInfo : (priceInfo.price || 0),
          currency: priceInfo.currency || 'EUR',
          source: priceInfo.source || 'manual',
          lastUpdated: priceInfo.lastUpdated || new Date().toISOString()
        };
      });

      await fs.writeJson(this.pricesPath, validatedPrices, { spaces: 2 });
      
      // Update metadata
      await this.updateMetadata({
        prices_imported: Object.keys(validatedPrices).length,
        last_prices_import: new Date().toISOString()
      });

      // Clean up temp file
      await fs.remove(filePath);

      return {
        success: true,
        imported: Object.keys(validatedPrices).length,
        message: `Successfully imported prices for ${Object.keys(validatedPrices).length} cards`
      };
    } catch (error) {
      console.error('Error importing prices:', error);
      throw new Error(`Failed to import prices: ${error.message}`);
    }
  }

  async exportData(format = 'json') {
    try {
      await this.ensureDirectories();

      const exportData = {};

      // Read all data files
      if (await fs.pathExists(this.cardsPath)) {
        exportData.cards = await fs.readJson(this.cardsPath);
      }
      if (await fs.pathExists(this.setsPath)) {
        exportData.sets = await fs.readJson(this.setsPath);
      }
      if (await fs.pathExists(this.pricesPath)) {
        exportData.prices = await fs.readJson(this.pricesPath);
      }
      if (await fs.pathExists(this.collectionsPath)) {
        exportData.collections = await fs.readJson(this.collectionsPath);
      }
      if (await fs.pathExists(this.metadataPath)) {
        exportData.metadata = await fs.readJson(this.metadataPath);
      }

      // Add export metadata
      exportData.exportInfo = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        format: format
      };

      // Create export file
      const exportFileName = `lorcana-export-${new Date().toISOString().split('T')[0]}.${format}`;
      const exportPath = path.join(this.exportDir, exportFileName);

      if (format === 'json') {
        await fs.writeJson(exportPath, exportData, { spaces: 2 });
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }

      return exportPath;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  async getDataStats() {
    try {
      const stats = {
        cards: 0,
        sets: 0,
        prices: 0,
        collections: 0,
        lastUpdate: null,
        filesSizes: {}
      };

      // Count cards
      if (await fs.pathExists(this.cardsPath)) {
        const cards = await fs.readJson(this.cardsPath);
        stats.cards = cards.length;
        const stat = await fs.stat(this.cardsPath);
        stats.filesSizes.cards = stat.size;
      }

      // Count sets
      if (await fs.pathExists(this.setsPath)) {
        const sets = await fs.readJson(this.setsPath);
        stats.sets = sets.length;
        const stat = await fs.stat(this.setsPath);
        stats.filesSizes.sets = stat.size;
      }

      // Count prices
      if (await fs.pathExists(this.pricesPath)) {
        const prices = await fs.readJson(this.pricesPath);
        stats.prices = Object.keys(prices).length;
        const stat = await fs.stat(this.pricesPath);
        stats.filesSizes.prices = stat.size;
      }

      // Count collections
      if (await fs.pathExists(this.collectionsPath)) {
        const collections = await fs.readJson(this.collectionsPath);
        stats.collections = collections.length;
        const stat = await fs.stat(this.collectionsPath);
        stats.filesSizes.collections = stat.size;
      }

      // Get metadata
      if (await fs.pathExists(this.metadataPath)) {
        const metadata = await fs.readJson(this.metadataPath);
        stats.lastUpdate = metadata.last_update;
      }

      return stats;
    } catch (error) {
      console.error('Error getting data stats:', error);
      throw new Error(`Failed to get data statistics: ${error.message}`);
    }
  }

  async createBackup() {
    try {
      await this.ensureDirectories();

      const backupData = {};
      const backupTimestamp = new Date().toISOString();

      // Read all data files
      const dataFiles = [
        { key: 'cards', path: this.cardsPath },
        { key: 'sets', path: this.setsPath },
        { key: 'prices', path: this.pricesPath },
        { key: 'collections', path: this.collectionsPath },
        { key: 'metadata', path: this.metadataPath }
      ];

      for (const file of dataFiles) {
        if (await fs.pathExists(file.path)) {
          backupData[file.key] = await fs.readJson(file.path);
        }
      }

      // Add backup metadata
      backupData.backupInfo = {
        timestamp: backupTimestamp,
        version: '1.0.0',
        files: Object.keys(backupData)
      };

      // Create backup file
      const backupFileName = `backup-${backupTimestamp.split('T')[0]}-${Date.now()}.json`;
      const backupPath = path.join(this.backupDir, backupFileName);

      await fs.writeJson(backupPath, backupData, { spaces: 2 });

      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      await this.ensureDirectories();

      const backupData = await fs.readJson(backupPath);

      if (!backupData.backupInfo) {
        throw new Error('Invalid backup file format');
      }

      // Restore data files
      const restoredFiles = [];

      if (backupData.cards) {
        await fs.writeJson(this.cardsPath, backupData.cards, { spaces: 2 });
        restoredFiles.push('cards');
      }

      if (backupData.sets) {
        await fs.writeJson(this.setsPath, backupData.sets, { spaces: 2 });
        restoredFiles.push('sets');
      }

      if (backupData.prices) {
        await fs.writeJson(this.pricesPath, backupData.prices, { spaces: 2 });
        restoredFiles.push('prices');
      }

      if (backupData.collections) {
        await fs.writeJson(this.collectionsPath, backupData.collections, { spaces: 2 });
        restoredFiles.push('collections');
      }

      if (backupData.metadata) {
        await fs.writeJson(this.metadataPath, {
          ...backupData.metadata,
          restored_from_backup: new Date().toISOString(),
          backup_timestamp: backupData.backupInfo.timestamp
        }, { spaces: 2 });
        restoredFiles.push('metadata');
      }

      // Clean up temp file
      await fs.remove(backupPath);

      return {
        success: true,
        restoredFiles,
        backupTimestamp: backupData.backupInfo.timestamp,
        message: `Successfully restored ${restoredFiles.length} data files`
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  async updateMetadata(updates) {
    try {
      await this.ensureDirectories();

      let metadata = {};
      if (await fs.pathExists(this.metadataPath)) {
        metadata = await fs.readJson(this.metadataPath);
      }

      metadata = {
        ...metadata,
        ...updates,
        last_update: new Date().toISOString()
      };

      await fs.writeJson(this.metadataPath, metadata, { spaces: 2 });
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  }

  generateCardId() {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateSetId() {
    return 'set_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new DataService();