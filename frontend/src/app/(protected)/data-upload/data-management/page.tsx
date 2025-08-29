'use client';

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import CommonShell from '@/components/common/CommonShell';
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

  // 입력 데이터와 출력 데이터 분리
  const inputData = data.filter(row => row.source_table === 'input_data');
  const outputData = data.filter(row => row.source_table === 'output_data');

  return (
    <CommonShell>
      <div className="p-6 space-y-6">
        {/* 상태 메시지 */}
        {status.type && (
          <div className={`p-4 rounded-lg ${
            status.type === 'success' ? 'bg-green-900/20 text-green-100 border border-green-500/30' :
            status.type === 'error' ? 'bg-red-900/20 text-red-100 border border-red-500/30' :
            'bg-blue-900/20 text-blue-100 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {status.type === 'error' && <XCircle className="w-5 h-5" />}
              {status.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span>{status.message}</span>
            </div>
          </div>
        )}

        {/* 메인 컨텐츠 영역 */}
        <div className="flex gap-6">
          {/* 데이터 테이블 영역 */}
          <div className="flex-1">
            {/* 입력 데이터 섹션 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-ecotrace-text mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                입력 데이터
              </h2>
              <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-ecotrace-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox
                            checked={selectedRows.size === inputData.length && inputData.length > 0}
                            onChange={() => {
                              const inputIds = new Set(inputData.map(row => row.id));
                              if (selectedRows.size === inputData.length) {
                                setSelectedRows(new Set());
                              } else {
                                setSelectedRows(new Set(inputIds));
                              }
                            }}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ecotrace-border">
                      {inputData.map((row) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {inputData.length === 0 && (
                  <div className="text-center py-8 text-ecotrace-textSecondary">
                    <p>입력 데이터가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 출력 데이터 섹션 */}
            <div>
              <h2 className="text-lg font-semibold text-ecotrace-text mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                출력 데이터
              </h2>
              <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-ecotrace-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox
                            checked={selectedRows.size === outputData.length && outputData.length > 0}
                            onChange={() => {
                              const outputIds = new Set(outputData.map(row => row.id));
                              if (selectedRows.size === outputData.length) {
                                setSelectedRows(new Set());
                              } else {
                                setSelectedRows(new Set(outputIds));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {outputData.length === 0 && (
                  <div className="text-center py-8 text-ecotrace-textSecondary">
                    <p>출력 데이터가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측 분류 선택 박스 */}
          <div className="w-80 bg-ecotrace-surface rounded-lg border border-ecotrace-border p-6 h-fit">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-4">분류 타입 선택</h3>
            
            <div className="space-y-3 mb-6">
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

            <div className="bg-ecotrace-secondary/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-ecotrace-textSecondary mb-2">선택된 데이터</h4>
              <div className="text-2xl font-bold text-ecotrace-accent">
                {selectedRows.size}개
              </div>
            </div>

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
      </div>
    </CommonShell>
  );
}
