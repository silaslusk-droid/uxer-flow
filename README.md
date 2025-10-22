# Website Project Planner

[![Node.js](https://img.shields.io/badge/node.js-16+-green)](https://nodejs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive, self-hosted web application for planning website projects locally on Windows 11. Manage sitemaps, user flows, wireframes, and content planning all in one place with an intuitive dark mode interface.

---

## Features

### Core Modules

#### 1. Sitemap Editor
- Hierarchical page structure with drag-and-drop organization
- Visual tree view with parent-child relationships
- Page metadata: title, URL, status (Planned/In Progress/Completed), notes
- Content planning field for each page
- Export to XML and CSV formats

#### 2. User Flow Editor
- Interactive flowchart creator with drag-and-drop
- Standard flowchart symbols:
  - Rectangle (Process)
  - Diamond (Decision)
  - Oval (Start/End)
  - Parallelogram (Input/Output)
- Connection arrows between elements
- Visual canvas for mapping user journeys

#### 3. Wireframe Tool
- Desktop and mobile view modes
- Pre-built UI component library:
  - Image placeholders
  - Text blocks and headings
  - Buttons and form fields
  - Navigation bars
  - Checkboxes and inputs
- Drag-and-drop interface
- Responsive canvas sizing

#### 4. General Features
- Multiple project management
- Dark mode with persistence
- Local SQLite database storage
- No external dependencies or cloud services
- Export capabilities (XML, CSV)

---

## Quick Start (Windows 11)

### Option 1: One-Click Setup
1. **Install [Node.js](https://nodejs.org/) (version 16 or higher)**
2. **Download this project**
   - Clone: `git clone <repository-url>`
   - Or download as ZIP from GitHub
3. **Double-click `setup.bat`**
   - Installs all dependencies automatically
   - Builds the frontend
4. **Double-click `start-dev.bat`**
   - Starts both frontend and backend servers
5. **Open [http://localhost:5173](http://localhost:5173)**
   - Start planning your website projects!

### Option 2: Command Line
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Option 3: Production Mode
```bash
# Setup everything
npm run setup

# Start production servers
npm start
```

---

## Usage Guide

### Creating Your First Project

1. Click **"+ New"** button in the header
2. Enter a project name
3. Select the project from the dropdown
4. Choose a module tab (Sitemap, User Flow, or Wireframe)

### Sitemap Module

**Create Pages:**
- Click **"+ Add Page"** to create a root-level page
- Select a page and click **"+ Add Child Page"** to create hierarchy
- Fill in title, URL, status, and notes

**Organize Structure:**
- Pages are displayed in a tree view
- Expand/collapse sections with arrow buttons
- View page details in the right panel

**Edit Content:**
- Select a page to view details
- Click **"Edit"** to modify page properties
- Use the content planning field for text drafts

**Export:**
- Click **"Export XML"** for sitemap.xml (SEO-ready)
- Click **"Export CSV"** for hierarchical spreadsheet

### User Flow Module

**Add Elements:**
- Click element types in the sidebar to add them to canvas
- Drag elements to position them

**Connect Elements:**
- Select an element
- Click **"Connect"** button
- Click the target element to create an arrow

**Edit Labels:**
- Select an element
- Update the label in the sidebar
- Changes save automatically

### Wireframe Module

**Setup:**
- Click **"+ New Page"** to create a wireframe page
- Toggle between Desktop (1200x800) and Mobile (375x667) views

**Add Components:**
- Click component types in the sidebar
- Components appear on the canvas
- Drag to position, components snap to grid

**Organize:**
- Select components to view properties
- Delete unwanted components
- Build realistic page layouts

---

## Technical Architecture

### Backend
- **Framework:** Fastify (lightweight Node.js web framework)
- **Database:** SQLite with better-sqlite3 (file-based, no setup required)
- **Storage:** All data stored locally in `backend/sitemap.db`

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite (fast development and builds)
- **Styling:** Tailwind CSS (utility-first, lightweight)
- **State:** React hooks (no external state management)

### Database Schema

```sql
-- Projects
projects (id, name, created_at)

-- Sitemap Pages
nodes (id, project_id, title, url, status, notes, content, parent_id, x, y)

-- Sitemap Relationships
edges (id, project_id, source, target, type)

-- User Flow Elements
flow_elements (id, project_id, type, label, x, y, width, height, style, node_reference_id)

-- User Flow Connections
flow_connections (id, project_id, source_id, target_id, label)

-- Wireframe Pages
wireframe_pages (id, project_id, node_id, name, view_mode)

-- Wireframe Components
wireframe_components (id, wireframe_page_id, type, x, y, width, height, properties)
```

---

## API Reference

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project with all data
- `DELETE /api/projects/:id` - Delete project

### Sitemap Nodes
- `GET /api/projects/:pid/nodes` - Get all pages
- `POST /api/projects/:pid/nodes` - Create page
- `PUT /api/projects/:pid/nodes/:id` - Update page
- `DELETE /api/projects/:pid/nodes/:id` - Delete page

### User Flow
- `GET /api/projects/:pid/flow-elements` - Get flow elements
- `POST /api/projects/:pid/flow-elements` - Create element
- `PUT /api/projects/:pid/flow-elements/:id` - Update element
- `DELETE /api/projects/:pid/flow-elements/:id` - Delete element
- `GET /api/projects/:pid/flow-connections` - Get connections
- `POST /api/projects/:pid/flow-connections` - Create connection
- `DELETE /api/projects/:pid/flow-connections/:id` - Delete connection

### Wireframes
- `GET /api/projects/:pid/wireframe-pages` - Get wireframe pages
- `POST /api/projects/:pid/wireframe-pages` - Create wireframe page
- `GET /api/projects/:pid/wireframe-pages/:id` - Get page with components
- `POST /api/projects/:pid/wireframe-pages/:wid/components` - Add component
- `PUT /api/wireframe-components/:id` - Update component
- `DELETE /api/wireframe-components/:id` - Delete component

### Export
- `GET /api/projects/:pid/export/sitemap.xml` - Export XML sitemap
- `GET /api/projects/:pid/export/sitemap.csv` - Export CSV sitemap

---

## System Requirements

- **Node.js:** Version 16 or higher
- **npm:** Version 8 or higher (comes with Node.js)
- **OS:** Windows 11 (also works on Windows 10, macOS, Linux)
- **Memory:** At least 2GB RAM
- **Disk:** At least 500MB free space
- **Browser:** Modern browser (Chrome, Firefox, Edge, Safari)

---

## Troubleshooting

### Common Issues

**Port already in use:**
- Close other applications using ports 5173 or 3000
- Or modify ports in `backend/server.js` and `frontend/vite.config.js`

**Node.js not found:**
- Install from https://nodejs.org/
- Restart terminal/command prompt after installation

**Database errors:**
- Delete `backend/sitemap.db` to reset
- Restart the application

**Build failures:**
- Run `npm run clean` to remove old files
- Run `npm run install:all` to reinstall dependencies

**Dark mode not persisting:**
- Check browser localStorage is enabled
- Clear browser cache and reload

---

## Development

### Project Structure
```
uxer-flow/
├── backend/
│   ├── server.js          # Fastify server and API routes
│   ├── db.js              # SQLite database setup
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── SitemapEditor.jsx
│   │   │   ├── UserFlowEditor.jsx
│   │   │   └── WireframeEditor.jsx
│   │   ├── App.jsx        # Main application
│   │   ├── api.js         # API client
│   │   └── index.css      # Tailwind CSS
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── setup.bat              # Windows setup script
├── start-dev.bat          # Windows dev server script
└── package.json           # Root package scripts
```

### Available Scripts
- `npm run install:all` - Install all dependencies
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production servers
- `npm run clean` - Clean build files and database

---

## Roadmap & Future Enhancements

Potential future features:
- [ ] PNG/PDF export for flowcharts and wireframes
- [ ] Rich text editor for content planning
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Templates library
- [ ] Collaboration features (if needed)
- [ ] Print-friendly views

---

## Contributing

This is a personal, self-hosted tool designed for individual use. If you'd like to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - See LICENSE file for details.

---

## Privacy & Security

- **100% Local:** All data stays on your computer
- **No Tracking:** No analytics or external API calls
- **No Auth Required:** Single-user application
- **Open Source:** Full transparency of code

---

## Credits

Built with:
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Fastify](https://fastify.dev/) - Backend framework
- [SQLite](https://www.sqlite.org/) - Database
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Node.js SQLite driver

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the API documentation
3. Open an issue on GitHub
4. Check Node.js and npm versions match requirements

---

**Happy Planning!** 🚀
