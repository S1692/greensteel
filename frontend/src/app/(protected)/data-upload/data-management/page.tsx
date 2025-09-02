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
  Upload,
  Trash2,
  Eye,
  Tag,
  X,
  ArrowLeft,
  Edit3,
  Plus
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
  주문처명?: string;
  오더번호?: string;
  source_table: 'input_data' | 'output_data';
  source_id: number;
  분류?: ClassificationType | null;
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

type TabType = 'classification' | 'view';
type ViewMode = 'overview' | 'fuel' | 'utility' | 'waste' | 'process_product';

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('classification');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [data, setData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedClassification, setSelectedClassification] = useState<ClassificationType>('연료');
  const [isLoading, setIsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  
  // 편집 모드 상태 관리
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<DataRow | null>(null);

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      // input_data, output_data, 분류 데이터를 병렬로 로드
      const [inputResponse, outputResponse, fuelResponse, utilityResponse, wasteResponse, processProductResponse] = await Promise.all([
        fetch(`${gatewayUrl}/api/datagather/input-data`),
        fetch(`${gatewayUrl}/api/datagather/output-data`),
        fetch(`${gatewayUrl}/api/datagather/classified-data/연료`),
        fetch(`${gatewayUrl}/api/datagather/classified-data/유틸리티`),
        fetch(`${gatewayUrl}/api/datagather/classified-data/폐기물`),
        fetch(`${gatewayUrl}/api/datagather/classified-data/공정 생산품`)
      ]);

      if (!inputResponse.ok || !outputResponse.ok) {
        throw new Error('데이터 로드 실패');
      }

      const inputData = await inputResponse.json();
      const outputData = await outputResponse.json();
      const fuelData = await fuelResponse.json();
      const utilityData = await utilityResponse.json();
      const wasteData = await wasteResponse.json();
      const processProductData = await processProductResponse.json();

      // 백엔드 응답 구조에서 data 배열 추출
      const inputDataArray = inputData.success ? inputData.data : [];
      const outputDataArray = outputData.success ? outputData.data : [];
      const fuelDataArray = fuelData.success ? fuelData.data : [];
      const utilityDataArray = utilityData.success ? utilityData.data : [];
      const wasteDataArray = wasteData.success ? wasteData.data : [];
      const processProductDataArray = processProductData.success ? processProductData.data : [];

      // 분류 데이터를 원본 테이블과 매핑하여 분류 정보 업데이트
      const updateClassificationInfo = (dataArray: any[], classification: ClassificationType) => {
        dataArray.forEach((item: any) => {
          const sourceTable = item.source_table;
          const sourceId = item.source_id;
          
          // input_data 또는 output_data에서 해당 항목을 찾아 분류 정보 업데이트
          if (sourceTable === 'input_data') {
            const inputItem = inputDataArray.find((input: any) => input.id === sourceId);
            if (inputItem) {
              inputItem.분류 = classification;
            }
          } else if (sourceTable === 'output_data') {
            const outputItem = outputDataArray.find((output: any) => output.id === sourceId);
            if (outputItem) {
              outputItem.분류 = classification;
            }
          }
        });
      };

      // 각 분류별로 분류 정보 업데이트
      updateClassificationInfo(fuelDataArray, '연료');
      updateClassificationInfo(utilityDataArray, '유틸리티');
      updateClassificationInfo(wasteDataArray, '폐기물');
      updateClassificationInfo(processProductDataArray, '공정 생산품');

      // 데이터 통합 및 형식 변환
      const combinedData: DataRow[] = [
        ...inputDataArray.map((item: any) => ({
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
          source_id: item.id,
          분류: item.분류 || null
        })),
        ...outputDataArray.map((item: any) => ({
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
          source_id: item.id,
          분류: item.분류 || null
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

  // 행 선택/해제 (분류되지 않은 데이터만 선택 가능)
  const toggleRowSelection = (id: string) => {
    const row = data.find(r => r.id === id);
    if (row && row.분류) {
      // 이미 분류된 데이터는 선택 불가
      return;
    }

    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // 전체 선택/해제 (분류되지 않은 데이터만)
  const toggleAllSelection = () => {
    const unclassifiedData = filteredData.filter(row => !row.분류);
    const unclassifiedIds = new Set(unclassifiedData.map(row => row.id));
    
    if (selectedRows.size === unclassifiedIds.size && unclassifiedIds.size > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(unclassifiedIds);
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

             const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
        
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
      
      // 로컬 상태 업데이트
      setData(prev => prev.map(row => 
        selectedRows.has(row.id) 
          ? { ...row, 분류: selectedClassification }
          : row
      ));
      
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

  // 분류된 데이터 삭제 (재분류 가능하도록)
  const deleteClassification = async (rowId: string) => {
    setIsDeleting(true);
    setStatus({ type: null, message: '' });

    try {
      const row = data.find(r => r.id === rowId);
      if (!row || !row.분류) {
        throw new Error('삭제할 분류 데이터가 없습니다.');
      }

             const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
        
              const response = await fetch(`${gatewayUrl}/delete-classification`, {
         method: 'DELETE',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           source_table: row.source_table,
           source_id: row.source_id
         }),
       });

      if (!response.ok) {
        throw new Error('분류 삭제 실패');
      }

      // 로컬 상태 업데이트
      setData(prev => prev.map(r => 
        r.id === rowId 
          ? { ...r, 분류: null }
          : r
      ));
      
      setStatus({ 
        type: 'success', 
        message: '분류가 삭제되어 재분류가 가능합니다.' 
      });
      
    } catch (error) {
      console.error('분류 삭제 오류:', error);
      setStatus({ type: 'error', message: '분류 삭제 중 오류가 발생했습니다.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 실적정보(투입물)와 실적정보(산출물) 분리
  const inputData = data.filter(row => row.source_table === 'input_data');
  const outputData = data.filter(row => row.source_table === 'output_data');

  // 분류 상태에 따른 색상 및 텍스트
  const getClassificationDisplay = (분류: ClassificationType | null) => {
    if (!분류) {
      return { text: '미분류', color: 'text-gray-400', bg: 'bg-gray-100' };
    }
    
    const colors = {
      '연료': { text: '연료', color: 'text-orange-600', bg: 'bg-orange-100' },
      '유틸리티': { text: '유틸리티', color: 'text-blue-600', bg: 'bg-blue-100' },
      '폐기물': { text: '폐기물', color: 'text-red-600', bg: 'bg-red-100' },
      '공정 생산품': { text: '공정 생산품', color: 'text-green-600', bg: 'bg-green-100' }
    };
    
    return colors[분류];
  };

  // 분류별 데이터 필터링
  const getFilteredDataByClassification = (classification: ClassificationType) => {
    return data.filter(row => row.분류 === classification);
  };

  // 분류별 통계 카드 클릭 핸들러
  const handleClassificationCardClick = (classification: ClassificationType) => {
    if (classification === '공정 생산품') {
      setViewMode('process_product');
    } else if (classification === '연료') {
      setViewMode('fuel');
    } else if (classification === '유틸리티') {
      setViewMode('utility');
    } else if (classification === '폐기물') {
      setViewMode('waste');
    }
  };

  // 뒤로가기 핸들러
  const handleBackToOverview = () => {
    setViewMode('overview');
  };

  // 행 편집 시작
  const handleEditRow = (rowId: string) => {
    const row = data.find(r => r.id === rowId);
    if (row) {
      setEditingRow(rowId);
      setEditingData({ ...row });
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData(null);
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!editingData) return;

    try {
      // 여기서 실제 데이터베이스 업데이트 로직을 구현할 수 있습니다
      setData(prev => prev.map(row => 
        row.id === editingRow ? editingData : row
      ));
      
      setStatus({ type: 'success', message: '데이터가 성공적으로 수정되었습니다.' });
      setEditingRow(null);
      setEditingData(null);
    } catch (error) {
      setStatus({ type: 'error', message: '데이터 수정 중 오류가 발생했습니다.' });
    }
  };

  // 행 삭제
  const handleDeleteRow = async (rowId: string) => {
    if (!confirm('정말로 이 데이터를 삭제하시겠습니까?')) return;

    try {
      // 여기서 실제 데이터베이스 삭제 로직을 구현할 수 있습니다
      setData(prev => prev.filter(row => row.id !== rowId));
      setStatus({ type: 'success', message: '데이터가 성공적으로 삭제되었습니다.' });
    } catch (error) {
      setStatus({ type: 'error', message: '데이터 삭제 중 오류가 발생했습니다.' });
    }
  };

  return (
    <CommonShell>
      <div className="p-6 space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ecotrace-text">데이터 관리</h1>
            <p className="text-ecotrace-textSecondary">데이터 분류 및 관리 시스템</p>
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

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-ecotrace-surface rounded-lg p-1 border border-ecotrace-border">
          <button
            onClick={() => setActiveTab('classification')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'classification'
                ? 'bg-ecotrace-accent text-white'
                : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            데이터 분류
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'view'
                ? 'bg-ecotrace-accent text-white'
                : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            분류 데이터 확인
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'classification' && (
          <div className="flex gap-6">
            {/* 좌측 데이터 테이블 영역 */}
            <div className="flex-1 space-y-6">
              {/* 실적정보(투입물) 섹션 */}
              <div>
                <h2 className="text-lg font-semibold text-ecotrace-text mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  실적정보(투입물)
                </h2>
                <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Checkbox
                              checked={selectedRows.size === inputData.filter(row => !row.분류).length && inputData.filter(row => !row.분류).length > 0}
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">주문처명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">오더번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류 상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {inputData.map((row) => {
                          const classificationDisplay = getClassificationDisplay(row.분류 || null);
                          const isClassified = !!(row.분류);
                          const isManualData = row.id.includes('manual_'); // 수동으로 추가된 데이터인지 확인
                          
                          return (
                            <tr key={row.id} className={`hover:bg-ecotrace-secondary/30 transition-colors ${
                              isClassified ? 'opacity-60' : ''
                            }`}>
                              <td className="px-4 py-3">
                                <Checkbox
                                  checked={selectedRows.has(row.id)}
                                  onChange={() => toggleRowSelection(row.id)}
                                  disabled={isClassified}
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
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.주문처명 || '-'}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.오더번호 || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classificationDisplay.bg} ${classificationDisplay.color}`}>
                                  {classificationDisplay.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {isManualData && (
                                  <Button
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    삭제
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {inputData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <p>실적정보(투입물)가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 실적정보(산출물) 섹션 */}
              <div>
                <h2 className="text-lg font-semibold text-ecotrace-text mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  실적정보(산출물)
                </h2>
                <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Checkbox
                              checked={selectedRows.size === outputData.filter(row => !row.분류).length && outputData.filter(row => !row.분류).length > 0}
                              onChange={toggleAllSelection}
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">주문처명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">오더번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">분류 상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ecotrace-border">
                        {outputData.map((row) => {
                          const classificationDisplay = getClassificationDisplay(row.분류 || null);
                          const isClassified = !!(row.분류);
                          const isManualData = row.id.includes('manual_'); // 수동으로 추가된 데이터인지 확인
                          
                          return (
                            <tr key={row.id} className={`hover:bg-ecotrace-secondary/30 transition-colors ${
                              isClassified ? 'opacity-60' : ''
                            }`}>
                              <td className="px-4 py-3">
                                <Checkbox
                                  checked={selectedRows.has(row.id)}
                                  onChange={() => toggleRowSelection(row.id)}
                                  disabled={isClassified}
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
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.주문처명 || '-'}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.오더번호 || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classificationDisplay.bg} ${classificationDisplay.color}`}>
                                  {classificationDisplay.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {isManualData && (
                                  <Button
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    삭제
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {outputData.length === 0 && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <p>실적정보(산출물)가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측 분류 설정 박스 */}
            <div className="w-80 bg-ecotrace-surface rounded-lg border border-ecotrace-border p-6 h-fit">
              <h3 className="text-lg font-semibold text-ecotrace-text mb-4">분류 설정</h3>
              
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-ecotrace-textSecondary mb-2">분류 타입 선택</label>
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
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                <Save className="w-4 h-4 mr-2" />
                {isClassifying ? '분류 중...' : `${selectedClassification}으로 분류하기`}
              </Button>
              
              <Button
                onClick={() => setSelectedRows(new Set())}
                disabled={selectedRows.size === 0}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                선택 해제
              </Button>
            </div>
          </div>
        )}

        {/* 분류 데이터 확인 탭 */}
        {activeTab === 'view' && (
          <div className="space-y-6">
            {/* 개요 모드 - 분류별 통계 카드 */}
            {viewMode === 'overview' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ecotrace-text">분류별 데이터 통계</h3>
                  <p className="text-sm text-ecotrace-textSecondary">각 분류를 클릭하여 상세 데이터를 확인하세요</p>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {(['연료', '유틸리티', '폐기물', '공정 생산품'] as ClassificationType[]).map((type) => {
                    const count = data.filter(row => row.분류 === type).length;
                    const classificationDisplay = getClassificationDisplay(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleClassificationCardClick(type)}
                        className="bg-ecotrace-surface rounded-lg border border-ecotrace-border p-4 hover:bg-ecotrace-secondary/30 transition-all duration-200 hover:scale-105 cursor-pointer group"
                      >
                        <div className="text-2xl font-bold text-ecotrace-accent group-hover:text-white transition-colors">
                          {count}
                        </div>
                        <div className={`text-sm font-medium ${classificationDisplay.color} group-hover:text-white transition-colors`}>
                          {type}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* 개별 분류 모드 - 뒤로가기 버튼과 상세 데이터 */}
            {viewMode !== 'overview' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onClick={handleBackToOverview}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    통계로 돌아가기
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold text-ecotrace-text">
                      {viewMode === 'fuel' && '연료 데이터'}
                      {viewMode === 'utility' && '유틸리티 데이터'}
                      {viewMode === 'waste' && '폐기물 데이터'}
                      {viewMode === 'process_product' && '공정 생산품 데이터'}
                    </h3>
                    <p className="text-sm text-ecotrace-textSecondary">
                      총 {(() => {
                        if (viewMode === 'fuel') return getFilteredDataByClassification('연료').length;
                        if (viewMode === 'utility') return getFilteredDataByClassification('유틸리티').length;
                        if (viewMode === 'waste') return getFilteredDataByClassification('폐기물').length;
                        if (viewMode === 'process_product') return getFilteredDataByClassification('공정 생산품').length;
                        return 0;
                      })()}개 데이터
                    </p>
                  </div>
                </div>

                {/* 분류별 상세 데이터 테이블 */}
                <div className="bg-ecotrace-surface rounded-lg border border-ecotrace-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ecotrace-secondary/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">물질명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">주문처명</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">오더번호</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">작업</th>
                        </tr>
                      </thead>
                                            <tbody className="divide-y divide-ecotrace-border">
                        {(() => {
                          let filteredData: DataRow[] = [];
                          if (viewMode === 'fuel') filteredData = getFilteredDataByClassification('연료');
                          else if (viewMode === 'utility') filteredData = getFilteredDataByClassification('유틸리티');
                          else if (viewMode === 'waste') filteredData = getFilteredDataByClassification('폐기물');
                          else if (viewMode === 'process_product') filteredData = getFilteredDataByClassification('공정 생산품');
                          
                          return filteredData.map((row) => (
                            <tr key={row.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.로트번호}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.생산수량}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입일}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.종료일}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.공정}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.투입물명}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.수량}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.단위}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.주문처명 || '-'}</td>
                              <td className="px-4 py-3 text-sm text-ecotrace-text">{row.오더번호 || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                <Button
                                  onClick={() => deleteClassification(row.id)}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  분류 삭제
                                </Button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                                     {(() => {
                     let filteredData: DataRow[] = [];
                     if (viewMode === 'fuel') filteredData = getFilteredDataByClassification('연료');
                     else if (viewMode === 'utility') filteredData = getFilteredDataByClassification('유틸리티');
                     else if (viewMode === 'waste') filteredData = getFilteredDataByClassification('폐기물');
                     else if (viewMode === 'process_product') filteredData = getFilteredDataByClassification('공정 생산품');
                     
                     return filteredData.length === 0;
                   })() && (
                    <div className="text-center py-8 text-ecotrace-textSecondary">
                      <p>해당 분류의 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </CommonShell>
  );
}
