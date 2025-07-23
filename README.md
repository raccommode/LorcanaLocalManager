# LorcanaLocalManager

🃏 **LorcanaLocalManager** est une application Docker pour gérer localement vos collections de cartes Disney Lorcana. L'application offre une interface web moderne avec support multilingue (français/anglais).

## Fonctionnalités

- 📚 **Catalogue de cartes** : Parcourez et recherchez les cartes Disney Lorcana
- 🗂️ **Gestion de collections** : Organisez vos cartes en collections personnalisées
- 🔍 **Filtrage avancé** : Filtrez par extension, couleur, rareté et recherche textuelle
- 🌍 **Support multilingue** : Interface en français et anglais
- 📥 **Import/Export** : Importez des données de cartes, extensions et prix
- 💾 **Sauvegarde locale** : Toutes les données restent sur votre machine
- 🔄 **Sauvegarde/Restauration** : Créez des sauvegardes de vos données

## Installation et utilisation

### Prérequis

- Docker
- Docker Compose (optionnel)

### Démarrage rapide

1. **Clonez le repository** :
   ```bash
   git clone <repository-url>
   cd Lorcana
   ```

2. **Lancez avec Docker Compose** :
   ```bash
   docker-compose up --build
   ```

3. **Ou construisez et lancez manuellement** :
   ```bash
   # Construire l'image
   docker build -t lorcanalocalmanager .
   
   # Lancer l'application
   docker run -p 8080:8080 -v $(pwd)/data:/app/data lorcanalocalmanager
   ```

4. **Accédez à l'application** :
   Ouvrez votre navigateur à `http://localhost:8080`

### Commandes de développement

```bash
# Développement local (avec Node.js installé)
npm install
npm run dev

# Construction
npm run build

# Tests
npm test

# Linting
npm run lint

# Docker
npm run docker:build
npm run docker:run
npm run docker:compose
```

## Structure du projet

```
/
├── Dockerfile                 # Configuration Docker
├── docker-compose.yml        # Docker Compose
├── package.json              # Dépendances Node.js
├── src/                      # Code backend
│   ├── server.js            # Serveur Express principal
│   ├── routes/              # Routes API
│   │   ├── cards.js         # API des cartes
│   │   ├── collections.js   # API des collections
│   │   └── data.js          # API de gestion des données
│   └── services/            # Services métier
│       ├── cardService.js   # Service des cartes
│       ├── collectionService.js # Service des collections
│       └── dataService.js   # Service de données
├── public/                  # Interface web
│   ├── index.html           # Page principale
│   ├── css/                 # Styles CSS
│   └── js/                  # JavaScript frontend
├── locales/                 # Fichiers de traduction
│   ├── fr.json              # Français
│   └── en.json              # Anglais
├── data/                    # Données locales (gitignored)
├── config/                  # Configuration
└── CLAUDE.md               # Guide pour Claude Code
```

## API

L'application expose une API REST pour la gestion des cartes et collections :

### Cartes
- `GET /api/cards` - Liste des cartes avec filtres
- `GET /api/cards/:id` - Détails d'une carte
- `GET /api/cards/meta/sets` - Liste des extensions
- `GET /api/cards/meta/stats` - Statistiques des cartes

### Collections
- `GET /api/collections` - Liste des collections
- `POST /api/collections` - Créer une collection
- `GET /api/collections/:id` - Détails d'une collection
- `PUT /api/collections/:id` - Modifier une collection
- `DELETE /api/collections/:id` - Supprimer une collection
- `POST /api/collections/:id/cards` - Ajouter une carte à une collection
- `DELETE /api/collections/:id/cards/:cardId` - Retirer une carte d'une collection

### Données
- `POST /api/data/import/cards` - Importer des cartes
- `POST /api/data/import/sets` - Importer des extensions
- `POST /api/data/import/prices` - Importer des prix
- `GET /api/data/export` - Exporter toutes les données
- `GET /api/data/stats` - Statistiques des données
- `POST /api/data/backup` - Créer une sauvegarde
- `POST /api/data/restore` - Restaurer depuis une sauvegarde

## Format des données

### Cartes
```json
{
  "id": "card_unique_id",
  "fullName": "Nom complet de la carte",
  "setCode": "TFC",
  "color": "Ambre",
  "rarity": "Rare",
  "cost": 3,
  "lore": 2,
  "images": {
    "thumbnail": "url_vers_image"
  },
  "externalLinks": {
    "cardTraderUrl": "url_vers_cardtrader"
  }
}
```

### Extensions
```json
{
  "id": "set_unique_id",
  "code": "TFC",
  "name": "The First Chapter",
  "releaseDate": "2023-08-18",
  "cardCount": 204
}
```

### Prix
```json
{
  "card_id": {
    "price": 12.50,
    "currency": "EUR",
    "source": "cardtrader",
    "lastUpdated": "2023-12-01T10:00:00Z"
  }
}
```

## Configuration

### Variables d'environnement

- `PORT` : Port d'écoute (défaut: 8080)
- `NODE_ENV` : Environnement (development/production)
- `DATA_PATH` : Chemin vers le dossier des données (défaut: ./data)

### Volumes Docker

- `/app/data` : Données persistantes (cartes, collections, sauvegardes)
- `/app/config` : Fichiers de configuration

## Support et contributions

Ce projet utilise Claude Code pour le développement. Consultez `CLAUDE.md` pour les détails techniques destinés aux instances futures de Claude Code.

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.