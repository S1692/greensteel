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
  XCircle
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
      
      const response = await fetch(`${gatewayUrl}/api/datagather/classify-data`, {
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">데이터 관리</h1>
            <p className="text-gray-400 mt-2">
              투입 데이터와 산출물 데이터를 통합하여 분류하고 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadData}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '로딩 중...' : '새로고침'}
            </Button>
          </div>
        </div>

        {/* 상태 메시지 */}
        {status.type && (
          <div className={`p-4 rounded-lg ${
            status.type === 'success' ? 'bg-green-900 text-green-100' :
            status.type === 'error' ? 'bg-red-900 text-red-100' :
            'bg-blue-900 text-blue-100'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {status.type === 'error' && <XCircle className="w-5 h-5" />}
              {status.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span>{status.message}</span>
            </div>
          </div>
        )}

        {/* 분류 선택 및 필터 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                분류 타입 선택
              </label>
              <div className="flex gap-3">
                {(['연료', '유틸리티', '폐기물', '공정 생산품'] as ClassificationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => filterByClassification(type)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedClassification === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">선택된 데이터</p>
              <p className="text-2xl font-bold text-blue-400">
                {selectedRows.size}개
              </p>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">로트번호</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">생산수량</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">투입일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">종료일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">공정</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">투입물명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">수량</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">단위</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">출처</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{row.로트번호}</td>
                    <td className="px-4 py-3 text-sm">{row.생산수량}</td>
                    <td className="px-4 py-3 text-sm">{row.투입일}</td>
                    <td className="px-4 py-3 text-sm">{row.종료일}</td>
                    <td className="px-4 py-3 text-sm">{row.공정}</td>
                    <td className="px-4 py-3 text-sm">{row.투입물명}</td>
                    <td className="px-4 py-3 text-sm">{row.수량}</td>
                    <td className="px-4 py-3 text-sm">{row.단위}</td>
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
            <div className="text-center py-12 text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>데이터가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 분류 저장 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={saveClassification}
            disabled={selectedRows.size === 0 || isClassifying}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {isClassifying ? '분류 중...' : `${selectedClassification}으로 분류하기`}
          </Button>
        </div>
      </div>
    </div>
  );
}
