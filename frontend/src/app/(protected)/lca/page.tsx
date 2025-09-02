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
  공정설명: string;
  공정유형: string;
  공정단계: string;
  공정효율: number;
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      if (activeTab === 'base') {
        // input_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const inputDataArray = data.success ? data.data : [];
          setInputData(inputDataArray);
        }
      } else if (activeTab === 'actual') {
        // input_data 테이블 데이터 로드 (투입물)
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const inputDataArray = data.success ? data.data : [];
          setInputData(inputDataArray);
        }
      } else if (activeTab === 'output') {
        // output_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/output-data`);
        if (response.ok) {
          const data = await response.json();
          const outputDataArray = data.success ? data.data : [];
          setOutputData(outputDataArray);
        }
      } else if (activeTab === 'transport') {
        // transport_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/transport-data`);
        if (response.ok) {
          const data = await response.json();
          const transportDataArray = data.success ? data.data : [];
          setTransportData(transportDataArray);
        }
      } else if (activeTab === 'process') {
        // process_data 테이블 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/process-data`);
        if (response.ok) {
          const data = await response.json();
          const processDataArray = data.success ? data.data : [];
          setProcessData(processDataArray);
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
          }
        } else if (activeSegment === 'waste') {
          // waste_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/폐기물`);
          if (response.ok) {
            const data = await response.json();
            const wasteArray = data.success ? data.data : [];
            setWasteData(wasteArray);
          }
        } else if (activeSegment === 'util') {
          // utility_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/유틸리티`);
          if (response.ok) {
            const data = await response.json();
            const utilityArray = data.success ? data.data : [];
            setUtilityData(utilityArray);
          }
        } else if (activeSegment === 'source') {
          // fuel_data
          const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/연료`);
          if (response.ok) {
            const data = await response.json();
            const fuelArray = data.success ? data.data : [];
            setFuelData(fuelArray);
          }
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'base':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">실적정보 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산 실적 정보를 관리합니다.
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                      <td className="px-4 py-3 text-sm text-ecotrace-textSecondary">수량</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-textSecondary">단위</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {inputData.map((row) => (
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
              
              {inputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>실적정보 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'actual':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">투입물 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산에 투입되는 원자재 및 자재 정보를 관리합니다.
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-sm text-ecotrace-textSecondary">단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {inputData.map((row) => (
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
              
              {inputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Package className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>투입물 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'output':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">산출물 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  생산된 제품 및 산출물 정보를 관리합니다.
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출물명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {outputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.산출물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {outputData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>산출물 데이터가 없습니다.</p>
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
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-ecotrace-border">
                       {processProductData.map((row) => (
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
                 
                 {processProductData.length === 0 && (
                   <div className="text-center py-8 text-ecotrace-textSecondary">
                     <Factory className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                     <p>공정생산품 데이터가 없습니다.</p>
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
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-ecotrace-border">
                       {wasteData.map((row) => (
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
                 
                 {wasteData.length === 0 && (
                   <div className="text-center py-8 text-ecotrace-textSecondary">
                     <Settings className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                     <p>폐기물 데이터가 없습니다.</p>
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
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-ecotrace-border">
                       {utilityData.map((row) => (
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
                 
                 {utilityData.length === 0 && (
                   <div className="text-center py-8 text-ecotrace-textSecondary">
                     <BarChart3 className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                     <p>유틸리티 데이터가 없습니다.</p>
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
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                         <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-ecotrace-border">
                       {fuelData.map((row) => (
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
                 
                 {fuelData.length === 0 && (
                   <div className="text-center py-8 text-ecotrace-textSecondary">
                     <Database className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                     <p>연료 데이터가 없습니다.</p>
                   </div>
                 )}
               </div>
             )}
          </div>
        );

      case 'transport':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">운송정보 데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  원자재 및 제품의 운송 정보를 관리합니다.
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
                    {transportData.map((row) => (
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
              
              {transportData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>운송정보 데이터가 없습니다.</p>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정설명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정유형</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정단계</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정효율</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {processData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정설명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정유형 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정단계 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정효율 || '-'}</td>
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

        {renderTabContent()}
      </div>
    </CommonShell>
  );
}
