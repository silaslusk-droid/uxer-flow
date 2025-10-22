# Self-Hosted Sitemap Generator

[![Node.js](https://img.shields.io/badge/node.js-16+-green)](https://nodejs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A lightweight, self-hosted visual sitemap generator with modern UI and dark mode support. Crawl websites, edit sitemaps visually, and export XML. No Docker required!

---

## 🚀 Quick Start (No Docker Required)

### Option 1: One-Click Setup (Windows)
1. **Install [Node.js](https://nodejs.org/) (version 16 or higher)**
2. **Download this project as a ZIP from GitHub**
   - Click the green "Code" button → "Download ZIP"
   - Extract the ZIP to a folder (e.g. `C:\SitemapGenerator`)
3. **Double-click `setup.bat`**
   - This will install all dependencies and build the project
   - Wait for setup to finish (first run may take a few minutes)
4. **Double-click `start-dev.bat`**
   - This will start both frontend and backend servers
5. **Open [http://localhost:5173](http://localhost:5173) in your browser**
   - Use the app! All data is stored locally.

### Option 2: Command Line Setup
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Option 3: Production Mode
```bash
# Install and build everything
npm run setup

# Start production servers
npm start
```

---

## 📦 Releases
- Download the latest ZIP from the [GitHub Releases](https://github.com/YOUR_GITHUB_REPO/releases) page for easy install.

---

## 🐳 Docker Compose (Alternative)
If you prefer Docker, you can still use the original Docker setup:
```bash
docker-compose up --build
```

---

## 🛠️ Troubleshooting

### Common Issues
- **Node.js not found**: Install Node.js from https://nodejs.org/ (version 16+)
- **Port already in use**: Close other apps using ports 5173 or 3000
- **Permission errors**: Run command prompt as administrator
- **Build failures**: Clear node_modules and reinstall: `npm run clean && npm run install:all`

### System Requirements
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Memory**: At least 2GB RAM
- **Disk**: At least 500MB free space

---

## 📁 Clean GitHub Repo
- `.gitignore` excludes build files, node_modules, and SQLite DB.
- `.gitattributes` for cross-platform line endings.

---

## 💡 Project Overview

### Features

- 📊 Interactive graph visualization using Cytoscape.js
- 🕷️ Website crawler with configurable depth and limits
- 🗺️ XML sitemap export
- 📝 Visual sitemap editing with drag-and-drop support
- 💾 Persistent storage using SQLite
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode support
- 🚀 Easy local development (no Docker required)
- 🐳 Docker support for production deployment

### Quick Start

#### Using Docker Compose

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sitemap-generator
   ```

2. Start the services:
   ```bash
   docker-compose up --build
   ```

3. Open http://localhost:5173 in your browser

The application will persist its data in a Docker volume named `sitemap-data`.

#### Development Setup

##### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at http://localhost:3000.

##### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173.

### API Reference

#### Projects

- `GET /api/projects`
  ```bash
  curl http://localhost:3000/api/projects
  ```

- `POST /api/projects`
  ```bash
  curl -X POST http://localhost:3000/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name": "My Project"}'
  ```

- `GET /api/projects/:id`
  ```bash
  curl http://localhost:3000/api/projects/1
  ```

#### Nodes

- `GET /api/projects/:pid/nodes`
  ```bash
  curl http://localhost:3000/api/projects/1/nodes
  ```

- `POST /api/projects/:pid/nodes`
  ```bash
  curl -X POST http://localhost:3000/api/projects/1/nodes \
    -H "Content-Type: application/json" \
    -d '{"title": "Homepage", "url": "https://example.com"}'
  ```

#### Crawler

- `POST /api/projects/:pid/crawl`
  ```bash
  curl -X POST http://localhost:3000/api/projects/1/crawl \
    -H "Content-Type: application/json" \
    -d '{"startUrl": "https://example.com", "maxDepth": 3, "maxPages": 200}'
  ```

#### Export

- `GET /api/projects/:pid/export/sitemap.xml`
  ```bash
  curl http://localhost:3000/api/projects/1/export/sitemap.xml > sitemap.xml
  ```

### Architecture

#### Backend

- **Fastify** - Lightweight Node.js web framework
- **SQLite** (better-sqlite3) - File-based database
- **Cheerio** - HTML parsing for the crawler
- **Undici** - Modern HTTP client for crawling

#### Frontend

- **React** - UI framework
- **Vite** - Build tool and development server
- **Cytoscape.js** - Graph visualization
- **Axios** - HTTP client

#### Database Schema

```sql
-- Projects
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nodes (Pages)
CREATE TABLE nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    meta TEXT,
    x REAL,
    y REAL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Edges (Links)
CREATE TABLE edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    source INTEGER NOT NULL,
    target INTEGER NOT NULL,
    type TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (source) REFERENCES nodes(id),
    FOREIGN KEY (target) REFERENCES nodes(id)
);
```

## Usage Guide

1. Create a new project using the "New Project" button
2. Enter a start URL in the crawler input and click "Start Crawl"
3. Wait for the crawler to discover pages and their relationships
4. The graph will automatically update with the discovered pages
5. Drag nodes to arrange them visually
6. Click "Export XML" to download the sitemap file

### Graph Navigation

- **Pan**: Click and drag the background
- **Zoom**: Mouse wheel or pinch gesture
- **Move Node**: Click and drag any node
- **Create Edge**: Drag a node close to another node
- **Select Node**: Click on a node to view/edit its details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details.

## Security Notes

This MVP version doesn't include authentication. For public deployment, consider:
1. Adding authentication (e.g., JWT)
2. Rate limiting the crawler
3. Input validation and sanitization
4. Implementing robots.txt compliance

## Roadmap

Future improvements could include:
- [ ] User authentication
- [ ] Advanced graph layouts
- [ ] Real-time collaboration
- [ ] Robots.txt compliance
- [ ] PDF/PNG export
- [ ] Custom metadata fields
- [ ] Import from existing sitemaps
