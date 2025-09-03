'use client';

import React, { useState } from 'react';
import { Process, Product, Install } from '@/hooks/useProcessManager';
import axiosClient from '@/lib/axiosClient';

interface ProcessSelectorProps {
  processes: Process[];
  allProcesses: Process[];
  products: Product[];
  installs: Install[];
  selectedProduct: Product | null;
  selectedInstall: Install | null;
  onProcessSelect: (process: Process) => void;
  onClose: () => void;
}

export const ProcessSelector: React.FC<ProcessSelectorProps> = ({
  processes,
  allProcesses,
  products,
  installs,
  selectedProduct,
  selectedInstall,
  onProcessSelect,
  onClose,
}) => {
  const [processFilterMode, setProcessFilterMode] = useState<'all' | 'product'>('all');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            공정 선택 - {selectedProduct?.product_name || '제품'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✕</button>
        </div>
        <div className="space-y-2">
          {processes.length > 0 ? (
            processes.map((process) => (
              <div
                key={process.id}
                className="p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-purple-400 transition-colors"
                onClick={() => onProcessSelect(process)}
              >
                <div className="font-medium text-white">{process.process_name}</div>
                <div className="text-sm text-gray-300">기간: {process.start_period || 'N/A'} ~ {process.end_period || 'N/A'}</div>
                <div className="text-sm text-gray-300">연결된 제품: {process.products?.length || 0}개</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              {selectedProduct?.product_name}에 등록된 공정이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 제품별 공정 선택 모달 (탭 포함)
export const ProductProcessModal: React.FC<{
  selectedProduct: Product | null;
  allProcesses: Process[];
  products: Product[];
  installs: Install[];
  selectedInstall: Install | null;
  onProcessSelect: (process: Process) => void;
  onClose: () => void;
}> = ({
  selectedProduct,
  allProcesses,
  products,
  installs,
  selectedInstall,
  onProcessSelect,
  onClose,
}) => {
  const [processFilterMode, setProcessFilterMode] = useState<'all' | 'product'>('all');
  const [productProcesses, setProductProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantityForm, setQuantityForm] = useState({
    product_amount: 0,
    product_sell: 0,
    product_eusell: 0
  });
  const [saving, setSaving] = useState(false);

  // 제품-공정 관계 데이터 가져오기
  React.useEffect(() => {
    const fetchProductProcesses = async () => {
      if (!selectedProduct?.id) return;
      
      setLoading(true);
      try {
        const response = await axiosClient.get(`/api/v1/cbam/productprocess/product/${selectedProduct.id}`);
        const data = response.data || [];
        
        // 해당 제품에만 연결된 공정들만 필터링 (추가 안전장치)
        const filteredData = data.filter((item: any) => 
          item.product_id === selectedProduct.id
        );
        
        console.log(`🔍 제품 ${selectedProduct.product_name}에 연결된 공정들:`, filteredData);
        setProductProcesses(filteredData);
      } catch (error) {
        console.error('제품-공정 관계 조회 실패:', error);
        setProductProcesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductProcesses();
  }, [selectedProduct?.id]);

  // 제품 수량 정보 초기화
  React.useEffect(() => {
    if (selectedProduct) {
      setQuantityForm({
        product_amount: selectedProduct.product_amount || 0,
        product_sell: selectedProduct.product_sell || 0,
        product_eusell: selectedProduct.product_eusell || 0
      });
    }
  }, [selectedProduct]);

  // 수량 저장 함수
  const handleSaveQuantity = async () => {
    if (!selectedProduct?.id) return;
    
    setSaving(true);
    try {
      const updateData = {
        product_amount: quantityForm.product_amount,
        product_sell: quantityForm.product_sell,
        product_eusell: quantityForm.product_eusell
      };
      
      await axiosClient.put(`/api/v1/cbam/product/${selectedProduct.id}`, updateData);
      alert('수량이 성공적으로 저장되었습니다!');
      
      // 제품 정보 새로고침을 위해 모달 닫기
      onClose();
    } catch (error) {
      console.error('수량 저장 실패:', error);
      alert('수량 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            제품 관리 - {selectedProduct?.product_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl">✕</button>
        </div>

        {/* 수량 관리 */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-white mb-4">제품 수량 관리</h4>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  총 생산량
                </label>
                <input
                  type="number"
                  value={quantityForm.product_amount}
                  onChange={(e) => setQuantityForm(prev => ({
                    ...prev,
                    product_amount: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  국내 판매량
                </label>
                <input
                  type="number"
                  value={quantityForm.product_sell}
                  onChange={(e) => setQuantityForm(prev => ({
                    ...prev,
                    product_sell: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  EU 판매량
                </label>
                <input
                  type="number"
                  value={quantityForm.product_eusell}
                  onChange={(e) => setQuantityForm(prev => ({
                    ...prev,
                    product_eusell: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-400"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveQuantity}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
              >
                {saving ? '저장 중...' : '수량 저장'}
              </button>
            </div>
          </div>
        </div>

        {/* 공정 관리 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white">
                {selectedProduct?.product_name}에 연결된 공정 목록
              </h4>
            </div>

            {/* 공정 카드 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-8 text-gray-400">
                  로딩 중...
                </div>
              ) : productProcesses.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">
                  등록된 공정이 없습니다.
                </div>
              ) : (
                productProcesses.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-600 rounded-lg bg-gray-700 hover:border-purple-400 transition-colors"
                  >
                    <div className="font-medium text-white mb-2">{item.process_name}</div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>제품: {item.product_name}</div>
                      <div>사업장: {item.install_name}</div>
                      <div>소비량: {item.consumption_amount || 0}</div>
                    </div>
                    <button
                      onClick={() => onProcessSelect(item)}
                      className="mt-3 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                    >
                      공정 선택
                    </button>
                  </div>
                ))
              )}
            </div>


          </div>
      </div>
    </div>
  );
};
