import React, { useState, useEffect, useRef } from 'react';
import { projectsApi } from '../api';

const COMPONENT_TYPES = [
  { id: 'image', label: 'Image Placeholder', icon: '🖼️' },
  { id: 'text', label: 'Text Block', icon: 'T' },
  { id: 'heading', label: 'Heading', icon: 'H' },
  { id: 'button', label: 'Button', icon: '⬚' },
  { id: 'input', label: 'Input Field', icon: '▭' },
  { id: 'textarea', label: 'Textarea', icon: '▢' },
  { id: 'checkbox', label: 'Checkbox', icon: '☑' },
  { id: 'navigation', label: 'Navigation Bar', icon: '☰' }
];

const VIEW_MODES = {
  desktop: { width: 1200, height: 800, label: 'Desktop' },
  mobile: { width: 375, height: 667, label: 'Mobile' }
};

export default function WireframeEditor({ projectId }) {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadPages();
    }
  }, [projectId]);

  useEffect(() => {
    if (currentPage) {
      loadPageComponents();
    }
  }, [currentPage]);

  const loadPages = async () => {
    try {
      const { data } = await projectsApi.getWireframePages(projectId);
      setPages(data);
      if (data.length > 0 && !currentPage) {
        setCurrentPage(data[0]);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadPageComponents = async () => {
    if (!currentPage) return;
    try {
      const { data } = await projectsApi.getWireframePage(projectId, currentPage.id);
      setComponents(data.components || []);
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  };

  const handleCreatePage = async () => {
    const name = prompt('Enter page name:');
    if (!name) return;

    try {
      const { data } = await projectsApi.createWireframePage(projectId, {
        name,
        view_mode: viewMode
      });
      await loadPages();
      setCurrentPage(data);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleAddComponent = async (type) => {
    if (!currentPage) {
      alert('Please create a page first');
      return;
    }

    const defaultSizes = {
      image: { width: 200, height: 150 },
      text: { width: 300, height: 100 },
      heading: { width: 300, height: 40 },
      button: { width: 120, height: 40 },
      input: { width: 250, height: 40 },
      textarea: { width: 300, height: 100 },
      checkbox: { width: 20, height: 20 },
      navigation: { width: VIEW_MODES[viewMode].width - 40, height: 60 }
    };

    const size = defaultSizes[type] || { width: 100, height: 100 };

    try {
      await projectsApi.createWireframeComponent(projectId, currentPage.id, {
        type,
        x: 20,
        y: 20 + components.length * 20,
        ...size,
        properties: JSON.stringify({ label: `New ${type}` })
      });
      await loadPageComponents();
    } catch (error) {
      console.error('Failed to add component:', error);
    }
  };

  const handleComponentMouseDown = (e, component) => {
    e.stopPropagation();
    setSelectedComponent(component);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedComponent || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - canvasRect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - canvasRect.top - dragOffset.y);

    setComponents(prevComponents =>
      prevComponents.map(comp =>
        comp.id === selectedComponent.id ? { ...comp, x: newX, y: newY } : comp
      )
    );
  };

  const handleMouseUp = async () => {
    if (isDragging && selectedComponent) {
      const updatedComponent = components.find(c => c.id === selectedComponent.id);
      if (updatedComponent) {
        try {
          await projectsApi.updateWireframeComponent(selectedComponent.id, {
            type: updatedComponent.type,
            x: updatedComponent.x,
            y: updatedComponent.y,
            width: updatedComponent.width,
            height: updatedComponent.height,
            properties: updatedComponent.properties
          });
        } catch (error) {
          console.error('Failed to update component:', error);
        }
      }
    }
    setIsDragging(false);
  };

  const handleDeleteComponent = async (componentId) => {
    if (!confirm('Delete this component?')) return;
    try {
      await projectsApi.deleteWireframeComponent(componentId);
      await loadPageComponents();
      setSelectedComponent(null);
    } catch (error) {
      console.error('Failed to delete component:', error);
    }
  };

  const renderComponent = (component) => {
    const props = component.properties ? JSON.parse(component.properties) : {};
    const isSelected = selectedComponent?.id === component.id;

    const baseClasses = `absolute cursor-move border ${
      isSelected ? 'border-blue-500 border-2' : 'border-gray-400'
    }`;

    const componentStyle = {
      left: `${component.x}px`,
      top: `${component.y}px`,
      width: `${component.width}px`,
      height: `${component.height}px`
    };

    let content = null;
    let bgClass = 'bg-white dark:bg-gray-800';

    switch (component.type) {
      case 'image':
        bgClass = 'bg-gray-200 dark:bg-gray-700';
        content = (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            🖼️ Image
          </div>
        );
        break;
      case 'text':
        content = (
          <div className="p-2 text-xs text-gray-700 dark:text-gray-300">
            Lorem ipsum dolor sit amet...
          </div>
        );
        break;
      case 'heading':
        bgClass = 'bg-gray-100 dark:bg-gray-700';
        content = (
          <div className="p-2 font-bold text-gray-900 dark:text-gray-100">
            {props.label || 'Heading'}
          </div>
        );
        break;
      case 'button':
        bgClass = 'bg-blue-500 hover:bg-blue-600';
        content = (
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-sm">
            {props.label || 'Button'}
          </div>
        );
        break;
      case 'input':
        content = (
          <input
            type="text"
            placeholder={props.label || 'Input field'}
            className="w-full h-full px-2 border-none text-sm"
            disabled
          />
        );
        break;
      case 'textarea':
        content = (
          <textarea
            placeholder={props.label || 'Textarea'}
            className="w-full h-full p-2 border-none text-sm resize-none"
            disabled
          />
        );
        break;
      case 'checkbox':
        content = (
          <div className="w-full h-full border-2 border-gray-400"></div>
        );
        break;
      case 'navigation':
        bgClass = 'bg-gray-800';
        content = (
          <div className="w-full h-full flex items-center px-4 gap-4 text-white text-sm">
            <div className="font-bold">Logo</div>
            <div>Home</div>
            <div>About</div>
            <div>Contact</div>
          </div>
        );
        break;
      default:
        content = <div className="p-2 text-xs">{component.type}</div>;
    }

    return (
      <div
        key={component.id}
        className={`${baseClasses} ${bgClass}`}
        style={componentStyle}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        onClick={() => setSelectedComponent(component)}
      >
        {content}
      </div>
    );
  };

  const currentViewMode = VIEW_MODES[viewMode];

  return (
    <div className="h-full flex">
      {/* Toolbar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Wireframes
        </h3>

        {/* Page Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Page
          </label>
          <select
            value={currentPage?.id || ''}
            onChange={(e) => {
              const page = pages.find(p => p.id === parseInt(e.target.value));
              setCurrentPage(page);
              if (page) setViewMode(page.view_mode);
            }}
            className="input w-full mb-2"
          >
            <option value="">Select page...</option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreatePage}
            className="btn btn-primary btn-sm w-full"
          >
            + New Page
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            View Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('desktop')}
              className={`btn btn-sm flex-1 ${
                viewMode === 'desktop' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`btn btn-sm flex-1 ${
                viewMode === 'mobile' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* Components Library */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Components
          </h4>
          <div className="space-y-1">
            {COMPONENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleAddComponent(type.id)}
                className="w-full btn btn-secondary btn-sm text-left flex items-center gap-2"
                disabled={!currentPage}
              >
                <span>{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Component */}
        {selectedComponent && (
          <div className="card p-3 space-y-2">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Selected Component
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Type: {selectedComponent.type}
            </div>
            <button
              onClick={() => handleDeleteComponent(selectedComponent.id)}
              className="btn btn-sm bg-red-600 text-white hover:bg-red-700 w-full"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-8 flex items-start justify-center">
        <div
          ref={canvasRef}
          className="bg-white dark:bg-gray-800 shadow-lg relative border border-gray-300 dark:border-gray-600"
          style={{
            width: `${currentViewMode.width}px`,
            height: `${currentViewMode.height}px`,
            minHeight: `${currentViewMode.height}px`
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {components.map(renderComponent)}

          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📐</div>
                <p>Add components from the sidebar to start wireframing</p>
              </div>
            </div>
          )}

          {/* Canvas Info */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            {currentViewMode.width} x {currentViewMode.height}
          </div>
        </div>
      </div>
    </div>
  );
}
