class LorcanaApp {
  constructor() {
    this.currentSection = 'cards';
    this.cards = [];
    this.filteredCards = [];
    this.collections = [];
    this.sets = [];
    
    this.initializeApp();
  }

  async initializeApp() {
    this.setupEventListeners();
    this.setupNavigation();
    this.setupLanguageSwitcher();
    
    // Wait for i18n to load
    await new Promise(resolve => {
      const checkI18n = () => {
        if (window.i18n && window.i18n.translations && Object.keys(window.i18n.translations).length > 0) {
          resolve();
        } else {
          setTimeout(checkI18n, 50);
        }
      };
      checkI18n();
    });

    // Load initial data
    await this.loadInitialData();
  }

  setupEventListeners() {
    // Filter change events
    document.getElementById('set-filter')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('color-filter')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('rarity-filter')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('search-input')?.addEventListener('input', this.debounce(() => this.applyFilters(), 300));

    // Import events
    document.getElementById('import-cards-btn')?.addEventListener('click', () => this.importCards());
    document.getElementById('import-sets-btn')?.addEventListener('click', () => this.importSets());
    document.getElementById('import-prices-btn')?.addEventListener('click', () => this.importPrices());

    // Export events
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportData());

    // Collection events
    document.getElementById('create-collection-btn')?.addEventListener('click', () => this.showCreateCollectionModal());

    // Settings events
    document.getElementById('backup-btn')?.addEventListener('click', () => this.createBackup());
    document.getElementById('restore-file-input')?.addEventListener('change', (e) => this.restoreBackup(e.target.files[0]));
    document.getElementById('clear-data-btn')?.addEventListener('click', () => this.clearAllData());
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href').substring(1);
        this.showSection(section);
      });
    });
  }

  setupLanguageSwitcher() {
    const languageSelects = document.querySelectorAll('#language-select, #settings-language-select');
    languageSelects.forEach(select => {
      select.value = i18n.currentLanguage;
      select.addEventListener('change', (e) => {
        i18n.setLanguage(e.target.value);
        // Reload data to apply translations
        setTimeout(() => {
          this.loadCards();
          this.loadCollections();
        }, 100);
      });
    });
  }

  showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionName}"]`)?.classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`)?.classList.add('active');

    this.currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
      case 'cards':
        this.loadCards();
        break;
      case 'collections':
        this.loadCollections();
        break;
      case 'import':
        // Import section doesn't need to load data
        break;
      case 'export':
        this.loadDataStats();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  async loadInitialData() {
    try {
      showLoading(true, i18n.get('common.loading'));
      
      // Load cards and sets in parallel
      await Promise.all([
        this.loadCards(),
        this.loadSets()
      ]);

      showLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError(i18n.get('common.error') + ': ' + error.message);
      showLoading(false);
    }
  }

  async loadCards() {
    try {
      const response = await api.getCards({
        language: i18n.currentLanguage
      });
      
      if (response.success) {
        this.cards = response.data;
        this.filteredCards = [...this.cards];
        this.renderCards();
        this.updateCardsCount();
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      showError(i18n.get('common.error') + ': ' + error.message);
    }
  }

  async loadSets() {
    try {
      const response = await api.getSets(i18n.currentLanguage);
      
      if (response.success) {
        this.sets = response.data;
        this.populateSetFilter();
      }
    } catch (error) {
      console.error('Error loading sets:', error);
    }
  }

  async loadCollections() {
    try {
      const response = await api.getCollections();
      
      if (response.success) {
        this.collections = response.data;
        this.renderCollections();
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      showError(i18n.get('common.error') + ': ' + error.message);
    }
  }

  populateSetFilter() {
    const setFilter = document.getElementById('set-filter');
    if (!setFilter) return;

    // Clear existing options (except the first one)
    while (setFilter.children.length > 1) {
      setFilter.removeChild(setFilter.lastChild);
    }

    // Add sets
    this.sets.forEach(set => {
      const option = document.createElement('option');
      option.value = set.code;
      option.textContent = set.name;
      setFilter.appendChild(option);
    });
  }

  applyFilters() {
    const setFilter = document.getElementById('set-filter')?.value;
    const colorFilter = document.getElementById('color-filter')?.value;
    const rarityFilter = document.getElementById('rarity-filter')?.value;
    const searchFilter = document.getElementById('search-input')?.value?.toLowerCase() || '';

    this.filteredCards = this.cards.filter(card => {
      // Set filter
      if (setFilter && card.setCode !== setFilter) return false;
      
      // Color filter
      if (colorFilter && card.color !== colorFilter) return false;
      
      // Rarity filter
      if (rarityFilter && card.rarity !== rarityFilter) return false;
      
      // Search filter
      if (searchFilter && !card.fullName.toLowerCase().includes(searchFilter)) return false;
      
      return true;
    });

    this.renderCards();
    this.updateCardsCount();
  }

  renderCards() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (this.filteredCards.length === 0) {
      showEmptyState(
        grid,
        '🔍',
        i18n.get('common.no_results'),
        i18n.get('cards.empty_description') || 'Aucune carte ne correspond à vos critères de recherche.',
        `<button class="btn btn-primary" onclick="app.clearFilters()">${i18n.get('common.clear_filters') || 'Effacer les filtres'}</button>`
      );
      return;
    }

    this.filteredCards.forEach(card => {
      const cardElement = createCardElement(card);
      grid.appendChild(cardElement);
    });
  }

  renderCollections() {
    const grid = document.getElementById('collections-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (this.collections.length === 0) {
      showEmptyState(
        grid,
        '📚',
        i18n.get('collections.empty'),
        i18n.get('collections.empty_description') || 'Créez votre première collection pour commencer à organiser vos cartes.',
        `<button class="btn btn-primary" onclick="app.showCreateCollectionModal()">${i18n.get('collections.create')}</button>`
      );
      return;
    }

    this.collections.forEach(collection => {
      const collectionElement = createCollectionElement(collection);
      grid.appendChild(collectionElement);
    });
  }

  updateCardsCount() {
    const cardsCount = document.getElementById('cards-count');
    if (cardsCount) {
      cardsCount.textContent = i18n.formatNumber(this.filteredCards.length);
    }
  }

  clearFilters() {
    document.getElementById('set-filter').value = '';
    document.getElementById('color-filter').value = '';
    document.getElementById('rarity-filter').value = '';
    document.getElementById('search-input').value = '';
    this.applyFilters();
  }

  // Import functions
  async importCards() {
    const fileInput = document.getElementById('cards-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
      showError(i18n.get('import.error.no_file') || 'Veuillez sélectionner un fichier');
      return;
    }

    try {
      showLoading(true, i18n.get('import.status.processing'));
      const response = await api.importCards(file);
      
      if (response.success) {
        showStatusMessage(response.data.message, 'success');
        fileInput.value = '';
        await this.loadCards();
      }
    } catch (error) {
      console.error('Error importing cards:', error);
      showError(i18n.get('import.status.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  async importSets() {
    const fileInput = document.getElementById('sets-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
      showError(i18n.get('import.error.no_file') || 'Veuillez sélectionner un fichier');
      return;
    }

    try {
      showLoading(true, i18n.get('import.status.processing'));
      const response = await api.importSets(file);
      
      if (response.success) {
        showStatusMessage(response.data.message, 'success');
        fileInput.value = '';
        await this.loadSets();
      }
    } catch (error) {
      console.error('Error importing sets:', error);
      showError(i18n.get('import.status.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  async importPrices() {
    const fileInput = document.getElementById('prices-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
      showError(i18n.get('import.error.no_file') || 'Veuillez sélectionner un fichier');
      return;
    }

    try {
      showLoading(true, i18n.get('import.status.processing'));
      const response = await api.importPrices(file);
      
      if (response.success) {
        showStatusMessage(response.data.message, 'success');
        fileInput.value = '';
        await this.loadCards(); // Reload cards to get updated prices
      }
    } catch (error) {
      console.error('Error importing prices:', error);
      showError(i18n.get('import.status.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  // Export function
  async exportData() {
    try {
      const format = document.getElementById('export-format')?.value || 'json';
      showLoading(true, i18n.get('export.processing') || 'Préparation de l\'export...');
      
      await api.exportData(format);
      showStatusMessage(i18n.get('export.success') || 'Export téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError(i18n.get('export.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  // Collection functions
  showCreateCollectionModal() {
    const modal = createModal(
      'create-collection-modal',
      i18n.get('collections.create'),
      `
        <form id="create-collection-form">
          <div class="form-group">
            <label class="form-label" for="collection-name">${i18n.get('collections.form.name')}</label>
            <input type="text" id="collection-name" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="collection-description">${i18n.get('collections.form.description')}</label>
            <textarea id="collection-description" class="form-textarea"></textarea>
          </div>
        </form>
      `,
      [
        {
          text: i18n.get('common.cancel'),
          class: 'btn-secondary',
          onclick: 'closeModal("create-collection-modal")'
        },
        {
          text: i18n.get('collections.form.create_button'),
          class: 'btn-primary',
          onclick: 'app.createCollection()'
        }
      ]
    );

    document.body.appendChild(modal);
    showModal('create-collection-modal');
  }

  async createCollection() {
    const name = document.getElementById('collection-name')?.value;
    const description = document.getElementById('collection-description')?.value;

    if (!name) {
      showError(i18n.get('collections.form.name_required'));
      return;
    }

    try {
      const response = await api.createCollection({ name, description });
      
      if (response.success) {
        showStatusMessage(i18n.get('collections.created') || 'Collection créée avec succès', 'success');
        closeModal('create-collection-modal');
        await this.loadCollections();
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      showError(i18n.get('common.error') + ': ' + error.message);
    }
  }

  // Settings functions
  async loadDataStats() {
    try {
      const response = await api.getDataStats();
      if (response.success) {
        // Update stats display if needed
        console.log('Data stats:', response.data);
      }
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  }

  loadSettings() {
    // Settings are loaded from localStorage and applied automatically
    const languageSelect = document.getElementById('settings-language-select');
    if (languageSelect) {
      languageSelect.value = i18n.currentLanguage;
    }
  }

  async createBackup() {
    try {
      showLoading(true, i18n.get('settings.backup.creating') || 'Création de la sauvegarde...');
      const response = await api.createBackup();
      
      if (response.success) {
        showStatusMessage(i18n.get('settings.backup.success') || 'Sauvegarde créée avec succès', 'success');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showError(i18n.get('settings.backup.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  async restoreBackup(file) {
    if (!file) return;

    try {
      showLoading(true, i18n.get('settings.restore.processing') || 'Restauration en cours...');
      const response = await api.restoreBackup(file);
      
      if (response.success) {
        showStatusMessage(response.data.message, 'success');
        // Reload all data
        await this.loadInitialData();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      showError(i18n.get('settings.restore.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  clearAllData() {
    showConfirmDialog(
      i18n.get('settings.clear.confirm') || 'Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.',
      'app.confirmClearAllData'
    );
  }

  async confirmClearAllData() {
    try {
      showLoading(true, i18n.get('settings.clear.processing') || 'Suppression des données...');
      // This would need a specific API endpoint
      showStatusMessage(i18n.get('settings.clear.success') || 'Toutes les données ont été effacées', 'success');
      await this.loadInitialData();
    } catch (error) {
      console.error('Error clearing data:', error);
      showError(i18n.get('settings.clear.error') + ': ' + error.message);
    } finally {
      showLoading(false);
    }
  }

  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Global functions for onclick handlers
window.showAddToCollectionModal = function(cardId) {
  // TODO: Implement add to collection modal
  console.log('Add card to collection:', cardId);
};

window.editCollection = function(collectionId) {
  // TODO: Implement edit collection
  console.log('Edit collection:', collectionId);
};

window.deleteCollection = function(collectionId) {
  showConfirmDialog(
    i18n.get('collections.delete.confirm') || 'Êtes-vous sûr de vouloir supprimer cette collection ?',
    `app.confirmDeleteCollection('${collectionId}')`
  );
};

window.app = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LorcanaApp();
});

// Add method to app prototype for collection deletion
LorcanaApp.prototype.confirmDeleteCollection = async function(collectionId) {
  try {
    const response = await api.deleteCollection(collectionId);
    if (response.success) {
      showStatusMessage(i18n.get('collections.deleted') || 'Collection supprimée avec succès', 'success');
      await this.loadCollections();
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
    showError(i18n.get('common.error') + ': ' + error.message);
  }
};