class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'fr';
    this.translations = {};
    this.loadTranslations();
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/locales/${this.currentLanguage}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${this.currentLanguage}`);
      }
      this.translations = await response.json();
      this.applyTranslations();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to French if error
      if (this.currentLanguage !== 'fr') {
        this.currentLanguage = 'fr';
        this.loadTranslations();
      }
    }
  }

  setLanguage(language) {
    if (this.currentLanguage === language) return;
    
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Update language selects
    const selects = document.querySelectorAll('#language-select, #settings-language-select');
    selects.forEach(select => {
      select.value = language;
    });
    
    this.loadTranslations();
  }

  get(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value === 'string') {
      // Replace parameters in the string
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return value;
  }

  applyTranslations() {
    // Update elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.get(key);
      
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    });

    // Update elements with data-i18n-placeholder attribute
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.get(key);
      
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    });

    // Update elements with data-i18n-title attribute
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.get(key);
      
      if (translation && translation !== key) {
        element.title = translation;
      }
    });

    // Update dynamic content
    this.updateDynamicContent();
  }

  updateDynamicContent() {
    // Update app title and subtitle
    const appTitle = document.getElementById('app-title');
    const appSubtitle = document.getElementById('app-subtitle');
    
    if (appTitle) {
      appTitle.textContent = this.get('app.title');
    }
    if (appSubtitle) {
      appSubtitle.textContent = this.get('app.subtitle');
    }

    // Update cards count text
    const cardsCount = document.getElementById('cards-count');
    if (cardsCount) {
      const count = cardsCount.textContent || '0';
      const countText = document.querySelector('[data-i18n="cards.stats.cards_found"]');
      if (countText) {
        countText.textContent = this.get('cards.stats.cards_found');
      }
    }
  }

  formatNumber(number) {
    return new Intl.NumberFormat(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US').format(number);
  }

  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      ...defaultOptions,
      ...options
    }).format(new Date(date));
  }

  getColorName(color) {
    const colorKey = color.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const colorMap = {
      'ambre': 'amber',
      'amber': 'amber',
      'amethyste': 'amethyst',
      'amethyst': 'amethyst',
      'emeraude': 'emerald',
      'emerald': 'emerald',
      'rubis': 'ruby',
      'ruby': 'ruby',
      'saphir': 'sapphire',
      'sapphire': 'sapphire',
      'acier': 'steel',
      'steel': 'steel'
    };

    const mappedColor = colorMap[colorKey] || colorKey;
    return this.get(`cards.filters.colors.${mappedColor}`) || color;
  }

  getRarityName(rarity) {
    const rarityKey = rarity.toLowerCase().replace(/\s+/g, '_');
    const rarityMap = {
      'commune': 'common',
      'common': 'common',
      'inhabituelle': 'uncommon',
      'uncommon': 'uncommon',
      'rare': 'rare',
      'super_rare': 'super_rare',
      'legendaire': 'legendary',
      'legendary': 'legendary',
      'enchantee': 'enchanted',
      'enchanted': 'enchanted'
    };

    const mappedRarity = rarityMap[rarityKey] || rarityKey;
    return this.get(`cards.filters.rarities.${mappedRarity}`) || rarity;
  }
}

// Initialize i18n
const i18n = new I18n();

// Export for use in other files
window.i18n = i18n;