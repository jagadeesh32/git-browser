import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

const GitGraph = ({ graphData, onNodeClick }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!graphData || graphData.length === 0 || !containerRef.current) {
      return;
    }

    // Prepare nodes and edges for vis-network
    const nodes = graphData.map((node) => ({
      id: node.sha,
      label: `${node.sha.substring(0, 7)}\n${node.message.substring(0, 30)}${node.message.length > 30 ? '...' : ''}`,
      title: `${node.message}\n${node.author}\n${new Date(node.timestamp * 1000).toLocaleString()}`,
      shape: 'box',
      color: {
        background: node.branches.length > 0 ? '#4CAF50' : '#2196F3',
        border: node.tags.length > 0 ? '#FF9800' : '#1976D2',
        highlight: {
          background: '#FFC107',
          border: '#FF6F00',
        },
      },
      font: {
        size: 12,
        color: '#ffffff',
      },
    }));

    const edges = [];
    graphData.forEach((node) => {
      node.parents.forEach((parentSha) => {
        edges.push({
          from: node.sha,
          to: parentSha,
          arrows: 'to',
          color: {
            color: '#666666',
            highlight: '#FFC107',
          },
        });
      });
    });

    // Create network
    const data = { nodes, edges };
    const options = {
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 150,
        },
      },
      physics: {
        enabled: false,
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'vertical',
        },
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true,
      },
    };

    // Clean up previous network
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Create new network
    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Handle node clicks
    if (onNodeClick) {
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          onNodeClick(nodeId);
        }
      });
    }

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [graphData, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-900"
      style={{ minHeight: '600px' }}
    />
  );
};

export default GitGraph;
