'use client';

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { 
  Database, 
  Filter, 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Upload
} from 'lucide-react';

interface DataRow {
  id: string;
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  source_table: 'input_data' | 'output_data';
  source_id: number;
}

type ClassificationType = '연료' | '유틸리티' | '폐기물' | '공정 생산품';

interface ClassificationData {
  로트번호: number;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  분류: ClassificationType;
  source_table: 'input_data' | 'output_data';
  source_id: number;
}

export default function DataManagementPage() {
  const [data, setData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedClassification, setSelectedClassification] = useState<ClassificationType>('연료');
  const [isLoading, setIsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000';
      
      // input_data와 output_data를 병렬로 로드
      const [inputResponse, outputResponse] = await Promise.all([
        fetch(`${gatewayUrl}/api/datagather/input-data`),
        fetch(`${gatewayUrl}/api/datagather/output-data`)
      ]);

      if (!inputResponse.ok || !outputResponse.ok) {
        throw new Error('데이터 로드 실패');
      }

      const inputData = await inputResponse.json();
      const outputData = await outputResponse.json();

      // 데이터 통합 및 형식 변환
      const combinedData: DataRow[] = [
        ...inputData.map((item: any) => ({
          id: `input_${item.id}`,
          로트번호: item.로트번호,
          생산수량: item.생산수량,
          투입일: item.투입일,
          종료일: item.종료일,
          공정: item.공정,
          투입물명: item.투입물명,
          수량: item.수량,
          단위: item.단위,
          source_table: 'input_data' as const,
          source_id: item.id
        })),
        ...outputData.map((item: any) => ({
          id: `output_${item.id}`,
          로트번호: item.로트번호,
          생산수량: item.생산수량,
          투입일: item.투입일,
          종료일: item.종료일,
          공정: item.공정,
          투입물명: item.산출물명, // output_data는 산출물명 컬럼 사용
          수량: item.수량,
          단위: item.단위,
          source_table: 'output_data' as const,
          source_id: item.id
        }))
      ];

      setData(combinedData);
      setFilteredData(combinedData);
      setStatus({ type: 'success', message: `${combinedData.length}개 데이터 로드 완료` });
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setStatus({ type: 'error', message: '데이터 로드 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 분류 타입별 필터링
  const filterByClassification = (classification: ClassificationType) => {
    setSelectedClassification(classification);
    // 여기서는 모든 데이터를 보여주고, 분류는 저장 시에만 적용
    setFilteredData(data);
  };

  // 행 선택/해제
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(row => row.id)));
    }
  };

  // 선택된 데이터 분류 저장
  const saveClassification = async () => {
    if (selectedRows.size === 0) {
      setStatus({ type: 'error', message: '분류할 데이터를 선택해주세요.' });
      return;
    }

    setIsClassifying(true);
    setStatus({ type: null, message: '' });

    try {
      const selectedData = data.filter(row => selectedRows.has(row.id));
      const classificationData: ClassificationData[] = selectedData.map(row => ({
        ...row,
        분류: selectedClassification
      }));

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000';
      
      const response = await fetch(`${gatewayUrl}/classify-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classification: selectedClassification,
          data: classificationData
        }),
      });

      if (!response.ok) {
        throw new Error('분류 저장 실패');
      }

      const result = await response.json();
      setStatus({ 
        type: 'success', 
        message: `${selectedData.length}개 데이터가 ${selectedClassification}으로 분류되어 저장되었습니다.` 
      });
      
      // 선택 해제
      setSelectedRows(new Set());
      
    } catch (error) {
      console.error('분류 저장 오류:', error);
      setStatus({ type: 'error', message: '분류 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsClassifying(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-ecotrace-background text-ecotrace-text">
      {/* 헤더 */}
      <header className="bg-ecotrace-surface border-b border-ecotrace-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-ecotrace-accent rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-ecotrace-text">데이터 관리</h1>
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-ecotrace-textSecondary">
                  투입 데이터와 산출물 데이터를 통합하여 분류하고 관리합니다.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={loadData}
                disabled={isLoading}
                className="bg-ecotrace-accent hover:bg-ecotrace-accent/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? '로딩 중...' : '새로고침'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-64 bg-ecotrace-surface border-r border-ecotrace-border min-h-screen">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-4">데이터 관리</h3>
            
            {/* 상태 메시지 */}
            {status.type && (
              <div className={`p-3 rounded-lg mb-4 ${
                status.type === 'success' ? 'bg-green-900/20 text-green-100 border border-green-500/30' :
                status.type === 'error' ? 'bg-red-900/20 text-red-100 border border-red-500/30' :
                'bg-blue-900/20 text-blue-100 border border-blue-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {status.type === 'error' && <XCircle className="w-4 h-4" />}
                  {status.type === 'info' && <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm">{status.message}</span>
                </div>
              </div>
            )}

            {/* 분류 선택 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-ecotrace-textSecondary mb-3">분류 타입 선택</h4>
              <div className="space-y-2">
                {(['연료', '유틸리티', '폐기물', '공정 생산품'] as ClassificationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => filterByClassification(type)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedClassification === type
                        ? 'bg-ecotrace-accent text-white'
                        : 'bg-ecotrace-secondary/50 text-ecotrace-textSecondary hover:bg-ecotrace-secondary hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 데이터 정보 */}
            <div className="bg-ecotrace-secondary/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-ecotrace-textSecondary mb-2">선택된 데이터</h4>
              <div className="text-2xl font-bold text-ecotrace-accent">
                {selectedRows.size}개
              </div>
            </div>

            {/* 분류 저장 버튼 */}
            <div className="mt-6">
              <Button
                onClick={saveClassification}
                disabled={selectedRows.size === 0 || isClassifying}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isClassifying ? '분류 중...' : `${selectedClassification}으로 분류하기`}
              </Button>
            </div>
          </div>
        </aside>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 p-6">
          {/* 데이터 테이블 */}
          <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                        onChange={toggleAllSelection}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">출처</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ecotrace-border">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRowSelection(row.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          row.source_table === 'input_data' 
                            ? 'bg-blue-600 text-blue-100' 
                            : 'bg-green-600 text-green-100'
                        }`}>
                          {row.source_table === 'input_data' ? '투입' : '산출'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-ecotrace-textSecondary">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
