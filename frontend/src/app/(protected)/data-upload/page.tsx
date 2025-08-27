'use client';

import React, { useState, useRef } from 'react';
import {
  Home, 
  Database, 
  Shield, 
  FileText, 
  Settings, 
  Download, 
  Upload,
  FileSpreadsheet,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit3, 
  Save, 
  Table, 
  Brain, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

// 타입 정의
interface DataPreview {
  filename: string;
  fileSize: string;
  data: any[];
  columns: string[];
}

interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: any[];
  columns: string[];
  processed_count?: number;
}

interface EditableRow {
  id: string;
  originalData: any;
  modifiedData: any;
  isEditing: boolean;
  editReason?: string;
  isNewlyAdded?: boolean; // 새로 추가된 행 여부를 나타내는 플래그
}

const DataUploadPage: React.FC = () => {
  // 상태 관리
  const [currentTab, setCurrentTab] = useState<'실적정보' | '데이터분류' | '운송정보'>('실적정보');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preparedDataForDB, setPreparedDataForDB] = useState<any>(null);
  const [editReasons, setEditReasons] = useState<{ [key: string]: string }>({}); // 수정 사유 저장
  const inputFileRef = useRef<HTMLInputElement>(null);

    // 템플릿 다운로드 함수 (간단한 방식)
  const handleTemplateDownload = async () => {
    try {
      // 간단하게 public/templates에서 직접 다운로드
      const templateUrl = '/templates/실적_데이터_인풋.xlsx';
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error(`템플릿 다운로드 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '실적 데이터 (인풋).xlsx';
      
      // 다운로드 실행
      document.body.appendChild(a);
      a.click();
      
      // 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setError(null);
      console.log('템플릿 다운로드 성공');
      
    } catch (err) {
      console.error('템플릿 다운로드 오류:', err);
      setError('템플릿 다운로드에 실패했습니다.');
    }
  };

  // 파일 선택 핸들러
  const handleInputFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
        setInputFile(null);
        return;
      }

      setInputFile(selectedFile);
      setError(null);
      setInputData(null);
      setEditableInputRows([]);
      setAiProcessedData(null);
    }
  };

  // 파일 업로드 처리
  const handleInputUpload = async () => {
    if (!inputFile) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsInputUploading(true);
    setError(null);

    try {
      // Excel 파일 읽기
      const XLSX = await import('xlsx');
      const arrayBuffer = await inputFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // 첫 번째 행에서 컬럼명 추출
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const columns = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          columns.push(cell.v.toString().trim());
        }
      }

      // 컬럼 형식 검증
      if (!validateTemplateFormat(columns)) {
        setIsInputUploading(false);
        return;
      }

      // 데이터 읽기 (첫 번째 행 제외)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: columns,
        range: 1, // 첫 번째 행(헤더) 제외
        defval: '' // 빈 셀은 빈 문자열로 처리
      });

      // AI추천답변 컬럼 추가
      const dataWithAiColumn = jsonData.map((row: any) => ({
        ...row,
        'AI추천답변': ''
      }));

      // 편집 가능한 행 데이터 생성
      const editableRows: EditableRow[] = dataWithAiColumn.map((row, index) => ({
        id: `input-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false
      }));

      const inputData: DataPreview = {
        filename: inputFile.name,
        fileSize: (inputFile.size / 1024 / 1024).toFixed(2),
        data: dataWithAiColumn,
        columns: [...columns, 'AI추천답변']
      };

      setInputData(inputData);
      setEditableInputRows(editableRows);
      setError(null);

      // AI 처리 즉시 시작
      await handleAIProcessImmediate(inputData);

    } catch (err) {
      console.error('파일 업로드 오류:', err);
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsInputUploading(false);
    }
  };

  // 템플릿 형식 검증
  const validateTemplateFormat = (columns: string[]): boolean => {
    const requiredColumns = [
      '로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '투입물명', '수량', '단위'
    ];
    
    const hasAllRequiredColumns = requiredColumns.every(col => {
      const found = columns.some(uploadedCol => {
        const cleanRequired = col.trim().toLowerCase().replace(' ', '').replace('_', '');
        const cleanUploaded = uploadedCol.trim().toLowerCase().replace(' ', '').replace('_', '');
        return cleanRequired === cleanUploaded;
      });
      return found;
    });
    
    if (!hasAllRequiredColumns) {
      const missingColumns = requiredColumns.filter(col => {
        return !columns.some(uploadedCol => {
          const cleanRequired = col.trim().toLowerCase().replace(' ', '').replace('_', '');
          const cleanUploaded = uploadedCol.trim().toLowerCase().replace(' ', '').replace('_', '');
          return cleanRequired === cleanUploaded;
        });
      });
      setError(`템플릿을 확인해 주세요. 누락된 컬럼: ${missingColumns.join(', ')}`);
      return false;
    }
    
    return true;
  };

  // AI 처리 즉시 시작
  const handleAIProcessImmediate = async (inputData: DataPreview) => {
    if (!inputData || !inputData.data || inputData.data.length === 0) {
      console.log('AI 처리할 데이터가 없습니다.');
      return;
    }

    setIsAiProcessing(true);
    setError(null);

    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      console.log('=== AI 처리 시작 ===');
      console.log('게이트웨이 URL:', gatewayUrl);
      console.log('전송할 데이터:', inputData);
      
      const response = await fetch(`${gatewayUrl}/ai-process-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputData.filename,
          data: inputData.data,
          columns: inputData.columns
        })
      });

      if (!response.ok) {
        throw new Error(`AI 처리 요청 실패: ${response.status}`);
      }

      console.log('AI 처리 응답 수신, 스트리밍 시작...');
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트리밍 응답을 읽을 수 없습니다.');
      }

      let processedData: any[] = [];
      let unifiedColumns: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('스트리밍 완료');
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('스트리밍 데이터 수신:', data);
              
              if (data.status === 'completed') {
                processedData = data.data || [];
                unifiedColumns = data.columns || [];
                
                console.log('AI 처리 완료:', {
                  totalRows: data.total_rows,
                  processedRows: data.processed_rows,
                  data: processedData,
                  columns: unifiedColumns
                });
                
                // AI 처리 결과를 편집 가능한 행에 적용
                const editableRows: EditableRow[] = processedData.map((row, index) => ({
                  id: `input-${index}`,
                  originalData: row,
                  modifiedData: { ...row },
                  isEditing: false
                }));
                
                setEditableInputRows(editableRows);
                setAiProcessedData({
                  status: data.status,
                  message: data.message,
                  filename: data.filename,
                  total_rows: data.total_rows,
                  processed_rows: data.processed_rows,
                  data: processedData,
                  columns: unifiedColumns,
                  processed_count: data.processed_rows
                });
                
                break;
              } else if (data.status === 'processing') {
                console.log('AI 처리 진행 중:', data.message);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn('JSON 파싱 오류:', parseError);
            }
          }
        }
      }

    } catch (err) {
      console.error('AI 처리 오류:', err);
      setError(`AI 처리 중 오류가 발생했습니다: ${err}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      setInputFile(droppedFile);
      setError(null);
      setInputData(null);
      setEditableInputRows([]);
      setAiProcessedData(null);
    } else {
      setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 데이터 테이블 렌더링
  const renderDataTable = () => {
    if (!inputData || !editableInputRows || editableInputRows.length === 0) {
      return null;
    }

    return (
      <div className='mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>업로드된 데이터</h3>
          <p className='text-sm text-gray-600 mt-1'>
            총 {editableInputRows.length}행의 데이터가 업로드되었습니다
          </p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                {inputData.columns.map((column, index) => (
                  <th
                    key={index}
                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200'
                  >
                    {column}
                  </th>
                ))}
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200'>
                  작업
                </th>
              </tr>
            </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
              {editableInputRows.map((row, rowIndex) => (
                <>
                  {/* 메인 데이터 행 */}
                  <tr key={row.id} className={`hover:bg-gray-50 ${row.isEditing ? 'bg-blue-50' : ''} ${
                    row.originalData && Object.keys(row.originalData).length > 0 ? 'bg-green-50' : ''
                  }`}>
                    {inputData.columns.map((column, colIndex) => (
                      <td key={colIndex} className='px-4 py-3 text-sm text-gray-900 border-b border-gray-100'>
                        {row.isEditing ? (
                          renderInputField(row, column)
                        ) : (
                          column === 'AI추천답변' ? (
                            <div className='flex items-center gap-2'>
                              {isAiProcessing ? (
                                <span className='text-blue-600 text-xs'>AI 처리 대기중...</span>
                              ) : row.modifiedData[column] ? (
                                <span className='text-green-600 font-medium'>{row.modifiedData[column]}</span>
                              ) : (
                                <span className='text-gray-400 text-xs'>AI 추천 대기중</span>
                              )}
                            </div>
                          ) : (
                            <span className={column === '투입물명' ? 'font-medium text-blue-600' : ''}>
                              {row.modifiedData[column] || '-'}
                            </span>
                          )
                        )}
                      </td>
                    ))}
                    <td className='px-4 py-3 text-sm text-gray-900 border-b border-gray-100'>
                      {row.isEditing ? (
                        <div className='flex gap-2'>
                                                  {/* 새 행 추가인 경우 일반 저장, 기존 데이터 수정인 경우 사유와 함께 저장 */}
                        {(!row.originalData || Object.keys(row.originalData).length === 0) ? (
                          // 새로 추가된 행
                          <Button
                            onClick={() => handleSaveRow(row.id)}
                            disabled={!canSaveRow(row)}
                            variant='ghost'
                            size='sm'
                            className={`${
                              canSaveRow(row)
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                : 'text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            <CheckCircle className='w-4 h-4 mr-1' />
                            저장
                          </Button>
                        ) : (
                          // 기존 Excel 데이터 수정
                          row.modifiedData['AI추천답변'] !== row.originalData['AI추천답변'] ? (
                            <Button
                              onClick={() => handleSaveWithReason(row.id)}
                              variant='ghost'
                              size='sm'
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              <CheckCircle className='w-4 h-4 mr-1' />
                              사유와 함께 저장
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleSaveRow(row.id)}
                              disabled={!canSaveRow(row)}
                              variant='ghost'
                              size='sm'
                              className={`${
                                canSaveRow(row)
                                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                  : 'text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              <CheckCircle className='w-4 h-4 mr-1' />
                              저장
                            </Button>
                          )
                        )}
                          <Button
                            onClick={() => handleCancelRow(row.id)}
                            variant='ghost'
                            size='sm'
                            className='text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                          >
                            <X className='w-4 h-4 mr-1' />
                            취소
                          </Button>
                          {/* 삭제 버튼 - 새로 추가된 행이면 편집 모드에서도 표시 */}
                          {row.isNewlyAdded && (
                            <Button
                              onClick={() => handleDeleteRow(row.id)}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              삭제
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            onClick={() => handleEditRow(row.id)}
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          >
                            <Edit3 className='w-4 h-4 mr-1' />
                            편집
                          </Button>
                          {/* 삭제 버튼 - 새로 추가된 행이면 편집 모드와 관계없이 표시 */}
                          {row.isNewlyAdded && (
                            <Button
                              onClick={() => handleDeleteRow(row.id)}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              삭제
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* 수정 사유 입력 행 - 기존 Excel 데이터 편집 시에만 표시 */}
                  {row.isEditing && row.originalData && Object.keys(row.originalData).length > 0 && (
                    <tr key={`${row.id}-reason`} className='bg-orange-50 border-b border-orange-200'>
                      <td colSpan={inputData.columns.length} className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center'>
                            <span className='text-orange-600 text-xs'>📝</span>
                          </div>
                          <div className='flex-1'>
                            <label className='block text-sm font-medium text-orange-800 mb-1'>
                              수정 사유 (선택사항)
                            </label>
                            <input
                              type='text'
                              value={editReasons[row.id] || ''}
                              onChange={(e) => handleReasonChange(row.id, e.target.value)}
                              placeholder='수정 사유를 입력하세요 (입력하지 않아도 저장 가능)'
                              className='w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 placeholder-gray-500'
                            />
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900 border-b border-orange-200'>
                        {/* 수정 사유 행의 작업 컬럼은 비워둠 */}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 새 행 추가 버튼 - 테이블 하단에 배치 */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
          <div className='flex justify-center'>
            <Button 
              onClick={handleAddNewRow}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors'
            >
              <Plus className='w-5 h-5 mr-2' />
              새 행 추가
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 행 편집 핸들러
  const handleEditRow = (rowId: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, isEditing: true }
          : row
      )
    );
  };

  // 새 행 추가 핸들러
  const handleAddNewRow = () => {
    const newRow: EditableRow = {
      id: `input-${Date.now()}`,
      originalData: {},
      modifiedData: {
        '로트번호': '',
        '생산품명': '',
        '생산수량': '',
        '투입일': '',
        '종료일': '',
        '공정': '',
        '투입물명': '',
        '수량': '',
        '단위': '',
        'AI추천답변': ''
      },
      isEditing: true,
      isNewlyAdded: true // 새로 추가된 행임을 표시
    };

    setEditableInputRows(prev => [...prev, newRow]);
  };

  // 행 저장 핸들러
  const handleSaveRow = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    // 새로 추가된 행인지 확인 (originalData가 비어있음)
    const isNewRow = !row.originalData || Object.keys(row.originalData).length === 0;
    
    if (isNewRow) {
      // 새 행의 경우 모든 필수 필드 검증
      if (!validateRequiredFields(row.modifiedData)) {
        setError('모든 필수 필드를 입력해주세요.');
        return;
      }
    }

    // 저장 처리 - 새로 추가된 행은 isNewlyAdded 플래그 유지
    setEditableInputRows(prev => 
      prev.map(r => 
        r.id === rowId 
          ? { 
              ...r, 
              isEditing: false,
              originalData: { ...r.modifiedData }, // 수정된 데이터를 원본으로 저장
              isNewlyAdded: isNewRow ? true : (r.isNewlyAdded || false) // 새로 추가된 행 플래그 유지
            }
          : r
      )
    );
    
    setError(null); // 에러 메시지 제거
  };

  // 필수 필드 검증
  const validateRequiredFields = (data: any): boolean => {
    const requiredFields = [
      '로트번호', '생산품명', '생산수량', '투입일', '종료일', 
      '공정', '투입물명', '수량', '단위'
    ];
    
    // 기본 필수 필드 검증
    const hasAllRequiredFields = requiredFields.every(field => {
      const value = data[field];
      return value && value.toString().trim() !== '';
    });
    
    if (!hasAllRequiredFields) {
      return false;
    }
    
    // 날짜 유효성 검사: 투입일이 종료일보다 늦으면 안됨
    const inputDate = new Date(data['투입일']);
    const endDate = new Date(data['종료일']);
    
    if (inputDate > endDate) {
      setError('투입일은 종료일보다 빠르거나 같아야 합니다.');
      return false;
    }
    
    return true;
  };

  // 저장 가능 여부 확인
  const canSaveRow = (row: EditableRow): boolean => {
    if (!row.isEditing) return false;
    
    // 새로 추가된 행인지 확인
    const isNewRow = !row.originalData || Object.keys(row.originalData).length === 0;
    
    if (isNewRow) {
      return validateRequiredFields(row.modifiedData);
    }
    
    return true; // 기존 행은 항상 저장 가능
  };

  // 행 취소 핸들러
  const handleCancelRow = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    // 새로 추가된 행인지 확인 (originalData가 비어있음)
    const isNewRow = !row.originalData || Object.keys(row.originalData).length === 0;
    
    if (isNewRow) {
      // 새 행인 경우 완전히 삭제
      handleDeleteRow(rowId);
    } else {
      // 기존 Excel 데이터인 경우 편집 모드만 해제하고 원본 데이터로 복원
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { ...r, isEditing: false, modifiedData: { ...r.originalData } }
            : r
        )
      );
      setError(null);
      console.log('기존 Excel 데이터 편집이 취소되었습니다:', rowId);
    }
  };

  // 행 삭제 핸들러
  const handleDeleteRow = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    // 새로 추가된 행인지 확인
    if (!row.isNewlyAdded) {
      // 새로 추가되지 않은 행은 삭제 불가
      setError('Excel로 업로드된 기존 데이터는 삭제할 수 없습니다.');
      return;
    }

    // 새로 추가된 행만 삭제 가능
    setEditableInputRows(prev => prev.filter(r => r.id !== rowId));
    setError(null);
    console.log('새로 추가된 행이 삭제되었습니다:', rowId);
  };

  // 입력값 변경 핸들러
  const handleInputChange = (rowId: string, column: string, value: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, modifiedData: { ...row.modifiedData, [column]: value } }
          : row
      )
    );
  };

  // 수정 사유 변경 핸들러
  const handleReasonChange = (rowId: string, reason: string) => {
    setEditReasons(prev => ({
      ...prev,
      [rowId]: reason
    }));
  };

  // DB 전송 준비 함수
  const handlePrepareDataForDB = () => {
    if (!editableInputRows || editableInputRows.length === 0) {
      setError('전송할 데이터가 없습니다.');
      return;
    }

    try {
      // DB 전송용 데이터 준비 (기존 기능 유지)
      const preparedData = editableInputRows.map(row => {
        const rowData = { ...row.modifiedData };
        
        // AI 추천 답변을 투입물명에 덮어쓰기 (기존 기능)
        if (rowData['AI추천답변'] && rowData['AI추천답변'].trim() !== '') {
          rowData['투입물명'] = rowData['AI추천답변'];
        }
        
        // AI 추천 답변 컬럼은 유지 (제거하지 않음) - 기존 기능
        // delete rowData['AI추천답변'];
        
        return rowData;
      });

      setPreparedDataForDB(preparedData);
      setError(null);
      
      console.log('DB 전송 준비 완료:', {
        totalRows: preparedData.length,
        columns: Object.keys(preparedData[0] || {}),
        sampleData: preparedData[0]
      });

      // 성공 메시지 표시 (기존 기능 유지 + 추가 정보)
      const aiProcessedCount = preparedData.filter(row => row['AI추천답변'] && row['AI추천답변'].trim() !== '').length;
      const originalKeptCount = preparedData.length - aiProcessedCount;
      
      alert(`DB 전송 준비가 완료되었습니다!\n총 ${preparedData.length}행의 데이터가 준비되었습니다.\n\n📊 AI 처리 현황:\n• AI 추천 답변 적용: ${aiProcessedCount}행\n• 원본 유지: ${originalKeptCount}행\n\n💡 사용자가 수정하지 않은 데이터는 AI가 올바르게 답변했다고 자동 인식됩니다.\n\nAI 추천 답변이 투입물명에 반영되었습니다.`);

    } catch (err) {
      console.error('DB 전송 준비 오류:', err);
      setError(`DB 전송 준비 중 오류가 발생했습니다: ${err}`);
    }
  };

  // 수정 사유 저장 및 피드백 전송
  const handleSaveWithReason = async (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    const reason = editReasons[rowId] || '';
    
    // 수정 사유가 입력되지 않은 경우
    if (!reason.trim()) {
      setError('수정 사유를 입력해주세요.');
      return;
    }

    try {
      // 피드백 데이터 준비
      const feedbackData = {
        공정: row.modifiedData['공정'] || '',
        투입물명: row.modifiedData['투입물명'] || '',
        수정된결과: row.modifiedData['AI추천답변'] || '',
        사유: reason,
        생산품명: row.modifiedData['생산품명'] || ''
      };

      // 피드백 데이터를 AI 서비스로 전송
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error(`피드백 저장 실패: ${response.status}`);
      }

      // 성공적으로 저장된 경우
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { 
                ...r, 
                isEditing: false,
                originalData: { ...r.modifiedData } // 수정된 데이터를 원본으로 저장
              }
            : r
        )
      );

      // 수정 사유 초기화
      setEditReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[rowId];
        return newReasons;
      });

      setError(null);
      console.log('피드백 저장 성공:', feedbackData);

    } catch (err) {
      console.error('피드백 저장 오류:', err);
      setError(`피드백 저장 중 오류가 발생했습니다: ${err}`);
    }
  };

  // 입력 유효성 검사
  const validateInput = (column: string, value: string): boolean => {
    // 최대 20글자 제한
    if (value.length > 20) {
      console.log(`글자 수 초과: ${column} - ${value.length}글자`);
      return false;
    }
    
    switch (column) {
      case '로트번호':
      case '생산수량':
      case '수량':
        const isNumberValid = /^\d*$/.test(value);
        if (!isNumberValid) {
          console.log(`숫자만 입력 가능: ${column} - ${value}`);
        }
        return isNumberValid;
      case '투입일':
      case '종료일':
        const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(value) || value === '';
        if (!isDateValid) {
          console.log(`날짜 형식 오류: ${column} - ${value}`);
        }
        return isDateValid;
      case '생산품명':
      case '공정':
      case '투입물명':
      case '단위':
        // 한글, 영문, 공백, 숫자, 특수문자 일부 허용 (더 유연하게)
        const isTextValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isTextValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
        }
        return isTextValid;
      default:
        return true;
    }
  };

    // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const isNewRow = !row.originalData || Object.keys(row.originalData).length === 0;
    const isRequired = isNewRow && ['로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '투입물명', '수량', '단위'].includes(column);
    const hasValue = value && value.toString().trim() !== '';
    
    // Excel로 입력된 기존 행인지 확인
    const isExistingRow = !isNewRow;
    
    // 새로 추가된 행은 모든 컬럼 편집 가능, 기존 행은 AI 추천 답변만 편집 가능
    const isEditable = isNewRow || column === 'AI추천답변';
    
    const getInputClassName = () => {
      let baseClass = 'w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
      
      if (isRequired && !hasValue) {
        baseClass += ' border-red-300 bg-red-50';
      } else if (isRequired && hasValue) {
        // 날짜 유효성 검사 (새 행인 경우에만)
        if (isNewRow && ['투입일', '종료일'].includes(column)) {
          const inputDate = row.modifiedData['투입일'];
          const endDate = row.modifiedData['종료일'];
          
          if (inputDate && endDate) {
            const inputDateObj = new Date(inputDate);
            const endDateObj = new Date(endDate);
            
            if (inputDateObj > endDateObj) {
              baseClass += ' border-red-300 bg-red-50'; // 유효하지 않은 날짜
            } else {
              baseClass += ' border-green-300 bg-green-50'; // 유효한 날짜
            }
          } else {
            baseClass += ' border-green-300 bg-green-50'; // 날짜가 모두 입력되지 않음
          }
        } else {
          baseClass += ' border-green-300 bg-green-50';
        }
      } else if (!isEditable) {
        baseClass += ' border-gray-200 bg-gray-100';
      } else {
        baseClass += ' border-gray-300';
      }
      
      return baseClass;
    };
    
    // 편집 불가능한 필드인 경우 읽기 전용으로 표시
    if (!isEditable) {
      return (
        <div className='px-2 py-1 bg-gray-100 rounded text-sm text-gray-700'>
          {value || '-'}
        </div>
      );
    }
    
    switch (column) {
      case '로트번호':
      case '생산수량':
      case '수량':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={20}
              onChange={(e) => {
                const newValue = e.target.value;
                if (validateInput(column, newValue)) {
                  handleInputChange(row.id, column, newValue);
                }
              }}
              placeholder={isRequired ? '숫자만 입력 *' : '숫자만 입력'}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
          </div>
        );
      
      case '투입일':
      case '종료일':
        return (
          <div className='relative'>
            <input
              type='date'
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                handleInputChange(row.id, column, newValue);
                
                // 날짜 변경 시 실시간 유효성 검사 (새 행인 경우에만)
                if (isNewRow && newValue) {
                  const currentData = { ...row.modifiedData, [column]: newValue };
                  if (currentData['투입일'] && currentData['종료일']) {
                    const inputDate = new Date(currentData['투입일']);
                    const endDate = new Date(currentData['종료일']);
                    
                    if (inputDate > endDate) {
                      setError('투입일은 종료일보다 빠르거나 같아야 합니다.');
                    } else {
                      setError(null);
                    }
                  }
                }
              }}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
          </div>
        );
      
      case '생산품명':
      case '공정':
      case '투입물명':
      case '단위':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={20}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log(`입력 시도: ${column} - "${newValue}" (${newValue.length}글자)`);
                
                // 유효성 검사 통과하면 즉시 업데이트
                if (validateInput(column, newValue)) {
                  console.log(`유효성 검사 통과: ${column} - "${newValue}"`);
                  handleInputChange(row.id, column, newValue);
                } else {
                  console.log(`유효성 검사 실패: ${column} - "${newValue}"`);
                  // 유효하지 않은 경우에도 입력은 허용하되, 경고 표시
                  handleInputChange(row.id, column, newValue);
                }
              }}
              placeholder={isRequired ? '한글/영문/숫자 입력 *' : '한글/영문/숫자 입력'}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
          </div>
        );
      
      case 'AI추천답변':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={20}
              onChange={(e) => handleInputChange(row.id, column, e.target.value)}
              placeholder={isNewRow ? 'AI 추천 답변을 입력하세요' : 'AI 추천 답변을 수정하거나 입력하세요'}
              className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isNewRow ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'
              }`}
            />
            <span className={`absolute -top-2 -right-2 text-xs ${
              isNewRow ? 'text-green-500' : 'text-blue-500'
            }`}>
              {isNewRow ? '✏️' : '✏️'}
            </span>
          </div>
        );
      
      default:
        return (
          <span>{value || '-'}</span>
        );
    }
  };

    return (
    <div className='flex h-screen bg-gray-50'>
      {/* 왼쪽 사이드바 메뉴 */}
      <div className='w-64 bg-white shadow-lg border-r border-gray-200'>
        <div className='p-6'>
          <div className='mb-6'>
            <h1 className='text-xl font-bold text-gray-900'>GreenSteel</h1>
            <p className='text-sm text-gray-600 mt-1'>AI 기반 데이터 관리 시스템</p>
                            </div>
          
          <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>메뉴</h2>
          <nav className='space-y-1'>
            <a href='/' className='flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors'>
              <Home className='w-5 h-5' />
              <span className='text-sm font-medium'>홈</span>
            </a>
            
            <a href='/lca' className='flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors'>
              <Database className='w-5 h-5' />
              <span className='text-sm font-medium'>LCA</span>
            </a>
            
            <a href='/cbam' className='flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors'>
              <Shield className='w-5 h-5' />
              <span className='text-sm font-medium'>CBAM</span>
            </a>
            
            <div className='space-y-1'>
              <div className='flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200'>
                <FileText className='w-5 h-5' />
                <span className='text-sm font-medium'>데이터 업로드</span>
              </div>
              <div className='ml-6 space-y-1'>
                <a href='/data-upload' className='block px-3 py-2 text-xs text-blue-600 font-medium bg-blue-50 rounded border border-blue-200'>실적정보(투입물)</a>
                <a href='/data-upload/output' className='block px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors'>실적정보(산출물)</a>
                <a href='/data-upload/transport' className='block px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors'>운송정보</a>
                <a href='/data-upload/process' className='block px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors'>공정정보</a>
              </div>
            </div>
          
            <a href='/settings' className='flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors'>
              <Settings className='w-5 h-5' />
              <span className='text-sm font-medium'>설정</span>
            </a>
          </nav>
          </div>
        </div>

      {/* 메인 콘텐츠 영역 */}
      <div className='flex-1 flex flex-col'>
        {/* 상단 탭 네비게이션 */}
        <div className='bg-white border-b border-gray-200 shadow-sm'>
          <div className='flex space-x-8 px-6'>
            {[
              { key: '실적정보', label: '데이터 업로드', active: true },
              { key: '데이터분류', label: '데이터분류', active: false },
              { key: '운송정보', label: '운송정보', active: false }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tab.active
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
                  </div>
              </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 flex overflow-hidden'>
          {/* 중앙 콘텐츠 영역 */}
          <div className='flex-1 p-8 overflow-y-auto bg-gray-50'>
            <div className='max-w-6xl mx-auto space-y-8'>
              {/* 페이지 헤더 */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>실적정보(투입물)</h1>
                  </div>
                  </div>
                </div>

              {/* 1. 템플릿 다운로드 섹션 */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <Download className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900'>템플릿 다운로드</h2>
                    <p className='text-sm text-gray-600'>표준 형식의 템플릿을 다운로드하여 데이터 입력에 활용하세요</p>
                  </div>
                  </div>
                  <Button
                  onClick={handleTemplateDownload}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors'
                  >
                  <Download className='w-4 h-4 mr-2' />
                  템플릿 다운로드
                  </Button>
                </div>
                
              {/* 2. Excel 업로드 섹션 */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                    <Upload className='w-5 h-5 text-green-600' />
                    </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900'>Excel 업로드</h2>
                    <p className='text-sm text-gray-600'>템플릿 형식에 맞는 Excel 파일을 업로드하면 AI가 자동으로 투입물명을 표준화합니다</p>
                  </div>
                </div>
                
                                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                    inputFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={inputFileRef}
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleInputFileSelect}
                    className='hidden'
                  />

                  {!inputFile ? (
                    <div>
                      <Upload className='mx-auto h-16 w-16 text-gray-400 mb-6' />
                      <p className='text-xl text-gray-700 mb-3 font-medium'>
                        Excel 파일을 여기에 드래그하거나 클릭하여 선택하세요
                      </p>
                      <p className='text-gray-500 mb-6'>지원 형식: .xlsx, .xls</p>
                      <Button
                        onClick={() => inputFileRef.current?.click()}
                        variant='outline'
                        className='border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg rounded-lg transition-colors'
                      >
                        파일 선택
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <FileSpreadsheet className='mx-auto h-16 w-16 text-green-500 mb-6' />
                      <p className='text-xl text-gray-900 mb-3 font-medium'>{inputFile.name}</p>
                      <p className='text-gray-500 mb-6'>
                        파일 크기: {(inputFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className='space-x-4'>
                        <Button
                          onClick={handleInputUpload}
                          disabled={isInputUploading}
                          className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-lg transition-colors'
                        >
                          {isInputUploading ? '업로드 중...' : '업로드 및 AI 처리'}
                        </Button>
                        <Button onClick={() => setInputFile(null)} variant='ghost' className='text-gray-600 hover:bg-gray-100 px-6 py-3 text-lg rounded-lg transition-colors'>
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                </div>

              {/* 에러 메시지 - Excel 업로드와 데이터 테이블 사이에 표시 */}
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                      <AlertCircle className='h-5 w-5 text-red-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-red-800'>오류가 발생했습니다</h3>
                      <p className='text-red-700 mt-1'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 데이터 테이블 섹션 */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <Table className='w-5 h-5 text-purple-600' />
                </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>업로드된 데이터</h3>
                    <p className='text-sm text-gray-600'>Excel 파일의 내용을 확인하고 AI 처리 결과를 확인할 수 있습니다</p>
                  </div>
                </div>

                                {inputData && (
                  <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center gap-2 mb-3'>
                      <CheckCircle className='w-5 h-5 text-blue-600' />
                      <h3 className='text-sm font-semibold text-blue-900'>파일 업로드 완료</h3>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                      <div className='bg-white rounded p-3 border border-blue-200'>
                        <p className='text-xs font-medium text-blue-900'>파일명</p>
                        <p className='text-sm text-blue-700'>{inputData.filename}</p>
                      </div>
                      <div className='bg-white rounded p-3 border border-blue-200'>
                        <p className='text-xs font-medium text-blue-900'>크기</p>
                        <p className='text-sm text-blue-700'>{inputData.fileSize} MB</p>
                      </div>
                      <div className='bg-white rounded p-3 border border-blue-200'>
                        <p className='text-xs font-medium text-blue-900'>데이터</p>
                        <p className='text-sm text-blue-700'>{inputData.data.length}행 × {inputData.columns.length}열</p>
                      </div>
                    </div>
                    <p className='text-xs text-blue-600'>
                      ✅ 컬럼명 검증 완료: {inputData.columns.join(', ')}
                    </p>
                  </div>
                )}
                
                {!inputData && (
                  <div className='text-center py-12 text-gray-500'>
                    <Table className='mx-auto h-12 w-12 mb-4' />
                    <p>Excel 파일을 업로드하면 데이터가 여기에 표시됩니다</p>
                  </div>
                )}

                {/* 데이터 테이블 표시 */}
                {renderDataTable()}
              </div>



              {/* AI 처리 완료 메시지 */}
              {aiProcessedData && (
                <div className='bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 text-center'>
                  <div className='flex items-center justify-center gap-3 mb-4'>
                    <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                      <Brain className='h-6 w-6 text-green-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-green-800'>AI 모델 처리 완료!</h3>
                      <p className='text-sm text-green-700'>
                        {aiProcessedData.processed_count}행의 투입물명이 AI 모델로 표준화되었습니다
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. 데이터 확인 버튼 */}
              <div className='flex justify-center'>
                <Button 
                  onClick={handlePrepareDataForDB}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl'
                >
                  📊 데이터 확인 및 저장 준비
                </Button>
              </div>

              {/* DB 전송 준비 완료 상태 */}
              {preparedDataForDB && (
                <div className='bg-green-50 border border-green-200 rounded-xl p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                      <CheckCircle className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-green-800'>DB 전송 준비 완료!</h3>
                      <p className='text-sm text-green-700 mt-1'>
                        총 {preparedDataForDB.length}행의 데이터가 DB 전송 준비되었습니다
                      </p>
                    </div>
                  </div>
                  
                  <div className='bg-white rounded-lg p-4 border border-green-200'>
                    <h4 className='font-medium text-green-800 mb-2'>처리된 데이터 정보:</h4>
                    <ul className='text-sm text-green-700 space-y-1'>
                      <li>• AI 추천 답변이 투입물명에 반영됨</li>
                      <li>• AI 추천 답변 컬럼 유지됨</li>
                      <li>• DB 컬럼과 동일한 구조로 준비됨</li>
                      <li>• 총 {preparedDataForDB.length}행 × {Object.keys(preparedDataForDB[0] || {}).length}열</li>
                    </ul>
                  </div>
                  
                  <div className='mt-4 text-xs text-green-600'>
                    💡 이제 DB 연결 후 preparedDataForDB 데이터를 전송할 수 있습니다.
                  </div>
                </div>
              )}


                </div>
                  </div>
                </div>
                  </div>
                  </div>
  );
};

export default DataUploadPage;
