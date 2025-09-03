'use client';

import React, { useState } from 'react';
import { Process, Product, Install } from '@/hooks/useProcessManager';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

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
  allProcesses: allProcessesProp,
  products,
  installs,
  selectedInstall,
  onProcessSelect,
  onClose,
}) => {
  const [processFilterMode, setProcessFilterMode] = useState<'all' | 'product'>('all');
  const [productProcesses, setProductProcesses] = useState<any[]>([]);
  const [allProcesses, setAllProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantityForm, setQuantityForm] = useState({
    product_amount: 0,
    product_sell: 0,
    product_eusell: 0
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'processes' | 'quantity'>('processes');
  const [selectedInstallForProcess, setSelectedInstallForProcess] = useState<Install | null>(null);

  // 제품-공정 관계 데이터 가져오기
  React.useEffect(() => {
    const fetchProductProcesses = async () => {
      if (!selectedProduct?.id) return;
      
      setLoading(true);
      try {
        const response = await axiosClient.get(apiEndpoints.cbam.productProcess.byProduct(selectedProduct.id));
        const data = response.data.processes || response.data || [];
        
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

  // 사업장별 공정 조회
  const fetchProcessesByInstall = React.useCallback(async (installId: number) => {
    if (!installId) return;
    
    setLoading(true);
    try {
      console.log('🔍 사업장별 공정 조회:', installId);
      
      // 사업장별 제품 조회
      const productsResponse = await axiosClient.get(apiEndpoints.cbam.product.byInstall(installId));
      const products = productsResponse.data || [];
      
      // 각 제품의 공정 관계 조회
      const allProcessesData: any[] = [];
      for (const product of products) {
        try {
          const processResponse = await axiosClient.get(apiEndpoints.cbam.productProcess.byProduct(product.id));
          const processData = processResponse.data.processes || processResponse.data || [];
          allProcessesData.push(...processData);
        } catch (error) {
          console.error(`제품 ${product.id}의 공정 조회 실패:`, error);
        }
      }
      
      // 중복 제거 (process_id 기준)
      const uniqueProcesses = allProcessesData.reduce((acc: any[], current: any) => {
        const existing = acc.find(item => item.process_id === current.process_id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log(`🔍 사업장 ${installId}의 모든 공정들:`, uniqueProcesses);
      setAllProcesses(uniqueProcesses);
    } catch (error) {
      console.error('사업장별 공정 조회 실패:', error);
      setAllProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사업장 선택 시 공정 조회
  React.useEffect(() => {
    if (selectedInstallForProcess?.id) {
      fetchProcessesByInstall(selectedInstallForProcess.id);
    }
  }, [selectedInstallForProcess?.id, fetchProcessesByInstall]);

  // 제품 수량 정보 초기화 (DB에서 최신 데이터 가져오기)
  React.useEffect(() => {
    const fetchProductQuantity = async () => {
      if (!selectedProduct?.id) return;
      
      try {
        const response = await axiosClient.get(apiEndpoints.cbam.product.get(selectedProduct.id));
        const productData = response.data;
        
        setQuantityForm({
          product_amount: productData.product_amount || 0,
          product_sell: productData.product_sell || 0,
          product_eusell: productData.product_eusell || 0
        });
      } catch (error) {
        console.error('제품 수량 정보 조회 실패:', error);
        // 실패 시 기존 데이터 사용
        setQuantityForm({
          product_amount: selectedProduct.product_amount || 0,
          product_sell: selectedProduct.product_sell || 0,
          product_eusell: selectedProduct.product_eusell || 0
        });
      }
    };

    fetchProductQuantity();
  }, [selectedProduct?.id]);

  // 공정 선택 시 제품-공정 관계 생성
  const handleProcessSelect = async (processData: any) => {
    if (!selectedProduct?.id || !processData?.process_id) {
      alert('제품 또는 공정 정보가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 제품-공정 관계 생성 요청 (CBAM 서비스 API 사용)
      const response = await axiosClient.post(apiEndpoints.cbam.productProcess.create, {
        product_id: selectedProduct.id,
        process_id: processData.process_id,
        consumption_amount: 0 // 기본값
      });

      console.log('✅ 제품-공정 관계 생성 성공:', response.data);
      
      // 성공 시 공정 목록 새로고침
      const productResponse = await axiosClient.get(apiEndpoints.cbam.productProcess.byProduct(selectedProduct.id));
      const data = productResponse.data.processes || productResponse.data || [];
      const filteredData = data.filter((item: any) => item.product_id === selectedProduct.id);
      setProductProcesses(filteredData);
      
      alert('공정이 성공적으로 연결되었습니다.');
    } catch (error) {
      console.error('❌ 제품-공정 관계 생성 실패:', error);
      alert('공정 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수량 저장 함수 (DB 연동)
  const handleSaveQuantity = async () => {
    if (!selectedProduct?.id) return;
    
    setSaving(true);
    try {
      const updateData = {
        product_amount: quantityForm.product_amount,
        product_sell: quantityForm.product_sell,
        product_eusell: quantityForm.product_eusell
      };
      
      console.log('💾 수량 저장 요청:', updateData);
      const response = await axiosClient.put(apiEndpoints.cbam.product.update(selectedProduct.id), updateData);
      console.log('✅ 수량 저장 성공:', response.data);
      
      alert('수량이 성공적으로 저장되었습니다!');
      
      // 저장 후 최신 데이터 다시 가져오기
      const refreshResponse = await axiosClient.get(apiEndpoints.cbam.product.get(selectedProduct.id));
      const updatedProduct = refreshResponse.data;
      
      setQuantityForm({
        product_amount: updatedProduct.product_amount || 0,
        product_sell: updatedProduct.product_sell || 0,
        product_eusell: updatedProduct.product_eusell || 0
      });
      
    } catch (error) {
      console.error('❌ 수량 저장 실패:', error);
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

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-600 mb-6">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'processes'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            공정 관리
          </button>
          <button
            onClick={() => setActiveTab('quantity')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'quantity'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            수량 관리
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'processes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white">
                {selectedProduct?.product_name}에 연결된 공정 목록
              </h4>
            </div>

            {/* 사업장 선택 드롭박스 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                사업장별 공정 조회
              </label>
              <select
                value={selectedInstallForProcess?.id || ''}
                onChange={(e) => {
                  const installId = parseInt(e.target.value);
                  const install = installs.find(i => i.id === installId);
                  setSelectedInstallForProcess(install || null);
                }}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-400"
              >
                <option value="">사업장을 선택하세요</option>
                {installs.map((install) => (
                  <option key={install.id} value={install.id}>
                    {install.install_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 공정 목록 */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  로딩 중...
                </div>
              ) : (
                <>
                  {/* 현재 사업장의 공정들 */}
                  <div>
                    <h5 className="text-md font-medium text-purple-400 mb-2">
                      현재 사업장 공정
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {productProcesses.length > 0 ? (
                        productProcesses.map((item) => (
                          <div
                            key={`current-${item.id}`}
                            className="p-3 border border-purple-500 rounded-lg bg-gray-700 hover:border-purple-400 transition-colors"
                          >
                            <div className="font-medium text-white mb-1">{item.process_name}</div>
                            <div className="text-sm text-gray-300">
                              소비량: {item.consumption_amount || 0}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                          현재 사업장에 연결된 공정이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 전체 사업장의 공정들 */}
                  {selectedInstallForProcess && (
                    <div>
                      <h5 className="text-md font-medium text-blue-400 mb-2">
                        전체 사업장 공정
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allProcesses.length > 0 ? (
                          allProcesses.map((item) => (
                            <div
                              key={`all-${item.id}`}
                              className="p-3 border border-blue-500 rounded-lg bg-gray-700 hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => handleProcessSelect(item)}
                            >
                              <div className="font-medium text-white mb-1">{item.process_name}</div>
                              <div className="text-sm text-gray-300">
                                사업장: {item.install_name}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                            {selectedInstallForProcess.install_name}에 등록된 공정이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quantity' && (
          <div>
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
        )}
      </div>
    </div>
  );
};
