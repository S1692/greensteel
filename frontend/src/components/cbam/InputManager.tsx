'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
import { useFuelMasterAPI } from '@/hooks/useFuelMasterAPI';
import { FuelMaster } from '@/lib/types';

interface InputManagerProps {
  selectedProcess: any;
  onClose: () => void;
  onDataSaved?: () => void; // 데이터 저장 후 콜백 추가
}

interface InputForm {
  name: string;
  factor: number;
  amount: number;
  oxyfactor: number;
}

interface InputResult {
  id: number | string;
  name: string;
  factor: number;
  amount: number;
  oxyfactor: number;
  emission: number;
  calculation_formula: string;
  type: 'matdir' | 'fueldir';
  created_at?: string;
  updated_at?: string;
}

export default function InputManager({ selectedProcess, onClose, onDataSaved }: InputManagerProps) {
  // Fuel Master API Hook
  const { searchFuels, getFuelFactor } = useFuelMasterAPI();

  // 현재 활성 탭
  const [activeTab, setActiveTab] = useState<'matdir' | 'fueldir'>('matdir');

  // 입력 폼 상태
  const [matdirForm, setMatdirForm] = useState<InputForm>({
    name: '',
    factor: 0,
    amount: 0,
    oxyfactor: 1.0000
  });

  const [fueldirForm, setFueldirForm] = useState<InputForm>({
    name: '',
    factor: 0,
    amount: 0,
    oxyfactor: 1.0000
  });

  // 결과 목록
  const [inputResults, setInputResults] = useState<InputResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fuel Master 자동 배출계수 관련 상태
  const [fuelSuggestions, setFuelSuggestions] = useState<FuelMaster[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoFactorStatus, setAutoFactorStatus] = useState<string>('');
  
  // Material Master 자동 배출계수 관련 상태
  const [materialSuggestions, setMaterialSuggestions] = useState<any[]>([]);
  const [showMaterialSuggestions, setShowMaterialSuggestions] = useState(false);
  const [materialAutoFactorStatus, setMaterialAutoFactorStatus] = useState<string>('');

  // 수정 모드 상태
  const [editingResult, setEditingResult] = useState<InputResult | null>(null);
  const [editForm, setEditForm] = useState<InputForm>({
    name: '',
    factor: 0,
    amount: 0,
    oxyfactor: 1.0000
  });

  // ============================================================================
  // 🔍 기존 데이터 로드
  // ============================================================================

  const loadAllExistingData = useCallback(async () => {
    if (!selectedProcess?.id) return;
    
    setIsLoadingData(true);
    try {
      console.log('🔍 기존 데이터 로드 시작:', selectedProcess.id);
      
      // 원료직접배출량과 연료직접배출량 데이터를 병렬로 로드
      const [matdirResponse, fueldirResponse] = await Promise.all([
        axiosClient.get(apiEndpoints.cbam.matdir.byProcess(selectedProcess.id)),
        axiosClient.get(apiEndpoints.cbam.fueldir.byProcess(selectedProcess.id))
      ]);
      
      const allResults: InputResult[] = [];
      
      // 원료직접배출량 데이터 처리
      if (matdirResponse.data && Array.isArray(matdirResponse.data)) {
        matdirResponse.data.forEach((item: any) => {
          allResults.push({
            id: item.id,
            name: item.material_name || item.name,
            factor: item.emission_factor || 0,
            amount: item.amount || 0,
            oxyfactor: item.oxyfactor || 1.0000,
            emission: item.emission || 0,
            calculation_formula: item.calculation_formula || '',
            type: 'matdir',
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        });
      }
      
      // 연료직접배출량 데이터 처리
      if (fueldirResponse.data && Array.isArray(fueldirResponse.data)) {
        fueldirResponse.data.forEach((item: any) => {
          allResults.push({
            id: item.id,
            name: item.fuel_name || item.name,
            factor: item.emission_factor || 0,
            amount: item.amount || 0,
            oxyfactor: item.oxyfactor || 1.0000,
            emission: item.emission || 0,
            calculation_formula: item.calculation_formula || '',
            type: 'fueldir',
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        });
      }
      
      setInputResults(allResults);
      console.log('✅ 기존 데이터 로드 완료:', allResults.length, '개 항목');
      
    } catch (error) {
      console.error('❌ 기존 데이터 로드 실패:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedProcess?.id]);

  // 컴포넌트 마운트 시 기존 데이터 로드
  useEffect(() => {
    if (selectedProcess?.id) {
      loadAllExistingData();
    }
  }, [selectedProcess?.id, loadAllExistingData]);

  // ============================================================================
  // 🔥 배출량 계산
  // ============================================================================

  const calculateEmission = useCallback((form: InputForm): number => {
    return form.amount * form.factor * form.oxyfactor;
  }, []);

  // ============================================================================
  // 📝 폼 입력 처리
  // ============================================================================

  const handleMatdirInputChange = (field: keyof InputForm, value: string | number) => {
    setMatdirForm(prev => {
      const newForm = { ...prev, [field]: value };
      return newForm;
    });
  };

  const handleFueldirInputChange = (field: keyof InputForm, value: string | number) => {
    setFueldirForm(prev => {
      const newForm = { ...prev, [field]: value };
      return newForm;
    });
  };

  // ============================================================================
  // 🔍 Fuel Master 자동 배출계수 검색
  // ============================================================================

  const handleFuelSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setFuelSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const fuels = await searchFuels(searchTerm);
      setFuelSuggestions(fuels || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('연료 검색 실패:', error);
      setFuelSuggestions([]);
    }
  }, [searchFuels]);

  const handleFuelSelect = useCallback(async (fuel: FuelMaster) => {
    try {
      const factor = await getFuelFactor(fuel.id.toString());
      if (factor) {
        const factorValue = (factor as any).factor || (factor as any).emission_factor || 0;
        setFueldirForm(prev => ({
          ...prev,
          name: fuel.fuel_name,
          factor: factorValue
        }));
        setShowSuggestions(false);
        setAutoFactorStatus(`✅ ${fuel.fuel_name} 자동 배출계수 적용: ${factorValue}`);
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => setAutoFactorStatus(''), 3000);
      } else {
        setAutoFactorStatus('❌ 배출계수를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('배출계수 가져오기 실패:', error);
      setAutoFactorStatus('❌ 배출계수 가져오기 실패');
    }
  }, [getFuelFactor]);

  // ============================================================================
  // 🔍 Material Master 자동 배출계수 검색
  // ============================================================================

  const handleMaterialSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setMaterialSuggestions([]);
      setShowMaterialSuggestions(false);
      return;
    }

    try {
      // Material Master API 호출 (실제 구현 필요)
      // 임시로 더미 데이터 사용
      const dummyMaterials = [
        { id: 1, material_name: '철광석', emission_factor: 0.5 },
        { id: 2, material_name: '석탄', emission_factor: 2.0 },
        { id: 3, material_name: '석회석', emission_factor: 0.4 }
      ].filter(material => 
        material.material_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setMaterialSuggestions(dummyMaterials);
      setShowMaterialSuggestions(true);
    } catch (error) {
      console.error('원료 검색 실패:', error);
      setMaterialSuggestions([]);
    }
  }, []);

  const handleMaterialSelect = useCallback(async (material: any) => {
    try {
      setMatdirForm(prev => ({
        ...prev,
        name: material.material_name || material.name,
        factor: material.emission_factor || 0
      }));
      setShowMaterialSuggestions(false);
      setMaterialAutoFactorStatus(`✅ ${material.material_name || material.name} 자동 배출계수 적용: ${material.emission_factor || 0}`);
      
      // 3초 후 상태 메시지 제거
      setTimeout(() => setMaterialAutoFactorStatus(''), 3000);
    } catch (error) {
      console.error('원료 배출계수 적용 실패:', error);
      setMaterialAutoFactorStatus('❌ 배출계수 적용 실패');
    }
  }, []);

  // ============================================================================
  // 💾 데이터 저장
  // ============================================================================

  const saveMatdirData = useCallback(async () => {
    if (!selectedProcess?.id || !matdirForm.name || matdirForm.amount <= 0) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setIsCalculating(true);
    try {
      const emission = calculateEmission(matdirForm);
      
      const payload = {
        process_id: selectedProcess.id,
        material_name: matdirForm.name,
        emission_factor: matdirForm.factor,
        amount: matdirForm.amount,
        oxyfactor: matdirForm.oxyfactor,
        emission: emission,
        calculation_formula: `${matdirForm.amount} × ${matdirForm.factor} × ${matdirForm.oxyfactor} = ${emission}`
      };

      const response = await axiosClient.post(apiEndpoints.cbam.matdir.create, payload);
      
      if (response.data) {
        const newResult: InputResult = {
          id: response.data.id,
          name: matdirForm.name,
          factor: matdirForm.factor,
          amount: matdirForm.amount,
          oxyfactor: matdirForm.oxyfactor,
          emission: emission,
          calculation_formula: payload.calculation_formula,
          type: 'matdir',
          created_at: response.data.created_at
        };

        setInputResults(prev => [...prev, newResult]);
        
        // 폼 초기화
        setMatdirForm({
          name: '',
          factor: 0,
          amount: 0,
          oxyfactor: 1.0000
        });

        console.log('✅ 원료직접배출량 저장 완료:', newResult);
        
        // 콜백 호출
        if (onDataSaved) {
          onDataSaved();
        }
      }
    } catch (error) {
      console.error('❌ 원료직접배출량 저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsCalculating(false);
    }
  }, [selectedProcess?.id, matdirForm, calculateEmission, onDataSaved]);

  const saveFueldirData = useCallback(async () => {
    if (!selectedProcess?.id || !fueldirForm.name || fueldirForm.amount <= 0) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setIsCalculating(true);
    try {
      const emission = calculateEmission(fueldirForm);
      
      const payload = {
        process_id: selectedProcess.id,
        fuel_name: fueldirForm.name,
        emission_factor: fueldirForm.factor,
        amount: fueldirForm.amount,
        oxyfactor: fueldirForm.oxyfactor,
        emission: emission,
        calculation_formula: `${fueldirForm.amount} × ${fueldirForm.factor} × ${fueldirForm.oxyfactor} = ${emission}`
      };

      const response = await axiosClient.post(apiEndpoints.cbam.fueldir.create, payload);
      
      if (response.data) {
        const newResult: InputResult = {
          id: response.data.id,
          name: fueldirForm.name,
          factor: fueldirForm.factor,
          amount: fueldirForm.amount,
          oxyfactor: fueldirForm.oxyfactor,
          emission: emission,
          calculation_formula: payload.calculation_formula,
          type: 'fueldir',
          created_at: response.data.created_at
        };

        setInputResults(prev => [...prev, newResult]);
        
        // 폼 초기화
        setFueldirForm({
          name: '',
          factor: 0,
          amount: 0,
          oxyfactor: 1.0000
        });

        console.log('✅ 연료직접배출량 저장 완료:', newResult);
        
        // 콜백 호출
        if (onDataSaved) {
          onDataSaved();
        }
      }
    } catch (error) {
      console.error('❌ 연료직접배출량 저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsCalculating(false);
    }
  }, [selectedProcess?.id, fueldirForm, calculateEmission, onDataSaved]);

  // ============================================================================
  // ✏️ 수정 모드
  // ============================================================================

  const handleEdit = (result: InputResult) => {
    setEditingResult(result);
    setEditForm({
      name: result.name,
      factor: result.factor,
      amount: result.amount,
      oxyfactor: result.oxyfactor
    });
  };

  const handleEditSave = async () => {
    if (!editingResult) return;

    try {
      const emission = calculateEmission(editForm);
      
      const payload = {
        name: editForm.name,
        emission_factor: editForm.factor,
        amount: editForm.amount,
        oxyfactor: editForm.oxyfactor,
        emission: emission,
        calculation_formula: `${editForm.amount} × ${editForm.factor} × ${editForm.oxyfactor} = ${emission}`
      };

      const endpoint = editingResult.type === 'matdir' 
        ? apiEndpoints.cbam.matdir.update(editingResult.id as number)
        : apiEndpoints.cbam.fueldir.update(editingResult.id as number);

      const response = await axiosClient.put(endpoint, payload);
      
      if (response.data) {
        setInputResults(prev => prev.map(item => 
          item.id === editingResult.id 
            ? { ...item, ...editForm, emission, calculation_formula: payload.calculation_formula }
            : item
        ));
        
        setEditingResult(null);
        console.log('✅ 수정 완료:', editingResult.id);
        
        // 콜백 호출
        if (onDataSaved) {
          onDataSaved();
        }
      }
    } catch (error) {
      console.error('❌ 수정 실패:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleEditCancel = () => {
    setEditingResult(null);
    setEditForm({
      name: '',
      factor: 0,
      amount: 0,
      oxyfactor: 1.0000
    });
  };

  // ============================================================================
  // 🗑️ 삭제
  // ============================================================================

  const handleDelete = async (result: InputResult) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const endpoint = result.type === 'matdir' 
        ? apiEndpoints.cbam.matdir.delete(result.id as number)
        : apiEndpoints.cbam.fueldir.delete(result.id as number);

      await axiosClient.delete(endpoint);
      
      setInputResults(prev => prev.filter(item => item.id !== result.id));
      console.log('✅ 삭제 완료:', result.id);
      
      // 콜백 호출
      if (onDataSaved) {
        onDataSaved();
      }
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // ============================================================================
  // 📊 총 배출량 계산
  // ============================================================================

  const totalMatdirEmission = inputResults
    .filter(item => item.type === 'matdir')
    .reduce((sum, item) => sum + item.emission, 0);

  const totalFueldirEmission = inputResults
    .filter(item => item.type === 'fueldir')
    .reduce((sum, item) => sum + item.emission, 0);

  const totalEmission = totalMatdirEmission + totalFueldirEmission;

  // ============================================================================
  // 🎨 UI 렌더링
  // ============================================================================

  if (!selectedProcess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-gray-700">
          <div className="text-center text-gray-400">
            공정을 선택해주세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-6xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              입력물 관리 - {selectedProcess.process_name}
            </h2>
            <p className="text-gray-400 text-sm">
              공정 ID: {selectedProcess.id} | 총 배출량: {totalEmission.toFixed(2)} tCO2
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('matdir')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'matdir'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            원료직접배출량 ({totalMatdirEmission.toFixed(2)} tCO2)
          </button>
          <button
            onClick={() => setActiveTab('fueldir')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'fueldir'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            연료직접배출량 ({totalFueldirEmission.toFixed(2)} tCO2)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              {activeTab === 'matdir' ? '원료' : '연료'} 입력
            </h3>
            
            {activeTab === 'matdir' ? (
              <div className="space-y-4">
                {/* 원료명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    원료명 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={matdirForm.name}
                      onChange={(e) => handleMatdirInputChange('name', e.target.value)}
                      onFocus={() => handleMaterialSearch(matdirForm.name)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                      placeholder="원료명을 입력하세요"
                    />
                    {showMaterialSuggestions && materialSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                        {materialSuggestions.map((material) => (
                          <div
                            key={material.id}
                            onClick={() => handleMaterialSelect(material)}
                            className="px-3 py-2 hover:bg-gray-500 cursor-pointer text-white text-sm"
                          >
                            {material.material_name || material.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {materialAutoFactorStatus && (
                    <p className="text-xs text-green-400 mt-1">{materialAutoFactorStatus}</p>
                  )}
                </div>

                {/* 배출계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (tCO2/단위) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={matdirForm.factor}
                    onChange={(e) => handleMatdirInputChange('factor', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0.0000"
                  />
                </div>

                {/* 수량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    수량 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={matdirForm.amount}
                    onChange={(e) => handleMatdirInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* 산화계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    산화계수
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={matdirForm.oxyfactor}
                    onChange={(e) => handleMatdirInputChange('oxyfactor', parseFloat(e.target.value) || 1.0000)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="1.0000"
                  />
                </div>

                {/* 계산 결과 미리보기 */}
                {matdirForm.amount > 0 && matdirForm.factor > 0 && (
                  <div className="bg-gray-600 p-3 rounded-md">
                    <div className="text-sm text-gray-300">
                      예상 배출량: {calculateEmission(matdirForm).toFixed(4)} tCO2
                    </div>
                    <div className="text-xs text-gray-400">
                      {matdirForm.amount} × {matdirForm.factor} × {matdirForm.oxyfactor}
                    </div>
                  </div>
                )}

                {/* 저장 버튼 */}
                <button
                  onClick={saveMatdirData}
                  disabled={isCalculating || !matdirForm.name || matdirForm.amount <= 0}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {isCalculating ? '저장 중...' : '원료 저장'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 연료명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    연료명 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fueldirForm.name}
                      onChange={(e) => handleFueldirInputChange('name', e.target.value)}
                      onFocus={() => handleFuelSearch(fueldirForm.name)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                      placeholder="연료명을 입력하세요"
                    />
                    {showSuggestions && fuelSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                        {fuelSuggestions.map((fuel) => (
                          <div
                            key={fuel.id}
                            onClick={() => handleFuelSelect(fuel)}
                            className="px-3 py-2 hover:bg-gray-500 cursor-pointer text-white text-sm"
                          >
                            {fuel.fuel_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {autoFactorStatus && (
                    <p className="text-xs text-green-400 mt-1">{autoFactorStatus}</p>
                  )}
                </div>

                {/* 배출계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (tCO2/단위) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fueldirForm.factor}
                    onChange={(e) => handleFueldirInputChange('factor', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0.0000"
                  />
                </div>

                {/* 수량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    수량 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fueldirForm.amount}
                    onChange={(e) => handleFueldirInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* 산화계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    산화계수
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fueldirForm.oxyfactor}
                    onChange={(e) => handleFueldirInputChange('oxyfactor', parseFloat(e.target.value) || 1.0000)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="1.0000"
                  />
                </div>

                {/* 계산 결과 미리보기 */}
                {fueldirForm.amount > 0 && fueldirForm.factor > 0 && (
                  <div className="bg-gray-600 p-3 rounded-md">
                    <div className="text-sm text-gray-300">
                      예상 배출량: {calculateEmission(fueldirForm).toFixed(4)} tCO2
                    </div>
                    <div className="text-xs text-gray-400">
                      {fueldirForm.amount} × {fueldirForm.factor} × {fueldirForm.oxyfactor}
                    </div>
                  </div>
                )}

                {/* 저장 버튼 */}
                <button
                  onClick={saveFueldirData}
                  disabled={isCalculating || !fueldirForm.name || fueldirForm.amount <= 0}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {isCalculating ? '저장 중...' : '연료 저장'}
                </button>
              </div>
            )}
          </div>

          {/* 결과 목록 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              {activeTab === 'matdir' ? '원료' : '연료'} 목록
            </h3>
            
            {isLoadingData ? (
              <div className="text-center py-8 text-gray-400">
                데이터 로딩 중...
              </div>
            ) : inputResults.filter(item => item.type === activeTab).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                등록된 {activeTab === 'matdir' ? '원료' : '연료'}가 없습니다.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inputResults
                  .filter(item => item.type === activeTab)
                  .map((result) => (
                    <div
                      key={result.id}
                      className="bg-gray-600 p-3 rounded-md border border-gray-500"
                    >
                      {editingResult?.id === result.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white text-sm"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              step="0.0001"
                              value={editForm.factor}
                              onChange={(e) => setEditForm(prev => ({ ...prev, factor: parseFloat(e.target.value) || 0 }))}
                              className="px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white text-xs"
                              placeholder="계수"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              className="px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white text-xs"
                              placeholder="수량"
                            />
                            <input
                              type="number"
                              step="0.0001"
                              value={editForm.oxyfactor}
                              onChange={(e) => setEditForm(prev => ({ ...prev, oxyfactor: parseFloat(e.target.value) || 1.0000 }))}
                              className="px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white text-xs"
                              placeholder="산화"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleEditSave}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEdit(result)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(result)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>배출계수: {result.factor}</div>
                            <div>수량: {result.amount}</div>
                            <div>산화계수: {result.oxyfactor}</div>
                            <div className="font-medium text-green-400">
                              배출량: {result.emission.toFixed(4)} tCO2
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 하단 요약 */}
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">배출량 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-600 p-3 rounded-md">
              <div className="text-sm text-gray-300">원료직접배출량</div>
              <div className="text-xl font-bold text-blue-400">{totalMatdirEmission.toFixed(4)} tCO2</div>
            </div>
            <div className="bg-gray-600 p-3 rounded-md">
              <div className="text-sm text-gray-300">연료직접배출량</div>
              <div className="text-xl font-bold text-green-400">{totalFueldirEmission.toFixed(4)} tCO2</div>
            </div>
            <div className="bg-gray-600 p-3 rounded-md">
              <div className="text-sm text-gray-300">총 배출량</div>
              <div className="text-xl font-bold text-white">{totalEmission.toFixed(4)} tCO2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
