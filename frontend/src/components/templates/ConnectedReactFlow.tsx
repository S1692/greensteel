'use client';

import {
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  Background,
  Panel,
  useViewport,
  useConnection,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Position,
} from '@xyflow/react';

import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Zap,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';

import '@xyflow/react/dist/style.css';

// ============================================================================
// 🎯 노드 타입 정의
// ============================================================================

interface CBAMNodeData {
  label: string;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  carbonIntensity?: number; // kg CO2/t
  energyConsumption?: number; // kWh/t
  processType?: 'input' | 'process' | 'output';
}

interface CBAMNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: CBAMNodeData & Record<string, unknown>;
  sourcePosition?: Position;
  targetPosition?: Position;
  selectable?: boolean;
  draggable?: boolean;
}

interface CBAMEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    label?: string;
    flowType?: 'material' | 'energy' | 'emission';
    quantity?: number;
    unit?: string;
  };
}

// ============================================================================
// 🎯 커스텀 노드 컴포넌트들
// ============================================================================

const ProcessNode: React.FC<{ data: CBAMNodeData }> = ({ data }) => {
  const getVariantStyle = () => {
    switch (data.variant) {
      case 'primary':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'danger':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getVariantStyle()} min-w-[200px]`}
    >
      <div className='font-semibold text-center mb-2'>{data.label}</div>
      {data.description && (
        <div className='text-xs text-center opacity-80 mb-2'>
          {data.description}
        </div>
      )}
      {data.carbonIntensity && (
        <div className='text-xs text-center opacity-70'>
          탄소집약도: {data.carbonIntensity} kg CO₂/t
        </div>
      )}
      {data.energyConsumption && (
        <div className='text-xs text-center opacity-70'>
          에너지: {data.energyConsumption} kWh/t
        </div>
      )}
    </div>
  );
};

const InputNode: React.FC<{ data: CBAMNodeData }> = ({ data }) => {
  return (
    <div className='p-4 rounded-lg border-2 bg-blue-500/20 border-blue-500/50 text-blue-300 min-w-[200px]'>
      <div className='font-semibold text-center mb-2'>📥 {data.label}</div>
      {data.description && (
        <div className='text-xs text-center opacity-80 mb-2'>
          {data.description}
        </div>
      )}
    </div>
  );
};

const OutputNode: React.FC<{ data: CBAMNodeData }> = ({ data }) => {
  return (
    <div className='p-4 rounded-lg border-2 bg-purple-500/20 border-purple-500/50 text-purple-300 min-w-[200px]'>
      <div className='font-semibold text-center mb-2'>📤 {data.label}</div>
      {data.description && (
        <div className='text-xs text-center opacity-80 mb-2'>
          {data.description}
        </div>
      )}
    </div>
  );
};

const AnnotationNode: React.FC<{ data: CBAMNodeData }> = ({ data }) => {
  return (
    <div className='p-3 rounded-lg border-2 bg-yellow-500/20 border-yellow-500/50 text-yellow-300 min-w-[150px]'>
      <div className='text-sm text-center'>💬 {data.label}</div>
    </div>
  );
};

const nodeTypes = {
  process: ProcessNode,
  input: InputNode,
  output: OutputNode,
  annotation: AnnotationNode,
};

// ============================================================================
// 🎯 뷰포트 정보 표시 컴포넌트
// ============================================================================

function ViewportWithAnnotation() {
  const viewport = useViewport();

  return (
    <div
      style={{
        fontFamily: 'monospace',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px',
      }}
    >
      <div>x: {viewport.x.toFixed(2)}</div>
      <div>y: {viewport.y.toFixed(2)}</div>
      <div>zoom: {viewport.zoom.toFixed(2)}</div>
    </div>
  );
}

// ============================================================================
// 🎯 Props 인터페이스
// ============================================================================

interface ConnectedReactFlowProps {
  flowId?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

// ============================================================================
// 🎯 메인 플로우 컴포넌트
// ============================================================================

function Flow({ flowId, autoSave, saveInterval }: ConnectedReactFlowProps) {
  const [nodes, setNodes] = useState<CBAMNode[]>([]);
  const [edges, setEdges] = useState<CBAMEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const connection = useConnection();

  // ============================================================================
  // 🎯 초기 데이터 로드
  // ============================================================================

  useEffect(() => {
    const loadFlowData = async () => {
      setIsLoading(true);
      setHasUnsavedChanges(false);
      setLastSaved(null);

      if (!flowId) {
        // 플로우 ID가 없으면 새 플로우 생성 (초기 노드만)
        const initialNodes: CBAMNode[] = [
          {
            id: '1-1',
            type: 'process',
            data: {
              label: '시작 프로세스',
              description: '프로세스 시작점',
              variant: 'primary',
              carbonIntensity: 0,
              energyConsumption: 0,
            },
            position: { x: 150, y: 100 },
          },
        ];

        setNodes(initialNodes);
        setEdges([]);
      } else {
        // 기존 플로우 로드 (실제 구현 시 API 호출)
        try {
          // 임시로 기본 노드 설정
          setNodes([
            {
              id: '1-1',
              type: 'process',
              data: {
                label: '기존 프로세스',
                description: '로드된 프로세스',
                variant: 'primary',
                carbonIntensity: 0,
                energyConsumption: 0,
              },
              position: { x: 150, y: 100 },
            },
          ]);
          setEdges([]);
        } catch (error) {
          console.error('플로우 로드 실패:', error);
          // 에러 발생 시 기본 노드로 초기화
          setNodes([
            {
              id: '1-1',
              type: 'process',
              data: {
                label: '시작 프로세스',
                description: '프로세스 시작점',
                variant: 'primary',
                carbonIntensity: 0,
                energyConsumption: 0,
              },
              position: { x: 150, y: 100 },
            },
          ]);
          setEdges([]);
        }
      }
      setIsLoading(false);
    };

    loadFlowData();
  }, [flowId]);

  // ============================================================================
  // 🎯 자동 저장 기능
  // ============================================================================

  const saveToBackend = useCallback(async () => {
    if (!flowId || !hasUnsavedChanges) return;

    try {
      const viewport = { x: 0, y: 0, zoom: 1 };
      // 실제 구현 시 API 호출
      console.log('플로우 저장:', { flowId, nodes, edges, viewport });

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }, [flowId, nodes, edges, hasUnsavedChanges]);

  // 자동 저장 인터벌
  useEffect(() => {
    if (!autoSave || !saveInterval) return;

    const interval = setInterval(() => {
      if (flowId && hasUnsavedChanges) {
        saveToBackend();
      }
    }, saveInterval);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, flowId, hasUnsavedChanges, saveToBackend]);

  // ============================================================================
  // 🎯 노드/엣지 변경 핸들러
  // ============================================================================

  const onNodesChange = useCallback((changes: any) => {
    setNodes(prev => applyNodeChanges(changes, prev) as unknown as CBAMNode[]);
    setHasUnsavedChanges(true);
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges(prev => applyEdgeChanges(changes, prev) as unknown as CBAMEdge[]);
    setHasUnsavedChanges(true);
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges(prev => addEdge(connection, prev) as unknown as CBAMEdge[]);
    setHasUnsavedChanges(true);
  }, []);

  // ============================================================================
  // 🎯 연결 어노테이션 로직
  // ============================================================================

  const onMouseMove = useCallback(() => {
    if (connection.inProgress) {
      const { from, to } = connection;
      const nodePosition = { x: to.x, y: to.y };

      setNodes(prevNodes => {
        const nodeExists = prevNodes.some(
          node => node.id === 'connection-annotation'
        );
        const connectionAnnotation: CBAMNode = {
          id: 'connection-annotation',
          type: 'annotation',
          selectable: false,
          data: {
            label: '연결 중...',
          },
          position: nodePosition,
        };

        if (nodeExists) {
          return prevNodes.map(node =>
            node.id === 'connection-annotation' ? connectionAnnotation : node
          );
        } else {
          return [...prevNodes, connectionAnnotation];
        }
      });
    }
  }, [connection]);

  const onConnectEnd = useCallback(() => {
    setNodes(prevNodes =>
      prevNodes.filter(node => node.id !== 'connection-annotation')
    );
  }, []);

  // ============================================================================
  // 🎯 노드 추가 기능
  // ============================================================================

  const addNode = useCallback(
    async (
      nodeType:
        | 'default'
        | 'primary'
        | 'success'
        | 'warning'
        | 'danger' = 'default'
    ) => {
      const newNode: CBAMNode = {
        id: `node-${Date.now()}`,
        type: 'process',
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 200 + 100,
        },
        data: {
          label: `프로세스 ${Date.now()}`,
          description: '새로운 프로세스 노드',
          variant: nodeType,
          size: 'md',
          carbonIntensity: Math.floor(Math.random() * 1000),
          energyConsumption: Math.floor(Math.random() * 500),
        },
        targetPosition: nodeType === 'primary' ? Position.Left : Position.Top,
        sourcePosition:
          nodeType === 'danger' ? Position.Right : Position.Bottom,
      };

      setNodes(prev => [...prev, newNode]);
      setHasUnsavedChanges(true);
    },
    []
  );

  const addAnnotationNode = useCallback(async () => {
    const newNode: CBAMNode = {
      id: `annotation-${Date.now()}`,
      type: 'annotation',
      draggable: true,
      selectable: true,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100,
      },
      data: {
        label: `어노테이션 ${Date.now()}`,
      },
    };

    setNodes(prev => [...prev, newNode]);
    setHasUnsavedChanges(true);
  }, []);

  const addInputNode = useCallback(
    async (
      variant:
        | 'default'
        | 'primary'
        | 'success'
        | 'warning'
        | 'danger' = 'default'
    ) => {
      const newNode: CBAMNode = {
        id: `input-${Date.now()}`,
        type: 'input',
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 200 + 100,
        },
        data: {
          label: `입력 ${Date.now()}`,
          description: '데이터 입력점',
          variant,
        },
        sourcePosition: Position.Right,
      };

      setNodes(prev => [...prev, newNode]);
      setHasUnsavedChanges(true);
    },
    []
  );

  const addOutputNode = useCallback(
    async (
      variant:
        | 'default'
        | 'primary'
        | 'success'
        | 'warning'
        | 'danger' = 'default'
    ) => {
      const newNode: CBAMNode = {
        id: `output-${Date.now()}`,
        type: 'output',
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 200 + 100,
        },
        data: {
          label: `출력 ${Date.now()}`,
          description: '결과 출력점',
          variant,
        },
        targetPosition: Position.Left,
      };

      setNodes(prev => [...prev, newNode]);
      setHasUnsavedChanges(true);
    },
    []
  );

  const clearAllNodes = useCallback(async () => {
    if (window.confirm('모든 노드를 삭제하시겠습니까?')) {
      setNodes([]);
      setEdges([]);
      setHasUnsavedChanges(true);
    }
  }, []);

  // ============================================================================
  // 🎯 CBAM 계산 실행
  // ============================================================================

  const runCBAMCalculation = useCallback(() => {
    const totalCarbonIntensity = nodes.reduce(
      (sum, node) => sum + (node.data.carbonIntensity || 0),
      0
    );
    const totalEnergyConsumption = nodes.reduce(
      (sum, node) => sum + (node.data.energyConsumption || 0),
      0
    );

    alert(
      `CBAM 계산 결과:\n총 탄소집약도: ${totalCarbonIntensity} kg CO₂/t\n총 에너지 소비: ${totalEnergyConsumption} kWh/t`
    );
  }, [nodes]);

  // ============================================================================
  // 🎯 수동 저장
  // ============================================================================

  const handleManualSave = useCallback(() => {
    saveToBackend();
  }, [saveToBackend]);

  if (isLoading) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>플로우 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }} onMouseMove={onMouseMove}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        preventScrolling={false}
      >
        <Background />
        <Controls position='top-left' />

        {/* 뷰포트 정보 패널 */}
        <Panel position='bottom-left'>
          <ViewportWithAnnotation />
        </Panel>

        {/* 노드 생성 컨트롤 패널 */}
        <Panel position='top-right'>
          <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-[220px]'>
            <div className='flex flex-col gap-3'>
              <h3 className='text-sm font-semibold text-gray-700'>노드 생성</h3>

              {/* 🎯 프로세스 노드들 */}
              <div>
                <h4 className='text-xs font-medium text-gray-600 mb-1'>
                  프로세스 노드
                </h4>
                <div className='grid grid-cols-3 gap-1'>
                  <button
                    onClick={() => addNode('default')}
                    className='px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors'
                    title='기본 프로세스'
                  >
                    기본
                  </button>

                  <button
                    onClick={() => addNode('primary')}
                    className='px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors'
                    title='주요 프로세스'
                  >
                    주요
                  </button>

                  <button
                    onClick={() => addNode('success')}
                    className='px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors'
                    title='완료 프로세스'
                  >
                    완료
                  </button>
                </div>
              </div>

              {/* 📥 입력/출력 노드들 */}
              <div>
                <h4 className='text-xs font-medium text-gray-600 mb-1'>
                  입력/출력 노드
                </h4>
                <div className='grid grid-cols-2 gap-1'>
                  <button
                    onClick={() => addInputNode('primary')}
                    className='px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1'
                    title='데이터 입력점'
                  >
                    📥 입력
                  </button>

                  <button
                    onClick={() => addOutputNode('success')}
                    className='px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors flex items-center gap-1'
                    title='결과 출력점'
                  >
                    📤 출력
                  </button>
                </div>
              </div>

              {/* 📝 기타 노드들 */}
              <div>
                <h4 className='text-xs font-medium text-gray-600 mb-1'>기타</h4>
                <div className='grid grid-cols-2 gap-1'>
                  <button
                    onClick={addAnnotationNode}
                    className='px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors'
                    title='어노테이션 노드'
                  >
                    💬 메모
                  </button>

                  <button
                    onClick={() => addNode('warning')}
                    className='px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors'
                    title='주의 프로세스'
                  >
                    ⚠️ 주의
                  </button>
                </div>
              </div>

              {/* 🗑️ 전체 삭제 버튼 */}
              <button
                onClick={clearAllNodes}
                className='px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors'
              >
                🗑️ 전체 삭제
              </button>

              <div className='text-xs text-gray-400 pt-2 border-t border-gray-200'>
                노드: {nodes.length} | 엣지: {edges.length}
              </div>
            </div>
          </div>
        </Panel>

        {/* 저장 상태 패널 */}
        <Panel position='top-left' style={{ top: '80px' }}>
          <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-orange-500' : 'bg-green-500'}`}
                ></div>
                <span className='text-sm font-medium'>
                  {hasUnsavedChanges ? '저장되지 않음' : '저장됨'}
                </span>
              </div>

              {lastSaved && (
                <div className='text-xs text-gray-500'>
                  마지막 저장: {lastSaved.toLocaleTimeString()}
                </div>
              )}

              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges}
                className={`px-3 py-1 rounded text-sm ${
                  hasUnsavedChanges
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                수동 저장
              </button>

              <button
                onClick={runCBAMCalculation}
                className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
              >
                CBAM 계산
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// 🎯 메인 컴포넌트 (Provider 포함)
// ============================================================================

function ConnectedReactFlow({
  flowId,
  autoSave = true,
  saveInterval = 10000, // 10초마다 자동 저장
}: ConnectedReactFlowProps) {
  return (
    <ReactFlowProvider>
      <Flow flowId={flowId} autoSave={autoSave} saveInterval={saveInterval} />
    </ReactFlowProvider>
  );
}

export default ConnectedReactFlow;
