import { useState, useCallback } from 'react';

export interface Process {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface Install {
  id: number;
  install_name: string;
  reporting_year: string;
}

export interface Product {
  id: number;
  name: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  product_amount?: number;
  product_sell?: number;
  product_eusell?: number;
}

export const useProcessManager = () => {
  const [installs, setInstalls] = useState<Install[]>([
    { id: 1, install_name: '포항제철소', reporting_year: '2025' },
    { id: 2, install_name: '광양제철소', reporting_year: '2025' }
  ]);
  
  const [selectedInstall, setSelectedInstall] = useState<Install | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: '블룸', category: '철강', startDate: '2025-01-01', endDate: '2025-12-31' },
    { id: 2, name: '압연강판', category: '철강', startDate: '2025-01-01', endDate: '2025-12-31' }
  ]);
  
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, name: '제철공정', description: '철광석을 제철하는 공정', category: '제철' },
    { id: 2, name: '압연공정', description: '철을 압연하는 공정', category: '압연' }
  ]);
  
  const [allProcesses, setAllProcesses] = useState<Process[]>([
    { id: 1, name: '제철공정', description: '철광석을 제철하는 공정', category: '제철' },
    { id: 2, name: '압연공정', description: '철을 압연하는 공정', category: '압연' },
    { id: 3, name: '열처리공정', description: '철을 열처리하는 공정', category: '열처리' }
  ]);
  
  const [crossInstallProcesses, setCrossInstallProcesses] = useState<Process[]>([]);
  const [isDetectingChains, setIsDetectingChains] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('');
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  const fetchProcessesByProduct = useCallback(async (productId: number) => {
    // TODO: API 호출하여 제품별 공정 조회
    console.log('제품별 공정 조회:', productId);
    return processes.filter(p => p.id === productId);
  }, [processes]);

  const handleProductQuantityUpdate = useCallback(async (productId: number, quantity: number) => {
    // TODO: API 호출하여 제품 수량 업데이트
    console.log('제품 수량 업데이트:', productId, quantity);
    setIsUpdatingProduct(true);
    try {
      // API 호출 로직
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 지연
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    } finally {
      setIsUpdatingProduct(false);
    }
  }, []);

  const fetchInstalls = useCallback(async () => {
    // TODO: API 호출하여 사업장 목록 조회
    console.log('사업장 목록 조회');
    // 현재는 하드코딩된 데이터 사용
    return installs;
  }, [installs]);

  return {
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
  };
};
