const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { dbOps } = require('./db');
const { crawl } = require('./crawler');

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
  
  return { ...project, nodes, edges };
});

fastify.delete('/api/projects/:id', async (request) => {
  const { id } = request.params;
  return dbOps.deleteProject.run(id);
});

// Nodes API
fastify.get('/api/projects/:pid/nodes', async (request) => {
  const { pid } = request.params;
  return dbOps.getProjectNodes.all(pid);
});

fastify.post('/api/projects/:pid/nodes', async (request) => {
  const { pid } = request.params;
  const { title, url, meta, x, y } = request.body;
  if (!title || !url) throw new Error('Title and URL are required');
  
  return dbOps.createNode.get(pid, title, url, 
    meta ? JSON.stringify(meta) : null, x || null, y || null);
});

fastify.put('/api/projects/:pid/nodes/:id', async (request) => {
  const { pid, id } = request.params;
  const { title, url, meta, x, y } = request.body;
  if (!title || !url) throw new Error('Title and URL are required');

  return dbOps.updateNode.get(title, url, 
    meta ? JSON.stringify(meta) : null, x || null, y || null, id, pid);
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

// Crawler API
fastify.post('/api/projects/:pid/crawl', async (request) => {
  const { pid } = request.params;
  const { startUrl, maxPages, maxDepth } = request.body;
  if (!startUrl) throw new Error('Start URL is required');

  const result = await crawl({ startUrl, maxPages, maxDepth });
  
  // Store crawled nodes and edges
  for (const node of result.nodes) {
    dbOps.createNode.run(pid, node.title, node.url, 
      node.meta ? JSON.stringify(node.meta) : null, null, null);
  }
  
  for (const edge of result.edges) {
    dbOps.createEdge.run(pid, edge.source, edge.target, edge.type);
  }

  return result;
});

// Sitemap Export API
fastify.get('/api/projects/:pid/export/sitemap.xml', async (request, reply) => {
  const { pid } = request.params;
  const nodes = dbOps.getProjectNodes.all(pid);
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${nodes.map(node => `
  <url>
    <loc>${node.url}</loc>
  </url>`).join('')}
</urlset>`;

  reply.header('Content-Type', 'application/xml');
  return xml;
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
