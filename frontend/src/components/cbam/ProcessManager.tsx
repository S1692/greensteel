'use client';

import React, { useState, useCallback } from 'react';
import { ReactFlow, Node, Edge, useReactFlow, Background, MiniMap, Controls, Connection, ReactFlowProvider } from '@xyflow/react';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  type: string;
  carbonIntensity: number;
  productionCapacity: number;
  location: string;
}

const ProcessManagerInner: React.FC = () => {
  const { addNodes, addEdges } = useReactFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 더미 제품 데이터
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

  const addProductNode = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    const newNode: Node = {
      id: `product-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: product.name,
        product: product
      }
    };

    addNodes(newNode);
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, [addNodes]);

  const addGroupNode = useCallback(() => {
    const newNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: '프로세스 그룹' },
      style: { width: 200, height: 100 }
    };

    addNodes(newNode);
  }, [addNodes]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      };

      addEdges(newEdge);
    }
  }, [addEdges]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={addProductNode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          제품 노드
        </button>
        <button
          onClick={addGroupNode}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          그룹 노드
        </button>
      </div>

      <ReactFlow
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

      {/* 제품 선택 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-slate-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">제품 노드 추가</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={() => selectedProduct && handleProductSelect(selectedProduct)}
                disabled={!selectedProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
