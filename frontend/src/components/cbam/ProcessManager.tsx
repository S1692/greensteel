'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  Settings,
  Link,
  Unlink,
} from 'lucide-react';
import ProcessStepModal from './ProcessStepModal';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  Panel,
  useReactFlow,
  ConnectionMode,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ============================================================================
// 🎯 CBAM 프로세스 타입 정의
// ============================================================================

interface ProcessStepData extends Record<string, unknown> {
  name: string;
  type: 'input' | 'process' | 'output';
  description: string;
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
}

interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  nodes: Node<ProcessStepData>[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

// ============================================================================
// 🎯 커스텀 노드 타입 정의
// ============================================================================

const CustomNode = ({
  data,
  selected,
}: {
  data: ProcessStepData;
  selected?: boolean;
}) => {
  const getNodeStyle = () => {
    const baseStyle = 'p-3 rounded-lg border-2 min-w-[150px] transition-all relative';

    switch (data.type) {
      case 'input':
        return `${baseStyle} bg-blue-100 border-blue-300 text-blue-800 ${
          selected ? 'border-blue-500 shadow-lg' : ''
        }`;
      case 'process':
        return `${baseStyle} bg-green-100 border-green-300 text-green-800 ${
          selected ? 'border-green-500 shadow-lg' : ''
        }`;
      case 'output':
        return `${baseStyle} bg-purple-100 border-purple-300 text-purple-800 ${
          selected ? 'border-purple-500 shadow-lg' : ''
        }`;
      default:
        return `${baseStyle} bg-gray-100 border-gray-300 text-gray-800 ${
          selected ? 'border-gray-500 shadow-lg' : ''
        }`;
    }
  };

  const getHandleStyle = (type: 'source' | 'target') => {
    const baseStyle = '!w-3 !h-3 !border-2 !border-white transition-colors';
    
    switch (data.type) {
      case 'input':
        return `${baseStyle} !bg-blue-500 ${type === 'source' ? '!border-blue-600' : '!border-blue-400'}`;
      case 'process':
        return `${baseStyle} !bg-green-500 ${type === 'source' ? '!border-green-600' : '!border-green-400'}`;
      case 'output':
        return `${baseStyle} !bg-purple-500 ${type === 'source' ? '!border-purple-600' : '!border-purple-400'}`;
      default:
        return `${baseStyle} !bg-gray-500 ${type === 'source' ? '!border-gray-600' : '!border-gray-400'}`;
    }
  };

  return (
    <div className={getNodeStyle()}>
      <Handle
        type="target"
        position={Position.Left}
        className={getHandleStyle('target')}
      />
      
      <div className="text-center">
        <div className="font-semibold text-sm mb-1">{data.name}</div>
        <div className="text-xs opacity-75 mb-2">{data.description}</div>
        
        {data.status === 'error' && (
          <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
            오류
          </div>
        )}
        
        {Object.keys(data.parameters).length > 0 && (
          <div className="text-xs opacity-60">
            {Object.keys(data.parameters).length}개 매개변수
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className={getHandleStyle('source')}
      />
    </div>
  );
};

// ============================================================================
// 🎯 노드 타입 정의
// ============================================================================

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// ============================================================================
// 🎯 엣지 타입 정의
// ============================================================================

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const [edgePath] = useMemo(() => {
    const offset = 20;
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    
    const path = `M ${sourceX} ${sourceY} Q ${centerX} ${centerY} ${targetX} ${targetY}`;
    return [path];
  }, [sourceX, sourceY, targetX, targetY]);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
    </>
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// ============================================================================
// 🎯 메인 ProcessManager 컴포넌트
// ============================================================================

export default function ProcessManager() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ProcessStepData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<ProcessStepData> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flows, setFlows] = useState<ProcessFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>('');
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');

  const { addNodes, setViewport } = useReactFlow();

  // 초기 노드 생성
  useEffect(() => {
    const initialNodes: Node<ProcessStepData>[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          name: '원료 입력',
          type: 'input',
          description: 'CBAM 대상 원료 입력',
          parameters: { material: '철강', quantity: '1000톤' },
          status: 'active',
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 400, y: 100 },
        data: {
          name: '탄소 배출량 계산',
          type: 'process',
          description: '생산 과정 탄소 배출량 계산',
          parameters: { method: 'LCA', scope: 'Scope 1,2' },
          status: 'active',
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 700, y: 100 },
        data: {
          name: 'CBAM 신고서',
          type: 'output',
          description: 'CBAM 신고서 생성',
          parameters: { format: 'EU 표준', language: '영어' },
          status: 'active',
        },
      },
    ];

    const initialEdges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  // 연결 처리
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // 노드 선택 처리
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<ProcessStepData>) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  // 새 노드 추가
  const addNewNode = useCallback(() => {
    const newNode: Node<ProcessStepData> = {
      id: `${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        name: '새 프로세스',
        type: 'process',
        description: '새로운 프로세스 단계',
        parameters: {},
        status: 'active',
      },
    };
    addNodes(newNode);
  }, [addNodes]);

  // 노드 삭제
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
      setIsModalOpen(false);
    }
  }, [selectedNode, setNodes, setEdges]);

  // 노드 저장
  const handleSaveNode = useCallback((data: ProcessStepData) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id ? { ...node, data } : node
        )
      );
      setSelectedNode(null);
      setIsModalOpen(false);
    }
  }, [selectedNode, setNodes]);

  // 플로우 저장
  const saveFlow = useCallback(() => {
    if (!flowName.trim()) return;

    const newFlow: ProcessFlow = {
      id: Date.now().toString(),
      name: flowName,
      description: flowDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    setFlows((prev) => [...prev, newFlow]);
    setFlowName('');
    setFlowDescription('');
  }, [flowName, flowDescription, nodes, edges]);

  // 플로우 로드
  const loadFlow = useCallback((flowId: string) => {
    const flow = flows.find((f) => f.id === flowId);
    if (flow) {
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setSelectedFlow(flowId);
    }
  }, [flows, setNodes, setEdges]);

  // 플로우 삭제
  const deleteFlow = useCallback((flowId: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== flowId));
    if (selectedFlow === flowId) {
      setSelectedFlow('');
      setNodes([]);
      setEdges([]);
    }
  }, [selectedFlow, setNodes, setEdges]);

  // 플로우 내보내기
  const exportFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      metadata: {
        name: flowName || 'CBAM_Process_Flow',
        description: flowDescription || 'CBAM 프로세스 플로우',
        exportedAt: new Date().toISOString(),
      },
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flowData.metadata.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, flowName, flowDescription]);

  // 플로우 가져오기
  const importFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.nodes && data.edges) {
              setNodes(data.nodes);
              setEdges(data.edges);
              setFlowName(data.metadata?.name || '가져온 플로우');
              setFlowDescription(data.metadata?.description || '');
            }
          } catch (error) {
            console.error('플로우 가져오기 실패:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  return (
    <div className="h-full">
      {/* 컨트롤 패널 */}
      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <Button onClick={addNewNode} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            새 노드
          </Button>
          
          <Button onClick={saveFlow} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            플로우 저장
          </Button>
          
          <Button onClick={exportFlow} className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
          
          <Button onClick={importFlow} className="bg-orange-600 hover:bg-orange-700">
            <Upload className="w-4 h-4 mr-2" />
            가져오기
          </Button>
        </div>

        {/* 플로우 정보 입력 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              플로우 이름
            </label>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="플로우 이름을 입력하세요"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              플로우 설명
            </label>
            <input
              type="text"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="플로우 설명을 입력하세요"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {/* 저장된 플로우 목록 */}
        {flows.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">저장된 플로우</h4>
            <div className="flex flex-wrap gap-2">
              {flows.map((flow) => (
                <div key={flow.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <button
                    onClick={() => loadFlow(flow.id)}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    {flow.name}
                  </button>
                  <button
                    onClick={() => deleteFlow(flow.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ReactFlow 캔버스 */}
      <div className="h-96 border border-white/20 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* 노드 편집 모달 */}
      <ProcessStepModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNode(null);
        }}
        node={selectedNode}
        onSave={handleSaveNode}
      />
    </div>
  );
}
