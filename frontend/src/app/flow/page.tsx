'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';

// Dynamically import ReactFlow with SSR disabled
const ReactFlow = dynamic(
  () => import('@xyflow/react').then(mod => mod.ReactFlow),
  { ssr: false }
);

const Background = dynamic(
  () => import('@xyflow/react').then(mod => mod.Background),
  { ssr: false }
);

const Controls = dynamic(
  () => import('@xyflow/react').then(mod => mod.Controls),
  { ssr: false }
);

const MiniMap = dynamic(
  () => import('@xyflow/react').then(mod => mod.MiniMap),
  { ssr: false }
);

// ============================================================================
// 🎯 간단한 플로우 테스트 페이지
// ============================================================================

function FlowCanvas() {
  const initialNodes = React.useMemo(
    () => [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Start' },
        type: 'input',
      },
      { id: '2', position: { x: 400, y: 100 }, data: { label: 'Process' } },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { label: 'End' },
        type: 'output',
      },
    ],
    []
  );

  const initialEdges = React.useMemo(
    () => [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    []
  );

  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  const onConnect = React.useCallback(
    (params: any) => {
      setEdges(eds => [...eds, { id: `e${Date.now()}`, ...params }]);
    },
    [setEdges]
  );

  const onNodesChange = React.useCallback((changes: any) => {
    setNodes(nds => {
      const newNodes = [...nds];
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          const node = newNodes.find(n => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        }
      });
      return newNodes;
    });
  }, []);

  const onEdgesChange = React.useCallback((changes: any) => {
    setEdges(eds => {
      const newEdges = [...eds];
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          const index = newEdges.findIndex(e => e.id === change.id);
          if (index > -1) {
            newEdges.splice(index, 1);
          }
        }
      });
      return newEdges;
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default function FlowPage() {
  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          React Flow Test Page
        </h1>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
