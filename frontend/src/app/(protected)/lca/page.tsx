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

// DB 테이블의 실제 칼럼에 맞춘 인터페이스
interface InputData {
  id: number;
  lot_number: string;
  product_name: string;
  production_quantity: number;
  input_date: string;
  end_date: string;
  process_name: string;
  input_material: string;
  quantity: number;
  unit: string;
  ai_recommendation: string;
  source_file: string;
  created_at: string;
  updated_at: string;
}

interface OutputData {
  id: number;
  output_name: string;
  output_type: string;
  output_quantity: number;
  unit: string;
  quality_grade: string;
  source_file: string;
  created_at: string;
  updated_at: string;
}

interface ProcessData {
  id: number;
  process_name: string;
  process_description: string;
  process_type: string;
  process_stage: string;
  process_efficiency: number;
  source_file: string;
  created_at: string;
  updated_at: string;
}

interface TransportData {
  id: number;
  transport_date: string;
  departure_location: string;
  arrival_location: string;
  transport_mode: string;
  transport_distance: number;
  transport_cost: number;
  transport_volume: number;
  unit: string;
  source_file: string;
  created_at: string;
  updated_at: string;
}

// 데이터 관리 탭용 인터페이스
interface ProcessProductData {
  id: number;
  process_name: string;
  product_name: string;
  quantity: number;
  unit: string;
  classification: string;
  source_table: string;
  source_id: number;
  created_at: string;
}

interface WasteData {
  id: number;
  waste_name: string;
  waste_type: string;
  quantity: number;
  unit: string;
  disposal_method: string;
  classification: string;
  source_table: string;
  source_id: number;
  created_at: string;
}

interface UtilityData {
  id: number;
  utility_name: string;
  utility_type: string;
  consumption: number;
  unit: string;
  efficiency: number;
  classification: string;
  source_table: string;
  source_id: number;
  created_at: string;
}

interface FuelData {
  id: number;
  fuel_name: string;
  fuel_type: string;
  consumption: number;
  unit: string;
  calorific_value: number;
  classification: string;
  source_table: string;
  source_id: number;
  created_at: string;
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">제품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">입력일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">AI추천</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {inputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.lot_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.product_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.production_quantity || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.input_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.end_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.input_material || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.quantity || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.ai_recommendation || '-'}</td>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">제품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">입력일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">AI추천</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {inputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.lot_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.product_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.production_quantity || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.input_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.end_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.input_material || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.quantity || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.ai_recommendation || '-'}</td>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출물명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출물유형</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">품질등급</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">소스파일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {outputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.output_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.output_type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.output_quantity || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.quality_grade || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.source_file || '-'}</td>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">제품명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ecotrace-border">
                      {processProductData.map((row) => (
                        <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.product_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.quantity || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.classification || '-'}</td>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">폐기물명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">폐기물유형</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">처리방법</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ecotrace-border">
                      {wasteData.map((row) => (
                        <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.waste_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.waste_type || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.quantity || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.disposal_method || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.classification || '-'}</td>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">유틸리티명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">유틸리티유형</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">소비량</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">효율</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ecotrace-border">
                      {utilityData.map((row) => (
                        <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.utility_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.utility_type || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.consumption || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.efficiency || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.classification || '-'}</td>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">연료명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">연료유형</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">소비량</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">발열량</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ecotrace-border">
                      {fuelData.map((row) => (
                        <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.fuel_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.fuel_type || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.consumption || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.calorific_value || '-'}</td>
                          <td className="px-4 py-3 text-sm text-ecotrace-text">{row.classification || '-'}</td>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송일자</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">출발지</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">도착지</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송수단</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송거리</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송비용</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {transportData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.transport_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.departure_location || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.arrival_location || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.transport_mode || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.transport_distance || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.transport_cost || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.transport_volume || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.unit || '-'}</td>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">소스파일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {processData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_stage || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.process_efficiency || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.source_file || '-'}</td>
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
