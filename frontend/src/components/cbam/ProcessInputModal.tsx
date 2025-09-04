'use client';

import React, { useState, useEffect } from 'react';
import { Process } from '@/hooks/useProcessManager';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface ProcessInputModalProps {
  selectedProcess: Process | null;
  onClose: () => void;
}

interface InputData {
  material_name: string;
  emission_factor: number;
  material_amount: number;
  oxidation_factor: number;
}

interface FuelData {
  fuel_name: string;
  emission_factor: number;
  fuel_amount: number;
  oxidation_factor: number;
}

export const ProcessInputModal: React.FC<ProcessInputModalProps> = ({
  selectedProcess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'material' | 'fuel'>('material');
  const [materialForm, setMaterialForm] = useState<InputData>({
    material_name: '',
    emission_factor: 0,
    material_amount: 0,
    oxidation_factor: 1,
  });
  const [fuelForm, setFuelForm] = useState<FuelData>({
    fuel_name: '',
    emission_factor: 0,
    fuel_amount: 0,
    oxidation_factor: 1,
  });
  const [materialList, setMaterialList] = useState<any[]>([]);
  const [fuelList, setFuelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 재료 직접배출량 계산
  const handleMaterialCalculation = async () => {
    if (!materialForm.material_name || materialForm.material_amount <= 0) {
      alert('원료명과 원료량을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const calculationData = {
        process_id: selectedProcess?.id,
        material_name: materialForm.material_name,
        emission_factor: materialForm.emission_factor,
        material_amount: materialForm.material_amount,
        oxidation_factor: materialForm.oxidation_factor,
      };

      const response = await axiosClient.post('/api/v1/cbam/process/material-emission', calculationData);
      
      // 목록 새로고침
      await fetchMaterialList();
      
      // 폼 초기화
      setMaterialForm({
        material_name: '',
        emission_factor: 0,
        material_amount: 0,
        oxidation_factor: 1,
      });
      
      alert('원료직접배출량이 계산되었습니다.');
    } catch (error) {
      console.error('원료직접배출량 계산 실패:', error);
      alert('계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 연료 직접배출량 계산
  const handleFuelCalculation = async () => {
    if (!fuelForm.fuel_name || fuelForm.fuel_amount <= 0) {
      alert('연료명과 연료량을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const calculationData = {
        process_id: selectedProcess?.id,
        fuel_name: fuelForm.fuel_name,
        emission_factor: fuelForm.emission_factor,
        fuel_amount: fuelForm.fuel_amount,
        oxidation_factor: fuelForm.oxidation_factor,
      };

      const response = await axiosClient.post('/api/v1/cbam/process/fuel-emission', calculationData);
      
      // 목록 새로고침
      await fetchFuelList();
      
      // 폼 초기화
      setFuelForm({
        fuel_name: '',
        emission_factor: 0,
        fuel_amount: 0,
        oxidation_factor: 1,
      });
      
      alert('연료직접배출량이 계산되었습니다.');
    } catch (error) {
      console.error('연료직접배출량 계산 실패:', error);
      alert('계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 재료 목록 조회
  const fetchMaterialList = async () => {
    if (!selectedProcess?.id) return;
    
    try {
      const response = await axiosClient.get(`/api/v1/cbam/matdir/process/${selectedProcess.id}`);
      setMaterialList(response.data || []);
    } catch (error) {
      console.error('재료 목록 조회 실패:', error);
      setMaterialList([]);
    }
  };

  // 연료 목록 조회
  const fetchFuelList = async () => {
    if (!selectedProcess?.id) return;
    
    try {
      const response = await axiosClient.get(`/api/v1/cbam/fueldir/process/${selectedProcess.id}`);
      setFuelList(response.data || []);
    } catch (error) {
      console.error('연료 목록 조회 실패:', error);
      setFuelList([]);
    }
  };

  useEffect(() => {
    if (selectedProcess) {
      fetchMaterialList();
      fetchFuelList();
    }
  }, [selectedProcess]);

  if (!selectedProcess) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-6xl w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            투입량 입력 - {selectedProcess.process_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl">✕</button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-600 mb-6">
          <button
            onClick={() => setActiveTab('material')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'material'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>📊</span>
            원료직접배출량
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'fuel'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>⛽</span>
            연료직접배출량
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽 패널 - 입력 폼 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">+</span>
              {activeTab === 'material' ? '원료 | 공정 배출 활동량' : '연료 | 공정 배출 활동량'}
            </h4>

            {activeTab === 'material' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 원료명 (자유 입력 가능)
                  </label>
                  <input
                    type="text"
                    value={materialForm.material_name}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, material_name: e.target.value }))}
                    placeholder="예: 직접환원철, EAF 탄소 전극"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (수정 불가)
                  </label>
                  <input
                    type="number"
                    value={materialForm.emission_factor}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-500 border border-gray-500 rounded-md text-white"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400">💡</span>
                    <span className="text-xs text-gray-400">
                      배출계수는 Master Table의 값만 사용 가능합니다
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 원료량
                  </label>
                  <input
                    type="number"
                    value={materialForm.material_amount}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, material_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    산화계수
                  </label>
                  <input
                    type="number"
                    value={materialForm.oxidation_factor}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, oxidation_factor: parseFloat(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  onClick={handleMaterialCalculation}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                >
                  <span>📊</span>
                  원료직접배출량 계산
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 연료명 (자유 입력 가능)
                  </label>
                  <input
                    type="text"
                    value={fuelForm.fuel_name}
                    onChange={(e) => setFuelForm(prev => ({ ...prev, fuel_name: e.target.value }))}
                    placeholder="예: 원유, 휘발유, 등유"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (수정 불가)
                  </label>
                  <input
                    type="number"
                    value={fuelForm.emission_factor}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-500 border border-gray-500 rounded-md text-white"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400">💡</span>
                    <span className="text-xs text-gray-400">
                      배출계수는 Master Table의 값만 사용 가능합니다
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 연료량
                  </label>
                  <input
                    type="number"
                    value={fuelForm.fuel_amount}
                    onChange={(e) => setFuelForm(prev => ({ ...prev, fuel_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    산화계수
                  </label>
                  <input
                    type="number"
                    value={fuelForm.oxidation_factor}
                    onChange={(e) => setFuelForm(prev => ({ ...prev, oxidation_factor: parseFloat(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  onClick={handleFuelCalculation}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                >
                  <span>📊</span>
                  연료직접배출량 계산
                </button>
              </div>
            )}
          </div>

          {/* 오른쪽 패널 - 입력된 목록 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white">입력된 목록</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  {activeTab === 'material' ? materialList.length : fuelList.length}개
                </span>
                <button
                  onClick={activeTab === 'material' ? fetchMaterialList : fetchFuelList}
                  className="text-gray-400 hover:text-gray-200"
                >
                  🔄 새로고침
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {activeTab === 'material' ? (
                materialList.length > 0 ? (
                  materialList.map((item, index) => (
                    <div key={index} className="bg-gray-600 p-3 rounded-md">
                      <div className="text-white font-medium">{item.material_name}</div>
                      <div className="text-sm text-gray-300">
                        배출량: {item.emission_amount || 0} tCO2
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    입력된 데이터가 없습니다.
                  </div>
                )
              ) : (
                fuelList.length > 0 ? (
                  fuelList.map((item, index) => (
                    <div key={index} className="bg-gray-600 p-3 rounded-md">
                      <div className="text-white font-medium">{item.fuel_name}</div>
                      <div className="text-sm text-gray-300">
                        배출량: {item.emission_amount || 0} tCO2
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    입력된 데이터가 없습니다.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
