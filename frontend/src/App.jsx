import React, { useState, useEffect } from 'react';
import { projectsApi } from './api';
import GraphEditor from './graph/GraphEditor';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [crawlUrl, setCrawlUrl] = useState('');

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load project data when selected
  useEffect(() => {
    if (currentProject) {
      loadProjectData(currentProject.id);
    }
  }, [currentProject]);

  const loadProjects = async () => {
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProjectData = async (projectId) => {
    try {
      const { data } = await projectsApi.get(projectId);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  const createProject = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;

    try {
      const { data } = await projectsApi.create(name);
      setProjects([...projects, data]);
      setCurrentProject(data);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const startCrawl = async () => {
    if (!currentProject || !crawlUrl) return;

    try {
      const { data } = await projectsApi.crawl(currentProject.id, {
        startUrl: crawlUrl,
        maxDepth: 3,
        maxPages: 200
      });
      
      // Refresh project data after crawl
      loadProjectData(currentProject.id);
    } catch (error) {
      console.error('Crawl failed:', error);
    }
  };

  const exportSitemap = async () => {
    if (!currentProject) return;

    try {
      const { data } = await projectsApi.exportSitemap(currentProject.id);
      const blob = new Blob([data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitemap-${currentProject.id}.xml`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleNodeChange = async (nodeId, changes) => {
    if (!currentProject) return;

    try {
      await projectsApi.updateNode(currentProject.id, nodeId, changes);
      loadProjectData(currentProject.id);
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const handleEdgeCreate = async (edge) => {
    if (!currentProject) return;

    try {
      await projectsApi.createEdge(currentProject.id, edge);
      loadProjectData(currentProject.id);
    } catch (error) {
      console.error('Failed to create edge:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h1>Sitemap Generator</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <button onClick={createProject}>New Project</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select 
            value={currentProject?.id || ''} 
            onChange={(e) => {
              const project = projects.find(p => p.id === parseInt(e.target.value));
              setCurrentProject(project);
            }}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {currentProject && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Start URL"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
              />
              <button onClick={startCrawl}>Start Crawl</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button onClick={exportSitemap}>Export XML</button>
            </div>

            <div>
              <p>Nodes: {nodes.length}</p>
              <p>Edges: {edges.length}</p>
            </div>
          </>
        )}
      </div>

      {/* Main Graph Area */}
      <div style={{ flex: 1 }}>
        {currentProject && (
          <GraphEditor
            nodes={nodes}
            edges={edges}
            onNodeChange={handleNodeChange}
            onEdgeCreate={handleEdgeCreate}
          />
        )}
      </div>
    </div>
  );
}
