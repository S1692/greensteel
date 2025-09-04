/**
 * 로컬 스토리지 기반 CBAM 전파 엔진
 * DB 없이 localStorage만으로 전파 규칙(continue/produce/consume)과 재계산 흐름을 구현
 */


// ============================================================================
// 타입 정의
// ============================================================================

export type NodeType = 'process' | 'product';
export type EdgeKind = 'continue' | 'produce' | 'consume';

export interface Process {
  id: number;
  install_id?: number;
  process_name?: string;
  attrdir_em: number;
  cumulative_emission: number;
  total_matdir_emission?: number;
  total_fueldir_emission?: number;
  // React Flow 정보
  position?: { x: number; y: number };
  type?: string;
  data?: any;
}

export interface Product {
  id: number;
  product_name?: string;
  product_amount: number;
  product_sell: number;
  product_eusell: number;
  attr_em: number;
  preview_attr_em: number;
  // React Flow 정보
  position?: { x: number; y: number };
  type?: string;
  data?: any;
}

export interface Edge {
  id: number;
  source_node_type: NodeType;
  source_id: number;
  target_node_type: NodeType;
  target_id: number;
  edge_kind: EdgeKind;
  // React Flow 정보
  source?: string;
  target?: string;
  type?: string;
  data?: any;
}

export interface ProductProcess {
  product_id: number;
  process_id: number;
  consumption_amount: number;
}

export interface GraphState {
  processesById: Record<number, Process>;
  productsById: Record<number, Product>;
  edges: Edge[];
  productProcess: ProductProcess[];
  // React Flow 노드/엣지 정보
  reactFlowNodes: any[];
  reactFlowEdges: any[];
  meta: {
    version: number;
    updated_at: string;
  };
}

// ============================================================================
// 로컬 스토리지 헬퍼
// ============================================================================

const LS_KEY = 'cbam:graph:v1';

export function loadState(): GraphState {
  const defaultState: GraphState = {
    processesById: {},
    productsById: {},
    edges: [],
    productProcess: [],
    reactFlowNodes: [],
    reactFlowEdges: [],
    meta: {
      version: 1,
      updated_at: ''
    }
  };

  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultState,
        ...parsed,
        // 누락된 필드 보정
        reactFlowNodes: parsed.reactFlowNodes || [],
        reactFlowEdges: parsed.reactFlowEdges || [],
        meta: {
          ...defaultState.meta,
          ...parsed.meta
        }
      };
    }
  } catch (error) {
    console.error('로컬 스토리지 로드 실패:', error);
  }

  return defaultState;
}

export function saveState(state: GraphState): void {
  try {
    state.meta.updated_at = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    console.log('✅ 로컬 스토리지 저장 완료:', state.meta.updated_at);
  } catch (error) {
    console.error('❌ 로컬 스토리지 저장 실패:', error);
  }
}

// ============================================================================
// 전파 알고리즘
// ============================================================================

/**
 * 모든 공정의 누적 배출량을 0으로 리셋
 */
export function resetAllCumulative(state: GraphState): void {
  Object.values(state.processesById).forEach(process => {
    process.cumulative_emission = 0;
  });
  console.log('🔄 모든 누적 배출량 리셋 완료');
}

/**
 * continue 전파 (공정 → 공정)
 * target.cumulative = source.cumulative_or_attrdir + target.attrdir
 */
export function propagateContinue(state: GraphState): void {
  const continueEdges = state.edges.filter(edge => edge.edge_kind === 'continue');
  
  // 위상 정렬을 위한 진입 차수 계산
  const incomingMap = new Map<number, number>();
  
  continueEdges.forEach(edge => {
    // 타겟의 진입 차수 증가
    incomingMap.set(edge.target_id, (incomingMap.get(edge.target_id) || 0) + 1);
    // 소스가 없으면 0으로 초기화
    if (!incomingMap.has(edge.source_id)) {
      incomingMap.set(edge.source_id, 0);
    }
  });

  // 진입 차수가 0인 노드들로 시작
  const queue: number[] = Array.from(incomingMap.entries())
    .filter(([, count]) => count === 0)
    .map(([id]) => id);

  const processed = new Set<number>();

  while (queue.length > 0) {
    const processId = queue.shift()!;
    
    if (processed.has(processId)) continue;
    processed.add(processId);

    const process = state.processesById[processId];
    if (!process) continue;

    // 이 공정에서 나가는 continue 엣지들 처리
    continueEdges
      .filter(edge => edge.source_id === processId)
      .forEach(edge => {
        const targetProcess = state.processesById[edge.target_id];
        if (!targetProcess) return;

        // 소스 누적 배출량 (누적이 없으면 직접 배출량 사용)
        const sourceCumulative = process.cumulative_emission || process.attrdir_em || 0;
        
        // 타겟 누적 배출량 계산
        const newCumulative = sourceCumulative + (targetProcess.attrdir_em || 0);
        targetProcess.cumulative_emission = Number(newCumulative.toFixed(8));

        // 타겟을 큐에 추가
        if (!queue.includes(edge.target_id) && !processed.has(edge.target_id)) {
          queue.push(edge.target_id);
        }
      });
  }

  console.log('✅ continue 전파 완료');
}

/**
 * 제품 프리뷰 계산 (공정 → 제품)
 * product.preview_attr_em = Σ(연결된 공정들의 cumulative)
 */
export function computeProductPreview(state: GraphState, productId: number): void {
  const product = state.productsById[productId];
  if (!product) return;

  // 이 제품으로 연결된 produce 엣지들 찾기
  const produceEdges = state.edges.filter(edge => 
    edge.edge_kind === 'produce' && edge.target_id === productId
  );

  // 연결된 공정들의 누적 배출량 합계
  const totalEmission = produceEdges.reduce((sum, edge) => {
    const process = state.processesById[edge.source_id];
    if (!process) return sum;
    
    // 누적이 0이면 직접 배출량으로 폴백
    const emission = process.cumulative_emission || process.attrdir_em || 0;
    return sum + emission;
  }, 0);

  product.preview_attr_em = Number(totalEmission.toFixed(8));
}

/**
 * consume 전파 (제품 → 공정)
 * 분배 비율 계산 후 공정에 배출량 귀속
 */
export function propagateConsume(state: GraphState): void {
  const consumeEdges = state.edges.filter(edge => edge.edge_kind === 'consume');

  for (const edge of consumeEdges) {
    const product = state.productsById[edge.source_id];
    const targetProcess = state.processesById[edge.target_id];

    if (!product || !targetProcess) continue;

    // 다음 공정으로 전달할 양 계산
    const toNextProcess = (product.product_amount || 0) - (product.product_sell || 0) - (product.product_eusell || 0);

    // 이 제품의 모든 소비 공정들 찾기
    const allConsumptions = state.productProcess.filter(pp => pp.product_id === product.id);
    const currentConsumption = allConsumptions.find(pp => pp.process_id === targetProcess.id);
    
    // 총 소비량 계산
    const totalConsumption = allConsumptions.reduce((sum, pp) => sum + (pp.consumption_amount || 0), 0);

    let allocatedAmount = 0;
    let processRatio = 0;

    if (totalConsumption > 0) {
      // 소비량 기반 분배
      const consumptionRatio = (currentConsumption?.consumption_amount || 0) / totalConsumption;
      allocatedAmount = toNextProcess * consumptionRatio;
      processRatio = (product.product_amount > 0) ? (allocatedAmount / product.product_amount) : consumptionRatio;
    } else {
      // 균등 분배
      const equalRatio = allConsumptions.length > 0 ? 1 / allConsumptions.length : 0;
      allocatedAmount = toNextProcess * equalRatio;
      processRatio = (product.product_amount > 0) ? (allocatedAmount / product.product_amount) : equalRatio;
    }

    // 제품 배출량 (프리뷰 우선, 없으면 저장된 값)
    const productEmission = product.preview_attr_em || product.attr_em || 0;
    
    // 공정에 귀속될 배출량
    const processEmission = productEmission * processRatio;
    
    // 타겟 공정의 누적 배출량에 추가
    targetProcess.cumulative_emission += Number(processEmission.toFixed(8));
  }

  console.log('✅ consume 전파 완료');
}

/**
 * 전체 그래프 전파 실행
 * reset → continue → consume → product preview 순서
 */
export function propagateFullGraph(state: GraphState): void {
  console.log('🚀 전체 그래프 전파 시작');
  
  resetAllCumulative(state);
  propagateContinue(state);
  propagateConsume(state);
  
  // 모든 제품의 프리뷰 계산
  Object.keys(state.productsById).forEach(productId => {
    computeProductPreview(state, Number(productId));
  });

  console.log('✅ 전체 그래프 전파 완료');
}

// ============================================================================
// 상태 변경 API
// ============================================================================

/**
 * 엣지 추가
 */
export function addEdge(edge: Edge): void {
  const state = loadState();
  state.edges.push(edge);
  propagateFullGraph(state);
  saveState(state);
  broadcastUpdate();
  console.log('✅ 엣지 추가 완료:', edge);
}

/**
 * 엣지 삭제
 */
export function deleteEdge(edgeId: number): void {
  const state = loadState();
  state.edges = state.edges.filter(edge => edge.id !== edgeId);
  propagateFullGraph(state);
  saveState(state);
  broadcastUpdate();
  console.log('✅ 엣지 삭제 완료:', edgeId);
}

/**
 * 공정 직접 배출량 업데이트
 */
export function updateProcessAttrdir(processId: number, attrdir: number): void {
  const state = loadState();
  const process = state.processesById[processId];
  if (process) {
    process.attrdir_em = attrdir;
    propagateFullGraph(state);
    saveState(state);
    broadcastUpdate();
    console.log('✅ 공정 직접 배출량 업데이트 완료:', processId, attrdir);
  }
}

/**
 * 제품 판매량 저장
 */
export function saveProductSales(productId: number, sell: number, eusell: number): void {
  const state = loadState();
  const product = state.productsById[productId];
  if (product) {
    product.product_sell = sell;
    product.product_eusell = eusell;
    propagateFullGraph(state);
    saveState(state);
    broadcastUpdate();
    console.log('✅ 제품 판매량 저장 완료:', productId, sell, eusell);
  }
}

/**
 * 공정 추가/업데이트
 */
export function upsertProcess(process: Process): void {
  const state = loadState();
  state.processesById[process.id] = process;
  propagateFullGraph(state);
  saveState(state);
  broadcastUpdate();
  console.log('✅ 공정 업데이트 완료:', process.id);
}

/**
 * 제품 추가/업데이트
 */
export function upsertProduct(product: Product): void {
  const state = loadState();
  state.productsById[product.id] = product;
  propagateFullGraph(state);
  saveState(state);
  broadcastUpdate();
  console.log('✅ 제품 업데이트 완료:', product.id);
}

/**
 * React Flow 노드/엣지 저장
 */
export function saveReactFlowData(nodes: any[], edges: any[]): void {
  const state = loadState();
  state.reactFlowNodes = nodes;
  state.reactFlowEdges = edges;
  saveState(state);
  console.log('✅ React Flow 데이터 저장 완료:', nodes.length, '노드,', edges.length, '엣지');
}

/**
 * React Flow 노드/엣지 로드
 */
export function loadReactFlowData(): { nodes: any[]; edges: any[] } {
  const state = loadState();
  return {
    nodes: state.reactFlowNodes || [],
    edges: state.reactFlowEdges || []
  };
}

// ============================================================================
// 이벤트 브로드캐스트
// ============================================================================

function broadcastUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cbam:ls:updated', {
      detail: { changed: 'graph' }
    }));
  }
}

// ============================================================================
// 개발 모드 체크
// ============================================================================

export function isLocalGraphMode(): boolean {
  return true; // 항상 하이브리드 모드로 작동
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 다음 사용 가능한 ID 생성
 */
export function getNextId(type: 'process' | 'product' | 'edge'): number {
  const state = loadState();
  
  switch (type) {
    case 'process':
      return Math.max(0, ...Object.keys(state.processesById).map(Number)) + 1;
    case 'product':
      return Math.max(0, ...Object.keys(state.productsById).map(Number)) + 1;
    case 'edge':
      return Math.max(0, ...state.edges.map(e => e.id)) + 1;
    default:
      return 1;
  }
}

/**
 * 그래프 상태 초기화
 */
export function clearGraphState(): void {
  const defaultState: GraphState = {
    processesById: {},
    productsById: {},
    edges: [],
    productProcess: [],
    reactFlowNodes: [],
    reactFlowEdges: [],
    meta: {
      version: 1,
      updated_at: new Date().toISOString()
    }
  };
  saveState(defaultState);
  broadcastUpdate();
  console.log('✅ 그래프 상태 초기화 완료');
}

/**
 * 그래프 상태 디버그 정보 출력
 */
export function debugGraphState(): void {
  const state = loadState();
  console.log('🔍 그래프 상태 디버그:', {
    processes: Object.keys(state.processesById).length,
    products: Object.keys(state.productsById).length,
    edges: state.edges.length,
    reactFlowNodes: state.reactFlowNodes.length,
    reactFlowEdges: state.reactFlowEdges.length,
    lastUpdated: state.meta.updated_at
  });
}

// ============================================================================
// 제품 보고서 정보 관리
// ============================================================================

export interface ProductReportInfo {
  id: number;
  product_name: string;
  product_amount: number;
  product_sell: number;
  product_eusell: number;
  attr_em: number;
  preview_attr_em: number;
  install_name: string;
  created_at: string;
  updated_at: string;
}

const LS_PRODUCT_REPORT_KEY = 'cbam:product_reports:v1';

/**
 * 제품 보고서 정보 저장
 */
export function saveProductReportInfo(productInfo: ProductReportInfo): void {
  try {
    const existingReports = getProductReportInfos();
    const existingIndex = existingReports.findIndex(report => report.id === productInfo.id);
    
    if (existingIndex >= 0) {
      // 기존 제품 정보 업데이트
      existingReports[existingIndex] = {
        ...productInfo,
        updated_at: new Date().toISOString()
      };
    } else {
      // 새 제품 정보 추가
      existingReports.push({
        ...productInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    localStorage.setItem(LS_PRODUCT_REPORT_KEY, JSON.stringify(existingReports));
    console.log('✅ 제품 보고서 정보 저장 완료:', productInfo.product_name);
  } catch (error) {
    console.error('❌ 제품 보고서 정보 저장 실패:', error);
  }
}

/**
 * 제품 보고서 정보 목록 조회
 */
export function getProductReportInfos(): ProductReportInfo[] {
  try {
    const data = localStorage.getItem(LS_PRODUCT_REPORT_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ 제품 보고서 정보 조회 실패:', error);
    return [];
  }
}

/**
 * 특정 제품 보고서 정보 삭제
 */
export function deleteProductReportInfo(productId: number): void {
  try {
    const existingReports = getProductReportInfos();
    const filteredReports = existingReports.filter(report => report.id !== productId);
    localStorage.setItem(LS_PRODUCT_REPORT_KEY, JSON.stringify(filteredReports));
    console.log('✅ 제품 보고서 정보 삭제 완료:', productId);
  } catch (error) {
    console.error('❌ 제품 보고서 정보 삭제 실패:', error);
  }
}

/**
 * 모든 제품 보고서 정보 삭제
 */
export function clearAllProductReportInfos(): void {
  try {
    localStorage.removeItem(LS_PRODUCT_REPORT_KEY);
    console.log('✅ 모든 제품 보고서 정보 삭제 완료');
  } catch (error) {
    console.error('❌ 제품 보고서 정보 삭제 실패:', error);
  }
}
