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

// 타입 정의
type DataRow = {
  로트번호?: string | number;
  생산품명?: string;
  생산수량?: string | number;
  투입일?: string | number;
  종료일?: string | number;
  공정?: string;
  투입물명?: string;
  수량?: string | number;
  단위?: string;
  AI추천답변?: string;
  [key: string]: any;
};

interface DataPreview {
  filename: string;
  fileSize: string;
  data: Array<{
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  }>;
  columns: string[];
}

interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: Array<{
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  }>;
  columns: string[];
}

interface EditableRow {
  id: string;
  originalData: {
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  };
  modifiedData: {
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  };
  isEditing: boolean;
  isNewlyAdded?: boolean;
}

const InputDataPage: React.FC = () => {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preparedDataForDB, setPreparedDataForDB] = useState<any>(null);
  const [editReasons, setEditReasons] = useState<{ [key: string]: string }>({});
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<string>('');

  const inputFileRef = useRef<HTMLInputElement>(null);
     

  // 행별 오류 상태 관리
  const [rowErrors, setRowErrors] = useState<{ [key: string]: { [column: string]: string } }>({});

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
    // 수정 사유도 함께 제거
    setEditReasons(prev => {
      const newReasons = { ...prev };
      delete newReasons[rowId];
      return newReasons;
    });
    // 행별 오류도 제거
    setRowErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId];
      }
      return newErrors;
    });
    setError(null);
  };

  // 템플릿 다운로드
  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = '/templates/실적_데이터_인풋.xlsx';
    link.download = '실적_데이터_인풋.xlsx';
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
        range: 1,
        defval: ''
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

      console.log('AI 처리 응답 수신...');
      
      // JSON 응답 처리 (스트리밍이 아닌 일반 응답)
      const responseData = await response.json();
      console.log('AI 처리 응답 데이터:', responseData);
      
      if (responseData.success) {
        const processedData: DataRow[] = responseData.data || [];
        const unifiedColumns = responseData.columns || [];
        
        console.log('AI 처리 완료:', {
          totalRows: responseData.total_rows,
          processedRows: responseData.processed_rows,
          data: processedData,
          columns: unifiedColumns
        });
        
        // AI 처리된 데이터로 상태 업데이트
        setAiProcessedData({
          status: 'completed',
          message: 'AI 처리가 완료되었습니다.',
          filename: inputData.filename,
          total_rows: responseData.total_rows || 0,
          processed_rows: responseData.processed_rows || 0,
          data: processedData,
          columns: unifiedColumns
        });

        // AI 추천 답변을 투입물명 컬럼에 적용
        const processedDataWithAppliedRecommendations = processedData.map((row: DataRow) => {
          const aiRecommendation = row['AI추천답변'] || '';
          return {
            ...row,
            // AI 추천 답변이 있으면 투입물명에 적용
            '투입물명': aiRecommendation || row['투입물명'] || ''
          };
        });

        // AI 처리된 데이터를 편집 가능한 행 데이터로 변환 (원본 데이터 유지)
        const updatedEditableRows: EditableRow[] = processedData.map((row: DataRow, index) => ({
          id: `input-${index}`,
          originalData: row,
          modifiedData: { ...row }, // 원본 데이터 유지, AI 추천 답변은 별도 컬럼에만 표시
          isEditing: false
        }));

        setEditableInputRows(updatedEditableRows);
        console.log('AI 처리 완료: 편집 가능한 행 데이터 업데이트됨');
        
        // 성공 메시지 표시
        console.log('AI 추천 답변이 별도 컬럼에 표시되었습니다. DB 저장 시 적용됩니다.');
        
      } else {
        throw new Error(responseData.message || 'AI 처리 실패');
      }

    } catch (err) {
      console.error('AI 처리 오류:', err);
      setError(`AI 처리 중 오류가 발생했습니다: ${err}`);
    } finally {
      setIsAiProcessing(false);
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

  // 행 편집 토글 (Excel 데이터는 AI 추천답변만, 수동 데이터는 모든 필드 편집 가능)
  const toggleRowEdit = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
          // 수동으로 추가된 데이터인지 확인 (isNewlyAdded 속성으로 판단)
      const isManualData = row.isNewlyAdded;
    
    if (!isManualData) {
      // Excel 데이터인 경우 AI 추천답변 칼럼만 편집 가능
      console.log('Excel 데이터 편집 모드 활성화 - AI 추천답변만 편집 가능');
    }
    
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, isEditing: !row.isEditing }
          : row
      )
    );
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
    setRowErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId];
      }
      return newErrors;
    });
  };

  // 행 확인 (DB 저장 없이 편집 완료)
  const confirmRow = async (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

         // Excel 데이터의 AI 추천 답변 편집 시 수정 사유 확인
     if (!row.isNewlyAdded) {
       const reason = editReasons[rowId] || '';
       if (!reason.trim()) {
         setError('Excel 데이터의 AI 추천 답변을 편집할 때는 수정 사유를 입력해주세요.');
         return;
       }
     }

     // 수동으로 추가된 데이터인 경우 모든 필수 필드 검증
     if (row.isNewlyAdded) {
      const requiredFields = ['로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '투입물명', '수량', '단위'];
      const missingFields = [];
      const invalidFields = [];

      for (const field of requiredFields) {
        const value = row.modifiedData[field];
        
        // 빈 값 체크
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
        return;
      }
    }

    // 편집 완료 상태로 변경
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

    // 수정 사유 초기화
    setEditReasons(prev => {
      const newReasons = { ...prev };
      delete newReasons[rowId];
      return newReasons;
    });

    // 행별 오류 제거
    setRowErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[rowId]) {
        delete newErrors[rowId];
      }
      return newErrors;
    });
    setError(null);
    console.log('행 확인 완료:', row.modifiedData);
  };

  // 날짜 비교 검증 함수
  const validateDateComparison = (rowId: string, column: string, value: string): void => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
    if (column === '투입일' && row.modifiedData['종료일']) {
      const inputDate = new Date(value);
      const endDate = new Date(row.modifiedData['종료일']);
      if (inputDate > endDate) {
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

  // 입력 유효성 검사
  const validateInput = (column: string, value: string): { isValid: boolean; errorMessage: string } => {
    if (value.length > 20) {
      console.log(`글자 수 초과: ${column} - ${value.length}글자`);
      return { isValid: false, errorMessage: '20자 이하로 입력해주세요.' };
    }
    
    switch (column) {
      case '로트번호':
      case '생산수량':
      case '수량':
        const isNumberValid = /^\d*$/.test(value);
        if (!isNumberValid) {
          console.log(`숫자만 입력 가능: ${column} - ${value}`);
          return { isValid: false, errorMessage: '숫자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '투입일':
      case '종료일':
        if (!value || value === '') {
          return { isValid: true, errorMessage: '' };
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
        const isProductNameValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isProductNameValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '공정':
        const isProcessValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isProcessValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '투입물명':
        const isMaterialNameValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isMaterialNameValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      case '단위':
        const isUnitValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
        if (!isUnitValid) {
          console.log(`텍스트 입력 오류: ${column} - ${value}`);
          return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
        }
        return { isValid: true, errorMessage: '' };
      default:
        return { isValid: true, errorMessage: '' };
    }
  };

     // 입력 필드 렌더링
   const renderInputField = (row: EditableRow, column: string) => {
     const value = row.modifiedData[column] || '';
     const isNewRowData = isNewRow(row);
     const isExcelData = !isNewRowData; // Excel에서 업로드된 기존 데이터
     const isRequired = isNewRowData && ['로트번호', '생산품명', '생산수량', '투입일', '종료일', '공정', '투입물명', '수량', '단위'].includes(column);
    
    // Excel 데이터인 경우 AI 추천답변만 편집 가능
    if (isExcelData && column !== 'AI추천답변') {
      return <span className='text-white/60'>{value || '-'}</span>;
    }
    
         // 수동으로 추가된 데이터인 경우 모든 필드 편집 가능
     if (isNewRowData) {
       // 모든 필드를 편집 가능하게 렌더링
     }
    
         const getInputClassName = () => {
       let baseClass = 'w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
       
       if (isNewRowData) {
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
              onKeyDown={(e) => handleNumericInput(e, column)}
              placeholder={isRequired ? '한글/영문/숫자 입력 *' : '한글/영문/숫자 입력'}
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
      
      case '투입물명':
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
              placeholder={isRequired ? '한글/영문/숫자 입력 *' : '한글/영문/숫자 입력'}
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
      
             case '단위':
         return (
           <div className='relative'>
             <select
               value={value}
               onChange={(e) => {
                 const newValue = e.target.value;
                 handleInputChange(row.id, column, newValue);
                 clearRowError(row.id, column);
               }}
               className={getInputClassName()}
             >
               <option value=''>단위를 선택하세요</option>
               <option value='t'>톤</option>
               <option value='kg'>킬로그램</option>
               <option value='개수'>개수</option>
               <option value='kg/h'>킬로그램/시간</option>
               <option value='kg/m'>킬로그램/미터</option>
               <option value='kg/m2'>킬로그램/제곱미터</option>
               <option value='kg/m3'>킬로그램/세제곱미터</option>
               <option value='kg/L'>킬로그램/리터</option>
               <option value='kg/m2/h'>킬로그램/제곱미터/시간</option>
               <option value='kg/m3/h'>킬로그램/세제곱미터/시간</option>
               <option value='kg/L/h'>킬로그램/리터/시간</option>
               <option value='kg/m2/m'>킬로그램/제곱미터/미터</option>
               <option value='kg/m3/m'>킬로그램/세제곱미터/미터</option>
               <option value='kg/L/m'>킬로그램/리터/미터</option>
               <option value='kg/m2/m2'>킬로그램/제곱미터/제곱미터</option>
               <option value='kg/m3/m2'>킬로그램/세제곱미터/제곱미터</option>
               <option value='kg/L/m2'>킬로그램/리터/제곱미터</option>
               <option value='kg/m3/m3'>킬로그램/세제곱미터/세제곱미터</option>
               <option value='kg/L/m3'>킬로그램/리터/세제곱미터</option>
               <option value='kg/m2/m3'>킬로그램/제곱미터/세제곱미터</option>
             </select>
            {isRequired && (
              <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
            )}
            {rowErrors[row.id]?.[column] && (
              <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
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
               onChange={(e) => {
                 const newValue = e.target.value;
                 // AI 추천 답변만 변경, 투입물명은 자동으로 변경하지 않음
                 handleInputChange(row.id, column, newValue);
               }}
               placeholder={isNewRowData ? 'AI 추천 답변을 입력하세요' : 'AI 추천 답변을 수정하거나 입력하세요'}
               className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                 isNewRowData ? 'border-green-300 bg-green-50 text-black' : 'border-blue-300 bg-blue-50 text-black'
               }`}
             />
             <span className={`absolute -top-2 -right-2 text-xs ${
               isNewRowData ? 'text-green-500' : 'text-blue-500'
             }`}>
               {isNewRowData ? '✏️' : '✏️'}
             </span>
           </div>
         );
      
      default:
        return (
          <span>{value || '-'}</span>
        );
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

     // 데이터 확인 핸들러
   const handleDataValidation = async () => {
     if (!editableInputRows || editableInputRows.length === 0) {
       setError('확인할 데이터가 없습니다.');
       return;
     }

     setIsSavingToDB(true);
     setDbSaveStatus('데이터 확인 중...');
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

      // AI 추천 답변을 투입물명에 적용하여 저장할 데이터 준비
      const dataToSave = editableInputRows.map(row => {
        const aiRecommendation = row.modifiedData['AI추천답변'] || '';
        const unit = row.modifiedData['단위'] && row.modifiedData['단위'].trim() ? row.modifiedData['단위'] : 't';
        
        // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
        let 투입물명 = aiRecommendation || row.modifiedData['투입물명'] || '';
        
        // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
        if (투입물명.length > 100) {
          투입물명 = 투입물명.substring(0, 100);
          console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
        }
        
        return {
          ...row.modifiedData,
          // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
          '투입물명': 투입물명,
          // 빈 단위 값은 't'로 설정
          '단위': unit,
          // Excel 날짜를 PostgreSQL date 형식으로 변환
          '투입일': convertExcelDate(row.modifiedData['투입일']),
          '종료일': convertExcelDate(row.modifiedData['종료일'])
        };
      });

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-processed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputFile?.name || 'unknown',
          data: dataToSave,
          columns: Object.keys(dataToSave[0] || {})
        }),
      });

      if (!response.ok) {
        throw new Error(`데이터베이스 저장 실패: ${response.status}`);
      }

      const responseData = await response.json();
             if (responseData.success) {
         setDbSaveStatus('✅ 데이터 확인이 완료되었습니다.');
         console.log('데이터 확인 성공:', responseData);
         
         // 확인 완료 후 편집 가능한 행 데이터 업데이트 (AI 추천 답변 적용된 상태로)
         const updatedRows = editableInputRows.map(row => {
           const aiRecommendation = row.modifiedData['AI추천답변'] || '';
           return {
             ...row,
             originalData: {
               ...row.modifiedData,
               '투입물명': aiRecommendation || row.modifiedData['투입물명'] || ''
             },
             modifiedData: {
               ...row.modifiedData,
               '투입물명': aiRecommendation || row.modifiedData['투입물명'] || ''
             }
           };
         });
         
         setEditableInputRows(updatedRows);
         console.log('AI 추천 답변이 투입물명 컬럼에 성공적으로 적용되었습니다.');
         
       } else {
         throw new Error(responseData.message || '데이터 확인 실패');
       }
     } catch (err) {
       console.error('데이터 확인 오류:', err);
       setError(`데이터 확인 중 오류가 발생했습니다: ${err}`);
       setDbSaveStatus(`❌ 데이터 확인 실패: ${err}`);
     } finally {
       setIsSavingToDB(false);
     }
  };

     // 새로운 행인지 확인하는 함수
   const isNewRow = (row: EditableRow): boolean => {
     return !row.originalData || Object.keys(row.originalData).length === 0 || 
            Object.values(row.originalData).every(val => val === '' || val === null || val === undefined);
   };

   // 새로운 행 추가 핸들러
   const addNewRow = () => {
    const newRow: EditableRow = {
      id: `input-${editableInputRows.length}`,
      originalData: {
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
      isNewlyAdded: true
    };
    setEditableInputRows(prev => [...prev, newRow]);
  };

  // 데이터베이스 저장 핸들러
  const handleSaveToDatabase = async () => {
    if (!editableInputRows || editableInputRows.length === 0) {
      setError('저장할 데이터가 없습니다.');
      return;
    }

    setIsSavingToDB(true);
    setDbSaveStatus('데이터베이스 저장 중...');
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

      // AI 추천 답변을 투입물명에 적용하여 저장할 데이터 준비
      const dataToSave = editableInputRows.map(row => {
        const aiRecommendation = row.modifiedData['AI추천답변'] || '';
        const unit = row.modifiedData['단위'] && row.modifiedData['단위'].trim() ? row.modifiedData['단위'] : 't';
        
        // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
        let 투입물명 = aiRecommendation || row.modifiedData['투입물명'] || '';
        
        // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
        if (투입물명.length > 100) {
          투입물명 = 투입물명.substring(0, 100);
          console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
        }
        
        return {
          ...row.modifiedData,
          // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
          '투입물명': 투입물명,
          // 빈 단위 값은 't'로 설정
          '단위': unit,
          // Excel 날짜를 PostgreSQL date 형식으로 변환
          '투입일': convertExcelDate(row.modifiedData['투입일']),
          '종료일': convertExcelDate(row.modifiedData['종료일'])
        };
      });

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-processed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputFile?.name || 'unknown',
          data: dataToSave,
          columns: Object.keys(dataToSave[0] || {})
        }),
      });

      if (!response.ok) {
        throw new Error(`데이터베이스 저장 실패: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success) {
        setDbSaveStatus('✅ 데이터베이스 저장이 완료되었습니다.');
        console.log('데이터베이스 저장 성공:', responseData);
        
        // 저장 완료 후 편집 가능한 행 데이터 업데이트 (AI 추천 답변 적용된 상태로)
        const updatedRows = editableInputRows.map(row => {
          const aiRecommendation = row.modifiedData['AI추천답변'] || '';
          return {
            ...row,
            originalData: {
              ...row.modifiedData,
              '투입물명': aiRecommendation || row.modifiedData['투입물명'] || ''
            },
            modifiedData: {
              ...row.modifiedData,
              '투입물명': aiRecommendation || row.modifiedData['투입물명'] || ''
            }
          };
        });
        
        setEditableInputRows(updatedRows);
        console.log('AI 추천 답변이 투입물명 컬럼에 성공적으로 적용되었습니다.');
        
      } else {
        throw new Error(responseData.message || '데이터베이스 저장 실패');
      }
    } catch (err) {
      console.error('데이터베이스 저장 오류:', err);
      setError(`데이터베이스 저장 중 오류가 발생했습니다: ${err}`);
      setDbSaveStatus(`❌ 데이터베이스 저장 실패: ${err}`);
    } finally {
      setIsSavingToDB(false);
    }
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
            <h1 className='stitch-h1 text-xl lg:text-2xl xl:text-3xl font-bold'>실적정보(투입물)</h1>
            <p className='stitch-caption text-white/60 text-xs lg:text-sm'>
              생산 과정에서 투입되는 원재료, 부재료 등의 데이터를 업로드하고 AI로 표준화합니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 min-h-0 space-y-6'>
          {/* 1. 템플릿 다운로드 섹션 */}
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Download className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>템플릿 다운로드</h2>
                <p className='text-sm text-white/60'>표준 형식의 템플릿을 다운로드하여 데이터 입력에 활용하세요</p>
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
          <div className='stitch-card p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <Upload className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Excel 업로드</h2>
                <p className='text-sm text-white/60'>템플릿 형식에 맞는 Excel 파일을 업로드하면 AI가 자동으로 투입물명을 표준화합니다</p>
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
          {isAiProcessing && (
            <div className='stitch-card p-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Brain className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>AI 처리 중...</h3>
                  <p className='text-sm text-white/60'>데이터를 분석하고 표준화하는 중입니다. 잠시만 기다려주세요.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. 데이터 미리보기 및 편집 */}
          {inputData && editableInputRows.length > 0 && (
            <div className='stitch-card p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-white'>데이터 미리보기</h3>
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
                              {/* 사용자가 직접 입력한 데이터인지 확인 */}
                              {row.isNewlyAdded ? (
                                // 사용자가 직접 입력한 데이터는 편집/삭제 모두 가능
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
                                // Excel 데이터는 AI 추천답변만 편집 가능
                                <Button
                                  onClick={() => toggleRowEdit(row.id)}
                                  className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs'
                                >
                                  <Edit3 className='w-3 h-3 mr-1' />
                                  편집
                                </Button>
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

                             {/* 수정 사유 입력 (AI 추천 답변 편집 시에만) */}
               {editableInputRows.some(row => row.isEditing && !row.isNewlyAdded) && (
                 <div className='mt-4 p-4 bg-white/5 rounded-lg'>
                   <h4 className='text-sm font-medium text-white mb-2'>AI 추천 답변 수정 사유 입력</h4>
                   <div className='flex gap-4'>
                     {editableInputRows
                       .filter(row => row.isEditing && !row.isNewlyAdded)
                       .map(row => (
                        <div key={row.id} className='flex-1'>
                          <label className='block text-xs text-white/60 mb-1'>
                            행 {row.id} 수정 사유
                          </label>
                          <Input
                            type='text'
                            value={editReasons[row.id] || ''}
                            onChange={(e) => setEditReasons(prev => ({
                              ...prev,
                              [row.id]: e.target.value
                            }))}
                            placeholder='AI 추천 답변 수정 사유를 입력하세요'
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                          />
                        </div>
                      ))}
                  </div>
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
                  <h3 className='text-lg font-semibold text-white'>AI 처리 완료</h3>
                  <p className='text-sm text-white/60'>
                    총 {aiProcessedData.total_rows}행 중 {aiProcessedData.processed_rows}행이 처리되었습니다.
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

                     {/* 데이터 확인 버튼 */}
           <div className='mt-4 flex items-center gap-4'>
                          <Button
               onClick={handleSaveToDatabase}
               disabled={isSavingToDB}
               className='bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center gap-2'
             >
               {isSavingToDB ? (
                 <>
                   <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                   저장 중...
                 </>
               ) : (
                 <>
                   <Save className='w-4 h-4' />
                   데이터 저장
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
        </div>
      </div>
    </CommonShell>
  );
};

export default InputDataPage;
