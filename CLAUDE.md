# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LorcanaLocalManager** is a Docker-based web application for managing Disney Lorcana trading card collections locally. The application provides a web interface for browsing, filtering, and managing Lorcana cards with support for both French and English languages.

## Architecture

- **Docker application**: Containerized web application with web interface
- **Multilingual support**: French and English language support
- **Web-based interface**: Modern web UI for card management
- **Local data management**: Manages Lorcana card data locally
- **Collection management**: Features for organizing and tracking card collections

## Development Commands

Since this will be a Docker application, common development commands will likely include:

```bash
# Build the Docker image
docker build -t lorcanalocalmanager .

# Run the application
docker run -p 8080:8080 lorcanalocalmanager

# Development with Docker Compose (if applicable)
docker-compose up --build

# Stop the application
docker-compose down
```

## Key Features (Planned)

- **Card catalog**: Browse and search Disney Lorcana cards
- **Collection tracking**: Manage personal card collections
- **Filtering system**: Filter by set, color, rarity, and other attributes
- **Multilingual interface**: Switch between French and English
- **Local data storage**: Keep all data local without external dependencies
- **Import/Export**: Manage card data and collections

## File Structure (Expected)

```
/
├── Dockerfile                 # Docker configuration
├── docker-compose.yml        # Docker Compose setup (if used)
├── src/                      # Application source code
├── web/                      # Web interface files
├── data/                     # Local data storage
├── locales/                  # Language files (fr/en)
└── README.md                 # Project documentation
```

## Language Support

The application supports:
- **French (fr)**: Primary language for French users
- **English (en)**: International support

Language switching should be available in the web interface.