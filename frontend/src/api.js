import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const projectsApi = {
  list: () => api.get('/projects'),
  create: (name) => api.post('/projects', { name }),
  get: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),
  
  // Nodes
  getNodes: (projectId) => api.get(`/projects/${projectId}/nodes`),
  createNode: (projectId, node) => api.post(`/projects/${projectId}/nodes`, node),
  updateNode: (projectId, nodeId, node) => api.put(`/projects/${projectId}/nodes/${nodeId}`, node),
  deleteNode: (projectId, nodeId) => api.delete(`/projects/${projectId}/nodes/${nodeId}`),
  
  // Edges
  getEdges: (projectId) => api.get(`/projects/${projectId}/edges`),
  createEdge: (projectId, edge) => api.post(`/projects/${projectId}/edges`, edge),
  deleteEdge: (projectId, edgeId) => api.delete(`/projects/${projectId}/edges/${edgeId}`),
  
  // Crawl
  crawl: (projectId, options) => api.post(`/projects/${projectId}/crawl`, options),
  
  // Export
  exportSitemap: (projectId) => api.get(`/projects/${projectId}/export/sitemap.xml`, {
    responseType: 'blob'
  })
};