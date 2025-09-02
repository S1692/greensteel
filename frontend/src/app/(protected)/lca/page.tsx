'use client';

import { useState, useEffect, useMemo } from 'react';
import CommonShell from '@/components/common/CommonShell';
import LcaTabsNav from '@/components/atomic/molecules/LcaTabsNav';
import { LcaTabKey, ManageSegment } from '@/lib';
import { Button } from '@/components/ui/Button';
import { 
  Database, 
  FileText, 
  Truck, 
  Settings, 
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Package,
  Factory,
  BarChart3,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

// DB 테이블의 실제 칼럼에 맞춘 인터페이스 (created_at, updated_at 제외)
interface InputData {
  id: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  주문처명?: string;
  오더번호?: string;
}

interface OutputData {
  id: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  산출물명: string;
  수량: number;
  단위: string;
}

interface ProcessData {
  id: number;
  공정명: string;
  생산제품: string;
  세부공정: string;
  공정설명: string;
  created_at?: string;
  updated_at?: string;
}

interface TransportData {
  id: number;
  생산품명: string;
  로트번호: string;
  운송물질: string;
  운송수량: number;
  운송일자: string;
  도착공정: string;
  출발지: string;
  이동수단: string;
}

// 데이터 관리 탭용 인터페이스 (created_at, updated_at 제외)
interface ProcessProductData {
  id: number;
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  분류: string;
  source_table: string;
  source_id: number;
}

interface WasteData {
  id: number;
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  분류: string;
  source_table: string;
  source_id: number;
}

interface UtilityData {
  id: number;
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  분류: string;
  source_table: string;
  source_id: number;
}

interface FuelData {
  id: number;
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  분류: string;
  source_table: string;
  source_id: number;
}

export default function LcaPage() {
  const [activeTab, setActiveTab] = useState<LcaTabKey | 'manage'>('actual');
  const [activeSegment, setActiveSegment] = useState<ManageSegment>('mat');
  
  const [inputData, setInputData] = useState<InputData[]>([]);
  const [outputData, setOutputData] = useState<OutputData[]>([]);
  const [processData, setProcessData] = useState<ProcessData[]>([]);
  const [transportData, setTransportData] = useState<TransportData[]>([]);
  const [processProductData, setProcessProductData] = useState<ProcessProductData[]>([]);
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [utilityData, setUtilityData] = useState<UtilityData[]>([]);
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태 추가
  const [filters, setFilters] = useState({
    주문처명: '',
    제품명: '',
    투입일시작: '',
    투입일종료: '',
    종료일시작: '',
    종료일종료: ''
  });

  // 필터링된 데이터 계산
  const filteredInputData = useMemo(() => {
    if (activeTab === 'actual' || activeTab === 'base') {
      return inputData.filter(item => {
        const 주문처명Match = !filters.주문처명 || (item.주문처명 && item.주문처명.includes(filters.주문처명));
        const 제품명Match = !filters.제품명 || item.생산품명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 주문처명Match && 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return inputData;
  }, [inputData, filters, activeTab]);

  const filteredOutputData = useMemo(() => {
    if (activeTab === 'output') {
      return outputData.filter(item => {
        const 제품명Match = !filters.제품명 || item.생산품명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return outputData;
  }, [outputData, filters, activeTab]);

  const filteredTransportData = useMemo(() => {
    if (activeTab === 'transport') {
      return transportData.filter(item => {
        const 제품명Match = !filters.제품명 || item.생산품명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.운송일자 >= filters.투입일시작 && item.운송일자 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.운송일자 >= filters.종료일시작 && item.운송일자 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return transportData;
  }, [transportData, filters, activeTab]);

  // 데이터 관리 탭용 필터링된 데이터 계산
  const filteredProcessProductData = useMemo(() => {
    if (activeTab === 'manage' && activeSegment === 'mat') {
      return processProductData.filter(item => {
        const 제품명Match = !filters.제품명 || item.투입물명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return processProductData;
  }, [processProductData, filters, activeTab, activeSegment]);

  const filteredWasteData = useMemo(() => {
    if (activeTab === 'manage' && activeSegment === 'waste') {
      return wasteData.filter(item => {
        const 제품명Match = !filters.제품명 || item.투입물명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return wasteData;
  }, [wasteData, filters, activeTab, activeSegment]);

  const filteredUtilityData = useMemo(() => {
    if (activeTab === 'manage' && activeSegment === 'util') {
      return utilityData.filter(item => {
        const 제품명Match = !filters.제품명 || item.투입물명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return utilityData;
  }, [utilityData, filters, activeTab, activeSegment]);

  const filteredFuelData = useMemo(() => {
    if (activeTab === 'manage' && activeSegment === 'source') {
      return fuelData.filter(item => {
        const 제품명Match = !filters.제품명 || item.투입물명.includes(filters.제품명);
        const 투입일Match = !filters.투입일시작 || !filters.투입일종료 || 
          (item.투입일 >= filters.투입일시작 && item.투입일 <= filters.투입일종료);
        const 종료일Match = !filters.종료일시작 || !filters.종료일종료 || 
          (item.종료일 >= filters.종료일시작 && item.종료일 <= filters.종료일종료);
        return 제품명Match && 투입일Match && 종료일Match;
      });
    }
    return fuelData;
  }, [fuelData, filters, activeTab, activeSegment]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null); // 이전 에러 메시지 초기화
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      if (activeTab === 'base') {
        // input_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const inputDataArray = data.success ? data.data : [];
          setInputData(inputDataArray);
          console.log('투입물명 값들:', inputDataArray.map((row: any) => row.투입물명));
        } else {
          throw new Error(`input_data 데이터 로드 실패: ${response.statusText}`);
        }
      } else if (activeTab === 'actual') {
        // input_data 테이블 데이터 로드 (투입물)
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const inputDataArray = data.success ? data.data : [];
          setInputData(inputDataArray);
        } else {
          throw new Error(`input_data 데이터 로드 실패: ${response.statusText}`);
        }
      } else if (activeTab === 'output') {
        // output_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/output-data`);
        if (response.ok) {
          const data = await response.json();
          const outputDataArray = data.success ? data.data : [];
          setOutputData(outputDataArray);
        } else {
          throw new Error(`output_data 데이터 로드 실패: ${response.statusText}`);
        }
      } else if (activeTab === 'transport') {
        // transport_data 테이블 데이터 로드
        console.log('운송 데이터 로드 시작...');
        const response = await fetch(`${gatewayUrl}/api/datagather/transport-data`);
        console.log('운송 데이터 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('운송 데이터 응답:', data);
          
          if (data.success) {
            const transportDataArray = data.data || [];
            console.log('운송 데이터 배열:', transportDataArray);
            console.log('운송 데이터 개수:', transportDataArray.length);
            setTransportData(transportDataArray);
          } else {
            console.error('운송 데이터 응답 실패:', data.message, data.error);
            throw new Error(`운송 데이터 응답 실패: ${data.message || '알 수 없는 오류'}`);
          }
        } else {
          const errorText = await response.text();
          console.error('운송 데이터 HTTP 오류:', response.status, errorText);
          throw new Error(`transport_data 데이터 로드 실패: ${response.status} ${response.statusText}`);
        }
      } else if (activeTab === 'process') {
        // process_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/process-data`);
        if (response.ok) {
          const data = await response.json();
          const processDataArray = data.success ? data.data : [];
          setProcessData(processDataArray);
        } else {
          throw new Error(`process_data 데이터 로드 실패: ${response.statusText}`);
        }
      } else if (activeTab === 'manage') {
        // 데이터 관리 탭 - 세그먼트별 데이터 로드
        if (activeSegment === 'mat') {
          // process_product_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/공정 생산품`);
          if (response.ok) {
            const data = await response.json();
            const processProductArray = data.success ? data.data : [];
            setProcessProductData(processProductArray);
          } else {
            throw new Error(`공정생산품 데이터 로드 실패: ${response.statusText}`);
          }
        } else if (activeSegment === 'waste') {
          // waste_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/폐기물`);
          if (response.ok) {
            const data = await response.json();
            const wasteArray = data.success ? data.data : [];
            setWasteData(wasteArray);
          } else {
            throw new Error(`폐기물 데이터 로드 실패: ${response.statusText}`);
          }
        } else if (activeSegment === 'util') {
          // utility_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/유틸리티`);
          if (response.ok) {
            const data = await response.json();
            const utilityArray = data.success ? data.data : [];
            setUtilityData(utilityArray);
          } else {
            throw new Error(`유틸리티 데이터 로드 실패: ${response.statusText}`);
          }
        } else if (activeSegment === 'source') {
          // fuel_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/연료`);
          if (response.ok) {
            const data = await response.json();
            const fuelArray = data.success ? data.data : [];
            setFuelData(fuelArray);
          } else {
            throw new Error(`연료 데이터 로드 실패: ${response.statusText}`);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('데이터 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // URL 쿼리 파라미터에서 탭 정보 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && (tabParam === 'actual' || tabParam === 'output' || tabParam === 'transport' || tabParam === 'process' || tabParam === 'manage')) {
        setActiveTab(tabParam as LcaTabKey | 'manage');
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, activeSegment]);

  const handleTabChange = (tab: LcaTabKey | 'manage') => {
    setActiveTab(tab);
    if (tab !== 'manage') {
      setActiveSegment('mat');
    }
  };

  const handleSegmentChange = (segment: ManageSegment) => {
    setActiveSegment(segment);
  };

  const handleEditRedirect = () => {
    // 데이터 업로드 페이지로 이동
    window.location.href = '/data-upload';
  };

  // 필터 컴포넌트 렌더링
  const renderFilters = () => {
    if (activeTab === 'process') return null; // 공정 탭은 제외
    
    // 고유한 값들을 추출하여 드롭다운 옵션 생성
    const unique주문처명 = [...new Set(inputData.map(item => item.주문처명).filter(Boolean))];
    const unique제품명 = [...new Set([
      ...inputData.map(item => item.생산품명),
      ...outputData.map(item => item.생산품명),
      ...transportData.map(item => item.생산품명)
    ].filter(Boolean))];
    
    return (
      <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-ecotrace-primary" />
          <h3 className="text-lg font-semibold text-ecotrace-text">필터</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'actual' || activeTab === 'base' ? (
            <div>
              <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
                주문처명
              </label>
              <select
                value={filters.주문처명}
                onChange={(e) => setFilters(prev => ({ ...prev, 주문처명: e.target.value }))}
                className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
              >
                <option value="">전체</option>
                {unique주문처명.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
              제품명
            </label>
            <select
              value={filters.제품명}
              onChange={(e) => setFilters(prev => ({ ...prev, 제품명: e.target.value }))}
              className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
            >
              <option value="">전체</option>
              {unique제품명.map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
              투입일 시작
            </label>
            <input
              type="date"
              value={filters.투입일시작}
              onChange={(e) => setFilters(prev => ({ ...prev, 투입일시작: e.target.value }))}
              className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
              투입일 종료
            </label>
            <input
              type="date"
              value={filters.투입일종료}
              onChange={(e) => setFilters(prev => ({ ...prev, 투입일종료: e.target.value }))}
              className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
              종료일 시작
            </label>
            <input
              type="date"
              value={filters.종료일시작}
              onChange={(e) => setFilters(prev => ({ ...prev, 종료일시작: e.target.value }))}
              className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">
              종료일 종료
            </label>
            <input
              type="date"
              value={filters.종료일종료}
              onChange={(e) => setFilters(prev => ({ ...prev, 종료일종료: e.target.value }))}
              className="w-full px-3 py-2 border border-ecotrace-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ecotrace-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setFilters({ 
              주문처명: '', 
              제품명: '', 
              투입일시작: '', 
              투입일종료: '', 
              종료일시작: '', 
              종료일종료: '' 
            })}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </Button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'base':
        return (
          <div className="space-y-6">
            {renderFilters()}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">실적정보 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산 실적 정보를 관리합니다. {filteredInputData.length > 0 && `(${filteredInputData.length}개 결과)`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
                      const response = await fetch(`${gatewayUrl}/api/datagather/table-schema`);
                      const data = await response.json();
                      if (data.success) {
                        console.log('테이블 스키마:', data.schema);
                        console.log('샘플 데이터:', data.sample_data);
                      }
                    } catch (error) {
                      console.error('스키마 조회 실패:', error);
                    }
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  스키마 확인
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                      <td className="px-4 py-3 text-sm text-ecotrace-textSecondary">수량</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-textSecondary">단위</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {filteredInputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                        <td className="px-4 py-4 text-ecotrace-text">{row.공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredInputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>{inputData.length === 0 ? '실적정보 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'actual':
        return (
          <div className="space-y-6">
            {renderFilters()}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">투입물 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산에 투입되는 원자재 및 자재 정보를 관리합니다. {filteredInputData.length > 0 && `(${filteredInputData.length}개 결과)`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-sm text-ecotrace-textSecondary">단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {filteredInputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredInputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Package className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>{inputData.length === 0 ? '투입물 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'output':
        return (
          <div className="space-y-6">
            {renderFilters()}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">산출물 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산된 제품 및 산출물 정보를 관리합니다. {filteredOutputData.length > 0 && `(${filteredInputData.length}개 결과)`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출물명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {filteredOutputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.산출물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                        <td className="px-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredOutputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>{outputData.length === 0 ? '산출물 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'manage':
        return (
          <div className="space-y-6">
                         <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-2xl font-bold text-ecotrace-text">데이터 관리</h2>
                 <p className="text-ecotrace-text-secondary">
                   분류된 데이터를 체계적으로 관리합니다.
                   {activeSegment === 'mat' && filteredProcessProductData.length > 0 && ` (${filteredProcessProductData.length}개 결과)`}
                   {activeSegment === 'waste' && filteredWasteData.length > 0 && ` (${filteredWasteData.length}개 결과)`}
                   {activeSegment === 'util' && filteredUtilityData.length > 0 && ` (${filteredUtilityData.length}개 결과)`}
                   {activeSegment === 'source' && filteredFuelData.length > 0 && ` (${filteredFuelData.length}개 결과)`}
                 </p>
               </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
                                                   {activeSegment === 'mat' && (
                <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {filteredProcessProductData.map((row) => (
                          <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredProcessProductData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <Factory className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                      <p>{processProductData.length === 0 ? '공정생산품 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              )}

                                                   {activeSegment === 'waste' && (
                <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {filteredWasteData.map((row) => (
                          <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                            <td className="px-4 py-3 text-left text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredWasteData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                      <p>{wasteData.length === 0 ? '폐기물 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              )}

                                                   {activeSegment === 'util' && (
                <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {filteredUtilityData.map((row) => (
                          <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredUtilityData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                      <p>{utilityData.length === 0 ? '유틸리티 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              )}

                                                   {activeSegment === 'source' && (
                <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {filteredFuelData.map((row) => (
                          <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredFuelData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <Database className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                      <p>{fuelData.length === 0 ? '연료 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        );

      case 'transport':
        return (
          <div className="space-y-6">
            {renderFilters()}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">운송정보 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  원자재 및 제품의 운송 정보를 관리합니다. {filteredTransportData.length > 0 && `(${filteredTransportData.length}개 결과)`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송물질</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송일자</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">도착공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">출발지</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">이동수단</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {filteredTransportData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송물질 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송일자 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.도착공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.출발지 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.이동수단 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTransportData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Truck className="w-4 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>{transportData.length === 0 ? '운송정보 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">공정정보 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산 공정 및 프로세스 정보를 관리합니다.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩 중...' : '새로고침'}
                </Button>
                <Button 
                  onClick={handleEditRedirect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  수정하러 가기
                </Button>
              </div>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산제품</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">세부공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정설명</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {processData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산제품 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.세부공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정설명 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {processData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Factory className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>공정정보 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CommonShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ecotrace-text">LCA 관리</h1>
          <p className="text-ecotrace-text-secondary mt-2">
            생명주기 평가(Life Cycle Assessment) 데이터를 관리합니다.
          </p>
        </div>

        <LcaTabsNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
        />

        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-ecotrace-textSecondary" />
            <p className="text-ecotrace-textSecondary">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400">데이터 로드 오류</h3>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 콘텐츠 렌더링 */}
        {!isLoading && !error && renderTabContent()}
      </div>
    </CommonShell>
  );
}
