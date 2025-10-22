import React, { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api';

export default function SitemapEditor({ projectId }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [showNodeForm, setShowNodeForm] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadNodes();
    }
  }, [projectId]);

  const loadNodes = async () => {
    try {
      const { data } = await projectsApi.getNodes(projectId);
      setNodes(data);
    } catch (error) {
      console.error('Failed to load nodes:', error);
    }
  };

  const handleCreateNode = async (nodeData) => {
    try {
      await projectsApi.createNode(projectId, nodeData);
      await loadNodes();
      setShowNodeForm(false);
      setEditingNode(null);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const handleUpdateNode = async (nodeId, updates) => {
    try {
      await projectsApi.updateNode(projectId, nodeId, updates);
      await loadNodes();
      setEditingNode(null);
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const handleDeleteNode = async (nodeId) => {
    if (!confirm('Delete this page?')) return;
    try {
      await projectsApi.deleteNode(projectId, nodeId);
      await loadNodes();
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  const getNodeChildren = (parentId) => {
    return nodes.filter(n => n.parent_id === parentId);
  };

  const getRootNodes = () => {
    return nodes.filter(n => !n.parent_id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const NodeItem = ({ node, level = 0 }) => {
    const children = getNodeChildren(node.id);
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="mb-1">
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
            selectedNode?.id === node.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {node.title}
            </div>
            {node.url && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {node.url}
              </div>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(node.status)}`}>
            {node.status || 'planned'}
          </span>
        </div>
        {isExpanded && children.length > 0 && (
          <div>
            {children.map(child => (
              <NodeItem key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Sitemap Tree */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sitemap Structure
          </h2>
          <button
            onClick={() => setShowNodeForm(true)}
            className="btn btn-primary btn-sm"
          >
            + Add Page
          </button>
        </div>

        <div>
          {getRootNodes().map(node => (
            <NodeItem key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Node Details Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedNode ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedNode.title}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingNode(selectedNode)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span className={`inline-block px-3 py-1 rounded ${getStatusColor(selectedNode.status)}`}>
                  {selectedNode.status || 'planned'}
                </span>
              </div>

              {selectedNode.url && (
                <div className="card p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL
                  </label>
                  <a
                    href={selectedNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {selectedNode.url}
                  </a>
                </div>
              )}

              {selectedNode.notes && (
                <div className="card p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedNode.notes}
                  </p>
                </div>
              )}

              <div className="card p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Planning
                </label>
                <button
                  onClick={() => {
                    setEditingNode(selectedNode);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Edit Content
                </button>
              </div>

              <div className="card p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Child Page
                </label>
                <button
                  onClick={() => {
                    setEditingNode({
                      title: '',
                      url: '',
                      status: 'planned',
                      notes: '',
                      parent_id: selectedNode.id
                    });
                    setShowNodeForm(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  + Add Child Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a page to view details
          </div>
        )}
      </div>

      {/* Node Form Modal */}
      {(showNodeForm || editingNode) && (
        <NodeFormModal
          node={editingNode}
          nodes={nodes}
          onSave={(data) => {
            if (editingNode?.id) {
              handleUpdateNode(editingNode.id, data);
            } else {
              handleCreateNode(data);
            }
          }}
          onClose={() => {
            setShowNodeForm(false);
            setEditingNode(null);
          }}
        />
      )}
    </div>
  );
}

function NodeFormModal({ node, nodes, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: node?.title || '',
    url: node?.url || '',
    status: node?.status || 'planned',
    notes: node?.notes || '',
    content: node?.content || '',
    parent_id: node?.parent_id || null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {node?.id ? 'Edit Page' : 'Create New Page'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Page Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="input w-full"
              placeholder="https://example.com/page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input w-full"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Page
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
              className="input w-full"
            >
              <option value="">None (Root Level)</option>
              {nodes.filter(n => n.id !== node?.id).map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input w-full"
              rows="3"
              placeholder="Add notes about this page..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Planning
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input w-full font-mono text-sm"
              rows="6"
              placeholder="Plan the content for this page..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {node?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
