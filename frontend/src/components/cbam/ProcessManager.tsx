'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Button from '@/components/atomic/atoms/Button';
import { Plus } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

import ProductNode from '@/components/atomic/atoms/ProductNode';
import ProcessNode from '@/components/atomic/atoms/ProcessNode';
import InputManager from '@/components/cbam/InputManager';
import { InstallSelector } from '@/components/cbam/InstallSelector';
import { ProductSelector } from '@/components/cbam/ProductSelector';
import { ProcessSelector, ProductProcessModal } from '@/components/cbam/ProcessSelector';
import { InstallModal } from '@/components/cbam/modals/InstallModal';

import { useProcessManager, Process, Install, Product } from '@/hooks/useProcessManager';
import { useProcessCanvas } from '@/hooks/useProcessCanvas';
import { 
  loadState, 
  saveState, 
  propagateFullGraph, 
  addEdge, 
  deleteEdge, 
  upsertProcess, 
  upsertProduct,
  saveReactFlowData,
  loadReactFlowData,
  isLocalGraphMode,
  getNextId,
  type GraphState,
  type Process as LocalProcess,
  type Product as LocalProduct,
  type Edge
} from '@/lib/localGraph';

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  MarkerType,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* ============================================================================
   커스텀 Edge 타입 정의
============================================================================ */
import CustomEdge from '@/components/atomic/atoms/CustomEdge';
const edgeTypes: EdgeTypes = { custom: CustomEdge };

/* ============================================================================
   내부 컴포넌트
============================================================================ */
function ProcessManagerInner() {
  // 로컬 모드 상태 (항상 활성화)
  const [localGraphState, setLocalGraphState] = useState<GraphState | null>(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);

  // 커스텀 훅 사용
  const {
    installs,
    selectedInstall,
    products,
    selectedProduct,
    processes,
    allProcesses,
    crossInstallProcesses,
    isDetectingChains,
    detectionStatus,
    isUpdatingProduct,
    setSelectedInstall,
    setSelectedProduct,
    fetchProcessesByProduct,
    handleProductQuantityUpdate,
    fetchInstalls,
    fetchProducts,
    fetchProductsByInstall,
    fetchProcesses,
  } = useProcessManager();

  // React Flow 컨텍스트 내에서만 useProcessCanvas 사용
  const {
    nodes,
    edges,
    installCanvases,
    activeInstallId,
    onNodesChange,
    onEdgesChange,
    handleEdgeCreate,
    handleInstallSelect: handleCanvasInstallSelect,
    addProductNode,
    addProcessNode,

    updateNodeData,
  } = useProcessCanvas(selectedInstall);

  // 로컬 스토리지 상태 로드
  const loadLocalGraphState = useCallback(() => {
    const state = loadState();
    setLocalGraphState(state);
    console.log('✅ 로컬 그래프 상태 로드 완료:', state);
  }, []);

  // 엣지 종류 결정 함수
  const determineEdgeKind = useCallback((sourceNode: any, targetNode: any): 'continue' | 'produce' | 'consume' => {
    if (sourceNode.type === 'process' && targetNode.type === 'process') {
      return 'continue';
    } else if (sourceNode.type === 'process' && targetNode.type === 'product') {
      return 'produce';
    } else if (sourceNode.type === 'product' && targetNode.type === 'process') {
      return 'consume';
    }
    return 'continue'; // 기본값
  }, []);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    console.log('🔍 노드 클릭:', node);
    
    if (localGraphState) {
      if (node.type === 'process') {
        const processId = parseInt(node.id);
        const processData = localGraphState.processesById[processId];
        if (processData) {
          setSelectedNodeInfo({
            type: 'process',
            id: processId,
            data: processData,
            nodeInfo: node
          });
        }
      } else if (node.type === 'product') {
        const productId = parseInt(node.id);
        const productData = localGraphState.productsById[productId];
        if (productData) {
          setSelectedNodeInfo({
            type: 'product',
            id: productId,
            data: productData,
            nodeInfo: node
          });
        }
      }
    }
  }, [localGraphState]);

  // 로컬 스토리지 변경 이벤트 리스너
  useEffect(() => {
    const handleLocalStorageUpdate = () => {
      loadLocalGraphState();
    };

    window.addEventListener('cbam:ls:updated', handleLocalStorageUpdate);
    return () => {
      window.removeEventListener('cbam:ls:updated', handleLocalStorageUpdate);
    };
  }, [loadLocalGraphState]);

  // 컴포넌트 마운트 시 데이터 초기화
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🚀 ProcessManager 데이터 초기화 시작');
        
        // 로컬 모드: 로컬 스토리지에서 데이터 로드
        loadLocalGraphState();
        console.log('✅ 로컬 모드 데이터 초기화 완료');
      } catch (error) {
        console.error('❌ ProcessManager 데이터 초기화 실패:', error);
      }
    };

    initializeData();
  }, [loadLocalGraphState]);

  // 사업장 선택 시 해당 사업장의 제품들 조회
  useEffect(() => {
    const fetchInstallProducts = async () => {
      if (selectedInstall?.id) {
        try {
          console.log(`🔍 사업장 ${selectedInstall.install_name}의 제품들 조회`);
          const installProducts = await fetchProductsByInstall(selectedInstall.id);
          console.log(`✅ 사업장 ${selectedInstall.install_name}의 제품들:`, installProducts);
        } catch (error) {
          console.error(`❌ 사업장 ${selectedInstall.install_name}의 제품 조회 실패:`, error);
        }
      }
    };

    fetchInstallProducts();
  }, [selectedInstall?.id, fetchProductsByInstall]);

  // 공정별 직접귀속배출량 정보 가져오기 (현재 API가 없으므로 임시로 비활성화)
  const fetchProcessEmissionData = useCallback(async (processId: number): Promise<{
    attr_em: number;
    total_matdir_emission: number;
    total_fueldir_emission: number;
    calculation_date: string;
  } | null> => {
    // TODO: API가 구현되면 활성화
    // try {
    //   const response = await axiosClient.get(apiEndpoints.cbam.calculation.process.attrdir(processId));
    //   if (response.data) {
    //     return {
    //       attr_em: response.data.attrdir_em || 0,
    //       total_matdir_emission: response.data.total_matdir_emission || 0,
    //       total_fueldir_emission: response.data.total_fueldir_emission || 0,
    //       calculation_date: response.data.calculation_date
    //     };
    //   }
    // } catch (error) {
    //   console.log(`⚠️ 공정 ${processId}의 배출량 정보가 아직 없습니다.`);
    // }
    return null;
  }, []);



  // 모달 상태
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProcessModalForProduct, setShowProcessModalForProduct] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedProcessForInput, setSelectedProcessForInput] = useState<Process | null>(null);

  // 모든 공정 노드의 배출량 정보 새로고침
  const refreshAllProcessEmissions = useCallback(async () => {
    const processNodes = nodes.filter(node => node.type === 'process');
    
    for (const node of processNodes) {
      const processId = node.data.id;
      if (processId && typeof processId === 'number') {
        const emissionData = await fetchProcessEmissionData(processId);
        if (emissionData && node.data.processData) {
          updateNodeData(node.id, {
            processData: {
              ...node.data.processData,
              ...(emissionData || {})
            }
          });
        }
      }
    }
  }, [nodes, fetchProcessEmissionData, updateNodeData]);

  // 사업장 선택 처리
  const handleInstallSelect = useCallback((install: Install) => {
    setSelectedInstall(install);
    // 캔버스 상태는 useProcessCanvas에서 자동으로 처리됨
  }, [setSelectedInstall]);

  // 제품 노드에서 공정 추가 요청 시
  const handleProductNodeAddProcess = useCallback((productData: Product) => {
    setSelectedProduct(productData);
    setShowProcessModal(true);
  }, []);

  // 제품 선택 처리
  const handleProductSelect = useCallback((product: Product) => {
    addProductNode(product, handleProductNodeClickComplex, handleProductNodeAddProcess);
    setShowProductModal(false);
  }, [addProductNode, handleProductNodeAddProcess]);

  // 투입량 입력 모달 열기
  const openInputModal = useCallback((process: any) => {
    console.log('🔍 openInputModal 호출됨:', process);
    
    // 공정과 관련된 제품 정보 찾기
    // processData에서 product_names를 통해 관련 제품 찾기
    let relatedProduct = null;
    if (process.product_names && process.product_names !== 'N/A') {
      const productNames = process.product_names.split(', ');
      relatedProduct = products.find(p => productNames.includes(p.product_name));
    }
    
    // 관련 제품이 없으면 현재 선택된 제품 사용
    if (!relatedProduct && selectedProduct) {
      relatedProduct = selectedProduct;
    }
    
    console.log('🔍 관련 제품 정보:', relatedProduct);
    console.log('🔍 현재 선택된 제품:', selectedProduct);
    
    setSelectedProcessForInput(process);
    if (relatedProduct) {
      setSelectedProduct(relatedProduct);
    }
    setShowInputModal(true);
  }, [products, selectedProduct]);

  // 공정 노드 더블클릭 핸들러
  const handleProcessNodeDoubleClick = useCallback((processData: any) => {
    console.log('🔍 공정 노드 더블클릭:', processData);
    
    // 공정과 관련된 제품 정보 찾기
    let relatedProduct = null;
    if (processData.product_names && processData.product_names !== 'N/A') {
      const productNames = processData.product_names.split(', ');
      relatedProduct = products.find(p => productNames.includes(p.product_name));
    }
    
    // 관련 제품이 없으면 현재 선택된 제품 사용
    if (!relatedProduct && selectedProduct) {
      relatedProduct = selectedProduct;
    }
    
    console.log('🔍 더블클릭 관련 제품 정보:', relatedProduct);
    
    setSelectedProcessForInput(processData);
    if (relatedProduct) {
      setSelectedProduct(relatedProduct);
    }
    setShowInputModal(true);
  }, [products, selectedProduct]);

  // 공정 선택 처리
  const handleProcessSelect = useCallback(async (process: Process) => {
    await addProcessNode(process, products, openInputModal, openInputModal, handleProcessNodeDoubleClick);
    setShowProcessModal(false);
    setShowProcessModalForProduct(false);
  }, [addProcessNode, products, openInputModal, handleProcessNodeDoubleClick]);

  // 제품 노드 클릭 시 공정 선택 모달 열기
  const handleProductNodeClickComplex = useCallback((productData: Product) => {
    setSelectedProduct(productData);
    setShowProcessModal(true);
  }, []);

  // 제품 노드 추가
  const handleAddProductNode = useCallback(async () => {
    if (!selectedInstall) {
      alert('먼저 사업장을 선택해주세요.');
      return;
    }
    setShowProductModal(true);
  }, [selectedInstall]);

  // Edge 연결 처리
  const handleConnect = useCallback(async (params: Connection) => {
    try {
      console.log('🔗 연결 시도:', params);
      console.log('📍 연결 정보:', {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle
      });
      
      // 연결 처리
      await handleEdgeCreate(params, () => {});
      
      console.log('✅ 연결 처리 완료');
      alert(`연결이 성공적으로 생성되었습니다!\n${params.source} → ${params.target}`);
      
    } catch (error) {
      console.error('❌ 연결 처리 실패:', error);
      alert(`연결 처리에 실패했습니다: ${error}`);
    }
  }, [handleEdgeCreate]);

  // 🔧 React Flow 공식 문서에 따른 단순화된 연결 검증 로직
  const validateConnection = useCallback((connection: Connection) => {
    console.log('🔍 연결 검증 시작:', connection);
    console.log('📍 검증 대상:', {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle
    });
    
    // ✅ React Flow 공식 문서: 같은 노드 간 연결 방지
    if (connection.source === connection.target) {
      console.log('❌ 같은 노드 간 연결 시도');
      return { valid: false, reason: '같은 노드 간 연결은 불가능합니다' };
    }
    
    // ✅ React Flow 공식 문서: 같은 핸들 간 연결 방지
    if (connection.sourceHandle && connection.targetHandle && 
        connection.sourceHandle === connection.targetHandle) {
      console.log('❌ 같은 핸들 간 연결 시도');
      return { valid: false, reason: '같은 핸들 간 연결은 불가능합니다' };
    }
    
    // ✅ React Flow 공식 문서: 이미 존재하는 연결 확인 (핸들 ID까지 포함하여 정확히 같은 연결만 체크)
    const existingEdge = edges.find(edge => 
      edge.source === connection.source && 
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );
    
    if (existingEdge) {
      console.log('❌ 이미 존재하는 연결 (핸들 ID 포함):', existingEdge);
      return { valid: false, reason: '이미 존재하는 연결입니다' };
    }
    
    // ✅ React Flow 공식 문서: 추가 검증 - 임시 엣지와의 중복 방지
    const tempEdgeExists = edges.find(edge => 
      edge.data?.isTemporary &&
      edge.source === connection.source && 
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );
    
    if (tempEdgeExists) {
      console.log('❌ 임시 엣지와 중복:', tempEdgeExists);
      return { valid: false, reason: '연결 처리 중입니다. 잠시 기다려주세요.' };
    }
    
    console.log('✅ React Flow 연결 검증 통과');
    return { valid: true, reason: '연결이 유효합니다' };
  }, [edges]);

  // 🔧 단순화된 연결 이벤트 핸들러
  const handleConnectStart = useCallback((event: any, params: any) => {
    console.log('🔗 연결 시작:', params);
  }, []);

  const handleConnectEnd = useCallback((event: any) => {
    console.log('🔗 연결 종료:', event);
  }, []);

  const nodeTypes: NodeTypes = { 
    product: ProductNode,
    process: ProcessNode
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">CBAM 산정경계설정</h1>
            <p className="text-gray-300">CBAM 배출량 산정을 위한 경계를 설정하고 노드를 생성합니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-green-400">
              로컬 스토리지 모드 활성화
            </div>
          </div>
        </div>
      </div>

      {/* 사업장 선택 */}
      <InstallSelector
        installs={installs}
        selectedInstall={selectedInstall}
        installCanvases={installCanvases}
        activeInstallId={activeInstallId}
        onInstallSelect={handleInstallSelect}
        onAddInstall={() => setShowInstallModal(true)} // 사업장 추가 모달 열기
      />

      {/* 버튼 */}
      <div className="bg-gray-800 p-4 flex gap-2">
        <Button 
          onClick={handleAddProductNode} 
          disabled={!selectedInstall} 
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> 제품 노드
        </Button>
        <Button 
          onClick={refreshAllProcessEmissions} 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          초기화
        </Button>

      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex">
        {/* ReactFlow 캔버스 */}
        <div className="flex-1 relative">
                 {/* 디버깅 정보 */}
         <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-10">
           <div>노드 수: {nodes.length}</div>
           <div>연결 수: {edges.length}</div>
           <div>사업장: {selectedInstall?.install_name || '선택 안됨'}</div>
           <div>모드: Loose (다중 핸들 연결 가능)</div>
           <div>핸들 수: {nodes.reduce((acc, node) => acc + (node.data?.showHandles ? 4 : 0), 0)}</div>
           <div>최대 연결 가능: {nodes.length * 4}</div>
           <div className="text-green-400">
             로컬 모드: ON
           </div>
           {localGraphState && (
             <div className="text-blue-400">
               로컬 공정: {Object.keys(localGraphState.processesById).length}
               <br />
               로컬 제품: {Object.keys(localGraphState.productsById).length}
               <br />
               로컬 엣지: {localGraphState.edges.length}
             </div>
           )}
           <div className="mt-2 pt-2 border-t border-gray-600">
             <div className="text-yellow-400">🔗 연결 테스트</div>
             <div>노드 간 드래그하여 연결</div>
             <div>콘솔에서 이벤트 확인</div>
           </div>
         </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            // React Flow 데이터 저장
            const updatedNodes = nodes.map(node => {
              const change = changes.find(c => 'id' in c && c.id === node.id);
              if (change && change.type === 'position' && 'position' in change) {
                return { ...node, position: change.position };
              }
              return node;
            });
            saveReactFlowData(updatedNodes, edges);
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            // React Flow 데이터 저장
            saveReactFlowData(nodes, edges);
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{ type: 'custom', markerEnd: { type: MarkerType.ArrowClosed } }}
          deleteKeyCode="Delete"
          className="bg-gray-900"
          fitView
          onNodeClick={handleNodeClick}
          onConnectStart={(event, params) => {
            console.log('🔗 4방향 연결 시작:', params);
            handleConnectStart(event, params);
          }}
          onConnect={(params) => {
            console.log('🔗 4방향 연결 완료:', params);
            const validation = validateConnection(params);
            if (validation.valid) {
              console.log('✅ 연결 검증 통과, 연결 처리 시작');
              handleConnect(params);
              
              // 엣지 저장
              const sourceNode = nodes.find(n => n.id === params.source);
              const targetNode = nodes.find(n => n.id === params.target);
              
              if (sourceNode && targetNode) {
                const edgeKind = determineEdgeKind(sourceNode, targetNode);
                const newEdge: Edge = {
                  id: getNextId('edge'),
                  source_node_type: sourceNode.type === 'product' ? 'product' : 'process',
                  source_id: parseInt(sourceNode.id),
                  target_node_type: targetNode.type === 'product' ? 'product' : 'process',
                  target_id: parseInt(targetNode.id),
                  edge_kind: edgeKind,
                  source: params.source,
                  target: params.target,
                  type: 'custom',
                  data: { edgeKind }
                };
                
                addEdge(newEdge);
                console.log('✅ 로컬 엣지 저장 완료:', newEdge);
              }
            } else {
              console.log(`❌ 연결 검증 실패: ${validation.reason}`, params);
              alert(`연결이 유효하지 않습니다: ${validation.reason}`);
            }
          }}
          onConnectEnd={handleConnectEnd}
          isValidConnection={(connection) => {
            const validation = validateConnection(connection as Connection);
            return validation.valid;
          }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls 
            className="!bg-gray-800 !border !border-gray-700 !text-gray-200 !rounded-md" 
            position="bottom-left"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
          <MiniMap
            className="!border !border-gray-700 !rounded-md"
            style={{ backgroundColor: '#0f172a' }}
            maskColor="rgba(15,23,42,0.6)"
            nodeColor={() => '#8b5cf6'}
            nodeStrokeColor={() => '#e5e7eb'}
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>
        </div>

        {/* 노드 정보 사이드바 */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">노드 정보</h3>
          
          {selectedNodeInfo ? (
            <div className="space-y-4">
              {/* 노드 타입 표시 */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedNodeInfo.type === 'process' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-white font-medium">
                    {selectedNodeInfo.type === 'process' ? '공정 노드' : '제품 노드'}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">
                  ID: {selectedNodeInfo.id}
                </div>
              </div>

              {/* 공정 노드 정보 */}
              {selectedNodeInfo.type === 'process' && (
                <div className="space-y-3">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-white font-medium mb-2">공정 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">공정명:</span>
                        <span className="text-white">{selectedNodeInfo.data.process_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">직접 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.attrdir_em?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">누적 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.cumulative_emission?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">원료 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.total_matdir_emission?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">연료 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.total_fueldir_emission?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 제품 노드 정보 */}
              {selectedNodeInfo.type === 'product' && (
                <div className="space-y-3">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-white font-medium mb-2">제품 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">제품명:</span>
                        <span className="text-white">{selectedNodeInfo.data.product_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">생산량:</span>
                        <span className="text-white">{selectedNodeInfo.data.product_amount || '0'} t</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">국내 판매:</span>
                        <span className="text-white">{selectedNodeInfo.data.product_sell || '0'} t</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">EU 판매:</span>
                        <span className="text-white">{selectedNodeInfo.data.product_eusell || '0'} t</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">저장된 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.attr_em?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">프리뷰 배출량:</span>
                        <span className="text-white">{selectedNodeInfo.data.preview_attr_em?.toFixed(2) || '0.00'} tCO2e</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 연결된 엣지 정보 */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2">연결 정보</h4>
                <div className="space-y-2 text-sm">
                  {localGraphState && (
                    <>
                      {localGraphState.edges
                        .filter(edge => 
                          edge.source_id === selectedNodeInfo.id || edge.target_id === selectedNodeInfo.id
                        )
                        .map(edge => (
                          <div key={edge.id} className="flex justify-between items-center">
                            <span className="text-gray-400">
                              {edge.edge_kind === 'continue' ? '연속' : 
                               edge.edge_kind === 'produce' ? '생산' : '소비'}
                            </span>
                            <span className="text-white">
                              {edge.source_id === selectedNodeInfo.id ? 
                                `→ ${edge.target_id}` : 
                                `${edge.source_id} →`}
                            </span>
                          </div>
                        ))}
                      {localGraphState.edges.filter(edge => 
                        edge.source_id === selectedNodeInfo.id || edge.target_id === selectedNodeInfo.id
                      ).length === 0 && (
                        <div className="text-gray-400">연결된 엣지 없음</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              노드를 클릭하면<br />
              상세 정보를 확인할 수 있습니다
            </div>
          )}
        </div>
      </div>

      {/* 모달들 */}
      {showProductModal && (
        <ProductSelector
          products={products.filter(product => product.install_id === selectedInstall?.id)}
          onProductSelect={handleProductSelect}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {showProcessModalForProduct && (
        <ProcessSelector
          processes={processes}
          allProcesses={allProcesses}
          products={products}
          installs={installs}
          selectedProduct={selectedProduct}
          selectedInstall={selectedInstall}
          onProcessSelect={handleProcessSelect}
          onClose={() => setShowProcessModalForProduct(false)}
        />
      )}

      {showProcessModal && (
        <ProductProcessModal
          selectedProduct={selectedProduct}
          allProcesses={allProcesses}
          products={products}
          installs={installs}
          selectedInstall={selectedInstall}
          onProcessSelect={handleProcessSelect}
          onClose={() => setShowProcessModal(false)}
        />
      )}

      {showInputModal && selectedProcessForInput && (
        <InputManager
          selectedProcess={selectedProcessForInput}
          selectedProduct={selectedProduct}
          onClose={() => setShowInputModal(false)}
          onDataSaved={refreshAllProcessEmissions} // 데이터 저장 후 배출량 정보 새로고침
        />
      )}

      {/* 공정 노드 더블클릭 시에도 InputManager 사용 */}

      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
          onSuccess={() => {
            setShowInstallModal(false);
            fetchInstalls(); // 사업장 목록 새로고침
          }}
        />
      )}
    </div>
  );
}

/* ============================================================================
   메인 컴포넌트
============================================================================ */
export default function ProcessManager() {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ProcessManagerInner />
      </ReactFlowProvider>
    </div>
  );
}
