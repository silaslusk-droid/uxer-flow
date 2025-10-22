import React, { useState, useEffect } from 'react';
import { projectsApi } from './api';
import SitemapEditor from './components/SitemapEditor';
import UserFlowEditor from './components/UserFlowEditor';
import WireframeEditor from './components/WireframeEditor';

const TABS = [
  { id: 'sitemap', label: 'Sitemap', icon: '🗺️' },
  { id: 'userflow', label: 'User Flow', icon: '→' },
  { id: 'wireframe', label: 'Wireframe', icon: '📐' }
];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('sitemap');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadProjects();

    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', newMode.toString());
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

  const exportSitemapXML = async () => {
    if (!currentProject) return;
    try {
      const { data } = await projectsApi.exportSitemapXML(currentProject.id);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitemap-${currentProject.id}.xml`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportSitemapCSV = async () => {
    if (!currentProject) return;
    try {
      const { data } = await projectsApi.exportSitemapCSV(currentProject.id);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitemap-${currentProject.id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Website Project Planner
            </h1>

            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <select
                value={currentProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === parseInt(e.target.value));
                  setCurrentProject(project);
                }}
                className="input"
              >
                <option value="">Select Project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                onClick={createProject}
                className="btn btn-primary btn-sm"
              >
                + New
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentProject && (
              <div className="flex gap-2">
                <button
                  onClick={exportSitemapXML}
                  className="btn btn-secondary btn-sm"
                >
                  Export XML
                </button>
                <button
                  onClick={exportSitemapCSV}
                  className="btn btn-secondary btn-sm"
                >
                  Export CSV
                </button>
              </div>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {currentProject && (
          <div className="flex gap-1 mt-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-50 dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-t-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentProject ? (
          <>
            {activeTab === 'sitemap' && <SitemapEditor projectId={currentProject.id} />}
            {activeTab === 'userflow' && <UserFlowEditor projectId={currentProject.id} />}
            {activeTab === 'wireframe' && <WireframeEditor projectId={currentProject.id} />}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Project Selected
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create a new project or select an existing one to get started
              </p>
              <button
                onClick={createProject}
                className="btn btn-primary"
              >
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
