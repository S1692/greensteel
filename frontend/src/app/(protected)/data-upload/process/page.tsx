'use client';

import React, { useState, useRef } from 'react';
import CommonShell from '@/components/common/CommonShell';
import {
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
  AlertCircle,
  ArrowLeft,
  Cog
} from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import Link from 'next/link';

// 타입 정의 - 이미지와 동일한 스키마
type DataRow = {
  공정명?: string;
  생산제품?: string;
  세부공정?: string;
  공정설명?: string;
  [key: string]: any;
};

interface DataPreview {
  filename: string;
  fileSize: string;
  data: Array<DataRow>;
  columns: string[];
}

interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: Array<DataRow>;
  columns: string[];
}

interface EditableRow {
  id: string;
  originalData: DataRow;
  modifiedData: DataRow;
  isEditing: boolean;
  isNewlyAdded?: boolean;
}

// 행별 오류 상태 관리
interface RowErrors {
  [rowId: string]: { [column: string]: string };
}

const ProcessDataPage: React.FC = () => {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData | null>(null);
  
  // 행별 오류 상태 관리
  const [rowErrors, setRowErrors] = useState<RowErrors>({});

  // 행별 오류 업데이트
  const updateRowError = (rowId: string, column: string, errorMessage: string) => {
    setRowErrors(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [column]: errorMessage
      }
    }));
  };

  // 행별 오류 제거
  const clearRowError = (rowId: string, column: string) => {
    setRowErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId][column];
        if (Object.keys(newErrors[rowId]).length === 0) {
          delete newErrors[rowId];
        }
      }
      return newErrors;
    });
  };

  // 행 삭제 핸들러
  const deleteRow = (rowId: string) => {
    setEditableInputRows(prev => prev.filter(row => row.id !== rowId));
    // 행별 오류도 제거
    setRowErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[rowId];
      return newErrors;
    });
    setError(null);
  };

  // 공정 데이터는 텍스트 기반이므로 숫자/날짜 입력 제한 불필요

  // 입력 검증 함수 - 이미지와 동일한 스키마
  const validateInput = (value: string, field: string): string | null => {
    if (!value || value.trim() === '') {
      return `${field}은(는) 필수 입력 항목입니다.`;
    }

    switch (field) {
      case '공정명':
        if (value.length > 100) {
          return '공정명은 100자를 초과할 수 없습니다.';
        }
        break;
      case '생산제품':
        if (value.length > 100) {
          return '생산제품은 100자를 초과할 수 없습니다.';
        }
        break;
      case '세부공정':
        if (value.length > 100) {
          return '세부공정은 100자를 초과할 수 없습니다.';
        }
        break;
      case '공정설명':
        if (value.length > 500) {
          return '공정설명은 500자를 초과할 수 없습니다.';
        }
        break;
      default:
        break;
    }

    return null;
  };

  // 행 확인 함수 - 새로운 스키마에 맞게 수정
  const confirmRow = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    const errors: { [column: string]: string } = {};
    let hasErrors = false;

    // 필수 필드 검증
    const requiredFields = ['공정명', '생산제품', '세부공정'];
    requiredFields.forEach(field => {
      const error = validateInput(row.modifiedData[field] || '', field);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setRowErrors(prev => ({
        ...prev,
        [rowId]: errors
      }));
      return;
    }

    // 오류가 없으면 행을 확인 상태로 변경
    setEditableInputRows(prev => 
      prev.map(r => 
        r.id === rowId 
          ? { ...r, isEditing: false, originalData: r.modifiedData }
          : r
      )
    );

    // 오류 상태 정리
    clearRowError(rowId, '공정명');
    clearRowError(rowId, '생산제품');
    clearRowError(rowId, '세부공정');
    clearRowError(rowId, '공정설명');
  };

  // 새로운 행 추가 핸들러
  const addNewRow = () => {
    const newRow: EditableRow = {
      id: `process-${editableInputRows.length}`,
      originalData: {
        공정명: '',
        생산제품: '',
        세부공정: '',
        공정설명: ''
      },
      modifiedData: {
        공정명: '',
        생산제품: '',
        세부공정: '',
        공정설명: ''
      },
      isEditing: true,
      isNewlyAdded: true
    };
    setEditableInputRows(prev => [...prev, newRow]);
  };

  // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const isNewRow = row.isNewlyAdded;
    const isRequired = isNewRow && ['공정명', '공정유형', '공정단계'].includes(column);
    
    const getInputClassName = () => {
      let baseClass = 'w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
      
      if (isNewRow) {
        baseClass += ' border-green-300 bg-green-50 text-black';
      } else if (row.isEditing) {
        baseClass += ' border-blue-300 bg-blue-50 text-black';
      } else {
        baseClass += ' border-gray-300 bg-white text-black';
      }
      
      return baseClass;
    };

    switch (column) {
      case '공정명':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                const error = validateInput(newValue, column);
                if (!error) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, error);
                }
              }}
              placeholder={isRequired ? '공정명을 입력하세요 *' : '공정명을 입력하세요'}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
            )}
          </div>
        );
      
      case '공정설명':
        return (
          <div className='relative'>
            <textarea
              value={value}
              maxLength={200}
              rows={3}
              onChange={(e) => {
                const newValue = e.target.value;
                const error = validateInput(newValue, column);
                if (!error) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, error);
                }
              }}
              placeholder={isRequired ? '공정설명을 입력하세요 *' : '공정설명을 입력하세요'}
              className={getInputClassName() + ' resize-none'}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
            )}
          </div>
        );
      
      case '생산제품':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                const error = validateInput(newValue, column);
                if (!error) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, error);
                }
              }}
              placeholder={isRequired ? '생산제품을 입력하세요 *' : '생산제품을 입력하세요'}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
            )}
          </div>
        );
      
      case '세부공정':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                const error = validateInput(newValue, column);
                if (!error) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, error);
                }
              }}
              placeholder={isRequired ? '세부공정을 입력하세요 *' : '세부공정을 입력하세요'}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
            )}
          </div>
        );
      

      
      default:
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                const error = validateInput(newValue, column);
                if (!error) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, error);
                }
              }}
              placeholder={isRequired ? `${column}을 입력하세요 *` : `${column}을 입력하세요`}
              className={getInputClassName()}
            />
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
            )}
          </div>
        );
    }
  };

  // 템플릿 다운로드
  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = '/templates/실적_데이터_공정정보.xlsx';
    link.download = '실적_데이터_공정정보.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      // 첫 번째 행만 읽어서 컬럼명 확인
      const firstRow = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 0,
        defval: ''
      })[0] as any[];
      
      if (!firstRow || firstRow.length === 0) {
        throw new Error('첫 번째 행을 읽을 수 없습니다.');
      }
      
      // 첫 번째 행에서 컬럼명 추출 (빈 값 제거)
      const columns = firstRow
        .map((cell: any) => cell?.toString().trim())
        .filter((col: string) => col && col.length > 0);
      
      console.log('읽은 컬럼들:', columns);
      
      // 필수 칼럼 구조 검증 (순서는 상관없음)
      const requiredColumns = [
        '공정명'
      ];
      
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`필수 칼럼이 누락되었습니다: ${missingColumns.join(', ')}`);
      }
      
      // 데이터 읽기 (두 번째 행부터) - 공정 설명 컬럼 처리 개선
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // 숫자 헤더 사용
        range: 1,
        defval: ''
      }) as any[][];
      
      // 컬럼명 매핑 및 데이터 변환
      const processedData = jsonData.map((row: any[]) => {
        const dataRow: any = {};
        columns.forEach((col, index) => {
          // 공정 설명 컬럼 특별 처리
          if (col === '공정 설명') {
            dataRow['공정설명'] = row[index] || '';
            console.log(`공정 설명 컬럼 처리: "${col}" -> "${row[index]}"`);
          } else {
            dataRow[col] = row[index] || '';
          }
        });
        return dataRow;
      });
      
      console.log('컬럼명들:', columns);
      console.log('원본 데이터 (첫 번째 행):', jsonData[0]);
      console.log('처리된 데이터 (첫 번째 행):', processedData[0]);
      
      // 공정 설명 관련 특별 디버깅
      console.log('=== 공정 설명 디버깅 ===');
      console.log('컬럼명에 "공정 설명" 포함 여부:', columns.includes('공정 설명'));
      console.log('컬럼명에 "공정설명" 포함 여부:', columns.includes('공정설명'));
      if (jsonData.length > 0) {
        console.log('원본 데이터의 공정 설명 인덱스:', columns.indexOf('공정 설명'));
        console.log('원본 데이터의 공정 설명 값:', jsonData[0][columns.indexOf('공정 설명')]);
      }
      console.log('=== 공정 설명 디버깅 완료 ===');
      
      console.log('처리된 데이터:', processedData);
      
      // 편집 가능한 행 데이터 생성
      const editableRows: EditableRow[] = processedData.map((row: any, index) => ({
        id: `process-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false
      }));

      const inputData: DataPreview = {
        filename: inputFile.name,
        fileSize: (inputFile.size / 1024 / 1024).toFixed(2),
        data: processedData,
        columns: columns
      };

      setInputData(inputData);
      setEditableInputRows(editableRows);
      setError(null);

      // AI 처리 시뮬레이션
      setTimeout(() => {
        setAiProcessedData({
          status: 'completed',
          message: '데이터 처리 완료',
          filename: inputFile.name,
          total_rows: jsonData.length,
          processed_rows: jsonData.length,
          data: jsonData,
          columns: columns
        });
      }, 2000);

    } catch (err) {
      console.error('파일 업로드 오류:', err);
      if (err instanceof Error) {
        setError(`파일 업로드 실패: ${err.message}`);
      } else {
        setError('파일 업로드 중 오류가 발생했습니다.');
      }
    } finally {
      setIsInputUploading(false);
    }
  };

  // DB 저장 핸들러
  const handleSaveToDatabase = async () => {
    if (editableInputRows.length === 0) {
      setError('저장할 데이터가 없습니다.');
      return;
    }

    setIsSavingToDB(true);
    setError(null);

    try {
      // 수정된 데이터만 필터링
      const dataToSave = editableInputRows
        .filter(row => !row.isEditing)
        .map(row => ({
          공정명: row.modifiedData.공정명 || '',
          생산제품: row.modifiedData.생산제품 || '',
          세부공정: row.modifiedData.세부공정 || '',
          // 공정 설명 필드를 그대로 전송 (공백 포함)
          '공정 설명': row.modifiedData['공정 설명'] || row.modifiedData.공정설명 || ''
        }))
        .filter(row => row.공정명 && row.생산제품 && row.세부공정); // 필수 필드가 있는 행만

      // 디버깅: 전송할 데이터 확인
      console.log('=== 프론트엔드에서 전송할 데이터 ===');
      console.log('전송할 데이터 개수:', dataToSave.length);
      console.log('첫 번째 행 데이터:', dataToSave[0]);
      console.log('공정설명 값들:', dataToSave.map(row => row['공정 설명']));
      console.log('=== 전송 데이터 디버깅 완료 ===');

      if (dataToSave.length === 0) {
        setError('저장할 유효한 데이터가 없습니다.');
        return;
      }

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-process-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputData?.filename || 'process_data.xlsx',
          data: dataToSave
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDbSaveStatus(`데이터베이스 저장 완료: ${result.saved_count || dataToSave.length}행`);
        
        // 성공적으로 저장된 행들을 제거
        setEditableInputRows([]);
        setInputData(null);
        setInputFile(null);
        if (inputFileRef.current) {
          inputFileRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setError(`데이터베이스 저장 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      setError(`저장 중 오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setIsSavingToDB(false);
    }
  };

  // 입력 변경 핸들러
  const handleInputChange = (rowId: string, column: string, value: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, modifiedData: { ...row.modifiedData, [column]: value } }
          : row
      )
    );
  };

  // 행 편집 토글 (직접 입력한 데이터만 편집 가능)
  const toggleRowEdit = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
    // Excel 데이터는 편집 불가능
    if (!row.isNewlyAdded) {
      setError('Excel 파일로 업로드된 데이터는 수정할 수 없습니다.');
      return;
    }
    
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, isEditing: !row.isEditing }
          : row
      )
    );
  };

  // 행 저장
  const saveRow = async (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    try {
      // 성공적으로 저장된 경우
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { 
                ...r, 
                isEditing: false,
                originalData: { ...r.modifiedData }
              }
            : r
        )
      );

      setError(null);
      console.log('행 저장 성공:', row.modifiedData);

    } catch (err) {
      console.error('행 저장 오류:', err);
      setError(`행 저장 중 오류가 발생했습니다: ${err}`);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.match(/\.(xlsx|xls)$/)) {
        setInputFile(file);
        setError(null);
      } else {
        setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/data-upload'>
            <Button variant='outline' className='border-white/20 text-white/80 hover:bg-white/10'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              뒤로가기
            </Button>
          </Link>
          <div>
            <h1 className='stitch-h1 text-xl lg:text-2xl xl:text-3xl font-bold'>공정정보</h1>
            <p className='stitch-caption text-white/60 text-xs lg:text-sm'>
              생산 공정의 세부 정보와 공정별 데이터를 체계적으로 관리합니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 min-h-0 space-y-6'>
          {/* 1. 템플릿 다운로드 섹션 */}
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Download className='w-5 h-5 text-orange-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>템플릿 다운로드</h2>
                <p className='text-sm text-white/60'>공정 데이터 입력을 위한 표준 템플릿을 다운로드하세요</p>
              </div>
            </div>
            <Button
              onClick={handleTemplateDownload}
              className='bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors'
            >
              <Download className='w-4 h-4 mr-2' />
              템플릿 다운로드
            </Button>
          </div>
          
          {/* 2. Excel 업로드 섹션 */}
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Cog className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Excel 업로드</h2>
                <p className='text-sm text-white/60'>공정 정보가 포함된 Excel 파일을 업로드하여 분석합니다</p>
              </div>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                inputFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-white/20 hover:border-primary hover:bg-white/5'
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
                <div className='space-y-4'>
                  <div className='w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center'>
                    <Cog className='w-8 h-8 text-white/60' />
                  </div>
                  <div>
                    <p className='text-lg font-medium text-white mb-2'>
                      파일을 드래그하여 업로드하거나 클릭하여 선택하세요
                    </p>
                    <p className='text-sm text-white/60 mb-4'>
                      지원 형식: .xlsx, .xls
                    </p>
                    <Button
                      onClick={() => inputFileRef.current?.click()}
                      className='bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors'
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
                    <FileSpreadsheet className='w-8 h-8 text-green-600' />
                  </div>
                  <div>
                    <p className='text-lg font-medium text-white mb-2'>
                      선택된 파일: {inputFile.name}
                    </p>
                    <p className='text-sm text-white/60 mb-4'>
                      파일 크기: {(inputFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className='flex gap-3 justify-center'>
                      <Button
                        onClick={handleInputUpload}
                        disabled={isInputUploading}
                        className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50'
                      >
                        {isInputUploading ? '업로드 중...' : '업로드 시작'}
                      </Button>
                      <Button
                                                 onClick={() => {
                           setInputFile(null);
                           setInputData(null);
                           setEditableInputRows([]);
                           setAiProcessedData(null);
                         }}
                        className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors'
                      >
                        파일 변경
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. AI 처리 상태 표시 */}
          {isInputUploading && (
            <div className='stitch-card p-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Brain className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>데이터 처리 중...</h3>
                  <p className='text-sm text-white/60'>업로드된 파일을 분석하고 처리하는 중입니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. 데이터 미리보기 및 편집 */}
          {inputData && editableInputRows.length > 0 && (
            <div className='stitch-card p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-white'>공정 데이터 미리보기</h3>
                  <p className='text-sm text-white/60'>
                    파일: {inputData.filename} | 
                    크기: {inputData.fileSize} MB | 
                    행 수: {inputData.data.length}
                  </p>
                </div>
              </div>

              {/* 데이터 테이블 */}
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse border border-white/20'>
                  <thead>
                    <tr className='bg-white/10'>
                      {inputData.columns.map((column) => (
                        <th key={column} className='border border-white/20 px-3 py-2 text-left text-sm font-medium text-white'>
                          {column}
                        </th>
                      ))}
                      <th className='border border-white/20 px-3 py-2 text-left text-sm font-medium text-white'>
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableInputRows.map((row) => (
                      <tr key={row.id} className='border-b border-white/10 hover:bg-white/5'>
                        {inputData.columns.map((column) => (
                          <td key={column} className='border border-white/20 px-3 py-2 text-sm text-white'>
                            {row.isEditing ? (
                              renderInputField(row, column)
                            ) : (
                              <span>{row.modifiedData[column] || '-'}</span>
                            )}
                          </td>
                        ))}
                        <td className='border border-white/20 px-3 py-2 text-sm'>
                          {row.isEditing ? (
                            <div className='flex gap-2'>
                              <Button
                                onClick={() => saveRow(row.id)}
                                className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs'
                              >
                                <Save className='w-3 h-3 mr-1' />
                                저장
                              </Button>
                              <Button
                                onClick={() => toggleRowEdit(row.id)}
                                className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs'
                              >
                                <X className='w-3 h-3 mr-1' />
                                취소
                              </Button>
                            </div>
                          ) : (
                            <div className='flex gap-2'>
                              {/* 직접 입력한 데이터만 편집/삭제 가능 */}
                              {row.isNewlyAdded ? (
                                <>
                                  <Button
                                    onClick={() => toggleRowEdit(row.id)}
                                    className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs'
                                  >
                                    <Edit3 className='w-3 h-3 mr-1' />
                                    편집
                                  </Button>
                                  <Button
                                    onClick={() => deleteRow(row.id)}
                                    className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs'
                                  >
                                    <Trash2 className='w-3 h-3 mr-1' />
                                    삭제
                                  </Button>
                                </>
                              ) : (
                                // Excel 데이터는 편집 불가능
                                <span className='text-white/40 text-xs'>수정 불가</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 데이터 추가 버튼 */}
              <div className='mt-4 flex justify-center'>
                <Button
                  onClick={addNewRow}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  데이터 추가
                </Button>
              </div>

              {/* DB 저장 버튼 */}
              {inputData && inputData.data.length > 0 && (
                <div className='mt-4 flex items-center gap-4'>
                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={isSavingToDB}
                    className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2'
                  >
                    {isSavingToDB ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4' />
                        데이터베이스에 저장
                      </>
                    )}
                  </Button>
                  
                  {dbSaveStatus && (
                    <div className={`text-sm px-3 py-2 rounded-lg ${
                      dbSaveStatus.includes('✅') 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {dbSaveStatus}
                    </div>
                  )}
                </div>
              )}


            </div>
          )}

          {/* 5. AI 처리 결과 */}
          {aiProcessedData && (
            <div className='stitch-card p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>데이터 처리 완료</h3>
                  <p className='text-sm text-white/60'>
                    총 {aiProcessedData.total_rows}행이 성공적으로 처리되었습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. 오류 메시지 */}
          {error && (
            <div className='stitch-card p-6 bg-red-500/10 border border-red-500/20'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                  <AlertCircle className='w-5 h-5 text-red-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-red-400'>오류 발생</h3>
                  <p className='text-sm text-red-300'>{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CommonShell>
  );
};

export default ProcessDataPage;
