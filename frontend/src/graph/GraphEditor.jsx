import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

// Register the layout algorithm
cytoscape.use(fcose);

export default function GraphEditor({ nodes, edges, onNodeChange, onEdgeCreate, onDelete }) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  
  // Initialize cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;
    
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(title)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'width': '30px',
            'height': '30px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#999',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'fcose',
        randomize: false,
        animate: false
      }
    });

    // Throttle position updates to avoid too many DB calls
    let positionUpdateTimeout;
    cyRef.current.on('position', 'node', (evt) => {
      const node = evt.target;
      clearTimeout(positionUpdateTimeout);
      positionUpdateTimeout = setTimeout(() => {
        onNodeChange?.(node.id(), {
          x: node.position('x'),
          y: node.position('y')
        });
      }, 500); // Wait 500ms after last movement
    });

    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      handleNodeSelect(node);
    });

    // Enable edge creation by dragging
    cyRef.current.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      const nearestNode = cyRef.current.$('node').filter(n => 
        n.id() !== node.id() &&
        n.distance(node) < 100
      )[0];
      
      if (nearestNode) {
        onEdgeCreate?.({
          source: node.id(),
          target: nearestNode.id(),
          type: 'link'
        });
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // Update elements when data changes
  useEffect(() => {
    if (!cyRef.current) return;
    
    cyRef.current.elements().remove();
    cyRef.current.add(
      [
        ...nodes.map(node => ({
          data: { ...node, id: node.id.toString() },
          position: { x: node.x || 0, y: node.y || 0 }
        })),
        ...edges.map(edge => ({
          data: {
            ...edge,
            id: edge.id.toString(),
            source: edge.source.toString(),
            target: edge.target.toString()
          }
        }))
      ]
    );
    
    cyRef.current.layout({ name: 'fcose' }).run();
  }, [nodes, edges]);

  // Handle zoom
  const handleZoom = (factor) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    const level = cy.zoom() * factor;
    cy.zoom(level);
    cy.center();
    setZoom(level);
  };

  // Handle node selection
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  // Reset view
  const resetView = () => {
    if (!cyRef.current) return;
    cyRef.current.fit();
    cyRef.current.center();
    setZoom(cyRef.current.zoom());
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Graph Container */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          border: '1px solid #ccc'
        }} 
      />

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => handleZoom(1.2)}>+</button>
        <span style={{ margin: '0 10px' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => handleZoom(0.8)}>-</button>
        <button onClick={resetView} style={{ marginLeft: '10px' }}>Reset View</button>
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <h3>{selectedNode.data('title')}</h3>
          <p style={{ wordBreak: 'break-all' }}>
            <a href={selectedNode.data('url')} target="_blank" rel="noopener noreferrer">
              {selectedNode.data('url')}
            </a>
          </p>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
}