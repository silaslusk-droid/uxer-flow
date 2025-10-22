const Database = require('better-sqlite3');
const path = require('path');

// Initialize database connection
const db = new Database(path.join(__dirname, 'sitemap.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDatabase() {
    // Create projects table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Create nodes table (Sitemap pages)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            url TEXT,
            meta TEXT,
            status TEXT DEFAULT 'planned',
            notes TEXT,
            content TEXT,
            parent_id INTEGER,
            x REAL,
            y REAL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE SET NULL
        )
    `).run();

    // Create edges table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS edges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            source INTEGER NOT NULL,
            target INTEGER NOT NULL,
            type TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (source) REFERENCES nodes(id) ON DELETE CASCADE,
            FOREIGN KEY (target) REFERENCES nodes(id) ON DELETE CASCADE
        )
    `).run();

    // Create user flow elements table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS flow_elements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            label TEXT,
            x REAL NOT NULL,
            y REAL NOT NULL,
            width REAL DEFAULT 120,
            height REAL DEFAULT 60,
            style TEXT,
            node_reference_id INTEGER,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (node_reference_id) REFERENCES nodes(id) ON DELETE SET NULL
        )
    `).run();

    // Create user flow connections table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS flow_connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            source_id INTEGER NOT NULL,
            target_id INTEGER NOT NULL,
            label TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (source_id) REFERENCES flow_elements(id) ON DELETE CASCADE,
            FOREIGN KEY (target_id) REFERENCES flow_elements(id) ON DELETE CASCADE
        )
    `).run();

    // Create wireframe pages table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS wireframe_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            node_id INTEGER,
            name TEXT NOT NULL,
            view_mode TEXT DEFAULT 'desktop',
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL
        )
    `).run();

    // Create wireframe components table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS wireframe_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wireframe_page_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            x REAL NOT NULL,
            y REAL NOT NULL,
            width REAL NOT NULL,
            height REAL NOT NULL,
            properties TEXT,
            FOREIGN KEY (wireframe_page_id) REFERENCES wireframe_pages(id) ON DELETE CASCADE
        )
    `).run();
}

// Initialize database on module load
initializeDatabase();

// Database operations
const dbOps = {
    // Projects
    getAllProjects: db.prepare('SELECT * FROM projects ORDER BY created_at DESC'),
    getProject: db.prepare('SELECT * FROM projects WHERE id = ?'),
    createProject: db.prepare('INSERT INTO projects (name) VALUES (?) RETURNING *'),
    deleteProject: db.prepare('DELETE FROM projects WHERE id = ?'),

    // Nodes (Sitemap pages)
    getProjectNodes: db.prepare('SELECT * FROM nodes WHERE project_id = ?'),
    getNode: db.prepare('SELECT * FROM nodes WHERE id = ? AND project_id = ?'),
    createNode: db.prepare(`
        INSERT INTO nodes (project_id, title, url, meta, status, notes, content, parent_id, x, y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `),
    updateNode: db.prepare(`
        UPDATE nodes SET title = ?, url = ?, meta = ?, status = ?, notes = ?, content = ?, parent_id = ?, x = ?, y = ?
        WHERE id = ? AND project_id = ? RETURNING *
    `),
    deleteNode: db.prepare('DELETE FROM nodes WHERE id = ? AND project_id = ?'),

    // Edges
    getProjectEdges: db.prepare('SELECT * FROM edges WHERE project_id = ?'),
    createEdge: db.prepare(`
        INSERT INTO edges (project_id, source, target, type)
        VALUES (?, ?, ?, ?) RETURNING *
    `),
    deleteEdge: db.prepare('DELETE FROM edges WHERE id = ? AND project_id = ?'),

    // User Flow Elements
    getFlowElements: db.prepare('SELECT * FROM flow_elements WHERE project_id = ?'),
    getFlowElement: db.prepare('SELECT * FROM flow_elements WHERE id = ? AND project_id = ?'),
    createFlowElement: db.prepare(`
        INSERT INTO flow_elements (project_id, type, label, x, y, width, height, style, node_reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `),
    updateFlowElement: db.prepare(`
        UPDATE flow_elements SET type = ?, label = ?, x = ?, y = ?, width = ?, height = ?, style = ?, node_reference_id = ?
        WHERE id = ? AND project_id = ? RETURNING *
    `),
    deleteFlowElement: db.prepare('DELETE FROM flow_elements WHERE id = ? AND project_id = ?'),

    // User Flow Connections
    getFlowConnections: db.prepare('SELECT * FROM flow_connections WHERE project_id = ?'),
    createFlowConnection: db.prepare(`
        INSERT INTO flow_connections (project_id, source_id, target_id, label)
        VALUES (?, ?, ?, ?) RETURNING *
    `),
    deleteFlowConnection: db.prepare('DELETE FROM flow_connections WHERE id = ? AND project_id = ?'),

    // Wireframe Pages
    getWireframePages: db.prepare('SELECT * FROM wireframe_pages WHERE project_id = ?'),
    getWireframePage: db.prepare('SELECT * FROM wireframe_pages WHERE id = ? AND project_id = ?'),
    createWireframePage: db.prepare(`
        INSERT INTO wireframe_pages (project_id, node_id, name, view_mode)
        VALUES (?, ?, ?, ?) RETURNING *
    `),
    updateWireframePage: db.prepare(`
        UPDATE wireframe_pages SET node_id = ?, name = ?, view_mode = ?
        WHERE id = ? AND project_id = ? RETURNING *
    `),
    deleteWireframePage: db.prepare('DELETE FROM wireframe_pages WHERE id = ? AND project_id = ?'),

    // Wireframe Components
    getWireframeComponents: db.prepare('SELECT * FROM wireframe_components WHERE wireframe_page_id = ?'),
    createWireframeComponent: db.prepare(`
        INSERT INTO wireframe_components (wireframe_page_id, type, x, y, width, height, properties)
        VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
    `),
    updateWireframeComponent: db.prepare(`
        UPDATE wireframe_components SET type = ?, x = ?, y = ?, width = ?, height = ?, properties = ?
        WHERE id = ? RETURNING *
    `),
    deleteWireframeComponent: db.prepare('DELETE FROM wireframe_components WHERE id = ?')
};

module.exports = { db, dbOps };