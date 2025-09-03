import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Trash2, Settings } from 'lucide-react';
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
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface BoundaryModalProps {
  onSuccess?: () => void;
}

interface Install {
  id: number;
  install_name: string;
  reporting_year: number;
}

interface Process {
  id: number;
  process_name: string;
  process_code: string;
}

interface Product {
  id: number;
  install_id: number;
  product_name: string;
  product_code: string;
}

interface Boundary {
  id: number;
  install_id: number;
  process_id: number;
  product_id: number;
  description?: string;
}

// 커스텀 노드 타입들
const CustomInstallNode = ({ data }: { data: any }) => (
  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 min-w-[150px]">
    <div className="text-sm font-medium text-blue-900">{data.label}</div>
    <div className="text-xs text-blue-700">{data.install_name}</div>
  </div>
);

const CustomProcessNode = ({ data }: { data: any }) => (
  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[150px]">
    <div className="text-sm font-medium text-green-900">{data.label}</div>
    <div className="text-xs text-green-700">{data.process_name}</div>
  </div>
);

const CustomProductNode = ({ data }: { data: any }) => (
  <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 min-w-[150px]">
    <div className="text-sm font-medium text-purple-900">{data.label}</div>
    <div className="text-xs text-purple-700">{data.product_name}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  install: CustomInstallNode,
  process: CustomProcessNode,
  product: CustomProductNode,
};

export const BoundaryModal: React.FC<BoundaryModalProps> = ({ onSuccess }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [installs, setInstalls] = useState<Install[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState({
    install_id: '',
    process_id: '',
    product_id: '',
    description: ''
  });

  const fetchInstalls = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.install.list);
      setInstalls(response.data || []);
    } catch (error) {
      console.error('사업장 목록 조회 실패:', error);
    }
  };

  const fetchProcesses = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.process.list);
      setProcesses(response.data || []);
    } catch (error) {
      console.error('공정 목록 조회 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.product.list);
      setProducts(response.data || []);
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    }
  };

  const fetchBoundaries = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.edge.list);
      setBoundaries(response.data || []);
      updateFlowFromBoundaries(response.data || []);
    } catch (error) {
      console.error('경계 목록 조회 실패:', error);
    }
  };

  const updateFlowFromBoundaries = (boundaryData: Boundary[]) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodeMap = new Map();

    // 사업장별로 노드 그룹화하여 배치
    installs.forEach((install, installIndex) => {
      // 사업장 노드 추가
      const installNode: Node = {
        id: `install-${install.id}`,
        type: 'install',
        position: { x: installIndex * 800, y: 50 },
        data: {
          label: install.install_name,
          install_name: install.install_name,
          install_id: install.id
        }
      };
      newNodes.push(installNode);
      nodeMap.set(`install-${install.id}`, installNode);

      // 해당 사업장의 제품들
      const installProducts = products.filter(product => product.install_id === install.id);
      installProducts.forEach((product, productIndex) => {
        const productNode: Node = {
          id: `product-${product.id}`,
          type: 'product',
          position: { 
            x: installIndex * 800 + (productIndex % 4) * 150, 
            y: 200 + Math.floor(productIndex / 4) * 100 
          },
          data: {
            label: product.product_name,
            product_name: product.product_name,
            product_id: product.id,
            install_id: product.install_id
          }
        };
        newNodes.push(productNode);
        nodeMap.set(`product-${product.id}`, productNode);
      });

      // 해당 사업장과 연결된 공정들 (경계 데이터 기반)
      const installProcesses = boundaryData
        .filter(boundary => boundary.install_id === install.id)
        .map(boundary => processes.find(process => process.id === boundary.process_id))
        .filter(Boolean);

      installProcesses.forEach((process, processIndex) => {
        if (process) {
          const processNode: Node = {
            id: `process-${process.id}`,
            type: 'process',
            position: { 
              x: installIndex * 800 + (processIndex % 4) * 150, 
              y: 400 + Math.floor(processIndex / 4) * 100 
            },
            data: {
              label: process.process_name,
              process_name: process.process_name,
              process_id: process.id
            }
          };
          newNodes.push(processNode);
          nodeMap.set(`process-${process.id}`, processNode);
        }
      });
    });

    // 경계 연결선 추가
    boundaryData.forEach((boundary, index) => {
      const sourceNode = nodeMap.get(`process-${boundary.process_id}`);
      const targetNode = nodeMap.get(`product-${boundary.product_id}`);
      
      if (sourceNode && targetNode) {
        const edge: Edge = {
          id: `edge-${boundary.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'smoothstep',
          data: { label: boundary.description || '연결' }
        };
        newEdges.push(edge);
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.install_id || !formData.process_id || !formData.product_id) {
      alert('모든 필드를 선택해주세요.');
      return;
    }

    try {
      await axiosClient.post(apiEndpoints.cbam.edge.create, formData);
      setFormData({ install_id: '', process_id: '', product_id: '', description: '' });
      fetchBoundaries();
      onSuccess?.();
    } catch (error) {
      console.error('경계 생성 실패:', error);
    }
  };

  const handleSaveFlow = async () => {
    try {
      // 현재 플로우 상태를 서버에 저장
      const flowData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          data: edge.data
        }))
      };

      await axiosClient.post(apiEndpoints.cbam.edge.saveFlow, flowData);
      alert('플로우가 저장되었습니다.');
    } catch (error) {
      console.error('플로우 저장 실패:', error);
    }
  };

  const handleDeleteBoundary = async (id: number) => {
    if (window.confirm('정말로 이 경계를 삭제하시겠습니까?')) {
      try {
        await axiosClient.delete(apiEndpoints.cbam.edge.delete(id));
        fetchBoundaries();
        onSuccess?.();
      } catch (error) {
        console.error('경계 삭제 실패:', error);
      }
    }
  };

  useEffect(() => {
    fetchInstalls();
    fetchProcesses();
    fetchProducts();
    fetchBoundaries();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ecotrace-text">CBAM 경계 설정</h2>
          <p className="text-ecotrace-text-secondary mt-1">사업장, 공정, 제품 간의 연결을 설정하여 CBAM 계산을 위한 경계를 정의하세요</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveFlow}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>저장</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 패널 - 경계 생성 폼 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-4">새 경계 생성</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">사업장</label>
                <select
                  value={formData.install_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, install_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-ecotrace-surface text-ecotrace-text transition-colors"
                  required
                >
                  <option value="">사업장 선택</option>
                  {installs.map((install) => (
                    <option key={install.id} value={install.id}>
                      {install.install_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">공정</label>
                <select
                  value={formData.process_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, process_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-ecotrace-surface text-ecotrace-text transition-colors"
                  required
                >
                  <option value="">공정 선택</option>
                  {processes.map((process) => (
                    <option key={process.id} value={process.id}>
                      {process.process_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">제품</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-ecotrace-surface text-ecotrace-text transition-colors"
                  required
                >
                  <option value="">제품 선택</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">설명</label>
                <input
                  type="text"
                  placeholder="경계 설명"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-ecotrace-surface text-ecotrace-text transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                경계 생성
              </button>
            </form>
          </div>

          {/* 경계 목록 */}
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-4">경계 목록</h3>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {boundaries.map((boundary) => {
                const install = installs.find(i => i.id === boundary.install_id);
                const process = processes.find(p => p.id === boundary.process_id);
                const product = products.find(p => p.id === boundary.product_id);
                
                return (
                  <div key={boundary.id} className="p-3 bg-ecotrace-secondary/30 rounded-lg border border-ecotrace-border">
                    <div className="font-medium text-ecotrace-text text-sm">
                      {install?.install_name} → {process?.process_name} → {product?.product_name}
                    </div>
                    {boundary.description && (
                      <div className="text-ecotrace-textSecondary text-xs mt-1">{boundary.description}</div>
                    )}
                    <button
                      onClick={() => handleDeleteBoundary(boundary.id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 우측 패널 - ReactFlow 캔버스 */}
        <div className="lg:col-span-3 bg-ecotrace-surface rounded-lg border border-ecotrace-border p-4">
          <div className="h-[600px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-ecotrace-secondary/20"
            >
              <Controls />
              <Background />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
};
