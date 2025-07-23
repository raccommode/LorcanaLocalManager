# 🃏 LorcanaLocalManager

**LorcanaLocalManager** est une application web Docker pour gérer votre collection de cartes Disney Lorcana localement. L'application offre une interface moderne avec thème sombre pour explorer, filtrer et organiser vos cartes Lorcana avec support multilingue (français/anglais).

## ✨ Fonctionnalités

### 🎯 Fonctionnalités actuelles
- **Catalogue de cartes** : Parcourez toutes les cartes Disney Lorcana disponibles
- **Filtrage avancé** : Filtrez par set, couleur, rareté
- **Interface moderne** : Thème sombre élégant et responsive
- **Paramètres utilisateur** : Gestion de la langue, profil, préférences d'affichage
- **Base de données locale** : SQLite pour sauvegarder vos paramètres
- **Support multilingue** : Interface en français et anglais

### 🚧 En développement
- **Produits** : Gestion des produits Lorcana (boosters, decks, etc.)
- **Mes Achats** : Suivi de vos achats de cartes et produits
- **Mes Ventes** : Gestion de vos ventes
- **Import/Export** : Sauvegarde et restauration de vos données

## 🚀 Installation

### Prérequis
- Docker
- Docker Compose (optionnel)

### Déploiement rapide

#### Avec Docker
```bash
# Cloner le repository
git clone <votre-repo-url>
cd Lorcana

# Construire l'image Docker
docker build -t lorcanalocalmanager .

# Lancer l'application
docker run -p 8080:8080 lorcanalocalmanager
```

#### Avec Docker Compose
```bash
# Lancer avec Docker Compose
docker-compose up --build

# En arrière-plan
docker-compose up -d --build
```

#### Pour Umbrel
L'application est compatible avec Umbrel. Le port 8080 est configuré et aucun port externe n'est exposé pour éviter les conflits.

### 🌐 Accès
Une fois démarrée, l'application est accessible à :
- **Local** : http://localhost:8080
- **Umbrel** : Via l'interface Umbrel

## 📁 Structure du projet

```
/
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Docker Compose (optionnel)
├── package.json           # Dépendances Node.js
├── server.js              # Serveur Express principal
├── public/                # Fichiers statiques
│   ├── index.html         # Page d'accueil
│   ├── cartes.html        # Catalogue des cartes
│   ├── parametre.html     # Page des paramètres
│   ├── header.html        # En-tête partagé
│   ├── footer.html        # Pied de page partagé
│   └── style.css          # Styles CSS (thème sombre)
├── data/                  # Base de données SQLite
│   └── settings.db        # Paramètres utilisateur
└── README.md              # Documentation
```

## 🛠️ Développement

### Variables d'environnement
- `PORT` : Port d'écoute du serveur (défaut: 8080)

### Base de données
L'application utilise SQLite pour stocker :
- Paramètres utilisateur (langue, préférences)
- Configuration de l'interface
- Données de profil

### API Endpoints
- `GET /health` : Vérification de l'état du serveur
- `GET /api/settings` : Récupération des paramètres
- `POST /api/settings` : Sauvegarde des paramètres

## 🎨 Interface

L'application dispose d'un **thème sombre moderne** avec :
- Navigation intuitive
- Design responsive (mobile/desktop)
- Filtres interactifs
- Interface multilingue

### Pages disponibles
- **🏠 Accueil** : Vue d'ensemble de l'application
- **🃏 Cartes** : Catalogue complet des cartes Lorcana
- **⚙️ Paramètres** : Configuration utilisateur et préférences

## 🌍 Support multilingue

### Langues supportées
- **Français** (fr) - Langue par défaut
- **English** (en) - Support international

La langue peut être changée dans les paramètres et est sauvegardée automatiquement.

## 📊 Données

### Cartes incluses
L'application contient des exemples de cartes des sets :
- **TFC** - The First Chapter
- **ROF** - Rise of the Floodborn  
- **ITI** - Into the Inklands

### Couleurs Lorcana
- **Ambre** (Amber)
- **Améthyste** (Amethyst)
- **Émeraude** (Emerald)
- **Rubis** (Ruby)
- **Saphir** (Sapphire)
- **Acier** (Steel)

## 🔧 Configuration

### Paramètres disponibles
- **Langue d'interface** : Français/Anglais
- **Profil utilisateur** : Nom, email
- **Préférences d'affichage** : Cartes par page, vue par défaut
- **Gestion des données** : Export/import (à venir)

## 🐳 Docker

### Image Docker
L'application est entièrement containerisée avec :
- Base Node.js 18 Alpine
- Installation automatique des dépendances
- Création du répertoire de données
- Configuration du port 8080

### Volumes recommandés
Pour persister les données :
```bash
docker run -p 8080:8080 -v ./data:/app/data lorcanalocalmanager
```

## 🚀 Roadmap

### Version actuelle (v1.0)
- ✅ Interface utilisateur complète
- ✅ Catalogue de cartes avec filtres
- ✅ Paramètres utilisateur avec SQLite
- ✅ Thème sombre responsive

### Prochaines versions
- 🔄 Gestion complète de la collection personnelle
- 🔄 Import de données depuis fichiers CSV/JSON
- 🔄 Statistiques de collection
- 🔄 Mode d'édition de cartes
- 🔄 Sauvegarde cloud (optionnelle)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens utiles

- **Disney Lorcana** : Site officiel du jeu
- **Docker** : https://docker.com
- **Umbrel** : https://umbrel.com

---

**Développé avec ❤️ pour la communauté Disney Lorcana**