import { useState, useCallback } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

export interface Process {
  id: number;
  process_name: string;  // CBAM 서비스 스키마와 일치
  start_period?: string;  // CBAM 서비스 스키마와 일치
  end_period?: string;    // CBAM 서비스 스키마와 일치
  products?: any[];  // 다대다 관계를 위한 제품 정보
}

export interface Install {
  id: number;
  install_name: string;
  reporting_year: number;  // CBAM 서비스 스키마와 일치
}

export interface Product {
  id: number;
  install_id: number;  // CBAM 서비스 스키마와 일치
  product_name: string;  // CBAM 서비스 스키마와 일치
  product_category: string;  // CBAM 서비스 스키마와 일치
  prostart_period: string;  // CBAM 서비스 스키마와 일치
  proend_period: string;    // CBAM 서비스 스키마와 일치
  product_amount: number;
  product_sell?: number;
  product_eusell?: number;
  attr_em?: number;  // CBAM 서비스 스키마와 일치
}

export const useProcessManager = () => {
  const [installs, setInstalls] = useState<Install[]>([]);
  
  const [selectedInstall, setSelectedInstall] = useState<Install | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  
  const [processes, setProcesses] = useState<Process[]>([]);
  
  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  
  const [crossInstallProcesses, setCrossInstallProcesses] = useState<Process[]>([]);
  const [isDetectingChains, setIsDetectingChains] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('');
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  const fetchProcessesByProduct = useCallback(async (productId: number) => {
    try {
      console.log('📋 제품별 공정 조회 API 호출:', productId);
      const response = await axiosClient.get(apiEndpoints.cbam.process.list, {
        params: { product_id: productId }
      });
      const fetchedProcesses = response.data;
      console.log('✅ 제품별 공정 조회 성공:', fetchedProcesses);
      return fetchedProcesses;
    } catch (error) {
      console.error('❌ 제품별 공정 조회 실패:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  }, []);

  const handleProductQuantityUpdate = useCallback(async (productId: number, quantity: number) => {
    // TODO: API 호출하여 제품 수량 업데이트
    console.log('제품 수량 업데이트:', productId, quantity);
    setIsUpdatingProduct(true);
    try {
      // TODO: 실제 API 호출 구현
      // const response = await axiosClient.put(apiEndpoints.cbam.product.update(productId), { product_amount: quantity });
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, product_amount: quantity } : p
      ));
    } finally {
      setIsUpdatingProduct(false);
    }
  }, []);

  const fetchInstalls = useCallback(async () => {
    try {
      console.log('📋 사업장 목록 조회 API 호출');
      const response = await axiosClient.get(apiEndpoints.cbam.install.list);
      const fetchedInstalls = response.data;
      setInstalls(fetchedInstalls);
      console.log('✅ 사업장 목록 조회 성공:', fetchedInstalls);
      return fetchedInstalls;
    } catch (error) {
      console.error('❌ 사업장 목록 조회 실패:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  }, []);

  // 제품 목록 조회
  const fetchProducts = useCallback(async () => {
    try {
      console.log('📋 제품 목록 조회 API 호출');
      const response = await axiosClient.get(apiEndpoints.cbam.product.list);
      const fetchedProducts = response.data;
      setProducts(fetchedProducts);
      console.log('✅ 제품 목록 조회 성공:', fetchedProducts);
      return fetchedProducts;
    } catch (error) {
      console.error('❌ 제품 목록 조회 실패:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  }, []);

  // 공정 목록 조회
  const fetchProcesses = useCallback(async () => {
    try {
      console.log('📋 공정 목록 조회 API 호출');
      const response = await axiosClient.get(apiEndpoints.cbam.process.list);
      const fetchedProcesses = response.data;
      setProcesses(fetchedProcesses);
      setAllProcesses(fetchedProcesses);
      console.log('✅ 공정 목록 조회 성공:', fetchedProcesses);
      return fetchedProcesses;
    } catch (error) {
      console.error('❌ 공정 목록 조회 실패:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  }, []);

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
    fetchProducts,
    fetchProcesses,
  };
};
