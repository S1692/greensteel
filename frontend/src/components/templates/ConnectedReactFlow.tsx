'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Zap,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

// CBAM 프로세스 노드 타입 정의
interface CBAMNode extends Node {
  data: {
    label: string;
    processType: 'input' | 'process' | 'output';
    description?: string;
    parameters?: Record<string, any>;
    carbonIntensity?: number; // kg CO2/t
    energyConsumption?: number; // kWh/t
  };
}

// CBAM 프로세스 엣지 타입 정의
type CBAMEdge = Edge & {
  data?: {
    label?: string;
    flowType?: 'material' | 'energy' | 'emission';
    quantity?: number;
    unit?: string;
  };
};

// CBAM 프로세스 노드 컴포넌트
const CBAMNode: React.FC<{ data: CBAMNode['data'] }> = ({ data }) => {
  const getNodeStyle = () => {
    switch (data.processType) {
      case 'input':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'process':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'output':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      default:
        return 'bg-white/20 border-white/50 text-white';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getNodeStyle()} min-w-[200px]`}>
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

const nodeTypes: NodeTypes = {
  cbamNode: CBAMNode,
};

// 기본 CBAM 프로세스 노드들
const defaultNodes: CBAMNode[] = [
  {
    id: '1',
    type: 'cbamNode',
    position: { x: 100, y: 100 },
    data: {
      label: '원료 투입',
      processType: 'input',
      description: '철광석, 코크스, 석회석',
      carbonIntensity: 0.1,
      energyConsumption: 5,
    },
  },
  {
    id: '2',
    type: 'cbamNode',
    position: { x: 400, y: 100 },
    data: {
      label: '제철 공정',
      processType: 'process',
      description: '고로에서 선철 제조',
      carbonIntensity: 1850,
      energyConsumption: 2800,
    },
  },
  {
    id: '3',
    type: 'cbamNode',
    position: { x: 700, y: 100 },
    data: {
      label: '제강 공정',
      processType: 'process',
      description: '산소 제강법',
      carbonIntensity: 120,
      energyConsumption: 450,
    },
  },
  {
    id: '4',
    type: 'cbamNode',
    position: { x: 1000, y: 100 },
    data: {
      label: '압연 공정',
      processType: 'process',
      description: '열간/냉간 압연',
      carbonIntensity: 45,
      energyConsumption: 180,
    },
  },
  {
    id: '5',
    type: 'cbamNode',
    position: { x: 1300, y: 100 },
    data: {
      label: '최종 제품',
      processType: 'output',
      description: '강판, 강재',
      carbonIntensity: 2015,
      energyConsumption: 3435,
    },
  },
];

// 기본 연결선들
const defaultEdges: CBAMEdge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    data: { label: '원료', flowType: 'material', quantity: 1500, unit: 'kg/t' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    data: { label: '선철', flowType: 'material', quantity: 1000, unit: 'kg/t' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    data: {
      label: '슬라브',
      flowType: 'material',
      quantity: 1000,
      unit: 'kg/t',
    },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    type: 'smoothstep',
    data: {
      label: '압연강판',
      flowType: 'material',
      quantity: 1000,
      unit: 'kg/t',
    },
  },
];

interface ConnectedReactFlowProps {
  flowId?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

export const ConnectedReactFlow: React.FC<ConnectedReactFlowProps> = ({
  flowId,
  autoSave = true,
  saveInterval = 10000,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // 연결선 추가
  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  // 새 노드 추가
  const addNewNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode: CBAMNode = {
      id: newNodeId,
      type: 'cbamNode',
      position: { x: Math.random() * 800 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: `새 공정 ${newNodeId}`,
        processType: 'process',
        description: '새로 추가된 공정',
        carbonIntensity: 0,
        energyConsumption: 0,
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  // 선택된 노드 삭제
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter(node => node.id !== selectedNode));
      setEdges(eds =>
        eds.filter(
          edge => edge.source !== selectedNode && edge.target !== selectedNode
        )
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // 노드 선택 처리
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  // 캔버스 클릭 시 선택 해제
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // 프로세스 플로우 저장
  const saveProcessFlow = useCallback(async () => {
    setIsSaving(true);
    try {
      const flowData = {
        id: flowId || `flow-${Date.now()}`,
        nodes,
        edges,
        timestamp: new Date().toISOString(),
        metadata: {
          totalCarbonIntensity: nodes.reduce(
            (sum, node) => sum + (node.data.carbonIntensity || 0),
            0
          ),
          totalEnergyConsumption: nodes.reduce(
            (sum, node) => sum + (node.data.energyConsumption || 0),
            0
          ),
          nodeCount: nodes.length,
          edgeCount: edges.length,
        },
      };

      // 백엔드 API 호출 (실제 구현 시)
      const gatewayUrl =
        process.env.NEXT_PUBLIC_GATEWAY_URL ||
        'https://gateway-production-da31.up.railway.app';
      const response = await fetch(`${gatewayUrl}/api/cbam/process-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('프로세스 플로우 저장 완료:', flowData.id);
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      // 로컬 저장으로 폴백
      const dataStr = JSON.stringify({ nodes, edges }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `cbam-process-flow-${flowId || 'new'}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, flowId]);

  // 자동 저장 설정
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveProcessFlow();
      }
    }, saveInterval);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, nodes, edges, saveProcessFlow]);

  // 플로우 로드
  const loadProcessFlow = useCallback(
    async (flowId: string) => {
      try {
        const gatewayUrl =
          process.env.NEXT_PUBLIC_GATEWAY_URL ||
          'https://gateway-production-da31.up.railway.app';
        const response = await fetch(
          `${gatewayUrl}/api/cbam/process-flow/${flowId}`
        );

        if (response.ok) {
          const flowData = await response.json();
          setNodes(flowData.nodes || []);
          setEdges(flowData.edges || []);
          console.log('플로우 로드 완료:', flowId);
        }
      } catch (error) {
        console.error('플로우 로드 중 오류:', error);
      }
    },
    [setNodes, setEdges]
  );

  // 플로우 ID가 변경되면 로드
  useEffect(() => {
    if (flowId) {
      loadProcessFlow(flowId);
    }
  }, [flowId, loadProcessFlow]);

  // CBAM 계산 실행
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

  return (
    <ReactFlowProvider>
      <div className='h-full flex flex-col'>
        {/* 툴바 */}
        <div className='flex items-center justify-between p-4 bg-white/5 border-b border-white/10'>
          <div className='flex items-center gap-3'>
            <Button onClick={addNewNode} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              노드 추가
            </Button>
            <Button
              onClick={() => setIsDrawingConnection(!isDrawingConnection)}
              variant={isDrawingConnection ? 'primary' : 'outline'}
              className='flex items-center gap-2'
            >
              <Zap className='h-4 w-4' />
              연결선 그리기
            </Button>
            {selectedNode && (
              <Button
                onClick={deleteSelectedNode}
                variant='ghost'
                className='flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10'
              >
                <Trash2 className='h-4 w-4' />
                노드 삭제
              </Button>
            )}
            <Button
              onClick={runCBAMCalculation}
              variant='outline'
              className='flex items-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              CBAM 계산
            </Button>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              onClick={saveProcessFlow}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Save className='h-4 w-4' />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button variant='outline' className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              내보내기
            </Button>
            <Button variant='outline' className='flex items-center gap-2'>
              <Upload className='h-4 w-4' />
              가져오기
            </Button>
          </div>
        </div>

        {/* React Flow 캔버스 */}
        <div className='flex-1 bg-white/5 rounded-lg overflow-hidden'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition='bottom-left'
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* 상태 표시 */}
        <div className='p-4 bg-white/5 border-t border-white/10'>
          <div className='flex items-center justify-between text-sm text-white/60'>
            <div className='flex items-center gap-4'>
              <span>총 노드: {nodes.length}개</span>
              <span>총 연결선: {edges.length}개</span>
              {selectedNode && <span>선택된 노드: {selectedNode}</span>}
              {isDrawingConnection && (
                <span className='text-blue-400'>연결선 그리기 모드</span>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <span>마지막 저장: {lastSaved.toLocaleTimeString()}</span>
              <span>자동 저장: {autoSave ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
};
