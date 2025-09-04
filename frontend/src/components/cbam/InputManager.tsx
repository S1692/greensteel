'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
import { useFuelMasterAPI } from '@/hooks/useFuelMasterAPI';
import { useMaterialMasterAPI } from '@/hooks/useMaterialMasterAPI';
import { FuelMaster, MaterialMaster } from '@/lib/types';

interface InputManagerProps {
  selectedProcess: any;
  selectedProduct?: any; // 선택된 제품 정보 추가
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

export default function InputManager({ selectedProcess, selectedProduct, onClose, onDataSaved }: InputManagerProps) {
  // Fuel Master API Hook
  const { searchFuels, getFuelFactor, getAllFuels } = useFuelMasterAPI();
  
  // Material Master API Hook
  const { lookupMaterialByName, getMaterialMasterList } = useMaterialMasterAPI();

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
  
  // 드롭다운을 위한 전체 목록 상태
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allFuels, setAllFuels] = useState<FuelMaster[]>([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  
  // 로컬 스토리지 input data에서 투입물명 목록
  const [inputMaterialNames, setInputMaterialNames] = useState<string[]>([]);
  const [inputFuelNames, setInputFuelNames] = useState<string[]>([]);

  // 수정 모드 상태
  const [editingResult, setEditingResult] = useState<InputResult | null>(null);
  const [editForm, setEditForm] = useState<InputForm>({
    name: '',
    factor: 0,
    amount: 0,
    oxyfactor: 1.0000
  });

  // ============================================================================
  // 📋 드롭다운용 전체 목록 로드
  // ============================================================================

  const loadAllMaterials = useCallback(async () => {
    try {
      console.log('🔍 원료 목록 로드 시작...');
      const response = await getMaterialMasterList();
      console.log('✅ 원료 목록 로드 성공:', response);
      setAllMaterials(response || []);
    } catch (error) {
      console.error('❌ 원료 목록 로드 실패:', error);
      setAllMaterials([]);
    }
  }, [getMaterialMasterList]);

  const loadAllFuels = useCallback(async () => {
    try {
      console.log('🔍 연료 목록 로드 시작...');
      const response = await getAllFuels();
      console.log('✅ 연료 목록 로드 성공:', response);
      if (response && response.fuels) {
        setAllFuels(response.fuels);
      } else if (Array.isArray(response)) {
        setAllFuels(response);
      }
    } catch (error) {
      console.error('❌ 연료 목록 로드 실패:', error);
      setAllFuels([]);
    }
  }, [getAllFuels]);

  // ============================================================================
  // 📋 로컬 스토리지 input data에서 투입물명 추출
  // ============================================================================

  const loadInputDataNames = useCallback(() => {
    try {
      console.log('🔍 로컬 스토리지 input data에서 투입물명 추출 시작...');
      console.log('선택된 제품:', selectedProduct);
      
      // 로컬 스토리지에서 input data 가져오기
      const storedData = localStorage.getItem('cbam_input_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        let inputDataArray = [];
        
        // 데이터 구조에 따라 배열 추출
        if (Array.isArray(parsedData)) {
          inputDataArray = parsedData;
        } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          inputDataArray = parsedData.data;
        }
        
        // 선택된 제품에 해당하는 투입물명만 필터링
        let filteredData = inputDataArray;
        if (selectedProduct && selectedProduct.product_name) {
          filteredData = inputDataArray.filter((item: any) => 
            item.생산품명 === selectedProduct.product_name
          );
          console.log('제품별 필터링된 데이터:', filteredData.length, '개');
        }
        
        // 투입물명 추출 및 중복 제거
        const materialNames: string[] = [...new Set(
          filteredData
            .map((item: any) => item.투입물명)
            .filter((name: string) => name && name.trim())
        )] as string[];
        
        console.log('✅ 추출된 투입물명 목록:', materialNames);
        setInputMaterialNames(materialNames);
        setInputFuelNames(materialNames); // 연료도 동일한 투입물명 사용
      } else {
        console.log('⚠️ 로컬 스토리지에 input data가 없습니다.');
        setInputMaterialNames([]);
        setInputFuelNames([]);
      }
    } catch (error) {
      console.error('❌ 투입물명 추출 실패:', error);
      setInputMaterialNames([]);
      setInputFuelNames([]);
    }
  }, [selectedProduct]);

  // ============================================================================
  // 🔍 기존 데이터 로드 (공정별 데이터는 제거하고 마스터 테이블만 사용)
  // ============================================================================

  const loadAllExistingData = useCallback(async () => {
    // 로컬 스토리지에서 기존 계산 데이터 로드
    try {
      const existingData = localStorage.getItem('cbam_emission_calculations');
      if (existingData) {
        const calculations = JSON.parse(existingData);
        const results: InputResult[] = calculations.map((item: any) => ({
          id: item.id,
          name: item.mat_name || item.fuel_name || item.name,
          factor: item.emission_factor || item.factor || 0,
          amount: item.amount || 0,
          oxyfactor: item.oxyfactor || 1.0000,
          emission: item.emission || 0,
          calculation_formula: item.calculation_formula || '',
          type: item.type === 'material' ? 'matdir' : 'fueldir',
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        setInputResults(results);
        console.log('✅ 로컬 스토리지에서 기존 데이터 로드 완료:', results.length, '개 항목');
      } else {
        setInputResults([]);
        console.log('✅ 로컬 스토리지에 기존 데이터 없음');
      }
    } catch (error) {
      console.error('❌ 로컬 스토리지 데이터 로드 실패:', error);
      setInputResults([]);
    }
  }, []);

  // 컴포넌트 마운트 시 기존 데이터 로드
  useEffect(() => {
    if (selectedProcess?.id) {
      loadAllExistingData();
      loadAllMaterials();
      loadAllFuels();
      loadInputDataNames();
    }
  }, [selectedProcess?.id, loadAllExistingData, loadAllMaterials, loadAllFuels, loadInputDataNames]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowMaterialDropdown(false);
        setShowFuelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleMaterialSelect = useCallback(async (selectedName: string) => {
    try {
      console.log('🔍 선택된 투입물명:', selectedName);
      
      // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
      const matchedMaterial = allMaterials.find(m => {
        const matName = m.mat_name || m.item_name || '';
        return matName.toLowerCase().includes(selectedName.toLowerCase()) || 
               selectedName.toLowerCase().includes(matName.toLowerCase());
      });
      
      if (matchedMaterial) {
        // 배출계수 자동 계산: carbon_content × mat_factor
        const carbonContent = matchedMaterial.carbon_content || matchedMaterial.carbon_factor || 0;
        const matFactor = matchedMaterial.mat_factor || matchedMaterial.em_factor || 0;
        const emissionFactor = carbonContent * matFactor;
        
        setMatdirForm(prev => ({
          ...prev,
          name: selectedName,
          factor: emissionFactor
        }));
        
        setMaterialAutoFactorStatus(`✅ ${selectedName} → ${matchedMaterial.mat_name || matchedMaterial.item_name} 자동 배출계수 적용: ${emissionFactor.toFixed(4)}`);
        console.log('✅ 마스터 테이블 매칭 성공:', matchedMaterial);
      } else {
        // 마스터 테이블에 일치하는 항목이 없는 경우
        setMatdirForm(prev => ({
          ...prev,
          name: selectedName,
          factor: 0
        }));
        
        setMaterialAutoFactorStatus(`⚠️ ${selectedName}에 해당하는 마스터 테이블 항목을 찾을 수 없습니다. 수동으로 배출계수를 입력해주세요.`);
        console.log('⚠️ 마스터 테이블 매칭 실패:', selectedName);
      }
      
      setShowMaterialSuggestions(false);
      setShowMaterialDropdown(false);
      
      // 5초 후 상태 메시지 제거
      setTimeout(() => setMaterialAutoFactorStatus(''), 5000);
    } catch (error) {
      console.error('원료 배출계수 적용 실패:', error);
      setMaterialAutoFactorStatus('❌ 배출계수 적용 실패');
    }
  }, [allMaterials]);

  const handleFuelSelect = useCallback(async (selectedName: string) => {
    try {
      console.log('🔍 선택된 투입물명 (연료):', selectedName);
      
      // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
      const matchedFuel = allFuels.find(f => {
        const fuelName = f.fuel_name || '';
        return fuelName.toLowerCase().includes(selectedName.toLowerCase()) || 
               selectedName.toLowerCase().includes(fuelName.toLowerCase());
      });
      
      if (matchedFuel) {
        // 배출계수 자동 계산: fuel_factor × net_calory
        const fuelFactor = matchedFuel.fuel_factor || 0;
        const netCalory = matchedFuel.net_calory || 0;
        const emissionFactor = fuelFactor * netCalory;
        
        setFueldirForm(prev => ({
          ...prev,
          name: selectedName,
          factor: emissionFactor
        }));
        
        setAutoFactorStatus(`✅ ${selectedName} → ${matchedFuel.fuel_name} 자동 배출계수 적용: ${emissionFactor.toFixed(4)}`);
        console.log('✅ 마스터 테이블 매칭 성공:', matchedFuel);
      } else {
        // 마스터 테이블에 일치하는 항목이 없는 경우
        setFueldirForm(prev => ({
          ...prev,
          name: selectedName,
          factor: 0
        }));
        
        setAutoFactorStatus(`⚠️ ${selectedName}에 해당하는 마스터 테이블 항목을 찾을 수 없습니다. 수동으로 배출계수를 입력해주세요.`);
        console.log('⚠️ 마스터 테이블 매칭 실패:', selectedName);
      }
      
      setShowSuggestions(false);
      setShowFuelDropdown(false);
      
      // 5초 후 상태 메시지 제거
      setTimeout(() => setAutoFactorStatus(''), 5000);
    } catch (error) {
      console.error('연료 배출계수 적용 실패:', error);
      setAutoFactorStatus('❌ 배출계수 적용 실패');
    }
  }, [allFuels]);

  // ============================================================================
  // 💾 데이터 저장
  // ============================================================================

  const saveMatdirData = useCallback(async () => {
    if (!matdirForm.name || matdirForm.amount <= 0) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
    const matchedMaterial = allMaterials.find(m => {
      const matName = m.mat_name || m.item_name || '';
      return matName.toLowerCase().includes(matdirForm.name.toLowerCase()) || 
             matdirForm.name.toLowerCase().includes(matName.toLowerCase());
    });

    if (!matchedMaterial) {
      alert('선택한 투입물명에 해당하는 마스터 테이블 항목을 찾을 수 없습니다.\n저장할 수 없습니다.');
      return;
    }

    setIsCalculating(true);
    try {
      const emission = calculateEmission(matdirForm);
      
      // 로컬 스토리지에 저장 (이미지 요구사항에 따라)
      const localData = {
        id: Date.now(),
        type: 'material',
        mat_name: matdirForm.name,
        mat_engname: matchedMaterial.mat_engname || matchedMaterial.item_eng || '',
        carbon_content: matchedMaterial.carbon_content || matchedMaterial.carbon_factor || 0,
        mat_factor: matchedMaterial.mat_factor || matchedMaterial.em_factor || 0,
        emission_factor: matdirForm.factor,
        amount: matdirForm.amount,
        oxyfactor: matdirForm.oxyfactor,
        emission: emission,
        calculation_formula: `${matdirForm.amount} × ${matdirForm.factor} × ${matdirForm.oxyfactor} = ${emission}`,
        created_at: new Date().toISOString()
      };
      
      // 기존 로컬 스토리지 데이터 가져오기
      const existingData = localStorage.getItem('cbam_emission_calculations');
      let calculations = existingData ? JSON.parse(existingData) : [];
      calculations.push(localData);
      localStorage.setItem('cbam_emission_calculations', JSON.stringify(calculations));
      
      // 화면에 표시용 결과 추가
      const newResult: InputResult = {
        id: Date.now(),
        name: matdirForm.name,
        factor: matdirForm.factor,
        amount: matdirForm.amount,
        oxyfactor: matdirForm.oxyfactor,
        emission: emission,
        calculation_formula: localData.calculation_formula,
        type: 'matdir',
        created_at: new Date().toISOString()
      };

      setInputResults(prev => [...prev, newResult]);
      
      // 폼 초기화
      setMatdirForm({
        name: '',
        factor: 0,
        amount: 0,
        oxyfactor: 1.0000
      });

      console.log('✅ 원료직접배출량 계산 완료:', newResult);
      console.log('✅ 로컬 스토리지 저장 완료:', localData);
      
      // 콜백 호출
      if (onDataSaved) {
        onDataSaved();
      }
    } catch (error) {
      console.error('❌ 원료직접배출량 계산 실패:', error);
      alert('계산에 실패했습니다.');
    } finally {
      setIsCalculating(false);
    }
  }, [matdirForm, calculateEmission, onDataSaved, allMaterials]);

  const saveFueldirData = useCallback(async () => {
    if (!fueldirForm.name || fueldirForm.amount <= 0) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
    const matchedFuel = allFuels.find(f => {
      const fuelName = f.fuel_name || '';
      return fuelName.toLowerCase().includes(fueldirForm.name.toLowerCase()) || 
             fueldirForm.name.toLowerCase().includes(fuelName.toLowerCase());
    });

    if (!matchedFuel) {
      alert('선택한 투입물명에 해당하는 마스터 테이블 항목을 찾을 수 없습니다.\n저장할 수 없습니다.');
      return;
    }

    setIsCalculating(true);
    try {
      const emission = calculateEmission(fueldirForm);
      
      // 로컬 스토리지에 저장 (이미지 요구사항에 따라)
      const localData = {
        id: Date.now(),
        type: 'fuel',
        fuel_name: fueldirForm.name,
        fuel_engname: matchedFuel.fuel_engname || '',
        fuel_factor: matchedFuel.fuel_factor || 0,
        net_calory: matchedFuel.net_calory || 0,
        emission_factor: fueldirForm.factor,
        amount: fueldirForm.amount,
        oxyfactor: fueldirForm.oxyfactor,
        emission: emission,
        calculation_formula: `${fueldirForm.amount} × ${fueldirForm.factor} × ${fueldirForm.oxyfactor} = ${emission}`,
        created_at: new Date().toISOString()
      };
      
      // 기존 로컬 스토리지 데이터 가져오기
      const existingData = localStorage.getItem('cbam_emission_calculations');
      let calculations = existingData ? JSON.parse(existingData) : [];
      calculations.push(localData);
      localStorage.setItem('cbam_emission_calculations', JSON.stringify(calculations));
      
      // 화면에 표시용 결과 추가
      const newResult: InputResult = {
        id: Date.now(),
        name: fueldirForm.name,
        factor: fueldirForm.factor,
        amount: fueldirForm.amount,
        oxyfactor: fueldirForm.oxyfactor,
        emission: emission,
        calculation_formula: localData.calculation_formula,
        type: 'fueldir',
        created_at: new Date().toISOString()
      };

      setInputResults(prev => [...prev, newResult]);
      
      // 폼 초기화
      setFueldirForm({
        name: '',
        factor: 0,
        amount: 0,
        oxyfactor: 1.0000
      });

      console.log('✅ 연료직접배출량 계산 완료:', newResult);
      console.log('✅ 로컬 스토리지 저장 완료:', localData);
      
      // 콜백 호출
      if (onDataSaved) {
        onDataSaved();
      }
    } catch (error) {
      console.error('❌ 연료직접배출량 계산 실패:', error);
      alert('계산에 실패했습니다.');
    } finally {
      setIsCalculating(false);
    }
  }, [fueldirForm, calculateEmission, onDataSaved, allFuels]);

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
      
      // 로컬 스토리지에서 해당 항목 찾아서 업데이트
      const existingData = localStorage.getItem('cbam_emission_calculations');
      if (existingData) {
        let calculations = JSON.parse(existingData);
        const index = calculations.findIndex((item: any) => item.id === editingResult.id);
        
        if (index !== -1) {
          calculations[index] = {
            ...calculations[index],
            ...editForm,
            emission: emission,
            calculation_formula: `${editForm.amount} × ${editForm.factor} × ${editForm.oxyfactor} = ${emission}`,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem('cbam_emission_calculations', JSON.stringify(calculations));
        }
      }
      
      // 화면 상태 업데이트
      setInputResults(prev => prev.map(item => 
        item.id === editingResult.id 
          ? { ...item, ...editForm, emission, calculation_formula: `${editForm.amount} × ${editForm.factor} × ${editForm.oxyfactor} = ${emission}` }
          : item
      ));
      
      setEditingResult(null);
      console.log('✅ 수정 완료:', editingResult.id);
      
      // 콜백 호출
      if (onDataSaved) {
        onDataSaved();
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
      // 로컬 스토리지에서 해당 항목 삭제
      const existingData = localStorage.getItem('cbam_emission_calculations');
      if (existingData) {
        let calculations = JSON.parse(existingData);
        calculations = calculations.filter((item: any) => item.id !== result.id);
        localStorage.setItem('cbam_emission_calculations', JSON.stringify(calculations));
      }
      
      // 화면 상태에서도 삭제
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
                    투입된 원료명 (자유 입력 가능) *
                  </label>
                  <div className="relative dropdown-container">
                    <input
                      type="text"
                      value={matdirForm.name}
                      onChange={(e) => {
                        handleMatdirInputChange('name', e.target.value);
                        setShowMaterialDropdown(true);
                      }}
                      onFocus={() => setShowMaterialDropdown(true)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                      placeholder="예: 직접환원철, EAF 탄소 전극"
                    />
                    {showMaterialDropdown && inputMaterialNames.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                        {inputMaterialNames
                          .filter(name => 
                            name.toLowerCase().includes(matdirForm.name.toLowerCase())
                          )
                          .map((name, index) => (
                            <div
                              key={index}
                              onClick={() => handleMaterialSelect(name)}
                              className="px-3 py-2 hover:bg-gray-500 cursor-pointer text-white text-sm"
                            >
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-gray-300">
                                로컬 스토리지 투입물명
                              </div>
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
                    배출계수 *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={matdirForm.factor}
                    onChange={(e) => handleMatdirInputChange('factor', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0"
                  />
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <span className="mr-1">💡</span>
                    <span>마스터 테이블 매칭 시 자동 계산, 매칭 실패 시 수동 입력</span>
                  </div>
                </div>

                {/* 수량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 원료량 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={matdirForm.amount}
                    onChange={(e) => handleMatdirInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0"
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
                    onChange={(e) => handleMatdirInputChange('oxyfactor', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="1"
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
                  {isCalculating ? '계산 중...' : '원료직접배출량 계산'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 연료명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 연료명 (자유 입력 가능) *
                  </label>
                  <div className="relative dropdown-container">
                    <input
                      type="text"
                      value={fueldirForm.name}
                      onChange={(e) => {
                        handleFueldirInputChange('name', e.target.value);
                        setShowFuelDropdown(true);
                      }}
                      onFocus={() => setShowFuelDropdown(true)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                      placeholder="예: 원유, 휘발유, 등유"
                    />
                    {showFuelDropdown && inputFuelNames.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                        {inputFuelNames
                          .filter(name => 
                            name.toLowerCase().includes(fueldirForm.name.toLowerCase())
                          )
                          .map((name, index) => (
                            <div
                              key={index}
                              onClick={() => handleFuelSelect(name)}
                              className="px-3 py-2 hover:bg-gray-500 cursor-pointer text-white text-sm"
                            >
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-gray-300">
                                로컬 스토리지 투입물명
                              </div>
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
                    배출계수 *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fueldirForm.factor}
                    onChange={(e) => handleFueldirInputChange('factor', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0"
                  />
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <span className="mr-1">💡</span>
                    <span>마스터 테이블 매칭 시 자동 계산, 매칭 실패 시 수동 입력</span>
                  </div>
                </div>

                {/* 수량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 연료량 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fueldirForm.amount}
                    onChange={(e) => handleFueldirInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="0"
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
                  {isCalculating ? '계산 중...' : '연료직접배출량 계산'}
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
