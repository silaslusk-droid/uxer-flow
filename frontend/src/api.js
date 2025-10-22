import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const projectsApi = {
  // Projects
  list: () => api.get('/projects'),
  create: (name) => api.post('/projects', { name }),
  get: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),

  // Nodes (Sitemap pages)
  getNodes: (projectId) => api.get(`/projects/${projectId}/nodes`),
  getNode: (projectId, nodeId) => api.get(`/projects/${projectId}/nodes/${nodeId}`),
  createNode: (projectId, node) => api.post(`/projects/${projectId}/nodes`, node),
  updateNode: (projectId, nodeId, node) => api.put(`/projects/${projectId}/nodes/${nodeId}`, node),
  deleteNode: (projectId, nodeId) => api.delete(`/projects/${projectId}/nodes/${nodeId}`),

  // Edges
  getEdges: (projectId) => api.get(`/projects/${projectId}/edges`),
  createEdge: (projectId, edge) => api.post(`/projects/${projectId}/edges`, edge),
  deleteEdge: (projectId, edgeId) => api.delete(`/projects/${projectId}/edges/${edgeId}`),

  // User Flow Elements
  getFlowElements: (projectId) => api.get(`/projects/${projectId}/flow-elements`),
  createFlowElement: (projectId, element) => api.post(`/projects/${projectId}/flow-elements`, element),
  updateFlowElement: (projectId, elementId, updates) => api.put(`/projects/${projectId}/flow-elements/${elementId}`, updates),
  deleteFlowElement: (projectId, elementId) => api.delete(`/projects/${projectId}/flow-elements/${elementId}`),

  // User Flow Connections
  getFlowConnections: (projectId) => api.get(`/projects/${projectId}/flow-connections`),
  createFlowConnection: (projectId, connection) => api.post(`/projects/${projectId}/flow-connections`, connection),
  deleteFlowConnection: (projectId, connectionId) => api.delete(`/projects/${projectId}/flow-connections/${connectionId}`),

  // Wireframe Pages
  getWireframePages: (projectId) => api.get(`/projects/${projectId}/wireframe-pages`),
  getWireframePage: (projectId, pageId) => api.get(`/projects/${projectId}/wireframe-pages/${pageId}`),
  createWireframePage: (projectId, page) => api.post(`/projects/${projectId}/wireframe-pages`, page),
  updateWireframePage: (projectId, pageId, updates) => api.put(`/projects/${projectId}/wireframe-pages/${pageId}`, updates),
  deleteWireframePage: (projectId, pageId) => api.delete(`/projects/${projectId}/wireframe-pages/${pageId}`),

  // Wireframe Components
  createWireframeComponent: (projectId, pageId, component) => api.post(`/projects/${projectId}/wireframe-pages/${pageId}/components`, component),
  updateWireframeComponent: (componentId, updates) => api.put(`/wireframe-components/${componentId}`, updates),
  deleteWireframeComponent: (componentId) => api.delete(`/wireframe-components/${componentId}`),

  // Export
  exportSitemapXML: (projectId) => api.get(`/projects/${projectId}/export/sitemap.xml`, { responseType: 'blob' }),
  exportSitemapCSV: (projectId) => api.get(`/projects/${projectId}/export/sitemap.csv`, { responseType: 'blob' })
};
