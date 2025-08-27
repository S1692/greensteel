'use client';

import React, { useState, useCallback } from 'react';
import { ReactFlow, Node, Edge, Background, MiniMap, Controls, Connection, ReactFlowProvider, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import { Plus, Building2, Factory, Package, GitBranch } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  type: string;
  carbonIntensity: number;
  productionCapacity: number;
  location: string;
}

interface BusinessSite {
  id: string;
  name: string;
  location: string;
  type: string;
}

interface Process {
  id: string;
  name: string;
  type: string;
  input: string;
  output: string;
  efficiency: number;
}

const ProcessManagerInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSite, setSelectedSite] = useState<BusinessSite | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  // 더미 데이터
  const dummyProducts: Product[] = [
    {
      id: '1',
      name: '고품질 철강 제품',
      type: 'Steel',
      carbonIntensity: 1.8,
      productionCapacity: 5000,
      location: '포항제철소'
    },
    {
      id: '2',
      name: '알루미늄 합금',
      type: 'Aluminum',
      carbonIntensity: 2.1,
      productionCapacity: 3000,
      location: '울산공장'
    },
    {
      id: '3',
      name: '시멘트 제품',
      type: 'Cement',
      carbonIntensity: 0.9,
      productionCapacity: 8000,
      location: '강릉공장'
    }
  ];

  const dummySites: BusinessSite[] = [
    { id: '1', name: '포항제철소', location: '포항', type: 'Steel' },
    { id: '2', name: '울산공장', location: '울산', type: 'Aluminum' },
    { id: '3', name: '강릉공장', location: '강릉', type: 'Cement' }
  ];

  const dummyProcesses: Process[] = [
    { id: '1', name: '용해 공정', type: 'Melting', input: '철광석', output: '용해철', efficiency: 0.95 },
    { id: '2', name: '압연 공정', type: 'Rolling', input: '용해철', output: '압연철', efficiency: 0.92 },
    { id: '3', name: '열처리 공정', type: 'HeatTreatment', input: '압연철', output: '완성품', efficiency: 0.88 }
  ];

  // 사업장 선택
  const selectBusinessSite = useCallback(() => {
    setIsSiteModalOpen(true);
  }, []);

  const handleSiteSelect = useCallback((site: BusinessSite) => {
    setSelectedSite(site);
    setIsSiteModalOpen(false);
  }, []);

  // 제품 노드 추가
  const addProductNode = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    const newNode: Node = {
      id: `product-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: product.name,
        product: product,
        site: selectedSite?.name || '미선택'
      },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #1d4ed8',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px'
      }
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  }, [setNodes, selectedSite]);

  // 공정 노드 추가
  const addProcessNode = useCallback(() => {
    setIsProcessModalOpen(true);
  }, []);

  const handleProcessSelect = useCallback((process: Process) => {
    const newNode: Node = {
      id: `process-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: process.name,
        process: process,
        site: selectedSite?.name || '미선택'
      },
      style: {
        background: '#10b981',
        color: 'white',
        border: '2px solid #059669',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px'
      }
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    setIsProcessModalOpen(false);
    setSelectedProcess(null);
  }, [setNodes, selectedSite]);

  // 그룹 노드 추가
  const addGroupNode = useCallback(() => {
    const newNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `프로세스 그룹 - ${selectedSite?.name || '미선택'}`,
        site: selectedSite?.name || '미선택'
      },
      style: { 
        width: 200, 
        height: 100,
        background: '#8b5cf6',
        color: 'white',
        border: '2px solid #7c3aed',
        borderRadius: '8px'
      }
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [setNodes, selectedSite]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        style: { stroke: '#6b7280', strokeWidth: 2 }
      };

      setEdges(prevEdges => addEdge(newEdge, prevEdges));
    }
  }, [setEdges]);

  return (
    <div className="w-full h-full relative">
      {/* 상단 버튼들 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
        <button
          onClick={selectBusinessSite}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <Building2 className="w-4 h-4" />
          {selectedSite ? selectedSite.name : '사업장 선택'}
        </button>
        <button
          onClick={addProductNode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <Package className="w-4 h-4" />
          + 제품 노드
        </button>
        <button
          onClick={addProcessNode}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <Factory className="w-4 h-4" />
          + 공정 노드
        </button>
        <button
          onClick={addGroupNode}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <GitBranch className="w-4 h-4" />
          + 그룹 노드
        </button>
      </div>

      {/* ReactFlow 캔버스 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-slate-800"
        style={{ width: '100%', height: '100%' }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        zoomOnScroll={true}
        panOnScroll={false}
        zoomOnPinch={true}
        panOnDrag={true}
      >
        <Background color="#475569" gap={20} size={1} />
        <MiniMap 
          className="bg-slate-700 border border-slate-600" 
          position="bottom-right"
          style={{ width: 200, height: 120 }}
        />
        <Controls 
          className="bg-white border border-slate-300 rounded-lg shadow-lg" 
          position="bottom-left"
        />
      </ReactFlow>

      {/* 사업장 선택 모달 */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-slate-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">사업장 선택</h3>
              <button
                onClick={() => setIsSiteModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {dummySites.map((site) => (
                <div
                  key={site.id}
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600"
                  onClick={() => handleSiteSelect(site)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{site.name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-300">
                      {site.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">위치: {site.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 제품 선택 모달 */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-slate-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">제품 노드 추가</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedSite && (
              <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">⚠️ 먼저 사업장을 선택해주세요.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {dummyProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{product.name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-300">
                      {product.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p>탄소집약도: {product.carbonIntensity} tCO2/t</p>
                    <p>생산능력: {product.productionCapacity.toLocaleString()} t/년</p>
                    <p>위치: {product.location}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={() => selectedProduct && handleProductSelect(selectedProduct)}
                disabled={!selectedProduct || !selectedSite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                노드 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공정 선택 모달 */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-slate-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">공정 노드 추가</h3>
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedSite && (
              <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">⚠️ 먼저 사업장을 선택해주세요.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {dummyProcesses.map((process) => (
                <div
                  key={process.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedProcess?.id === process.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'
                  }`}
                  onClick={() => setSelectedProcess(process)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{process.name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-300">
                      {process.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p>입력: {process.input}</p>
                    <p>출력: {process.output}</p>
                    <p>효율성: {process.efficiency * 100}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={() => selectedProcess && handleProcessSelect(selectedProcess)}
                disabled={!selectedProcess || !selectedSite}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                노드 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProcessManager: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ProcessManagerInner />
    </ReactFlowProvider>
  );
};

export default ProcessManager;
