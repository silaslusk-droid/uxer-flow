import React, { useState, useEffect, useRef } from 'react';
import { projectsApi } from '../api';

const ELEMENT_TYPES = [
  { id: 'rectangle', label: 'Process', icon: '▭' },
  { id: 'diamond', label: 'Decision', icon: '◆' },
  { id: 'oval', label: 'Start/End', icon: '◯' },
  { id: 'parallelogram', label: 'Input/Output', icon: '▱' }
];

export default function UserFlowEditor({ projectId }) {
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadFlowData();
    }
  }, [projectId]);

  const loadFlowData = async () => {
    try {
      const [elementsRes, connectionsRes] = await Promise.all([
        projectsApi.getFlowElements(projectId),
        projectsApi.getFlowConnections(projectId)
      ]);
      setElements(elementsRes.data);
      setConnections(connectionsRes.data);
    } catch (error) {
      console.error('Failed to load flow data:', error);
    }
  };

  const handleAddElement = async (type) => {
    try {
      const newElement = {
        type,
        label: `New ${type}`,
        x: 100,
        y: 100 + elements.length * 20,
        width: 120,
        height: 60
      };
      await projectsApi.createFlowElement(projectId, newElement);
      await loadFlowData();
    } catch (error) {
      console.error('Failed to add element:', error);
    }
  };

  const handleElementMouseDown = (e, element) => {
    if (isConnecting) return;
    e.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    setElements(prevElements =>
      prevElements.map(el =>
        el.id === selectedElement.id ? { ...el, x: newX, y: newY } : el
      )
    );
  };

  const handleMouseUp = async () => {
    if (isDragging && selectedElement) {
      const updatedElement = elements.find(el => el.id === selectedElement.id);
      if (updatedElement) {
        try {
          await projectsApi.updateFlowElement(projectId, selectedElement.id, {
            ...updatedElement,
            type: updatedElement.type,
            x: updatedElement.x,
            y: updatedElement.y
          });
        } catch (error) {
          console.error('Failed to update element:', error);
        }
      }
    }
    setIsDragging(false);
  };

  const handleStartConnection = (element) => {
    setIsConnecting(true);
    setConnectSource(element);
  };

  const handleEndConnection = async (targetElement) => {
    if (!connectSource || connectSource.id === targetElement.id) {
      setIsConnecting(false);
      setConnectSource(null);
      return;
    }

    try {
      await projectsApi.createFlowConnection(projectId, {
        source_id: connectSource.id,
        target_id: targetElement.id
      });
      await loadFlowData();
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
    setIsConnecting(false);
    setConnectSource(null);
  };

  const handleDeleteElement = async (elementId) => {
    if (!confirm('Delete this element?')) return;
    try {
      await projectsApi.deleteFlowElement(projectId, elementId);
      await loadFlowData();
      setSelectedElement(null);
    } catch (error) {
      console.error('Failed to delete element:', error);
    }
  };

  const handleUpdateElementLabel = async (elementId, label) => {
    try {
      const element = elements.find(el => el.id === elementId);
      await projectsApi.updateFlowElement(projectId, elementId, {
        ...element,
        label
      });
      await loadFlowData();
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const renderElement = (element) => {
    const baseClasses = `absolute cursor-move border-2 flex items-center justify-center text-sm font-medium ${
      selectedElement?.id === element.id
        ? 'border-blue-500 shadow-lg'
        : 'border-gray-700 dark:border-gray-400'
    }`;

    const elementStyles = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`
    };

    let shapeClasses = '';
    switch (element.type) {
      case 'rectangle':
        shapeClasses = 'rounded bg-blue-100 dark:bg-blue-900';
        break;
      case 'diamond':
        shapeClasses = 'bg-yellow-100 dark:bg-yellow-900';
        elementStyles.transform = 'rotate(45deg)';
        break;
      case 'oval':
        shapeClasses = 'rounded-full bg-green-100 dark:bg-green-900';
        break;
      case 'parallelogram':
        shapeClasses = 'bg-purple-100 dark:bg-purple-900';
        elementStyles.transform = 'skewX(-20deg)';
        break;
      default:
        shapeClasses = 'rounded bg-gray-100 dark:bg-gray-700';
    }

    return (
      <div
        key={element.id}
        className={`${baseClasses} ${shapeClasses}`}
        style={elementStyles}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onClick={() => {
          if (isConnecting) {
            handleEndConnection(element);
          } else {
            setSelectedElement(element);
          }
        }}
      >
        <div style={element.type === 'diamond' || element.type === 'parallelogram' ? { transform: 'rotate(-45deg)' } : {}}>
          {element.label || element.type}
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    return connections.map((conn) => {
      const source = elements.find(el => el.id === conn.source_id);
      const target = elements.find(el => el.id === conn.target_id);

      if (!source || !target) return null;

      const x1 = source.x + source.width / 2;
      const y1 = source.y + source.height / 2;
      const x2 = target.x + target.width / 2;
      const y2 = target.y + target.height / 2;

      return (
        <line
          key={conn.id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          className="text-gray-600 dark:text-gray-400"
        />
      );
    });
  };

  return (
    <div className="h-full flex">
      {/* Toolbar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Flow Elements
        </h3>

        <div className="space-y-2 mb-6">
          {ELEMENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleAddElement(type.id)}
              className="w-full btn btn-secondary btn-sm text-left flex items-center gap-2"
            >
              <span className="text-xl">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {selectedElement && (
          <div className="card p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Selected Element
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedElement.label || ''}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  setSelectedElement({ ...selectedElement, label: newLabel });
                }}
                onBlur={(e) => handleUpdateElementLabel(selectedElement.id, e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartConnection(selectedElement)}
                className="btn btn-primary btn-sm flex-1"
              >
                Connect
              </button>
              <button
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-gray-700 dark:text-gray-300">
          <p className="font-medium mb-2">Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Click elements to add them</li>
            <li>• Drag to move</li>
            <li>• Select & click "Connect" to link</li>
          </ul>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-white dark:bg-gray-900 overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  className="fill-current text-gray-600 dark:text-gray-400"
                />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Elements */}
          {elements.map(renderElement)}

          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">→</div>
                <p>Add elements from the sidebar to start building your flow</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
