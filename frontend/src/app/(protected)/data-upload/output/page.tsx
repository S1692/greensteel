'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
FileText, 
  Edit3, 
  CheckCircle, 
  X, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Brain,
  Home,
  BarChart3,
  Shield,
  Settings,
  Grid3X3,
  Truck,
  Cog,
  Table,
  Plus,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';

import axios from 'axios';

interface EditableRow {
  id: string;
  originalData: any;
  modifiedData: any;
  isEditing: boolean;
  isNewlyAdded?: boolean;
}

interface InputData {
  filename: string;
  fileSize: string;
  data: any[];
  columns: string[];
}

interface AIProcessedData {
  processed_count: number;
  total_count: number;
}

export default function OutputDataPage() {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<InputData | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editReasons, setEditReasons] = useState<{ [key: string]: string }>({});
  const [preparedDataForDB, setPreparedDataForDB] = useState<any[] | null>(null);

  // refs
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 템플릿 다운로드 (간단한 방식)
  const handleTemplateDownload = async () => {
    try {
      // 간단하게 public/templates에서 직접 다운로드
      const templateUrl = '/templates/실적_데이터_아웃풋.xlsx';
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error(`템플릿 다운로드 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '실적 데이터 (아웃풋).xlsx';
      
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

  // 파일 선택
  const handleInputFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.match(/\.(xlsx|xls)$/)) {
      setInputFile(file);
      setError(null);
      setInputData(null);
      setEditableInputRows([]);
      setAiProcessedData(null);
    } else {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  // 파일 업로드 및 AI 처리
  const handleInputUpload = async () => {
    if (!inputFile) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsInputUploading(true);
    setError(null);

    try {
      // 파일 읽기
      const data = await readExcelFile(inputFile);
      
      // 템플릿 형식 검증
      const isValidFormat = validateTemplateFormat(data.columns);
      if (!isValidFormat) {
        setError('템플릿을 확인해 주세요');
        setIsInputUploading(false);
        return;
      }

      // 업로드된 데이터 설정
      const inputDataObj: InputData = {
        filename: inputFile.name,
        fileSize: (inputFile.size / 1024 / 1024).toFixed(2),
        data: data.data,
        columns: data.columns
      };
      
      setInputData(inputDataObj);

      // 편집 가능한 행으로 변환
      const editableRows: EditableRow[] = data.data.map((row, index) => ({
        id: `input-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false
      }));
      
      setEditableInputRows(editableRows);

      // AI 처리 즉시 시작
      await handleAIProcessImmediate(inputDataObj);

    } catch (err) {
      console.error('파일 업로드 오류:', err);
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsInputUploading(false);
    }
  };

  // Excel 파일 읽기
  const readExcelFile = (file: File): Promise<{ data: any[], columns: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('데이터가 충분하지 않습니다.'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((row: any) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve({ data: rows, columns: headers });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 템플릿 형식 검증 (산출물용)
  const validateTemplateFormat = (columns: string[]): boolean => {
    // 디버깅: 실제 업로드된 파일의 컬럼명 출력
    console.log('🔍 템플릿 형식 검증 시작');
    console.log('🔍 실제 업로드된 파일의 컬럼명:', columns);

    // 실제 산출물 템플릿의 컬럼명 (실제 파일 기준)
    const expectedColumns = [
      '로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '산출물명', '수량', '단위'
    ];

    console.log('🔍 예상 컬럼명:', expectedColumns);
    console.log('🔍 컬럼 개수 비교:', columns.length, 'vs', expectedColumns.length);

    // 컬럼 개수가 다르면 false
    if (columns.length !== expectedColumns.length) {
      console.log('❌ 컬럼 개수가 다릅니다!');
      return false;
    }

    // 각 컬럼이 포함되어 있는지 확인 (공백 제거 후 비교)
    const isValid = expectedColumns.every(expectedCol => {
      const trimmedExpected = expectedCol.trim();
      return columns.some(actualCol => actualCol.trim() === trimmedExpected);
    });

    console.log('🔍 컬럼 검증 결과:', isValid);

    if (!isValid) {
      const missingColumns = expectedColumns.filter(expectedCol => {
        const trimmedExpected = expectedCol.trim();
        return !columns.some(actualCol => actualCol.trim() === trimmedExpected);
      });
      console.log('❌ 누락된 컬럼:', missingColumns);
    }

    return isValid;
  };

  // AI 처리 즉시 시작 (산출물용)
  const handleAIProcessImmediate = async (data: InputData) => {
    try {
      // 산출물명 컬럼의 데이터 추출
      const outputNames = data.data.map(row => row['산출물명']).filter(Boolean);
      
      if (outputNames.length === 0) {
        setError('처리할 산출물명 데이터가 없습니다.');
        return;
      }

      console.log('🔍 AI 처리할 산출물명 데이터:', outputNames);
      console.log('🔍 AI 서비스 URL:', `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ailink/ai-process-stream`);

      // AI 서비스로 데이터 전송
      const response = await axios.post(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ailink/ai-process-stream`, {
        data: outputNames
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const processedData = response.data.processed_data;
        
        // AI 처리 결과를 기존 데이터에 추가
        const updatedRows = editableInputRows.map((row, index) => {
          if (index < processedData.length) {
            const aiRecommendation = processedData[index];
            return {
              ...row,
              modifiedData: {
                ...row.modifiedData,
                'AI추천답변': aiRecommendation
              }
            };
          }
          return row;
        });

        setEditableInputRows(updatedRows);
        setAiProcessedData({
          processed_count: processedData.length,
          total_count: outputNames.length
        });

        setError(null);
      } else {
        setError('AI 처리에 실패했습니다.');
      }

    } catch (err: any) {
      console.error('AI 처리 오류:', err);
      
      // 더 자세한 오류 정보 표시
      if (err.response) {
        // 서버 응답이 있는 경우
        setError(`AI 처리 중 오류가 발생했습니다. (${err.response.status}: ${err.response.data?.message || err.response.statusText})`);
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('AI 서비스에 연결할 수 없습니다. 게이트웨이와 AI 서비스가 실행 중인지 확인해주세요.');
      } else {
        // 기타 오류
        setError(`AI 처리 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
      }
    }
  };

  // 드래그 앤 드롭
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      setInputFile(droppedFile);
      setError(null);
      setInputData(null);
      setEditableInputRows([]);
      setAiProcessedData(null);
    } else {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // 행 편집
  const handleEditRow = (id: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, isEditing: true } : row
      )
    );
  };

  // 행 저장
  const handleSaveRow = (id: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, isEditing: false } : row
      )
    );
  };

  // 사유와 함께 저장
  const handleSaveWithReason = async (id: string) => {
    const row = editableInputRows.find(r => r.id === id);
    if (!row) return;

    const reason = editReasons[id] || '';
    
         try {
       // 피드백 데이터 저장
       const feedbackData = {
         공정: row.modifiedData['공정'],
         산출물명: row.originalData['산출물명'],
         수정된결과: row.modifiedData['AI추천답변'],
         사유: reason,
         생산품명: row.modifiedData['생산품명']
       };

      await axios.post(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ailink/save-feedback`, feedbackData);
      
      // 편집 모드 종료
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === id ? { ...r, isEditing: false } : r
        )
      );
      
      // 사유 입력 초기화
      setEditReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[id];
        return newReasons;
      });

      setError(null);
    } catch (err) {
      console.error('피드백 저장 오류:', err);
      setError('피드백 저장에 실패했습니다.');
    }
  };

  // 행 취소
  const handleCancelRow = (id: string) => {
    const row = editableInputRows.find(r => r.id === id);
    if (!row) return;

    if (row.isNewlyAdded) {
      // 새로 추가된 행은 완전히 제거
      setEditableInputRows(prev => prev.filter(r => r.id !== id));
    } else {
      // 기존 데이터는 원본으로 복원
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === id ? { ...r, isEditing: false, modifiedData: { ...r.originalData } } : r
        )
      );
    }

    // 사유 입력 초기화
    setEditReasons(prev => {
      const newReasons = { ...prev };
      delete newReasons[id];
      return newReasons;
    });
  };

  // 행 삭제
  const handleDeleteRow = (id: string) => {
    setEditableInputRows(prev => prev.filter(row => row.id !== id));
  };

  // 새 행 추가
  const handleAddNewRow = () => {
    const newRow: EditableRow = {
      id: `new-${Date.now()}`,
      originalData: {},
      modifiedData: {
        '로트번호': '',
        '생산품명': '',
        '생산수량': '',
        '투입일': '',
        '종료일': '',
        '공정': '',
        '산출물명': '',
        '수량': '',
        '단위': '',
        'AI추천답변': ''
      },
      isEditing: true,
      isNewlyAdded: true
    };

    setEditableInputRows(prev => [...prev, newRow]);
  };

  // 입력 변경 처리
  const handleInputChange = (id: string, column: string, value: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === id 
          ? { ...row, modifiedData: { ...row.modifiedData, [column]: value } }
          : row
      )
    );
  };

  // 입력 검증
  const validateInput = (value: string, type: 'number' | 'date' | 'text'): boolean => {
    switch (type) {
      case 'number':
        return /^\d*$/.test(value);
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      case 'text':
        return /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
      default:
        return true;
    }
  };

  // 필수 필드 검증
  const validateRequiredFields = (row: EditableRow): boolean => {
    const requiredFields = ['로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '산출물명', '수량', '단위'];
    return requiredFields.every(field => {
      const value = row.modifiedData[field];
      return value && value.toString().trim() !== '';
    });
  };

  // 저장 가능 여부 확인
  const canSaveRow = (row: EditableRow): boolean => {
    if (!validateRequiredFields(row)) return false;
    
    // 날짜 유효성 검사
    const inputDate = row.modifiedData['투입일'];
    const endDate = row.modifiedData['종료일'];
    
    if (inputDate && endDate) {
      const inputDateObj = new Date(inputDate);
      const endDateObj = new Date(endDate);
      if (inputDateObj > endDateObj) return false;
    }
    
    return true;
  };

  // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const isNewRow = row.isNewlyAdded;
    
    // AI 추천 답변 컬럼은 항상 편집 가능
    if (column === 'AI추천답변') {
      return (
        <input
          type='text'
          value={value}
          onChange={(e) => handleInputChange(row.id, column, e.target.value)}
          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          maxLength={20}
        />
      );
    }

    // 새로 추가된 행은 모든 컬럼 편집 가능
    if (isNewRow) {
      let inputType = 'text';
      let placeholder = '';
      
      if (column === '로트번호' || column === '생산수량' || column === '수량') {
        inputType = 'number';
        placeholder = '숫자만 입력';
      } else if (column === '투입일' || column === '종료일') {
        inputType = 'date';
        placeholder = 'YYYY-MM-DD';
      } else {
        placeholder = '텍스트 입력';
      }

      return (
        <input
          type={inputType}
          value={value}
          onChange={(e) => handleInputChange(row.id, column, e.target.value)}
          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder={placeholder}
          maxLength={20}
        />
      );
    }

    // 기존 Excel 데이터는 AI 추천 답변만 편집 가능
    return (
      <span className='text-gray-900'>{value}</span>
    );
  };

  // 데이터 테이블 렌더링
  const renderDataTable = () => {
    if (!inputData || !editableInputRows.length) {
      return null;
    }

    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900'>데이터 테이블</h3>
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
                <React.Fragment key={row.id}>
                  <tr className={`${row.isNewlyAdded ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
                    {inputData.columns.map((column, colIndex) => (
                      <td key={colIndex} className='px-4 py-3 text-sm text-gray-900 border-b border-gray-100'>
                        {row.isEditing ? (
                          renderInputField(row, column)
                        ) : (
                          <span className={row.isNewlyAdded ? 'font-medium' : ''}>
                            {row.modifiedData[column] || ''}
                          </span>
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
                                variant='ghost'
                                size='sm'
                                className='text-green-600 hover:text-green-700 hover:bg-green-50'
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
                            className='text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                          >
                            <X className='w-4 h-4 mr-1' />
                            취소
                          </Button>
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
                    <tr className='bg-orange-50 border-b border-orange-200'>
                      <td colSpan={inputData.columns.length} className='px-4 py-3'>
                        <div className='max-w-md'>
                          <label className='block text-sm font-medium text-orange-800 mb-1'>
                            수정 사유 (선택사항)
                          </label>
                          <input
                            type='text'
                            value={editReasons[row.id] || ''}
                            onChange={(e) => setEditReasons(prev => ({ ...prev, [row.id]: e.target.value }))}
                            placeholder='수정 사유를 입력하세요 (선택사항)'
                            className='w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900'
                            maxLength={100}
                          />
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900 border-b border-orange-200'>
                        {/* 수정 사유 행의 작업 컬럼은 비워둠 */}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 새 행 추가 버튼 - 테이블 하단에 배치 (투입물 페이지와 동일한 디자인) */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 mt-6'>
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

  // DB 전송 준비 함수
  const handlePrepareDataForDB = () => {
    if (!editableInputRows || editableInputRows.length === 0) {
      setError('전송할 데이터가 없습니다.');
      return;
    }

         try {
       // DB 전송용 데이터 준비
       const preparedData = editableInputRows.map(row => {
         const rowData = { ...row.modifiedData };
         
         // AI 추천 답변을 산출물명에 덮어쓰기
         if (rowData['AI추천답변'] && rowData['AI추천답변'].trim() !== '') {
           rowData['산출물명'] = rowData['AI추천답변'];
         }
         
         // AI 추천 답변 컬럼은 유지 (제거하지 않음)
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

             // 성공 메시지 표시
       alert(`DB 전송 준비가 완료되었습니다!\n총 ${preparedData.length}행의 데이터가 준비되었습니다.\n\nAI 추천 답변이 산출물명에 반영되었습니다.`);

    } catch (err) {
      console.error('DB 전송 준비 오류:', err);
      setError(`DB 전송 준비 중 오류가 발생했습니다: ${err}`);
    }
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* 왼쪽 사이드바 메뉴 */}
      <div className='w-64 bg-white shadow-lg border-r border-gray-200'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center'>
              <BarChart3 className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>GreenSteel</h1>
              <p className='text-sm text-gray-600 mt-1'>AI 기반 데이터 관리 시스템</p>
            </div>
          </div>
          
          <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>메뉴</h2>
          <nav className='space-y-1'>
            <a href='/' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Home className='w-5 h-5' />
              <span className='text-sm font-medium'>홈</span>
            </a>
            <a href='/lca' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <BarChart3 className='w-5 h-5' />
              <span className='text-sm font-medium'>LCA</span>
            </a>
            <a href='/cbam' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Shield className='w-5 h-5' />
              <span className='text-sm font-medium'>CBAM</span>
            </a>
            <div className='space-y-1'>
              <div className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-200'>
                <FileText className='w-5 h-5' />
                <span className='text-sm font-medium'>데이터 업로드</span>
              </div>
              <div className='ml-6 space-y-1'>
                <a href='/data-upload' className='block px-3 py-2 text-xs text-gray-700 font-medium'>실적정보(투입물)</a>
                <a href='/data-upload/output' className='block px-3 py-2 text-xs text-blue-600 font-medium bg-blue-50 rounded border border-blue-200'>실적정보(산출물)</a>
                <a href='/data-upload/transport' className='block px-3 py-2 text-xs text-gray-700 font-medium'>운송정보</a>
                <a href='/data-upload/process' className='block px-3 py-2 text-xs text-gray-700 font-medium'>공정정보</a>
              </div>
            </div>
            <a href='/data-classification' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Database className='w-5 h-5' />
              <span className='text-sm font-medium'>데이터 분류</span>
            </a>
            <a href='/settings' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Cog className='w-5 h-5' />
              <span className='text-sm font-medium'>설정</span>
            </a>
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='flex-1 flex flex-col'>
        {/* 상단 탭 네비게이션 */}
        <div className='bg-white border-b border-gray-200 shadow-sm'>
          <div className='flex space-x-8 px-6'>
            {[
              { key: '실적정보', label: '데이터 업로드', active: true, href: null },
              { key: '데이터분류', label: '데이터분류', active: false, href: '/data-classification' }
            ].map((tab) => (
              tab.href ? (
                <a
                  key={tab.key}
                  href={tab.href}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </a>
              ) : (
                <button
                  key={tab.key}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              )
            ))}
          </div>
        </div>

        {/* 상단 헤더 */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <h1 className='text-2xl font-bold text-gray-900'>실적정보(산출물)</h1>
              </div>
            </div>
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
                    <h1 className='text-2xl font-bold text-gray-900'>실적정보(산출물)</h1>
                  </div>
                </div>
              </div>

              {/* 1. 템플릿 다운로드 섹션 */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center gap-4 mb-4'>
              <Download className='w-8 h-8 text-blue-600' />
              <h2 className='text-xl font-semibold text-gray-900'>템플릿 다운로드</h2>
            </div>
            <p className='text-gray-600 mb-6'>표준 형식의 템플릿을 다운로드하여 데이터 입력에 활용하세요</p>
            <Button 
              onClick={handleTemplateDownload}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-lg transition-colors'
            >
              <Download className='w-5 h-5 mr-2' />
              템플릿 다운로드
            </Button>
          </div>
          
          {/* 2. Excel 업로드 섹션 */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center gap-4 mb-4'>
              <Upload className='w-8 h-8 text-green-600' />
              <h2 className='text-xl font-semibold text-gray-900'>Excel 업로드</h2>
            </div>
                         <p className='text-gray-600 mb-6'>템플릿 형식에 맞는 Excel 파일을 업로드하면 AI가 자동으로 산출물명을 표준화합니다</p>
            
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
                      className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-lg transition-colors disabled:opacity-50'
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

          {/* 오류 메시지 - Excel 업로드와 데이터 테이블 사이에 표시 */}
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

          {/* 3. 업로드된 데이터 섹션 */}
          {inputData && (
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
              
              {/* 업로드 완료 상태 */}
              <div className='bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <CheckCircle2 className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-blue-900'>파일 업로드 완료</h3>
                  </div>
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
            </div>
          )}

          {/* 데이터가 없을 때 안내 */}
          {!inputData && (
            <div className='text-center py-12 text-gray-500'>
              <Table className='mx-auto h-12 w-12 mb-4' />
              <p>Excel 파일을 업로드하면 데이터가 여기에 표시됩니다</p>
            </div>
          )}

          {/* 데이터 테이블 표시 */}
          {renderDataTable()}
            </div>
          </div>
        </div>

                 {/* AI 처리 완료 메시지 */}
         {aiProcessedData && (
           <div className='px-8 pb-8'>
             <div className='bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 text-center'>
               <div className='flex items-center justify-center gap-3 mb-4'>
                 <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                   <Brain className='w-6 h-6 text-green-600' />
                 </div>
                 <div>
                   <h3 className='text-lg font-semibold text-green-800'>AI 모델 처리 완료!</h3>
                   <p className='text-sm text-green-700'>
                     {aiProcessedData.processed_count}행의 산출물명이 AI 모델로 표준화되었습니다
                   </p>
                 </div>
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
          <div className='px-8 pb-8'>
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
                   <li>• AI 추천 답변이 산출물명에 반영됨</li>
                   <li>• AI 추천 답변 컬럼 유지됨</li>
                   <li>• DB 컬럼과 동일한 구조로 준비됨</li>
                   <li>• 총 {preparedDataForDB.length}행 × {Object.keys(preparedDataForDB[0] || {}).length}열</li>
                 </ul>
               </div>
              
              <div className='mt-4 text-xs text-green-600'>
                💡 이제 DB 연결 후 preparedDataForDB 데이터를 전송할 수 있습니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
