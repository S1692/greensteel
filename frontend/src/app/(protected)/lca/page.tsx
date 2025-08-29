'use client';

import { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';

interface BaseData {
  id: number;
  물질명: string;
  단위: string;
  GWP: number;
  AP: number;
  EP: number;
  POCP: number;
  ADPE: number;
  ADPF: number;
}

interface ActualData {
  id: number;
  로트번호: string;
  공정: string;
  투입물: string;
  수량: number;
  단위: string;
  분류: string;
  날짜: string;
}

interface TransportData {
  id: number;
  로트번호: string;
  운송물질: string;
  운송수량: number;
  운송일자: string;
  출발지: string;
  도착지: string;
  운송수단: string;
}

interface ProcessData {
  id: number;
  공정명: string;
  생산제품: string;
  세부공정: string;
  공정설명: string;
  에너지소비: number;
  단위: string;
}

interface ClassificationData {
  id: number;
  로트번호: string;
  공정: string;
  물질명: string;
  수량: number;
  단위: string;
  분류: string;
  source_table: string;
  source_id: number;
}

interface OutputData {
  id: number;
  로트번호: string;
  날짜: string;
  사업장: string;
  제품명: string;
  수량: number;
  단위: string;
}

export default function LcaPage() {
  const [activeTab, setActiveTab] = useState<LcaTabKey | 'manage'>('base');
  const [activeSegment, setActiveSegment] = useState<ManageSegment>('mat');
  
  // 데이터 상태
  const [baseData, setBaseData] = useState<BaseData[]>([]);
  const [actualData, setActualData] = useState<ActualData[]>([]);
  const [outputData, setOutputData] = useState<OutputData[]>([]);
  const [transportData, setTransportData] = useState<TransportData[]>([]);
  const [processData, setProcessData] = useState<ProcessData[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드 함수
  const loadData = async () => {
    setIsLoading(true);
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      // 각 탭별 데이터 로드
      if (activeTab === 'base') {
        // 실적정보 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const baseDataArray = data.success ? data.data : [];
          setBaseData(baseDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            날짜: item.날짜 || '',
            사업장: item.사업장 || '',
            제품명: item.제품명 || '',
            수량: item.수량 || 0,
            단위: item.단위 || 't'
          })));
        }
      } else if (activeTab === 'actual') {
        // 투입물 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/input-data`);
        if (response.ok) {
          const data = await response.json();
          const actualDataArray = data.success ? data.data : [];
          setActualData(actualDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            날짜: item.날짜 || '',
            사업장: item.사업장 || '',
            제품명: item.제품명 || '',
            수량: item.수량 || 0,
            단위: item.단위 || 't'
          })));
        }
      } else if (activeTab === 'output') {
        // 산출물 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/output-data`);
        if (response.ok) {
          const data = await response.json();
          const outputDataArray = data.success ? data.data : [];
          setOutputData(outputDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            날짜: item.날짜 || '',
            사업장: item.사업장 || '',
            제품명: item.제품명 || '',
            수량: item.수량 || 0,
            단위: item.단위 || 't'
          })));
        }
      } else if (activeTab === 'transport') {
        // 운송정보 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/transport-data`);
        if (response.ok) {
          const data = await response.json();
          const transportDataArray = data.success ? data.data : [];
          setTransportData(transportDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            운송일자: item.운송일자 || '',
            운송수량: item.운송수량 || 0,
            단위: item.단위 || 't',
            출발지: item.출발지 || '',
            도착지: item.도착지 || ''
          })));
        }
      } else if (activeTab === 'process') {
        // 공정정보 데이터 로드
        const response = await fetch(`${gatewayUrl}/api/datagather/process-data`);
        if (response.ok) {
          const data = await response.json();
          const processDataArray = data.success ? data.data : [];
          setProcessData(processDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            공정명: item.공정명 || '',
            시작일: item.시작일 || '',
            종료일: item.종료일 || '',
            투입물: item.투입물 || '',
            산출물: item.산출물 || ''
          })));
        }
      } else if (activeTab === 'manage') {
        // 분류 데이터 로드 (공정생산품별)
        const response = await fetch(`${gatewayUrl}/api/datagather/classified-data/공정 생산품`);
        if (response.ok) {
          const data = await response.json();
          const classificationDataArray = data.success ? data.data : [];
          setClassificationData(classificationDataArray.map((item: any, index: number) => ({
            id: index + 1,
            로트번호: item.로트번호 || '',
            공정: item.공정 || '',
            물질명: item.투입물명 || '',
            수량: item.수량 || 0,
            단위: item.단위 || 't',
            분류: item.분류 || '',
            source_table: item.source_table || '',
            source_id: item.source_id || 0
          })));
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleTabChange = (tab: LcaTabKey | 'manage') => {
    setActiveTab(tab);
    if (tab !== 'manage') {
      setActiveSegment('mat');
    }
  };

  const handleSegmentChange = (segment: ManageSegment) => {
    setActiveSegment(segment);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'base':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">기준데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  LCA 분석을 위한 기준 데이터를 관리합니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                기준데이터 추가
              </Button>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">물질명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">GWP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">AP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">EP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">POCP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ADPE</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ADPF</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {baseData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.물질명}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.GWP}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.AP}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.EP}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.POCP}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.ADPE}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.ADPF}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {baseData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Database className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>기준데이터가 없습니다.</p>
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
                <h2 className="text-2xl font-bold text-ecotrace-text">실적데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  실제 운영 데이터를 입력하고 관리합니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                실적데이터 추가
              </Button>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">날짜</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {actualData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.날짜}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {actualData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>실적데이터가 없습니다.</p>
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
                  산출물 데이터를 관리합니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                산출물 데이터 추가
              </Button>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">날짜</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">사업장</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">제품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {outputData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.날짜}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.사업장}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.제품명}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
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
                <h2 className="text-2xl font-bold text-ecotrace-text">공정생산품 데이터 관리</h2>
                <p className="text-ecotrace-text-secondary">
                  공정생산품별로 분류된 데이터를 체계적으로 관리합니다.
                </p>
              </div>
              <Button 
                onClick={loadData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? '로딩 중...' : '새로고침'}
              </Button>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">물질명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {classificationData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.물질명}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.분류}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {classificationData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>공정생산품 분류 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'transport':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ecotrace-text">운송데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  운송 관련 데이터를 관리합니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                운송데이터 추가
              </Button>
            </div>
            
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ecotrace-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송물질</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송수량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송일자</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">출발지</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">도착지</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송수단</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {transportData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송물질}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송수량}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송일자}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.출발지}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.도착지}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.운송수단}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {transportData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>운송데이터가 없습니다.</p>
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
                <h2 className="text-2xl font-bold text-ecotrace-text">공정데이터</h2>
                <p className="text-ecotrace-text-secondary">
                  공정 관련 데이터를 관리합니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                공정데이터 추가
              </Button>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">에너지소비</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ecotrace-border">
                    {processData.map((row) => (
                      <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정명}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산제품}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.세부공정}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정설명}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.에너지소비}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {processData.length === 0 && (
                <div className="text-center py-8 text-ecotrace-textSecondary">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-ecotrace-textSecondary/50" />
                  <p>공정데이터가 없습니다.</p>
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
