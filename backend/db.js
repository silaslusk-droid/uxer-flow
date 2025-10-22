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

    // Create nodes table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            meta TEXT,
            x REAL,
            y REAL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
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
}

// Database operations
const dbOps = {
    // Projects
    getAllProjects: db.prepare('SELECT * FROM projects ORDER BY created_at DESC'),
    getProject: db.prepare('SELECT * FROM projects WHERE id = ?'),
    createProject: db.prepare('INSERT INTO projects (name) VALUES (?) RETURNING *'),
    deleteProject: db.prepare('DELETE FROM projects WHERE id = ?'),

    // Nodes
    getProjectNodes: db.prepare('SELECT * FROM nodes WHERE project_id = ?'),
    createNode: db.prepare(`
        INSERT INTO nodes (project_id, title, url, meta, x, y)
        VALUES (?, ?, ?, ?, ?, ?) RETURNING *
    `),
    updateNode: db.prepare(`
        UPDATE nodes SET title = ?, url = ?, meta = ?, x = ?, y = ?
        WHERE id = ? AND project_id = ? RETURNING *
    `),
    deleteNode: db.prepare('DELETE FROM nodes WHERE id = ? AND project_id = ?'),

    // Edges
    getProjectEdges: db.prepare('SELECT * FROM edges WHERE project_id = ?'),
    createEdge: db.prepare(`
        INSERT INTO edges (project_id, source, target, type)
        VALUES (?, ?, ?, ?) RETURNING *
    `),
    deleteEdge: db.prepare('DELETE FROM edges WHERE id = ? AND project_id = ?')
};

// Initialize database on module load
initializeDatabase();

module.exports = { db, dbOps };