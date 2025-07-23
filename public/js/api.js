class API {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Cards API
  async getCards(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    return this.request(`/cards${queryString ? '?' + queryString : ''}`);
  }

  async getCard(id) {
    return this.request(`/cards/${id}`);
  }

  async getSets(language = 'fr') {
    return this.request(`/cards/meta/sets?language=${language}`);
  }

  async getCardStats() {
    return this.request('/cards/meta/stats');
  }

  // Collections API
  async getCollections() {
    return this.request('/collections');
  }

  async getCollection(id) {
    return this.request(`/collections/${id}`);
  }

  async createCollection(data) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCollection(id, data) {
    return this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCollection(id) {
    return this.request(`/collections/${id}`, {
      method: 'DELETE'
    });
  }

  async addCardToCollection(collectionId, cardId, quantity = 1) {
    return this.request(`/collections/${collectionId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ cardId, quantity })
    });
  }

  async removeCardFromCollection(collectionId, cardId) {
    return this.request(`/collections/${collectionId}/cards/${cardId}`, {
      method: 'DELETE'
    });
  }

  // Data management API
  async importCards(file) {
    const formData = new FormData();
    formData.append('cardsFile', file);
    
    return this.request('/data/import/cards', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData
    });
  }

  async importSets(file) {
    const formData = new FormData();
    formData.append('setsFile', file);
    
    return this.request('/data/import/sets', {
      method: 'POST',
      headers: {},
      body: formData
    });
  }

  async importPrices(file) {
    const formData = new FormData();
    formData.append('pricesFile', file);
    
    return this.request('/data/import/prices', {
      method: 'POST',
      headers: {},
      body: formData
    });
  }

  async exportData(format = 'json') {
    const response = await fetch(`${this.baseURL}/data/export?format=${format}`);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorcana-export-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  }

  async getDataStats() {
    return this.request('/data/stats');
  }

  async createBackup() {
    return this.request('/data/backup', {
      method: 'POST'
    });
  }

  async restoreBackup(file) {
    const formData = new FormData();
    formData.append('backupFile', file);
    
    return this.request('/data/restore', {
      method: 'POST',
      headers: {},
      body: formData
    });
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}

// Create global API instance
const api = new API();

// Export for use in other files
window.api = api;