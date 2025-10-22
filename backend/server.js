const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { dbOps } = require('./db');

// Enable CORS
fastify.register(cors, {
  origin: true // Allow all origins in dev/MVP
});

// Health check
fastify.get('/api/health', async () => {
  return { ok: true, version: '0.1.0' };
});

// Projects API
fastify.get('/api/projects', async () => {
  return dbOps.getAllProjects.all();
});

fastify.post('/api/projects', async (request) => {
  const { name } = request.body;
  if (!name) throw new Error('Project name is required');
  return dbOps.createProject.get(name);
});

fastify.get('/api/projects/:id', async (request) => {
  const { id } = request.params;
  const project = dbOps.getProject.get(id);
  if (!project) throw new Error('Project not found');

  const nodes = dbOps.getProjectNodes.all(id);
  const edges = dbOps.getProjectEdges.all(id);
  const flowElements = dbOps.getFlowElements.all(id);
  const flowConnections = dbOps.getFlowConnections.all(id);
  const wireframePages = dbOps.getWireframePages.all(id);

  return {
    ...project,
    nodes,
    edges,
    flowElements,
    flowConnections,
    wireframePages
  };
});

fastify.delete('/api/projects/:id', async (request) => {
  const { id } = request.params;
  return dbOps.deleteProject.run(id);
});

// Nodes API (Sitemap pages)
fastify.get('/api/projects/:pid/nodes', async (request) => {
  const { pid } = request.params;
  return dbOps.getProjectNodes.all(pid);
});

fastify.get('/api/projects/:pid/nodes/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.getNode.get(id, pid);
});

fastify.post('/api/projects/:pid/nodes', async (request) => {
  const { pid } = request.params;
  const { title, url, meta, status, notes, content, parent_id, x, y } = request.body;
  if (!title) throw new Error('Title is required');

  return dbOps.createNode.get(
    pid,
    title,
    url || null,
    meta ? JSON.stringify(meta) : null,
    status || 'planned',
    notes || null,
    content || null,
    parent_id || null,
    x || null,
    y || null
  );
});

fastify.put('/api/projects/:pid/nodes/:id', async (request) => {
  const { pid, id } = request.params;
  const { title, url, meta, status, notes, content, parent_id, x, y } = request.body;
  if (!title) throw new Error('Title is required');

  return dbOps.updateNode.get(
    title,
    url || null,
    meta ? JSON.stringify(meta) : null,
    status || 'planned',
    notes || null,
    content || null,
    parent_id || null,
    x || null,
    y || null,
    id,
    pid
  );
});

fastify.delete('/api/projects/:pid/nodes/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.deleteNode.run(id, pid);
});

// Edges API
fastify.get('/api/projects/:pid/edges', async (request) => {
  const { pid } = request.params;
  return dbOps.getProjectEdges.all(pid);
});

fastify.post('/api/projects/:pid/edges', async (request) => {
  const { pid } = request.params;
  const { source, target, type } = request.body;
  if (!source || !target) throw new Error('Source and target are required');
  return dbOps.createEdge.get(pid, source, target, type || 'link');
});

fastify.delete('/api/projects/:pid/edges/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.deleteEdge.run(id, pid);
});

// User Flow Elements API
fastify.get('/api/projects/:pid/flow-elements', async (request) => {
  const { pid } = request.params;
  return dbOps.getFlowElements.all(pid);
});

fastify.post('/api/projects/:pid/flow-elements', async (request) => {
  const { pid } = request.params;
  const { type, label, x, y, width, height, style, node_reference_id } = request.body;
  if (!type || x === undefined || y === undefined) {
    throw new Error('Type, x, and y are required');
  }

  return dbOps.createFlowElement.get(
    pid,
    type,
    label || null,
    x,
    y,
    width || 120,
    height || 60,
    style ? JSON.stringify(style) : null,
    node_reference_id || null
  );
});

fastify.put('/api/projects/:pid/flow-elements/:id', async (request) => {
  const { pid, id } = request.params;
  const { type, label, x, y, width, height, style, node_reference_id } = request.body;
  if (!type || x === undefined || y === undefined) {
    throw new Error('Type, x, and y are required');
  }

  return dbOps.updateFlowElement.get(
    type,
    label || null,
    x,
    y,
    width || 120,
    height || 60,
    style ? JSON.stringify(style) : null,
    node_reference_id || null,
    id,
    pid
  );
});

fastify.delete('/api/projects/:pid/flow-elements/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.deleteFlowElement.run(id, pid);
});

// User Flow Connections API
fastify.get('/api/projects/:pid/flow-connections', async (request) => {
  const { pid } = request.params;
  return dbOps.getFlowConnections.all(pid);
});

fastify.post('/api/projects/:pid/flow-connections', async (request) => {
  const { pid } = request.params;
  const { source_id, target_id, label } = request.body;
  if (!source_id || !target_id) {
    throw new Error('Source and target IDs are required');
  }

  return dbOps.createFlowConnection.get(pid, source_id, target_id, label || null);
});

fastify.delete('/api/projects/:pid/flow-connections/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.deleteFlowConnection.run(id, pid);
});

// Wireframe Pages API
fastify.get('/api/projects/:pid/wireframe-pages', async (request) => {
  const { pid } = request.params;
  return dbOps.getWireframePages.all(pid);
});

fastify.get('/api/projects/:pid/wireframe-pages/:id', async (request) => {
  const { pid, id } = request.params;
  const page = dbOps.getWireframePage.get(id, pid);
  if (!page) throw new Error('Wireframe page not found');

  const components = dbOps.getWireframeComponents.all(id);
  return { ...page, components };
});

fastify.post('/api/projects/:pid/wireframe-pages', async (request) => {
  const { pid } = request.params;
  const { node_id, name, view_mode } = request.body;
  if (!name) throw new Error('Name is required');

  return dbOps.createWireframePage.get(
    pid,
    node_id || null,
    name,
    view_mode || 'desktop'
  );
});

fastify.put('/api/projects/:pid/wireframe-pages/:id', async (request) => {
  const { pid, id } = request.params;
  const { node_id, name, view_mode } = request.body;
  if (!name) throw new Error('Name is required');

  return dbOps.updateWireframePage.get(
    node_id || null,
    name,
    view_mode || 'desktop',
    id,
    pid
  );
});

fastify.delete('/api/projects/:pid/wireframe-pages/:id', async (request) => {
  const { pid, id } = request.params;
  return dbOps.deleteWireframePage.run(id, pid);
});

// Wireframe Components API
fastify.post('/api/projects/:pid/wireframe-pages/:wid/components', async (request) => {
  const { wid } = request.params;
  const { type, x, y, width, height, properties } = request.body;
  if (!type || x === undefined || y === undefined || !width || !height) {
    throw new Error('Type, x, y, width, and height are required');
  }

  return dbOps.createWireframeComponent.get(
    wid,
    type,
    x,
    y,
    width,
    height,
    properties ? JSON.stringify(properties) : null
  );
});

fastify.put('/api/wireframe-components/:id', async (request) => {
  const { id } = request.params;
  const { type, x, y, width, height, properties } = request.body;
  if (!type || x === undefined || y === undefined || !width || !height) {
    throw new Error('Type, x, y, width, and height are required');
  }

  return dbOps.updateWireframeComponent.get(
    type,
    x,
    y,
    width,
    height,
    properties ? JSON.stringify(properties) : null,
    id
  );
});

fastify.delete('/api/wireframe-components/:id', async (request) => {
  const { id } = request.params;
  return dbOps.deleteWireframeComponent.run(id);
});

// Export APIs
fastify.get('/api/projects/:pid/export/sitemap.xml', async (request, reply) => {
  const { pid } = request.params;
  const nodes = dbOps.getProjectNodes.all(pid);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${nodes.filter(n => n.url).map(node => `
  <url>
    <loc>${node.url}</loc>
  </url>`).join('')}
</urlset>`;

  reply.header('Content-Type', 'application/xml');
  return xml;
});

fastify.get('/api/projects/:pid/export/sitemap.csv', async (request, reply) => {
  const { pid } = request.params;
  const nodes = dbOps.getProjectNodes.all(pid);

  // Build hierarchical CSV
  const headers = 'ID,Title,URL,Status,Parent ID,Notes\n';
  const rows = nodes.map(node => {
    const title = `"${(node.title || '').replace(/"/g, '""')}"`;
    const url = `"${(node.url || '').replace(/"/g, '""')}"`;
    const status = node.status || 'planned';
    const parentId = node.parent_id || '';
    const notes = `"${(node.notes || '').replace(/"/g, '""')}"`;
    return `${node.id},${title},${url},${status},${parentId},${notes}`;
  }).join('\n');

  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', `attachment; filename="sitemap-${pid}.csv"`);
  return headers + rows;
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
