'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Viewport,
  useViewport,
} from '@xyflow/react';
import { Button } from '@/components/ui/Button';
import { Plus, Save, Trash2, Download, Upload } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// ============================================================================
// 🎯 커스텀 노드 타입들
// ============================================================================

const ProcessNode = ({
  data,
  selected,
}: {
  data: { label: string; description?: string };
  selected?: boolean;
}) => (
  <div
    className={`p-4 rounded-lg border-2 min-w-[150px] text-center transition-all ${
      selected
        ? 'border-blue-500 bg-blue-50 shadow-lg'
        : 'border-gray-300 bg-white shadow-md'
    }`}
  >
    <div className='font-semibold text-gray-800 mb-2'>{data.label}</div>
    {data.description && (
      <div className='text-sm text-gray-600'>{data.description}</div>
    )}
  </div>
);

const InputNode = ({
  data,
  selected,
}: {
  data: { label: string; description?: string };
  selected?: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border-2 min-w-[120px] text-center transition-all ${
      selected
        ? 'border-green-500 bg-green-50 shadow-lg'
        : 'border-green-300 bg-white shadow-md'
    }`}
  >
    <div className='font-semibold text-green-800 mb-1'>📥 {data.label}</div>
    {data.description && (
      <div className='text-xs text-green-600'>{data.description}</div>
    )}
  </div>
);

const OutputNode = ({
  data,
  selected,
}: {
  data: { label: string; description?: string };
  selected?: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border-2 min-w-[120px] text-center transition-all ${
      selected
        ? 'border-purple-500 bg-purple-50 shadow-lg'
        : 'border-purple-300 bg-white shadow-md'
    }`}
  >
    <div className='font-semibold text-purple-800 mb-1'>📤 {data.label}</div>
    {data.description && (
      <div className='text-xs text-purple-600'>{data.description}</div>
    )}
  </div>
);

// ============================================================================
// 🎯 노드 타입 정의
// ============================================================================

const nodeTypes = {
  process: ProcessNode,
  input: InputNode,
  output: OutputNode,
};

// ============================================================================
// 🎯 초기 노드 데이터
// ============================================================================

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 100, y: 100 },
    data: { label: '원료 입력', description: '철광석, 코크스 등' },
  },
  {
    id: '2',
    type: 'process',
    position: { x: 300, y: 100 },
    data: { label: '고로 공정', description: '철광석 환원 및 용융' },
  },
  {
    id: '3',
    type: 'process',
    position: { x: 500, y: 100 },
    data: { label: '제강 공정', description: '탄소 함량 조절' },
  },
  {
    id: '4',
    type: 'output',
    position: { x: 700, y: 100 },
    data: { label: '철강 제품', description: '최종 제품' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
];

// ============================================================================
// 🎯 메인 플로우 컴포넌트
// ============================================================================

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  // ============================================================================
  // 🎯 연결 처리
  // ============================================================================

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => addEdge(params, eds));
    },
    [setEdges]
  );

  // ============================================================================
  // 🎯 노드 선택 처리
  // ============================================================================

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // ============================================================================
  // 🎯 노드 추가 기능
  // ============================================================================

  const addProcessNode = useCallback(() => {
    const newNode: Node = {
      id: `process-${Date.now()}`,
      type: 'process',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `프로세스 ${nodes.length + 1}`,
        description: '새로운 공정',
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes, nodes.length]);

  const addInputNode = useCallback(() => {
    const newNode: Node = {
      id: `input-${Date.now()}`,
      type: 'input',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: `입력 ${nodes.length + 1}`, description: '새로운 입력' },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes, nodes.length]);

  const addOutputNode = useCallback(() => {
    const newNode: Node = {
      id: `output-${Date.now()}`,
      type: 'output',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: `출력 ${nodes.length + 1}`, description: '새로운 출력' },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes, nodes.length]);

  // ============================================================================
  // 🎯 선택된 요소 삭제
  // ============================================================================

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter(node => node.id !== selectedNode.id));
      setEdges(eds =>
        eds.filter(
          edge =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges(eds => eds.filter(edge => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // ============================================================================
  // 🎯 전체 초기화
  // ============================================================================

  const resetFlow = useCallback(() => {
    if (window.confirm('모든 노드와 엣지를 삭제하시겠습니까?')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [setNodes, setEdges]);

  // ============================================================================
  // 🎯 플로우 저장/로드 (로컬 스토리지)
  // ============================================================================

  const saveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem('cbam-flow', JSON.stringify(flow));
      alert('플로우가 저장되었습니다!');
    }
  }, [reactFlowInstance]);

  const loadFlow = useCallback(() => {
    const savedFlow = localStorage.getItem('cbam-flow');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      alert('플로우가 로드되었습니다!');
    } else {
      alert('저장된 플로우가 없습니다.');
    }
  }, [setNodes, setEdges]);

  // ============================================================================
  // 🎯 컴포넌트 마운트 시 저장된 플로우 로드
  // ============================================================================

  useEffect(() => {
    const savedFlow = localStorage.getItem('cbam-flow');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);
      setNodes(flow.nodes || initialNodes);
      setEdges(flow.edges || initialEdges);
    }
  }, [setNodes, setEdges]);

  return (
    <div className='w-full h-full' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        fitView
        attributionPosition='bottom-left'
      >
        <Background />
        <Controls />

        {/* 상단 컨트롤 패널 */}
        <Panel
          position='top-left'
          className='bg-white p-4 rounded-lg shadow-lg border'
        >
          <div className='flex flex-col gap-3'>
            <h3 className='text-lg font-semibold text-gray-800'>노드 추가</h3>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={addProcessNode}
                className='bg-blue-500 hover:bg-blue-600 px-3 py-2 text-sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                프로세스 노드
              </Button>
              <Button
                onClick={addInputNode}
                className='bg-green-500 hover:bg-green-600 px-3 py-2 text-sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                입력 노드
              </Button>
              <Button
                onClick={addOutputNode}
                className='bg-purple-500 hover:bg-purple-600 px-3 py-2 text-sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                출력 노드
              </Button>
            </div>
          </div>
        </Panel>

        {/* 우측 컨트롤 패널 */}
        <Panel
          position='top-right'
          className='bg-white p-4 rounded-lg shadow-lg border'
        >
          <div className='flex flex-col gap-3'>
            <h3 className='text-lg font-semibold text-gray-800'>플로우 관리</h3>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={saveFlow}
                className='bg-blue-500 hover:bg-blue-600 px-3 py-2 text-sm'
              >
                <Save className='h-4 w-4 mr-2' />
                저장
              </Button>
              <Button
                onClick={loadFlow}
                variant='outline'
                className='px-3 py-2 text-sm'
              >
                <Upload className='h-4 w-4 mr-2' />
                로드
              </Button>
              <Button
                onClick={resetFlow}
                variant='outline'
                className='px-3 py-2 text-sm'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                초기화
              </Button>
            </div>
          </div>
        </Panel>

        {/* 하단 정보 패널 */}
        <Panel
          position='bottom-left'
          className='bg-white p-4 rounded-lg shadow-lg border'
        >
          <div className='text-sm text-gray-600'>
            <div>노드: {nodes.length}개</div>
            <div>엣지: {edges.length}개</div>
            {selectedNode && (
              <div className='mt-2 p-2 bg-blue-50 rounded border'>
                <strong>선택된 노드:</strong>{' '}
                {selectedNode.data?.label || '제목 없음'}
              </div>
            )}
            {selectedEdge && (
              <div className='mt-2 p-2 bg-green-50 rounded border'>
                <strong>선택된 엣지:</strong> {selectedEdge.source} →{' '}
                {selectedEdge.target}
              </div>
            )}
          </div>
        </Panel>

        {/* 선택된 요소 삭제 버튼 */}
        {(selectedNode || selectedEdge) && (
          <Panel
            position='bottom-right'
            className='bg-white p-4 rounded-lg shadow-lg border'
          >
            <Button
              onClick={deleteSelected}
              className='bg-red-500 hover:bg-red-600 px-3 py-2 text-sm'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              선택된 요소 삭제
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// 🎯 메인 컴포넌트 (Provider 포함)
// ============================================================================

export default function ConnectedReactFlow() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
