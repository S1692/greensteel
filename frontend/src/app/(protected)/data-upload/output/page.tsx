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
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import Link from 'next/link';

// 타입 정의 - 새로운 스키마 기반
type DataRow = {
  로트번호?: string;
  생산품명?: string;
  생산수량?: number;
  투입일?: string;
  종료일?: string;
  공정?: string;
  산출물명?: string;
  수량?: number;
  단위?: string;
  주문처명?: string;
  오더번호?: string;
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
  editReason?: string;
  isNewlyAdded?: boolean;
}

// 행별 오류 상태 관리
interface RowErrors {
  [rowId: string]: { [column: string]: string };
}

const OutputDataPage: React.FC = () => {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<string>('');
  
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

  // 숫자 입력 필드에서 문자 입력 방지
  const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>, column: string) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumericColumn = ['로트번호', '생산수량', '수량'].includes(column);
    
    if (isNumericColumn) {
      // 숫자, 소수점, 허용된 키만 입력 가능
      if (!/[\d.]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
        return;
      }
      
      // 소수점은 한 번만 입력 가능
      if (e.key === '.' && (e.currentTarget.value.includes('.') || e.currentTarget.value === '')) {
        e.preventDefault();
        return;
      }
    }
  };

  // 날짜 비교 검증 함수
  const validateDateComparison = (rowId: string, column: string, value: string): void => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
    if (column === '투입일' && row.modifiedData['종료일']) {
      const startDate = new Date(value);
      const endDate = new Date(row.modifiedData['종료일']);
      if (startDate > endDate) {
        updateRowError(rowId, column, '투입일은 종료일보다 늦을 수 없습니다.');
      } else {
        clearRowError(rowId, column);
      }
    } else if (column === '종료일' && row.modifiedData['투입일']) {
      const startDate = new Date(row.modifiedData['투입일']);
      const endDate = new Date(value);
      if (startDate > endDate) {
        updateRowError(rowId, column, '종료일은 투입일보다 빠를 수 없습니다.');
      } else {
        clearRowError(rowId, column);
      }
    }
  };

  // 입력 유효성 검사 - 새로운 스키마 기반
  const validateInput = (column: string, value: string): { isValid: boolean; errorMessage: string } => {
    if (value.length > 50) {
      console.log(`글자 수 초과: ${column} - ${value.length}글자`);
      return { isValid: false, errorMessage: '50자 이하로 입력해주세요.' };
    }
    
    switch (column) {
      case '로트번호':
        // 로트번호는 문자열로 처리
        if (!value || value.trim() === '') {
          return { isValid: false, errorMessage: '로트번호는 필수 입력 항목입니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '생산수량':
      case '수량':
        // 수량은 숫자만 입력 가능
        const isNumberValid = /^\d+(\.\d+)?$/.test(value);
        if (!isNumberValid) {
          console.log(`숫자만 입력 가능: ${column} - ${value}`);
          return { isValid: false, errorMessage: '숫자만 입력 가능합니다.' };
        }
        // 0보다 큰 값인지 확인
        const numValue = parseFloat(value);
        if (numValue <= 0) {
          return { isValid: false, errorMessage: '0보다 큰 값을 입력해주세요.' };
        }
        return { isValid: true, errorMessage: '' };
      case '투입일':
      case '종료일':
        // 빈 값 체크 - 날짜는 필수 입력 항목
        if (!value || value === '') {
          return { isValid: false, errorMessage: '필수 입력 항목입니다.' };
        }
        
        // YYYY-MM-DD 형식 검증
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          console.log(`날짜 형식 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: 'YYYY-MM-DD 형식으로 입력해주세요.' };
        }
        
        // 유효한 날짜인지 검증
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.log(`유효하지 않은 날짜: ${column} - ${value}`);
          return { isValid: false, errorMessage: '유효한 날짜를 입력해주세요.' };
        }
        
        // 미래 날짜 제한 (선택사항)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // 오늘의 마지막 시간
        if (date > today) {
          console.log(`미래 날짜 입력: ${column} - ${value}`);
          return { isValid: false, errorMessage: '미래 날짜는 입력할 수 없습니다.' };
        }
        
        return { isValid: true, errorMessage: '' };
      case '생산품명':
      case '공정':
      case '산출물명':
        // 한글, 영문, 숫자, 공백, 특수문자 허용
        const isNameValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isNameValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '생산수량_단위':
      case '산출물_단위':
        const isUnitValid = /^[가-힣a-zA-Z0-9\s\-_()\/]*$/.test(value);
        if (!isUnitValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자, /만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      default:
        return { isValid: true, errorMessage: '' };
    }
  };

  // 새로운 행 추가 핸들러
  const addNewRow = () => {
    const newRow: EditableRow = {
      id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalData: {
        '로트번호': '',
        '생산품명': '',
        '생산수량': 0,
        '투입일': '',
        '종료일': '',
        '공정': '',
        '산출물명': '',
        '수량': 0,
        '단위': 't',
        '주문처명': '',
        '오더번호': ''
      },
      modifiedData: {
        '로트번호': '',
        '생산품명': '',
        '생산수량': 0,
        '투입일': '',
        '종료일': '',
        '공정': '',
        '산출물명': '',
        '수량': 0,
        '단위': 't',
        '주문처명': '',
        '오더번호': ''
      },
      isEditing: true,
      isNewlyAdded: true
    };
    setEditableInputRows(prev => [...prev, newRow]);
    setError(null); // 새 행 추가 시 오류 메시지 제거
  };

  // 행 편집 취소 (이전 상태로 복원)
  const cancelRowEdit = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    if (row.isNewlyAdded) {
      // 새로 추가된 행인 경우 완전히 제거
      setEditableInputRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      // 기존 행 편집 취소인 경우 원본 데이터로 복원
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { ...r, isEditing: false, modifiedData: { ...r.originalData } }
            : r
        )
      );
    }

    // 행별 오류도 제거
    clearRowError(rowId, '');
    setError(null); // 편집 취소 시 오류 메시지 제거
  };

  // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const isNewRow = row.isNewlyAdded;
    const isRequired = isNewRow && ['로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '산출물명', '수량', '단위'].includes(column);
    
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
                const { isValid, errorMessage } = validateInput(column, newValue);
                if (isValid) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, errorMessage);
                }
              }}
              onKeyDown={(e) => handleNumericInput(e, column)}
              placeholder={isRequired ? '숫자만 입력 *' : '숫자만 입력'}
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
      
      case '투입일':
      case '종료일':
        return (
          <div className='relative'>
            <input
              type='date'
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                const { isValid, errorMessage } = validateInput(column, newValue);
                
                handleInputChange(row.id, column, newValue);
                
                if (isValid) {
                  clearRowError(row.id, column);
                  // 날짜 비교 검증 실행
                  validateDateComparison(row.id, column, newValue);
                } else {
                  updateRowError(row.id, column, errorMessage);
                }
              }}
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
      
      case '생산품명':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                const { isValid, errorMessage } = validateInput(column, newValue);
                if (isValid) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, errorMessage);
                }
              }}
              placeholder={isRequired ? '생산품명을 입력하세요 *' : '생산품명을 입력하세요'}
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
      
      case '공정':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={20}
              onChange={(e) => {
                const newValue = e.target.value;
                const { isValid, errorMessage } = validateInput(column, newValue);
                if (isValid) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, errorMessage);
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
      
      case '산출물명':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={20}
              onChange={(e) => {
                const newValue = e.target.value;
                const { isValid, errorMessage } = validateInput(column, newValue);
                if (isValid) {
                  handleInputChange(row.id, column, newValue);
                  clearRowError(row.id, column);
                } else {
                  handleInputChange(row.id, column, newValue);
                  updateRowError(row.id, column, errorMessage);
                }
              }}
              placeholder={isRequired ? '산출물명을 입력하세요 *' : '산출물명을 입력하세요'}
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
      
      case '생산수량_단위':
      case '산출물_단위':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                handleInputChange(row.id, column, newValue);
                clearRowError(row.id, column);
              }}
              placeholder={column === '생산수량_단위' ? '생산수량 단위를 입력하세요 (예: kg, t, 개수)' : '산출물 단위를 입력하세요 (예: kg, t, 개수)'}
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
      
      case '주문처명':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={100}
              onChange={(e) => {
                const newValue = e.target.value;
                handleInputChange(row.id, column, newValue);
              }}
              placeholder='주문처명을 입력하세요'
              className={getInputClassName()}
            />
          </div>
        );
      
      case '오더번호':
        return (
          <div className='relative'>
            <input
              type='text'
              value={value}
              maxLength={50}
              onChange={(e) => {
                const newValue = e.target.value;
                handleInputChange(row.id, column, newValue);
              }}
              placeholder='오더번호를 입력하세요'
              className={getInputClassName()}
            />
          </div>
        );
      
      default:
        return (
          <span>{value || '-'}</span>
        );
    }
  };

  // 템플릿 다운로드
  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = '/templates/실적_데이터_아웃풋.xlsx';
    link.download = '실적_데이터_아웃풋.xlsx';
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
      
      // 첫 번째 행에서 컬럼명 추출
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const columns: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          columns.push(cell.v.toString().trim());
        }
      }
      
      // 기본 컬럼이 없는 경우 추가
      const requiredColumns = ['로트번호', '생산품명', '생산수량', '생산수량_단위', '투입일', '종료일', '공정', '산출물명', '수량', '산출물_단위', '주문처명', '오더번호'];
      requiredColumns.forEach(col => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });

      // 데이터 읽기 (첫 번째 행 제외)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: columns,
        range: 1,
        defval: ''
      }) as DataRow[];
      
      // 누락된 컬럼에 기본값 설정
      jsonData.forEach(row => {
        if (!row.주문처명) row.주문처명 = '';
        if (!row.오더번호) row.오더번호 = '';
        if (!row.단위) row.단위 = 't';
      });

      // 편집 가능한 행 데이터 생성
      const editableRows: EditableRow[] = jsonData.map((row: any, index) => ({
        id: `output-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false
      }));

      const inputData: DataPreview = {
        filename: inputFile.name,
        fileSize: (inputFile.size / 1024 / 1024).toFixed(2),
        data: jsonData,
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
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsInputUploading(false);
    }
  };

  // DB 저장 핸들러
  const handleSaveToDatabase = async () => {
    if (!inputData || inputData.data.length === 0) {
      setError('저장할 데이터가 없습니다.');
      return;
    }

    setIsSavingToDB(true);
    setDbSaveStatus('');
    setError(null);

    try {
      // Excel 날짜를 PostgreSQL date 형식으로 변환하는 함수
      const convertExcelDate = (excelDate: any): string | null => {
        if (!excelDate || excelDate === '') return null;
        
        try {
          // 이미 문자열 형태의 날짜인 경우
          if (typeof excelDate === 'string') {
            return excelDate;
          }
          
          // Excel 날짜 숫자인 경우 (1900년 1월 1일부터의 일수)
          if (typeof excelDate === 'number') {
            const baseDate = new Date(1900, 0, 1); // JavaScript는 0부터 시작
            const resultDate = new Date(baseDate.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
            return resultDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
          }
          
          return null;
        } catch (error) {
          console.warn('날짜 변환 실패:', excelDate, error);
          return null;
        }
      };

             // 날짜 변환 및 데이터 타입 변환을 적용한 데이터 준비 - 새로운 스키마 기반
       const processedData = inputData.data.map((row: any) => {
         // 수량 칼럼을 찾기 (여러 가능한 칼럼명 시도)
         let 수량 = 0;
         if (row['수량'] !== undefined) {
           수량 = parseFloat(row['수량']?.toString() || '0');
         } else if (row['산출수량'] !== undefined) {
           수량 = parseFloat(row['산출수량']?.toString() || '0');
         } else if (row['생산수량'] !== undefined) {
           수량 = parseFloat(row['생산수량']?.toString() || '0');
         }
         
         // 수량이 0 이하인 경우 오류 처리
         if (수량 <= 0) {
           console.error('수량 데이터:', row);
           throw new Error('수량은 0보다 큰 값이어야 합니다. 현재 값: ' + 수량);
         }
         
         return {
           ...row,
           '수량': 수량,
           '투입일': convertExcelDate(row['투입일']),
           '종료일': convertExcelDate(row['종료일']),
           '주문처명': row['주문처명'] || '',
           '오더번호': row['오더번호'] || ''
         };
       });

             const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
       const response = await fetch(`${gatewayUrl}/save-output-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputFile?.name || 'unknown',
          data: processedData,
          columns: inputData.columns
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDbSaveStatus(`✅ ${result.message}`);
        console.log('산출물 데이터가 성공적으로 저장되었습니다:', result);
      } else {
        setDbSaveStatus(`❌ 저장 실패: ${result.message}`);
        console.error('산출물 데이터 저장 실패:', result);
      }
    } catch (error) {
      setDbSaveStatus(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('산출물 데이터 저장 중 오류:', error);
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
    setError(null); // 편집 시작 시 오류 메시지 제거
  };

  // 행 확인 (DB 저장 없이 편집 완료)
  const confirmRow = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    // 수동으로 추가된 데이터인 경우 모든 필수 필드 검증
    if (row.isNewlyAdded) {
      const requiredFields = ['로트번호', '생산품명', '생산수량', '생산수량_단위', '투입일', '종료일', '공정', '산출물명', '수량', '산출물_단위'];
      const missingFields = [];
      const invalidFields = [];

      for (const field of requiredFields) {
        const value = row.modifiedData[field];
        
        // 빈 값 체크 (빈 문자열, null, undefined 모두 체크)
        if (!value || value.toString().trim() === '') {
          missingFields.push(field);
          continue;
        }

        // 유효성 검사
        const { isValid, errorMessage } = validateInput(field, value.toString());
        if (!isValid) {
          invalidFields.push(field);
          updateRowError(rowId, field, errorMessage);
        } else {
          clearRowError(rowId, field);
        }
      }

      // 오류가 있으면 확인 거부
      if (missingFields.length > 0 || invalidFields.length > 0) {
        let errorMsg = '';
        if (missingFields.length > 0) {
          errorMsg += `필수 입력 항목: ${missingFields.join(', ')}`;
        }
        if (invalidFields.length > 0) {
          errorMsg += `${missingFields.length > 0 ? ' | ' : ''}유효하지 않은 항목: ${invalidFields.join(', ')}`;
        }
        setError(`데이터 확인 실패: ${errorMsg}`);
        return; // 여기서 함수 종료하여 확인 차단
      }
    }

    // 모든 검증을 통과한 경우에만 편집 완료 상태로 변경
    setEditableInputRows(prev => 
      prev.map(r => 
        r.id === rowId 
          ? { 
              ...r, 
              isEditing: false,
              originalData: { ...r.modifiedData },
              isNewlyAdded: true
            }
          : r
      )
    );

    // 행별 오류 제거
    clearRowError(rowId, '');
    setError(null);
    console.log('행 확인 완료:', row.modifiedData);
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
            <h1 className='stitch-h1 text-xl lg:text-2xl xl:text-3xl font-bold'>실적정보(산출물)</h1>
            <p className='stitch-caption text-white/60 text-xs lg:text-sm'>
              생산 과정에서 나오는 제품, 부산물 등의 데이터를 업로드하고 분석합니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 min-h-0 space-y-6'>
          {/* 1. 템플릿 다운로드 섹션 */}
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <Download className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>템플릿 다운로드</h2>
                <p className='text-sm text-white/60'>산출물 데이터 입력을 위한 표준 템플릿을 다운로드하세요</p>
              </div>
            </div>
            <Button
              onClick={handleTemplateDownload}
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors'
            >
              <Download className='w-4 h-4 mr-2' />
              템플릿 다운로드
            </Button>
          </div>
          
          {/* 2. Excel 업로드 섹션 */}
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Upload className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Excel 업로드</h2>
                <p className='text-sm text-white/60'>산출물 데이터가 포함된 Excel 파일을 업로드하여 분석합니다</p>
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
                    <Upload className='w-8 h-8 text-white/60' />
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
                  <h3 className='text-lg font-semibold text-white'>산출물 데이터 미리보기</h3>
                  <p className='text-sm text-white/60'>
                    파일: {inputData.filename} | 
                    크기: {inputData.fileSize} MB | 
                    행 수: {inputData.data.length}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={isSavingToDB}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
                  >
                    {isSavingToDB ? '저장 중...' : 'DB에 저장하기'}
                  </Button>
                </div>
              </div>

              {/* DB 저장 상태 표시 */}
              {dbSaveStatus && (
                <div className={`p-4 mb-4 rounded-lg ${
                  dbSaveStatus.includes('✅') ? 'bg-green-100 text-green-800' : 
                  dbSaveStatus.includes('❌') ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {dbSaveStatus}
                </div>
              )}

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
                                onClick={() => confirmRow(row.id)}
                                className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs'
                              >
                                <CheckCircle className='w-3 h-3 mr-1' />
                                확인
                              </Button>
                              <Button
                                onClick={() => cancelRowEdit(row.id)}
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

              {/* 수정 사유 입력 제거 - 수기 입력 데이터만 있으므로 불필요 */}
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

export default OutputDataPage;
