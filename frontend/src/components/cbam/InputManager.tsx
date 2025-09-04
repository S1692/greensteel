'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMaterialMasterAPI } from '@/hooks/useMaterialMasterAPI';
import { useFuelMasterAPI } from '@/hooks/useFuelMasterAPI';

interface InputManagerProps {
  selectedProcess: any;
  selectedProduct?: any;
  onClose: () => void;
  onDataSaved?: () => void;
}

interface InputForm {
  name: string;
  factor: number;
  amount: number;
  oxyfactor: number;
}

interface InputResult {
  id: number;
  name: string;
  factor: number;
  amount: number;
  oxyfactor: number;
  emission: number;
  calculation_formula: string;
  type: 'matdir' | 'fueldir';
  created_at: string;
}

export default function InputManager({ selectedProcess, selectedProduct, onClose, onDataSaved }: InputManagerProps) {
  const { getMaterialMasterList } = useMaterialMasterAPI();
  const { getAllFuels } = useFuelMasterAPI();
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'matdir' | 'fueldir'>('matdir');

  // 폼 상태
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
  
  // 계산 상태
  const [isCalculating, setIsCalculating] = useState(false);
  
  // 마스터 테이블 데이터
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allFuels, setAllFuels] = useState<any[]>([]);
  
  // 드롭다운 상태
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  
  // 로컬 스토리지 input data에서 투입물명 목록
  const [inputMaterialNames, setInputMaterialNames] = useState<string[]>([]);
  const [inputFuelNames, setInputFuelNames] = useState<string[]>([]);
  
  // 투입물 정보 (이름과 수량을 함께 저장)
  const [inputMaterialData, setInputMaterialData] = useState<Array<{name: string, amount: number, unit: string}>>([]);
  const [inputFuelData, setInputFuelData] = useState<Array<{name: string, amount: number, unit: string}>>([]);

  // ============================================================================
  // 📋 마스터 테이블 데이터 로드 (배출계수 계산용)
  // ============================================================================

  const loadAllMaterials = useCallback(async () => {
    try {
      console.log('🔍 원료 마스터 테이블 로드 시작...');
      const response = await getMaterialMasterList();
      console.log('✅ 원료 마스터 테이블 로드 성공:', response);
      setAllMaterials(response || []);
    } catch (error: any) {
      console.error('❌ 원료 마스터 테이블 로드 실패:', error);
      console.error('❌ 오류 상세:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data
      });
      setAllMaterials([]);
    }
  }, [getMaterialMasterList]);

  const loadAllFuels = useCallback(async () => {
    try {
      console.log('🔍 연료 마스터 테이블 로드 시작...');
      const response = await getAllFuels();
      console.log('✅ 연료 마스터 테이블 로드 성공:', response);
      if (response && response.fuels) {
        setAllFuels(response.fuels);
      } else if (Array.isArray(response)) {
        setAllFuels(response);
      }
    } catch (error: any) {
      console.error('❌ 연료 마스터 테이블 로드 실패:', error);
      console.error('❌ 오류 상세:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data
      });
      setAllFuels([]);
    }
  }, [getAllFuels]);

  // ============================================================================
  // 📋 로컬 스토리지 input data에서 투입물명 추출
  // ============================================================================

  const loadInputDataNames = useCallback(() => {
    try {
      console.log('🔍 로컬 스토리지에서 투입물명 추출 시작...');
      console.log('선택된 제품:', selectedProduct);
      console.log('선택된 제품명:', selectedProduct?.product_name);
      console.log('선택된 공정:', selectedProcess);
      console.log('선택된 공정명:', selectedProcess?.process_name);
      
      // 로컬 스토리지에서 input data 가져오기
      const storedData = localStorage.getItem('cbam_input_data');
      console.log('🔍 로컬 스토리지 원본 데이터 (문자열):', storedData);
      
      if (!storedData) {
        console.log('⚠️ 로컬 스토리지에 input data가 없습니다.');
        setInputMaterialNames([]);
        setInputFuelNames([]);
        return;
      }

      const parsedData = JSON.parse(storedData);
      console.log('🔍 로컬 스토리지 파싱된 데이터:', parsedData);
      
      // 데이터 구조 파악 및 배열 추출
      let inputDataArray = [];
      if (Array.isArray(parsedData)) {
        inputDataArray = parsedData;
        console.log('📊 배열 형태 데이터:', inputDataArray.length, '개');
      } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        inputDataArray = parsedData.data;
        console.log('📊 API 응답 형태 데이터:', inputDataArray.length, '개');
      } else {
        console.log('⚠️ 알 수 없는 데이터 구조:', parsedData);
        setInputMaterialNames([]);
        setInputFuelNames([]);
        return;
      }
      
      console.log('📋 전체 input data 샘플:', inputDataArray.slice(0, 3));
      
      // 제품명과 공정명으로 필터링 (더 유연한 매칭)
      let filteredData = inputDataArray;
      if (selectedProduct && selectedProcess && selectedProduct.product_name && selectedProcess.process_name) {
        const selectedProductName = selectedProduct.product_name.trim();
        const selectedProcessName = selectedProcess.process_name.trim();
        
        console.log('🔍 검색할 제품명:', `"${selectedProductName}"`, '🔍 검색할 공정명:', `"${selectedProcessName}"`);
        
        filteredData = inputDataArray.filter((item: any) => {
          const itemProductName = (item.생산품명 || '').trim();
          const itemProcessName = (item.공정 || '').trim();
          
          // 엄격한 매칭: 제품명과 공정명이 정확히 일치해야 함
          const isProductMatch = itemProductName === selectedProductName;
          const isProcessMatch = itemProcessName === selectedProcessName;
          
          // 제품명과 공정명이 모두 정확히 일치하는 경우만 필터링
          const isMatch = isProductMatch && isProcessMatch;
          
          if (isMatch) {
            console.log('✅ 정확히 매칭된 항목:', item.생산품명, '|', item.공정, '→', item.투입물명);
          }
          return isMatch;
        });
        
        console.log(`🎯 제품 "${selectedProduct.product_name}"의 공정 "${selectedProcess.process_name}"에 해당하는 데이터:`, filteredData.length, '개');
        
        // 매칭된 데이터가 없으면 전체 데이터 사용
        if (filteredData.length === 0) {
          console.log('⚠️ 매칭된 데이터가 없어서 전체 데이터를 사용합니다.');
          filteredData = inputDataArray;
        }
      } else {
        console.log('⚠️ 선택된 제품 또는 공정이 없어서 전체 데이터를 사용합니다.');
      }
      
      // 투입물 정보 추출 (이름, 수량, 단위를 함께 저장)
      const materialDataMap = new Map<string, {name: string, amount: number, unit: string}>();
      const fuelDataMap = new Map<string, {name: string, amount: number, unit: string}>();
      
      filteredData.forEach((item: any) => {
        const 투입물명 = item.투입물명;
        const 수량 = item.수량 || 0;
        const 단위 = item.단위 || '톤';
        
        if (투입물명 && 투입물명.trim()) {
          // 원료와 연료 모두 동일한 데이터 사용
          materialDataMap.set(투입물명, { name: 투입물명, amount: 수량, unit: 단위 });
          fuelDataMap.set(투입물명, { name: 투입물명, amount: 수량, unit: 단위 });
        }
      });
      
      const materialData = Array.from(materialDataMap.values());
      const fuelData = Array.from(fuelDataMap.values());
      const materialNames = materialData.map(item => item.name);
      const fuelNames = fuelData.map(item => item.name);
      
      console.log('✅ 추출된 투입물 정보:', {
        materialData: materialData.slice(0, 3), // 처음 3개만 로그
        fuelData: fuelData.slice(0, 3),
        materialNames: materialNames.slice(0, 5), // 처음 5개만 로그
        fuelNames: fuelNames.slice(0, 5)
      });
      
      setInputMaterialNames(materialNames);
      setInputFuelNames(fuelNames);
      setInputMaterialData(materialData);
      setInputFuelData(fuelData);
      
    } catch (error) {
      console.error('❌ 투입물명 추출 실패:', error);
      setInputMaterialNames([]);
      setInputFuelNames([]);
      setInputMaterialData([]);
      setInputFuelData([]);
    }
  }, [selectedProduct, selectedProcess]);

  // ============================================================================
  // 🔍 기존 데이터 로드
  // ============================================================================

  const loadAllExistingData = useCallback(async () => {
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
          created_at: item.created_at
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

  // ============================================================================
  // 🔍 투입물명 선택 처리 (로컬 스토리지 + 마스터 테이블 매칭)
  // ============================================================================

  const handleMaterialSelect = useCallback((selectedName: string) => {
    try {
      console.log('🔍 선택된 투입물명 (원료):', selectedName);
      
      // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
      const matchedMaterial = allMaterials.find(m => {
        const matName = m.mat_name || m.item_name || '';
        return matName.toLowerCase().includes(selectedName.toLowerCase()) || 
               selectedName.toLowerCase().includes(matName.toLowerCase());
      });
      
      // 저장된 투입물 데이터에서 수량 가져오기
      const matchedInputData = inputMaterialData.find(item => item.name === selectedName);
      const inputAmount = matchedInputData ? matchedInputData.amount : 0;
      
      console.log('🎯 저장된 투입물 데이터에서 수량 가져오기 (원료):', {
        selectedName,
        matchedInputData,
        inputAmount
      });
      
      if (matchedMaterial) {
        // 배출계수 자동 계산: mat_factor만 사용
        const matFactor = matchedMaterial.mat_factor || matchedMaterial.em_factor || 0;
        
        setMatdirForm({
          name: selectedName,
          factor: matFactor,
          amount: inputAmount,
          oxyfactor: 1.0000
        });
        
        console.log('✅ 마스터 테이블 매칭 성공:', matchedMaterial);
        console.log('✅ 투입량 자동 설정:', inputAmount);
      } else {
        // 마스터 테이블에 일치하는 항목이 없는 경우
        setMatdirForm({
          name: selectedName,
          factor: 0,
          amount: inputAmount,
          oxyfactor: 1.0000
        });
        
        console.log('⚠️ 마스터 테이블 매칭 실패:', selectedName);
        console.log('✅ 투입량 자동 설정:', inputAmount);
      }
      
      setShowMaterialDropdown(false);
    } catch (error) {
      console.error('원료 선택 처리 실패:', error);
    }
  }, [allMaterials, selectedProduct, selectedProcess, inputMaterialData]);

  const handleFuelSelect = useCallback((selectedName: string) => {
    try {
      console.log('🔍 선택된 투입물명 (연료):', selectedName);
      
      // 마스터 테이블에서 해당 투입물명과 일치하는 항목 찾기
      const matchedFuel = allFuels.find(f => {
        const fuelName = f.fuel_name || '';
        return fuelName.toLowerCase().includes(selectedName.toLowerCase()) || 
               selectedName.toLowerCase().includes(fuelName.toLowerCase());
      });
      
      // 저장된 투입물 데이터에서 수량 가져오기
      const matchedInputData = inputFuelData.find(item => item.name === selectedName);
      const inputAmount = matchedInputData ? matchedInputData.amount : 0;
      
      console.log('🎯 저장된 투입물 데이터에서 수량 가져오기 (연료):', {
        selectedName,
        matchedInputData,
        inputAmount
      });
      
      if (matchedFuel) {
        // 배출계수 자동 계산: fuel_factor만 사용
        const fuelFactor = matchedFuel.fuel_factor || 0;
        
        setFueldirForm({
          name: selectedName,
          factor: fuelFactor,
          amount: inputAmount,
          oxyfactor: 1.0000
        });
        
        console.log('✅ 마스터 테이블 매칭 성공:', matchedFuel);
        console.log('✅ 투입량 자동 설정:', inputAmount);
      } else {
        // 마스터 테이블에 일치하는 항목이 없는 경우
        setFueldirForm({
          name: selectedName,
          factor: 0,
          amount: inputAmount,
          oxyfactor: 1.0000
        });
        
        console.log('⚠️ 마스터 테이블 매칭 실패:', selectedName);
        console.log('✅ 투입량 자동 설정:', inputAmount);
      }
      
      setShowFuelDropdown(false);
    } catch (error) {
      console.error('연료 선택 처리 실패:', error);
    }
  }, [allFuels, selectedProduct, selectedProcess, inputFuelData]);

  // ============================================================================
  // 💾 데이터 저장
  // ============================================================================

  const calculateEmission = (form: InputForm) => {
    return form.amount * form.factor * form.oxyfactor;
  };

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
      
      // 로컬 스토리지에 저장
      const localData = {
        id: Date.now(),
        type: 'material',
        process_id: selectedProcess?.id,
        process_name: selectedProcess?.process_name,
        install_id: selectedProcess?.install_id,
        install_name: selectedProcess?.install_name,
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
      
      console.log('🔍 원료직접배출량 저장 데이터:', localData);
      
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
  }, [matdirForm, allMaterials, selectedProcess, onDataSaved]);

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
      
      // 로컬 스토리지에 저장
      const localData = {
        id: Date.now(),
        type: 'fuel',
        process_id: selectedProcess?.id,
        process_name: selectedProcess?.process_name,
        install_id: selectedProcess?.install_id,
        install_name: selectedProcess?.install_name,
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
      
      console.log('🔍 연료직접배출량 저장 데이터:', localData);
      
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
  }, [fueldirForm, allFuels, selectedProcess, onDataSaved]);

  // ============================================================================
  // 🗑️ 데이터 삭제
  // ============================================================================

  const handleDelete = useCallback((id: number) => {
    try {
      // 로컬 스토리지에서 삭제
      const existingData = localStorage.getItem('cbam_emission_calculations');
      if (existingData) {
        const calculations = JSON.parse(existingData);
        const updatedCalculations = calculations.filter((item: any) => item.id !== id);
        localStorage.setItem('cbam_emission_calculations', JSON.stringify(updatedCalculations));
      }
      
      // 화면에서 삭제
      setInputResults(prev => prev.filter(result => result.id !== id));
      
      console.log('✅ 데이터 삭제 완료:', id);
        
        // 콜백 호출
        if (onDataSaved) {
          onDataSaved();
      }
    } catch (error) {
      console.error('❌ 데이터 삭제 실패:', error);
    }
  }, [onDataSaved]);

  // ============================================================================
  // 📊 통계 계산
  // ============================================================================

  const totalMatdirEmission = inputResults
    .filter(result => result.type === 'matdir')
    .reduce((sum, result) => sum + result.emission, 0);

  const totalFueldirEmission = inputResults
    .filter(result => result.type === 'fueldir')
    .reduce((sum, result) => sum + result.emission, 0);

  const totalEmission = totalMatdirEmission + totalFueldirEmission;

  // ============================================================================
  // 🚀 초기화
  // ============================================================================

  useEffect(() => {
    console.log('🔍 InputManager useEffect 실행됨');
    console.log('🔍 selectedProcess:', selectedProcess);
    console.log('🔍 selectedProcess 상세 정보:', {
      id: selectedProcess?.id,
      process_name: selectedProcess?.process_name,
      install_id: selectedProcess?.install_id,
      install_name: selectedProcess?.install_name,
      product_names: selectedProcess?.product_names
    });
    console.log('🔍 selectedProduct:', selectedProduct);
    console.log('🔍 selectedProduct 상세 정보:', {
      id: selectedProduct?.id,
      product_name: selectedProduct?.product_name,
      install_id: selectedProduct?.install_id
    });
    
    if (selectedProcess?.id) {
      console.log('🚀 InputManager 초기화 시작...');
      loadAllExistingData(); // 기존 계산 데이터 로드
      loadAllMaterials(); // 마스터 테이블 로드 (배출계수 계산용)
      loadAllFuels(); // 마스터 테이블 로드 (배출계수 계산용)
      loadInputDataNames(); // 로컬 스토리지에서 투입물명 추출
    } else {
      console.log('⚠️ selectedProcess.id가 없어서 초기화를 건너뜁니다.');
    }
  }, [selectedProcess?.id, selectedProcess, selectedProduct, loadAllExistingData, loadAllMaterials, loadAllFuels, loadInputDataNames]);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // 🎨 렌더링
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
              투입량 입력 - {selectedProcess.process_name}
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
        <div className="flex border-b border-gray-600 mb-6">
          <button
            onClick={() => setActiveTab('matdir')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'matdir'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>📊</span>
            원료직접배출량
          </button>
          <button
            onClick={() => setActiveTab('fueldir')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'fueldir'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>⛽</span>
            연료직접배출량
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 입력 폼 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              + {activeTab === 'matdir' ? '원료' : '연료'} | 공정 배출 활동량
            </h3>
            
            {activeTab === 'matdir' ? (
              <div className="space-y-4">
                {/* 원료명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 원료명 (드롭다운 선택) *
                  </label>
                  <div className="relative dropdown-container">
                    <div
                      onClick={() => setShowMaterialDropdown(true)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white cursor-pointer min-h-[42px] flex items-center"
                    >
                      {matdirForm.name || (
                        <span className="text-gray-400">드롭다운에서 선택하세요</span>
                      )}
                    </div>
                    {showMaterialDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {inputMaterialNames.length > 0 ? (
                          inputMaterialNames
                            .filter(name => {
                              if (!matdirForm.name) return true; // 입력이 없으면 모든 항목 표시
                              return name.toLowerCase().includes(matdirForm.name.toLowerCase());
                            })
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
                            ))
                        ) : (
                          <div className="px-3 py-2 text-gray-400 text-sm">
                            사용 가능한 투입물명이 없습니다.
                      </div>
                    )}
                  </div>
                  )}
                  </div>
                </div>

                {/* 배출계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (수정 불가)
                  </label>
                  <input
                    type="number"
                    value={matdirForm.factor}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md text-white cursor-not-allowed"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400">💡</span>
                    <span className="text-xs text-gray-400">
                      배출계수는 Master Table의 값만 사용 가능합니다
                    </span>
                  </div>
                </div>

                {/* 투입량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 원료량
                  </label>
                  <input
                    type="number"
                    value={matdirForm.amount}
                    onChange={(e) => setMatdirForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
                    onChange={(e) => setMatdirForm(prev => ({ ...prev, oxyfactor: parseFloat(e.target.value) || 1.0000 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="1.0000"
                  />
                </div>

                {/* 계산 버튼 */}
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
                    투입된 연료명 (드롭다운 선택) *
                  </label>
                  <div className="relative dropdown-container">
                    <div
                      onClick={() => setShowFuelDropdown(true)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white cursor-pointer min-h-[42px] flex items-center"
                    >
                      {fueldirForm.name || (
                        <span className="text-gray-400">드롭다운에서 선택하세요</span>
                      )}
                    </div>
                                        {showFuelDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {inputFuelNames.length > 0 ? (
                          inputFuelNames
                            .filter(name => {
                              if (!fueldirForm.name) return true; // 입력이 없으면 모든 항목 표시
                              return name.toLowerCase().includes(fueldirForm.name.toLowerCase());
                            })
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
                            ))
                        ) : (
                          <div className="px-3 py-2 text-gray-400 text-sm">
                            사용 가능한 투입물명이 없습니다.
                      </div>
                    )}
                  </div>
                  )}
                  </div>
                </div>

                {/* 배출계수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배출계수 (수정 불가)
                  </label>
                  <input
                    type="number"
                    value={fueldirForm.factor}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md text-white cursor-not-allowed"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400">💡</span>
                    <span className="text-xs text-gray-400">
                      배출계수는 Master Table의 값만 사용 가능합니다
                    </span>
                  </div>
                </div>

                {/* 투입량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    투입된 연료량
                  </label>
                  <input
                    type="number"
                    value={fueldirForm.amount}
                    onChange={(e) => setFueldirForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
                    onChange={(e) => setFueldirForm(prev => ({ ...prev, oxyfactor: parseFloat(e.target.value) || 1.0000 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    placeholder="1.0000"
                  />
                </div>

                {/* 계산 버튼 */}
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

          {/* 오른쪽: 입력된 목록 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">입력된 목록</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{inputResults.length}개</span>
                <button
                  onClick={() => {
                    loadAllExistingData();
                  }}
                  className="text-gray-400 hover:text-gray-200"
                >
                  🔄
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {inputResults.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  입력된 데이터가 없습니다.
              </div>
            ) : (
                inputResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-gray-600 p-3 rounded-md border border-gray-500"
                    >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {result.name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.type === 'matdir' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {result.type === 'matdir' ? '원료' : '연료'}
                          </span>
                          </div>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>배출계수: {result.factor}</div>
                          <div>투입량: {result.amount}</div>
                          <div>산화계수: {result.oxyfactor}</div>
                          <div className="font-medium text-white">
                            배출량: {result.emission.toFixed(2)} tCO2
                          </div>
                          <div className="text-gray-400">
                            {result.calculation_formula}
                        </div>
                        </div>
                      </div>
                              <button
                        onClick={() => handleDelete(result.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        🗑️
                              </button>
                            </div>
                          </div>
                ))
                      )}
                    </div>
              </div>
        </div>
      </div>
    </div>
  );
}