'use client';

import React, { useState } from 'react';
import { Process, Product, Install } from '@/hooks/useProcessManager';

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
  const [productModalTab, setProductModalTab] = useState<'process' | 'quantity'>('process');
  const [processFilterMode, setProcessFilterMode] = useState<'all' | 'product'>('all');
  const [productQuantityForm, setProductQuantityForm] = useState({
    product_amount: selectedProduct?.product_amount || 0,
    product_sell: selectedProduct?.product_sell || 0,
    product_eusell: selectedProduct?.product_eusell || 0
  });

  // useEffect로 selectedProduct 변경 시 폼 값 업데이트
  React.useEffect(() => {
    if (selectedProduct) {
      setProductQuantityForm({
        product_amount: selectedProduct.product_amount || 0,
        product_sell: selectedProduct.product_sell || 0,
        product_eusell: selectedProduct.product_eusell || 0
      });
    }
  }, [selectedProduct]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            제품 관리 - {selectedProduct?.product_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl">✕</button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setProductModalTab('process')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              productModalTab === 'process'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            공정 관리
          </button>
          <button
            onClick={() => setProductModalTab('quantity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              productModalTab === 'quantity'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            수량 관리
          </button>
        </div>

        {/* 공정 관리 탭 */}
        {productModalTab === 'process' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white">등록된 공정 목록</h4>
              <div className="flex space-x-2">
                <select
                  value={processFilterMode}
                  onChange={(e) => setProcessFilterMode(e.target.value as 'all' | 'product')}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                >
                  <option value="all">전체 공정</option>
                  <option value="product">제품별 공정</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProcesses.map((process) => (
                <div
                  key={process.id}
                  className="p-4 border border-gray-600 rounded-lg bg-gray-700 hover:border-purple-400 transition-colors"
                >
                  <div className="font-medium text-white mb-2">{process.process_name}</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>기간: {process.start_period || 'N/A'} ~ {process.end_period || 'N/A'}</div>
                    <div>연결된 제품: {process.products?.length || 0}개</div>
                  </div>
                  <button
                    onClick={() => onProcessSelect(process)}
                    className="mt-3 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                  >
                    공정 선택
                  </button>
                </div>
              ))}
            </div>

            {allProcesses.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {processFilterMode === 'all' 
                  ? '등록된 공정이 없습니다.' 
                  : `${selectedProduct?.product_name}에 등록된 공정이 없습니다.`
                }
              </div>
            )}
          </div>
        )}

        {/* 수량 관리 탭 */}
        {productModalTab === 'quantity' && (
          <div>
            <h4 className="text-lg font-medium text-white mb-4">제품 수량 정보</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  총 생산량
                </label>
                <input
                  type="number"
                  value={productQuantityForm.product_amount}
                  onChange={(e) => setProductQuantityForm(prev => ({
                    ...prev,
                    product_amount: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="생산량을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  국내 판매량
                </label>
                <input
                  type="number"
                  value={productQuantityForm.product_sell}
                  onChange={(e) => setProductQuantityForm(prev => ({
                    ...prev,
                    product_sell: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="국내 판매량을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  EU 판매량
                </label>
                <input
                  type="number"
                  value={productQuantityForm.product_eusell}
                  onChange={(e) => setProductQuantityForm(prev => ({
                    ...prev,
                    product_eusell: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="EU 판매량을 입력하세요"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: 수량 정보 저장 로직 구현
                  console.log('수량 정보 저장:', productQuantityForm);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
