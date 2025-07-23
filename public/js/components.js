// Card Component
function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.dataset.cardId = card.id;

  const priceText = card.price 
    ? i18n.formatCurrency(card.price.price, card.price.currency)
    : i18n.get('cards.details.not_available');

  const imageUrl = card.images?.thumbnail || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTi9BPC90ZXh0Pjwvc3ZnPg==';

  cardDiv.innerHTML = `
    <img src="${imageUrl}" 
         alt="${card.fullName}" 
         class="card-image"
         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTi9BPC90ZXh0Pjwvc3ZnPg=='">
    <div class="card-content">
      <div class="card-title">${card.fullName}</div>
      <div class="card-price">${priceText}</div>
      <div class="card-details">
        <div class="card-detail-row">
          <span class="card-detail-label">${i18n.get('cards.details.set')}:</span>
          <span>${card.setCode}</span>
        </div>
        <div class="card-detail-row">
          <span class="card-detail-label">${i18n.get('cards.details.color')}:</span>
          <span>${card.color ? i18n.getColorName(card.color) : i18n.get('cards.details.not_specified')}</span>
        </div>
        <div class="card-detail-row">
          <span class="card-detail-label">${i18n.get('cards.details.rarity')}:</span>
          <span>${card.rarity ? i18n.getRarityName(card.rarity) : i18n.get('cards.details.not_specified')}</span>
        </div>
        <div class="card-detail-row">
          <span class="card-detail-label">${i18n.get('cards.details.cost')}:</span>
          <span>${card.cost || i18n.get('cards.details.not_available')}</span>
        </div>
        ${card.lore ? `
        <div class="card-detail-row">
          <span class="card-detail-label">${i18n.get('cards.details.lore')}:</span>
          <span>${card.lore}</span>
        </div>
        ` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" onclick="showAddToCollectionModal('${card.id}')">
          ${i18n.get('cards.actions.add_to_collection')}
        </button>
        ${card.externalLinks?.cardTraderUrl ? `
        <a href="${card.externalLinks.cardTraderUrl}" target="_blank" class="btn btn-secondary btn-sm">
          ${i18n.get('cards.actions.view_on_cardtrader')}
        </a>
        ` : ''}
      </div>
    </div>
  `;

  return cardDiv;
}

// Collection Component
function createCollectionElement(collection) {
  const collectionDiv = document.createElement('div');
  collectionDiv.className = 'collection-card';
  collectionDiv.dataset.collectionId = collection.id;

  const cardCount = collection.cards ? collection.cards.length : 0;
  const totalQuantity = collection.cards 
    ? collection.cards.reduce((sum, card) => sum + (card.quantity || 1), 0)
    : 0;

  collectionDiv.innerHTML = `
    <div class="collection-header">
      <div>
        <div class="collection-title">${collection.name}</div>
        ${collection.description ? `<div class="collection-description">${collection.description}</div>` : ''}
      </div>
      <div class="collection-actions">
        <button class="btn btn-secondary btn-sm" onclick="editCollection('${collection.id}')">
          ${i18n.get('collections.edit')}
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteCollection('${collection.id}')">
          ${i18n.get('collections.delete')}
        </button>
      </div>
    </div>
    <div class="collection-stats">
      <span>${cardCount} ${i18n.get('collections.details.cards_count')}</span>
      <span>${i18n.get('collections.details.created')} ${i18n.formatDate(collection.createdAt)}</span>
    </div>
  `;

  return collectionDiv;
}

// Modal Component
function createModal(id, title, content, actions = []) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = id;

  const actionsHTML = actions.map(action => 
    `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick}">${action.text}</button>`
  ).join('');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeModal('${id}')">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${actions.length > 0 ? `
      <div class="modal-footer">
        ${actionsHTML}
      </div>
      ` : ''}
    </div>
  `;

  return modal;
}

// Status Message Component
function showStatusMessage(message, type = 'info', duration = 5000) {
  const statusDiv = document.createElement('div');
  statusDiv.className = `status-message status-${type}`;
  statusDiv.textContent = message;

  // Remove existing status messages
  const existing = document.querySelectorAll('.status-message');
  existing.forEach(el => el.remove());

  // Add to top of main content
  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(statusDiv, mainContent.firstChild);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      statusDiv.remove();
    }, duration);
  }

  return statusDiv;
}

// Loading Spinner Component
function showLoading(show = true, text = null) {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (!loadingIndicator) return;

  if (show) {
    if (text) {
      const loadingText = loadingIndicator.querySelector('p');
      if (loadingText) {
        loadingText.textContent = text;
      }
    }
    loadingIndicator.style.display = 'block';
  } else {
    loadingIndicator.style.display = 'none';
  }
}

// Error Message Component
function showError(message, persistent = false) {
  const errorDiv = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  
  if (errorDiv && errorText) {
    errorText.textContent = message;
    errorDiv.style.display = 'block';

    if (!persistent) {
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 10000);
    }
  }
}

function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Empty State Component
function showEmptyState(container, icon, title, description, actionButton = null) {
  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'empty-state';

  emptyDiv.innerHTML = `
    <div class="empty-state-icon">${icon}</div>
    <div class="empty-state-title">${title}</div>
    <div class="empty-state-description">${description}</div>
    ${actionButton ? `<div class="empty-state-action">${actionButton}</div>` : ''}
  `;

  container.innerHTML = '';
  container.appendChild(emptyDiv);
}

// Modal Management
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// File Upload Component
function createFileUploadArea(containerId, acceptedTypes = '.json', onFileSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const uploadArea = document.createElement('div');
  uploadArea.className = 'file-upload-area';
  uploadArea.innerHTML = `
    <input type="file" accept="${acceptedTypes}" style="display: none;">
    <div class="upload-text">
      <p>📁 ${i18n.get('common.drag_drop_or_click')}</p>
      <p class="upload-hint">${i18n.get('common.supported_formats')}: ${acceptedTypes}</p>
    </div>
  `;

  const fileInput = uploadArea.querySelector('input[type="file"]');
  
  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  });

  container.appendChild(uploadArea);
  return uploadArea;
}

// Color Badge Component
function getColorBadgeClass(color) {
  if (!color) return '';
  
  const colorMap = {
    'Ambre': 'amber',
    'Amber': 'amber',
    'Améthyste': 'amethyst',
    'Amethyst': 'amethyst',
    'Émeraude': 'emerald',
    'Emerald': 'emerald',
    'Rubis': 'ruby',
    'Ruby': 'ruby',
    'Saphir': 'sapphire',
    'Sapphire': 'sapphire',
    'Acier': 'steel',
    'Steel': 'steel'
  };

  return `color-${colorMap[color] || color.toLowerCase()}`;
}

// Rarity Badge Component
function getRarityBadgeClass(rarity) {
  if (!rarity) return '';
  
  const rarityMap = {
    'Commune': 'common',
    'Common': 'common',
    'Inhabituelle': 'uncommon',
    'Uncommon': 'uncommon',
    'Rare': 'rare',
    'Super Rare': 'super-rare',
    'Légendaire': 'legendary',
    'Legendary': 'legendary',
    'Enchantée': 'enchanted',
    'Enchanted': 'enchanted'
  };

  return `rarity-${rarityMap[rarity] || rarity.toLowerCase().replace(/\s+/g, '-')}`;
}

// Confirmation Dialog
function showConfirmDialog(message, onConfirm, onCancel = null) {
  const dialog = createModal(
    'confirm-dialog',
    i18n.get('common.confirmation'),
    `<p>${message}</p>`,
    [
      {
        text: i18n.get('common.cancel'),
        class: 'btn-secondary',
        onclick: `closeModal('confirm-dialog'); ${onCancel ? onCancel + '()' : ''}`
      },
      {
        text: i18n.get('common.confirm'),
        class: 'btn-danger',
        onclick: `closeModal('confirm-dialog'); ${onConfirm}()`
      }
    ]
  );

  // Remove existing dialog
  const existing = document.getElementById('confirm-dialog');
  if (existing) existing.remove();

  document.body.appendChild(dialog);
  showModal('confirm-dialog');
}