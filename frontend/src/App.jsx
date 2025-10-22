import React, { useState, useEffect } from 'react';
import { projectsApi } from './api';
import GraphEditor from './graph/GraphEditor';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 sidebar p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sitemap Generator</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="mb-6">
          <button 
            onClick={createProject}
            className="btn btn-primary w-full"
          >
            + New Project
          </button>
        </div>

        <div className="mb-6">
          <select 
            value={currentProject?.id || ''} 
            onChange={(e) => {
              const project = projects.find(p => p.id === parseInt(e.target.value));
              setCurrentProject(project);
            }}
            className="input"
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
            <div className="mb-6">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter start URL (e.g., https://example.com)"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  className="input"
                />
                <button 
                  onClick={startCrawl}
                  className="btn btn-primary w-full"
                  disabled={!crawlUrl}
                >
                  🕷️ Start Crawl
                </button>
              </div>
            </div>

            <div className="mb-6">
              <button 
                onClick={exportSitemap}
                className="btn btn-secondary w-full"
              >
                📄 Export XML
              </button>
            </div>

            <div className="card p-4 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Project Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nodes:</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Edges:</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">{edges.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 bg-white dark:bg-gray-800">
        {currentProject ? (
          <GraphEditor
            nodes={nodes}
            edges={edges}
            onNodeChange={handleNodeChange}
            onEdgeCreate={handleEdgeCreate}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Project Selected
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Create a new project or select an existing one to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
