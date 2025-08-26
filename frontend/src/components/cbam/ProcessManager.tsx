'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Play,
  Pause,
  RotateCcw,
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
  type: 'input' | 'process' | 'output' | 'transport' | 'storage';
  description: string;
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'warning';
  carbonIntensity?: number;
  energyConsumption?: number;
  materialFlow?: number;
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
  totalCarbonEmission?: number;
  totalEnergyConsumption?: number;
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
    const baseStyle = 'p-3 rounded-lg border-2 min-w-[180px] transition-all relative shadow-sm';

    switch (data.type) {
      case 'input':
        return `${baseStyle} bg-blue-50 border-blue-300 text-blue-800 ${
          selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : ''
        }`;
      case 'process':
        return `${baseStyle} bg-green-50 border-green-300 text-green-800 ${
          selected ? 'border-green-500 shadow-lg ring-2 ring-green-200' : ''
        }`;
      case 'transport':
        return `${baseStyle} bg-orange-50 border-orange-300 text-orange-800 ${
          selected ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' : ''
        }`;
      case 'storage':
        return `${baseStyle} bg-yellow-50 border-yellow-300 text-yellow-800 ${
          selected ? 'border-yellow-500 shadow-lg ring-2 ring-yellow-200' : ''
        }`;
      case 'output':
        return `${baseStyle} bg-purple-50 border-purple-300 text-purple-800 ${
          selected ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : ''
        }`;
      default:
        return `${baseStyle} bg-gray-50 border-gray-300 text-gray-800 ${
          selected ? 'border-gray-500 shadow-lg ring-2 ring-gray-200' : ''
        }`;
    }
  };

  const getHandleStyle = (type: 'source' | 'target') => {
    const baseStyle = '!w-3 !h-3 !border-2 !border-white transition-colors';
    
    switch (data.type) {
      case 'input':
        return `${baseStyle} !bg-blue-600 hover:!bg-blue-700`;
      case 'process':
        return `${baseStyle} !bg-green-600 hover:!bg-green-700`;
      case 'transport':
        return `${baseStyle} !bg-orange-600 hover:!bg-orange-700`;
      case 'storage':
        return `${baseStyle} !bg-yellow-600 hover:!bg-yellow-700`;
      case 'output':
        return `${baseStyle} !bg-purple-600 hover:!bg-purple-700`;
      default:
        return `${baseStyle} !bg-gray-600 hover:!bg-gray-700`;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = () => {
    switch (data.type) {
      case 'input':
        return '📥';
      case 'process':
        return '⚙️';
      case 'transport':
        return '🚚';
      case 'storage':
        return '📦';
      case 'output':
        return '📤';
      default:
        return '🔘';
    }
  };

  return (
    <div className={getNodeStyle()}>
      {/* 🎯 Target 핸들 (입력) */}
      {data.type !== 'input' && (
        <Handle
          type='target'
          position={Position.Left}
          isConnectable={true}
          className={getHandleStyle('target')}
        />
      )}

      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium uppercase opacity-70'>
            {getTypeIcon()} {data.type}
          </span>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        </div>
      </div>
      
      <div className='font-semibold text-sm mb-1'>{data.name}</div>
      <div className='text-xs opacity-70 mb-2'>{data.description}</div>

      {/* 탄소 배출량 표시 */}
      {data.carbonIntensity && (
        <div className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded mb-2'>
          🏭 {data.carbonIntensity} tCO2/t
        </div>
      )}

      {/* 에너지 소비량 표시 */}
      {data.energyConsumption && (
        <div className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mb-2'>
          ⚡ {data.energyConsumption} GJ/t
        </div>
      )}

      {/* 파라미터 미리보기 */}
      {Object.keys(data.parameters).length > 0 && (
        <div className='text-xs opacity-60 bg-white/50 p-2 rounded'>
          {Object.entries(data.parameters)
            .slice(0, 3)
            .map(([key, value]) => (
              <div key={key} className='flex justify-between'>
                <span>{key}:</span>
                <span className='font-medium'>{String(value)}</span>
              </div>
            ))}
          {Object.keys(data.parameters).length > 3 && (
            <div className='text-center opacity-50'>...</div>
          )}
        </div>
      )}

      {/* 🎯 Source 핸들 (출력) */}
      {data.type !== 'output' && (
        <Handle
          type='source'
          position={Position.Right}
          isConnectable={true}
          className={getHandleStyle('source')}
        />
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// ============================================================================
// 🎯 커스텀 엣지 타입 정의
// ============================================================================

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  data,
}: any) => {
  const [edgePath] = useMemo(() => {
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;

    const path = `M ${sourceX} ${sourceY} Q ${centerX} ${sourceY} ${targetX} ${targetY}`;

    return [path];
  }, [sourceX, sourceY, targetX, targetY]);

  return (
    <>
      <path
        id={id}
        className='react-flow__edge-path'
        d={edgePath}
        stroke={selected ? '#3b82f6' : '#6b7280'}
        strokeWidth={selected ? 3 : 2}
        fill='none'
        markerEnd='url(#arrowhead)'
      />
      {selected && (
        <path
          d={edgePath}
          stroke='#3b82f6'
          strokeWidth={6}
          fill='none'
          opacity={0.3}
        />
      )}
      {/* 엣지 라벨 */}
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          textAnchor='middle'
          dominantBaseline='middle'
          className='text-xs fill-gray-600 bg-white px-1'
        >
          {data.label}
        </text>
      )}
    </>
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// ============================================================================
// 🎯 CBAM 프로세스 매니저 컴포넌트
// ============================================================================

export default function ProcessManager() {
  const [flows, setFlows] = useState<ProcessFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node<ProcessStepData> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // React Flow 상태 관리
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { addNodes, addEdges, deleteElements, getNodes, getEdges } = useReactFlow();

  // ============================================================================
  // 🎯 초기 데이터 로드
  // ============================================================================

  useEffect(() => {
    const savedFlows = localStorage.getItem('cbam-process-flows');
    if (savedFlows) {
      try {
        const parsedFlows = JSON.parse(savedFlows);
        setFlows(parsedFlows);

        // 첫 번째 플로우가 있으면 자동 선택
        if (parsedFlows.length > 0 && !selectedFlow) {
          selectFlow(parsedFlows[0]);
        }
      } catch (error) {
        console.error('저장된 플로우 로드 실패:', error);
      }
    }
  }, []);

  // selectedFlow가 변경될 때 자동으로 선택
  useEffect(() => {
    if (selectedFlow) {
      setNodes(selectedFlow.nodes);
      setEdges(selectedFlow.edges);
    }
  }, [selectedFlow, setNodes, setEdges]);

  // ============================================================================
  // 🎯 플로우 저장
  // ============================================================================

  const saveFlows = useCallback((newFlows: ProcessFlow[]) => {
    localStorage.setItem('cbam-process-flows', JSON.stringify(newFlows));
    setFlows(newFlows);
  }, []);

  // ============================================================================
  // 🎯 새 플로우 생성
  // ============================================================================

  const createNewFlow = useCallback(() => {
    const defaultNodes: Node<ProcessStepData>[] = [
      {
        id: 'input-1',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: {
          name: '철광석 입력',
          type: 'input',
          description: '철광석, 코크스 등 원료 투입',
          parameters: { material: 'iron_ore', quantity: 1000, unit: 'ton' },
          status: 'active',
          carbonIntensity: 0.05,
          energyConsumption: 2.5,
        },
      },
      {
        id: 'process-1',
        type: 'custom',
        position: { x: 350, y: 200 },
        data: {
          name: '고로 공정',
          type: 'process',
          description: '철광석 환원 및 용융 공정',
          parameters: { temperature: 1500, pressure: 1.2, duration: 8 },
          status: 'active',
          carbonIntensity: 1.8,
          energyConsumption: 15.2,
        },
      },
      {
        id: 'transport-1',
        type: 'custom',
        position: { x: 600, y: 100 },
        data: {
          name: '중간 운송',
          type: 'transport',
          description: '고로에서 제강공정으로 운송',
          parameters: { distance: 500, mode: 'conveyor', duration: 2 },
          status: 'active',
          carbonIntensity: 0.02,
          energyConsumption: 0.8,
        },
      },
      {
        id: 'process-2',
        type: 'custom',
        position: { x: 600, y: 300 },
        data: {
          name: '제강 공정',
          type: 'process',
          description: '탄소 함량 조절 및 정련',
          parameters: { carbon_content: 0.15, oxygen_blow: true, duration: 4 },
          status: 'active',
          carbonIntensity: 0.3,
          energyConsumption: 8.5,
        },
      },
      {
        id: 'storage-1',
        type: 'custom',
        position: { x: 850, y: 200 },
        data: {
          name: '제품 저장',
          type: 'storage',
          description: '완성된 철강 제품 저장',
          parameters: { capacity: 2000, temperature: 25, humidity: 60 },
          status: 'active',
          carbonIntensity: 0.01,
          energyConsumption: 0.5,
        },
      },
      {
        id: 'output-1',
        type: 'custom',
        position: { x: 1100, y: 200 },
        data: {
          name: '철강 제품',
          type: 'output',
          description: '강판, 강재 등 최종 제품',
          parameters: {
            product_type: 'steel_plate',
            quantity: 800,
            unit: 'ton',
            quality: 'A-grade',
          },
          status: 'active',
        },
      },
    ];

    const defaultEdges: Edge[] = [
      {
        id: 'e1-2',
        source: 'input-1',
        target: 'process-1',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '원료 공급' },
      },
      {
        id: 'e2-3',
        source: 'process-1',
        target: 'transport-1',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '용융철' },
      },
      {
        id: 'e3-4',
        source: 'transport-1',
        target: 'process-2',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '운송' },
      },
      {
        id: 'e2-4',
        source: 'process-1',
        target: 'process-2',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '직접 공급' },
      },
      {
        id: 'e4-5',
        source: 'process-2',
        target: 'storage-1',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '완성품' },
      },
      {
        id: 'e5-6',
        source: 'storage-1',
        target: 'output-1',
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '출하' },
      },
    ];

    const newFlow: ProcessFlow = {
      id: `flow-${Date.now()}`,
      name: '새 CBAM 프로세스',
      description: '새로 생성된 CBAM 프로세스 플로우',
      nodes: defaultNodes,
      edges: defaultEdges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const updatedFlows = [...flows, newFlow];
    saveFlows(updatedFlows);
    selectFlow(newFlow);
  }, [flows, saveFlows]);

  // ============================================================================
  // 🎯 플로우 선택
  // ============================================================================

  const selectFlow = useCallback(
    (flow: ProcessFlow) => {
      setSelectedFlow(flow);
      setNodes(flow.nodes);
      setEdges(flow.edges);
    },
    [setNodes, setEdges]
  );

  // ============================================================================
  // 🎯 플로우 삭제
  // ============================================================================

  const deleteFlow = useCallback(
    (flowId: string) => {
      if (window.confirm('정말로 이 플로우를 삭제하시겠습니까?')) {
        const updatedFlows = flows.filter(flow => flow.id !== flowId);
        saveFlows(updatedFlows);
        if (selectedFlow?.id === flowId) {
          setSelectedFlow(null);
          setNodes([]);
          setEdges([]);
        }
      }
    },
    [flows, selectedFlow, saveFlows, setNodes, setEdges]
  );

  // ============================================================================
  // 🎯 플로우 저장
  // ============================================================================

  const saveCurrentFlow = useCallback(() => {
    if (!selectedFlow) return;

    const updatedFlow: ProcessFlow = {
      ...selectedFlow,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(flow =>
      flow.id === selectedFlow.id ? updatedFlow : flow
    );

    saveFlows(updatedFlows);
    setSelectedFlow(updatedFlow);
    alert('플로우가 저장되었습니다!');
  }, [selectedFlow, nodes, edges, flows, saveFlows]);

  // ============================================================================
  // 🎯 플로우 내보내기
  // ============================================================================

  const exportFlow = useCallback((flow: ProcessFlow) => {
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${flow.name.replace(/\s+/g, '_')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, []);

  // ============================================================================
  // 🎯 플로우 가져오기
  // ============================================================================

  const importFlow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedFlow: ProcessFlow = JSON.parse(
            e.target?.result as string
          );
          importedFlow.id = `flow-${Date.now()}`;
          importedFlow.createdAt = new Date().toISOString();
          importedFlow.updatedAt = new Date().toISOString();

          const updatedFlows = [...flows, importedFlow];
          saveFlows(updatedFlows);
          selectFlow(importedFlow);
          alert('플로우가 성공적으로 가져와졌습니다!');
        } catch (error) {
          alert('플로우 파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    },
    [flows, saveFlows, selectFlow]
  );

  // ============================================================================
  // 🎯 새 노드 추가
  // ============================================================================

  const addNewNode = useCallback(() => {
    if (!selectedFlow) return;

    const newNode: Node<ProcessStepData> = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        name: '새 단계',
        type: 'process',
        description: '새로 추가된 프로세스 단계',
        parameters: {},
        status: 'active',
      },
    };

    addNodes(newNode);
  }, [selectedFlow, addNodes]);

  // ============================================================================
  // 🎯 노드 편집
  // ============================================================================

  const editNode = useCallback((node: Node<ProcessStepData>) => {
    setEditingNode(node);
    setShowProcessModal(true);
  }, []);

  // ============================================================================
  // 🎯 노드 저장
  // ============================================================================

  const saveNode = useCallback(
    (updatedData: ProcessStepData) => {
      if (!editingNode) return;

      const updatedNodes = nodes.map(node =>
        node.id === editingNode.id ? { ...node, data: updatedData } : node
      );

      setNodes(updatedNodes);
      setShowProcessModal(false);
      setEditingNode(null);
    },
    [editingNode, nodes, setNodes]
  );

  // ============================================================================
  // 🎯 연결 관리
  // ============================================================================

  const onConnect = useCallback(
    async (params: Connection) => {
      if (params.source && params.target) {
        try {
          console.log('🔗 연결 시도:', params);
          
          // 로컬 상태에 즉시 추가 (사용자 경험 향상)
          const newEdge: Edge = {
            id: `e${params.source}-${params.target}`,
            source: params.source,
            target: params.target,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
              label: '연결',
              processType: 'standard'
            }
          };
          
          addEdges(newEdge);
          
          console.log('✅ 연결 완료:', newEdge.id);
        } catch (error) {
          console.error('❌ 연결 실패:', error);
        }
      }
    },
    [addEdges]
  );

  const onConnectStart = useCallback((event: any, params: any) => {
    setIsConnecting(true);
    setConnectionStart(params.nodeId);
  }, []);

  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  // ============================================================================
  // 🎯 시뮬레이션 실행
  // ============================================================================

  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    
    // 탄소 배출량 계산
    const totalCarbonEmission = nodes.reduce((total, node) => {
      return total + (node.data.carbonIntensity || 0);
    }, 0);

    // 에너지 소비량 계산
    const totalEnergyConsumption = nodes.reduce((total, node) => {
      return total + (node.data.energyConsumption || 0);
    }, 0);

    console.log('🏭 총 탄소 배출량:', totalCarbonEmission, 'tCO2');
    console.log('⚡ 총 에너지 소비량:', totalEnergyConsumption, 'GJ');

    // 시뮬레이션 완료 후 상태 업데이트
    setTimeout(() => {
      setIsSimulating(false);
      alert(`시뮬레이션 완료!\n총 탄소 배출량: ${totalCarbonEmission.toFixed(2)} tCO2\n총 에너지 소비량: ${totalEnergyConsumption.toFixed(2)} GJ`);
    }, 2000);
  }, [nodes]);

  // ============================================================================
  // 🎯 메인 렌더링
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* 플로우 목록 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {flows.map(flow => (
          <div
            key={flow.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedFlow?.id === flow.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => selectFlow(flow)}
          >
            <div className='flex items-start justify-between mb-3'>
              <h3 className='font-semibold text-gray-900'>{flow.name}</h3>
              <div className='flex gap-2'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    exportFlow(flow);
                  }}
                  className='p-1 hover:bg-gray-100 rounded'
                  title='내보내기'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteFlow(flow.id);
                  }}
                  className='p-1 hover:bg-red-100 rounded text-red-600'
                  title='삭제'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
            <p className='text-sm text-gray-600 mb-3'>{flow.description}</p>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>노드: {flow.nodes.length}개</span>
              <span>v{flow.version}</span>
            </div>
          </div>
        ))}

        {/* 새 플로우 생성 버튼 */}
        <button
          onClick={createNewFlow}
          className='p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-gray-700'
        >
          <Plus className='h-8 w-8 mb-2' />
          <span className='font-medium'>새 플로우 생성</span>
        </button>
      </div>

      {/* 선택된 플로우 상세 보기 */}
      {selectedFlow && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {selectedFlow.name}
              </h2>
              <p className='text-gray-600'>{selectedFlow.description}</p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={saveCurrentFlow}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Save className='h-4 w-4' />
                저장
              </button>
              <button
                onClick={addNewNode}
                className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Plus className='h-4 w-4' />
                노드 추가
              </button>
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50'
              >
                {isSimulating ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
                {isSimulating ? '시뮬레이션 중...' : '시뮬레이션'}
              </button>
            </div>
          </div>

          {/* React Flow 캔버스 */}
          <div className='h-[600px] border-2 border-gray-200 rounded-lg overflow-hidden'>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionMode={ConnectionMode.Loose}
              deleteKeyCode='Delete'
              multiSelectionKeyCode='Shift'
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnScroll={false}
              preventScrolling={true}
              className='bg-gray-50'
            >
              <Background gap={12} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeColor={n => {
                  if (n.type === 'input') return '#3b82f6';
                  if (n.type === 'output') return '#8b5cf6';
                  if (n.type === 'transport') return '#f97316';
                  if (n.type === 'storage') return '#eab308';
                  return '#22c55e';
                }}
                nodeColor={n => {
                  if (n.type === 'input') return '#dbeafe';
                  if (n.type === 'output') return '#f3e8ff';
                  if (n.type === 'transport') return '#fed7aa';
                  if (n.type === 'storage') return '#fef3c7';
                  return '#dcfce7';
                }}
              />

              {/* 상단 패널 */}
              <Panel
                position='top-left'
                className='bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg'
              >
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                  <span>입력</span>
                  <div className='w-3 h-3 bg-green-500 rounded-full ml-2'></div>
                  <span>처리</span>
                  <div className='w-3 h-3 bg-orange-500 rounded-full ml-2'></div>
                  <span>운송</span>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full ml-2'></div>
                  <span>저장</span>
                  <div className='w-3 h-3 bg-purple-500 rounded-full ml-2'></div>
                  <span>출력</span>
                </div>
              </Panel>

              {/* 우측 패널 */}
              <Panel
                position='top-right'
                className='bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg'
              >
                <div className='text-sm text-gray-600'>
                  <div>💡 노드의 핸들을 드래그하여 연결하세요</div>
                  <div>🔗 파란색 핸들: 입력, 초록색 핸들: 출력</div>
                  <div>🔄 연결선을 드래그하여 재연결</div>
                  <div>🗑️ Delete 키로 선택된 요소 삭제</div>
                  {isConnecting && (
                    <div className='text-blue-600 font-medium mt-2'>
                      🔗 연결 중... {connectionStart && `(${connectionStart})`}
                    </div>
                  )}
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* 노드 상세 정보 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              노드 상세 정보
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`p-4 rounded-lg border-2 ${
                    node.data.type === 'input'
                      ? 'border-blue-200 bg-blue-50'
                      : node.data.type === 'process'
                        ? 'border-green-200 bg-green-50'
                        : node.data.type === 'transport'
                          ? 'border-orange-200 bg-orange-50'
                          : node.data.type === 'storage'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  <div className='flex items-center justify-between mb-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        node.data.type === 'input'
                          ? 'bg-blue-100 text-blue-800'
                          : node.data.type === 'process'
                            ? 'bg-green-100 text-green-800'
                            : node.data.type === 'transport'
                              ? 'bg-orange-100 text-orange-800'
                              : node.data.type === 'storage'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {node.data.type}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => editNode(node)}
                        className='p-1 hover:bg-white/50 rounded'
                      >
                        <Edit className='h-3 w-3' />
                      </button>
                      <button
                        onClick={() => deleteElements({ nodes: [node] })}
                        className='p-1 hover:bg-red-100 rounded text-red-600'
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    </div>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    {node.data.name}
                  </h4>
                  <p className='text-sm text-gray-600 mb-3'>
                    {node.data.description}
                  </p>

                  {/* 탄소 배출량 및 에너지 소비량 */}
                  {(node.data.carbonIntensity || node.data.energyConsumption) && (
                    <div className='space-y-2 mb-3'>
                      {node.data.carbonIntensity && (
                        <div className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded'>
                          🏭 탄소 배출량: {node.data.carbonIntensity} tCO2/t
                        </div>
                      )}
                      {node.data.energyConsumption && (
                        <div className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                          ⚡ 에너지 소비량: {node.data.energyConsumption} GJ/t
                        </div>
                      )}
                    </div>
                  )}

                  {/* 파라미터 표시 */}
                  {Object.keys(node.data.parameters).length > 0 && (
                    <div className='space-y-2'>
                      <h5 className='text-xs font-medium text-gray-700 uppercase'>
                        파라미터
                      </h5>
                      {Object.entries(node.data.parameters).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className='flex justify-between text-xs'
                          >
                            <span className='text-gray-600'>{key}:</span>
                            <span className='font-medium'>{String(value)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 플로우 가져오기 */}
      <div className='border-t pt-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          플로우 가져오기
        </h3>
        <div className='flex items-center gap-4'>
          <input
            type='file'
            accept='.json'
            onChange={importFlow}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90'
          />
          <p className='text-sm text-gray-500'>
            JSON 형식의 CBAM 프로세스 플로우 파일을 선택하세요
          </p>
        </div>
      </div>

      {/* 프로세스 단계 편집 모달 */}
      <ProcessStepModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setEditingNode(null);
        }}
        node={editingNode}
        onSave={saveNode}
      />
    </div>
  );
}
