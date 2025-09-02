'use client';

import React, { useState, useRef, useCallback, useMemo, forwardRef } from 'react';
import CommonShell from '@/components/common/CommonShell';
import {
  Download, 
  FileSpreadsheet,
  X,
  Plus,
  Trash2,
  Edit3, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Truck
} from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import Link from 'next/link';

// 타입 정의 - 새로운 스키마 기반
type DataRow = {
  주문처명?: string;
  오더번호?: string;
  생산품명?: string;
  로트번호?: string;
  운송물질?: string;
  운송수량?: number;
  운송일자?: string;
  도착공정?: string;
  출발지?: string;
  이동수단?: string;
  [key: string]: any;
};

interface DataPreview {
  filename: string;
  fileSize: string;
  data: Array<DataRow>;
  columns: string[];
}

interface EditableRow {
  id: string;
  originalData: DataRow;
  modifiedData: DataRow;
  isEditing: boolean;
  isNewlyAdded?: boolean;
  errors?: Record<string, string>;
}

// 제어 컴포넌트 패턴을 사용한 입력 필드
const ControlledInput = forwardRef<HTMLInputElement, {
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  min?: string;
  max?: string;
  step?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}>(({ 
  type, 
  value, 
  onChange, 
  onBlur, 
  onKeyDown, 
  onPaste, 
  onInput, 
  placeholder, 
  className = '', 
  maxLength, 
  min, 
  max, 
  step, 
  disabled, 
  required, 
  error 
}, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorClasses = "border-red-500 bg-red-50 text-red-900";
  const normalClasses = "border-gray-300 bg-white text-gray-900";
  
  const finalClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`;

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onInput={onInput}
        placeholder={placeholder}
        className={finalClasses}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        inputMode={type === 'number' ? 'numeric' : undefined}
        pattern={type === 'number' ? '[0-9]*' : undefined}
      />
      {required && (
        <span className="absolute -top-2 -right-2 text-red-500 text-xs font-bold">*</span>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 absolute">{error}</p>
      )}
    </div>
  );
});

ControlledInput.displayName = 'ControlledInput';

const TransportDataPage: React.FC = () => {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<string>('');

  const inputFileRef = useRef<HTMLInputElement>(null);

  // 유효성 검사 함수들
  const validateField = useCallback((column: string, value: string): string => {
    if (!value || value.trim() === '') {
      return '필수 입력 항목입니다';
    }

    switch (column) {
      case '운송 일자':  // 공백 포함된 컬럼명 사용
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return 'YYYY-MM-DD 형식으로 입력해주세요';
        }
        const inputDate = new Date(value);
        const today = new Date();
        if (inputDate > today) {
          return '미래 날짜는 입력할 수 없습니다';
        }
        if (inputDate < new Date('1900-01-01')) {
          return '1900년 이후 날짜를 입력해주세요';
        }
        break;
      
      case '운송 수량':  // 공백 포함된 컬럼명 사용
        if (!/^\d+$/.test(value)) {
          return '숫자만 입력 가능합니다';
        }
        if (parseInt(value) <= 0) {
          return '0보다 큰 숫자를 입력해주세요';
        }
        break;
      
      case '로트번호':
        if (!/^\d+$/.test(value)) {
          return '숫자만 입력 가능합니다';
        }
        break;
      
      case '생산품명':
        if (value.length > 50) {
          return '50자 이내로 입력해주세요';
        }
        break;
    }

    return '';
  }, []);

  // 행별 에러 상태 관리
  const updateRowErrors = useCallback((rowId: string, column: string, value: string) => {
    setEditableInputRows(prev => 
      prev.map(row => {
        if (row.id === rowId) {
          const error = validateField(column, value);
          const newErrors = { ...row.errors, [column]: error };
          return { ...row, errors: newErrors };
        }
        return row;
      })
    );
  }, [validateField]);

  // 행 삭제
  const deleteRow = useCallback((rowId: string) => {
    setEditableInputRows(prev => prev.filter(row => row.id !== rowId));
    setError(null);
  }, []);

  // 새 행 추가
  const addNewRow = useCallback(() => {
    const newRow: EditableRow = {
      id: `transport-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalData: {
        '주문처명': '',
        '오더번호': '',
        '생산품명': '',
        '로트번호': '',
        '운송 물질': '',  // 공백 포함된 컬럼명 사용
        '운송 수량': 0,   // 공백 포함된 컬럼명 사용
        '운송 일자': '',  // 공백 포함된 컬럼명 사용
        '도착 공정': '',  // 공백 포함된 컬럼명 사용
        '출발지': '',
        '이동 수단': ''   // 공백 포함된 컬럼명 사용
      },
      modifiedData: {
        '주문처명': '',
        '오더번호': '',
        '생산품명': '',
        '로트번호': '',
        '운송 물질': '',  // 공백 포함된 컬럼명 사용
        '운송 수량': 0,   // 공백 포함된 컬럼명 사용
        '운송 일자': '',  // 공백 포함된 컬럼명 사용
        '도착 공정': '',  // 공백 포함된 컬럼명 사용
        '출발지': '',
        '이동 수단': ''   // 공백 포함된 컬럼명 사용
      },
      isEditing: true,
      isNewlyAdded: true,
      errors: {}
    };
    setEditableInputRows(prev => [...prev, newRow]);
    setError(null);
  }, []);

  // 행 편집 취소
  const cancelRowEdit = useCallback((rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    if (row.isNewlyAdded) {
      setEditableInputRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { ...r, isEditing: false, modifiedData: { ...r.originalData }, errors: {} }
            : r
        )
      );
    }
    setError(null);
  }, [editableInputRows]);

  // 입력 필드 렌더링 - 최신 패턴 사용
  const renderInputField = useCallback((row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const error = row.errors?.[column] || '';
    const isRequired = ['로트번호', '운송 수량', '운송 일자', '도착 공정', '출발지', '이동 수단'].includes(column);  // 공백 포함된 컬럼명 사용
    
    const handleChange = (newValue: string) => {
      handleInputChange(row.id, column, newValue);
      updateRowErrors(row.id, column, newValue);
    };

    // 운송 일자 - 날짜 선택기
    if (column === '운송 일자') {  // 공백 포함된 컬럼명 사용
      return (
        <ControlledInput
          type="date"
          value={value || ''}
          onChange={handleChange}
          placeholder="날짜 선택"
          max={new Date().toISOString().split('T')[0]}
          required={isRequired}
          error={error}
        />
      );
    }
    
    // 운송 수량 - 숫자만 입력 + 즉시 필터링 (소수점 허용)
    if (column === '운송 수량') {  // 공백 포함된 컬럼명 사용
      return (
        <ControlledInput
          type="text"
          value={value}
          onChange={(newValue) => {
            // 숫자와 소수점만 허용
            const filteredValue = newValue.replace(/[^\d.]/g, '');
            // 소수점이 여러 개 있는 경우 처리
            const parts = filteredValue.split('.');
            if (parts.length > 2) {
              const finalValue = parts[0] + '.' + parts.slice(1).join('');
              handleChange(finalValue);
            } else {
              handleChange(filteredValue);
            }
          }}
          onKeyDown={(e) => {
            // 숫자, 소수점, 백스페이스, 삭제, 화살표 키만 허용
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'];
            if (!/\d/.test(e.key) && !allowedKeys.includes(e.key)) {
              e.preventDefault();
              return false;
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filteredText = pastedText.replace(/[^\d.]/g, '');
            if (filteredText) {
              handleChange(filteredText);
            }
          }}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            // 입력 이벤트에서도 필터링
            const target = e.target as HTMLInputElement;
            const filteredValue = target.value.replace(/[^\d.]/g, '');
            if (target.value !== filteredValue) {
              target.value = filteredValue;
              handleChange(filteredValue);
            }
          }}
          placeholder="숫자 입력 (소수점 허용)"
          maxLength={15}
          required={isRequired}
          error={error}
        />
      );
    }
    
    // 로트번호 - 숫자만 입력
    if (column === '로트번호') {
      return (
        <ControlledInput
          type="text"
          value={value}
          onChange={(newValue) => {
            const filteredValue = newValue.replace(/[^\d]/g, '');
            handleChange(filteredValue);
          }}
          placeholder="숫자만 입력"
          maxLength={20}
          required={isRequired}
          error={error}
        />
      );
    }
    
    // 주문처명
    if (column === '주문처명') {
      return (
        <ControlledInput
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="주문처명을 입력하세요"
          maxLength={100}
          required={false}
          error={error}
        />
      );
    }
    
    // 오더번호
    if (column === '오더번호') {
      return (
        <ControlledInput
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="오더번호를 입력하세요"
          maxLength={50}
          required={false}
          error={error}
        />
      );
    }
    
    // 기타 텍스트 필드
    return (
      <ControlledInput
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={`${column} 입력`}
        maxLength={column === '생산품명' ? 50 : 20}
        required={isRequired}
        error={error}
      />
    );
  }, [updateRowErrors]);

  // 템플릿 다운로드
  const handleTemplateDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/templates/실적_데이터_운송정보.xlsx';
    link.download = '실적_데이터_운송정보.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 파일 선택
  const handleInputFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  }, []);

  // 파일 업로드
  const handleInputUpload = useCallback(async () => {
    if (!inputFile) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsInputUploading(true);
    setError(null);

    try {
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
        '주문처명', '오더번호', '생산품명', '로트번호'
      ];
      
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`필수 칼럼이 누락되었습니다: ${missingColumns.join(', ')}`);
      }
      
      // 데이터 읽기 (두 번째 행부터)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: columns,
        range: 1,
        defval: ''
      }) as DataRow[];
      
      console.log('처리된 데이터:', jsonData);
      
      const editableRows: EditableRow[] = jsonData.map((row: any, index) => ({
        id: `transport-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false,
        errors: {}
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
  }, [inputFile]);

  // DB 저장
  const handleSaveToDatabase = useCallback(async () => {
    if (!inputData || inputData.data.length === 0) {
      setError('저장할 데이터가 없습니다.');
      return;
    }

    setIsSavingToDB(true);
    setDbSaveStatus('');
    setError(null);

    try {
      const convertExcelDate = (excelDate: any): string | null => {
        if (!excelDate || excelDate === '') return null;
        
        try {
          if (typeof excelDate === 'string') {
            return excelDate;
          }
          
          if (typeof excelDate === 'number') {
            const baseDate = new Date(1900, 0, 1);
            const resultDate = new Date(baseDate.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
            return resultDate.toISOString().split('T')[0];
          }
          
          return null;
        } catch (error) {
          console.warn('날짜 변환 실패:', excelDate, error);
          return null;
        }
      };

      const processedData = inputData.data.map((row: any) => {
        // 운송수량을 숫자로 변환 (Excel 컬럼명에 맞춤)
        let 운송수량 = parseFloat(row['운송 수량']?.toString() || '0');
        
        // 운송수량 검증 (0 이하인 경우 기본값 1로 설정)
        if (운송수량 <= 0) {
          console.warn(`행 ${inputData.data.indexOf(row) + 1}: 운송수량이 0 이하입니다. 기본값 1로 설정됩니다.`);
          운송수량 = 1;
        }
        
        return {
          ...row,
          '운송 수량': 운송수량,  // Excel 컬럼명과 일치
          '운송 일자': convertExcelDate(row['운송 일자']),  // Excel 컬럼명과 일치
          '주문처명': row['주문처명'] || '',
          '오더번호': row['오더번호'] || ''
        };
      });

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-transport-data`, {
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
        console.log('운송 데이터가 성공적으로 저장되었습니다:', result);
      } else {
        setDbSaveStatus(`❌ 저장 실패: ${result.message}`);
        console.error('운송 데이터 저장 실패:', result);
      }
    } catch (error) {
      setDbSaveStatus(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('운송 데이터 저장 중 오류:', error);
    } finally {
      setIsSavingToDB(false);
    }
  }, [inputData, inputFile]);

  // 입력 변경
  const handleInputChange = useCallback((rowId: string, column: string, value: string) => {
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, modifiedData: { ...row.modifiedData, [column]: value } }
          : row
      )
    );
  }, []);

  // 행 편집 토글
  const toggleRowEdit = useCallback((rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
    if (!row.isNewlyAdded) {
      setError('Excel 파일로 업로드된 데이터는 수정할 수 없습니다.');
      return;
    }
    
    setEditableInputRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, isEditing: !row.isEditing, errors: {} }
          : row
      )
    );
  }, [editableInputRows]);

  // 행 저장
  const saveRow = useCallback(async (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

         if (row.isNewlyAdded) {
       const requiredFields = ['생산품명', '로트번호', '운송 물질', '운송 수량', '운송 일자', '도착 공정', '출발지', '이동 수단'];  // 공백 포함된 컬럼명 사용
       const missingFields = [];
       const newErrors: Record<string, string> = {};

      // 모든 필수 필드 검증
      for (const field of requiredFields) {
        const value = row.modifiedData[field];
        const error = validateField(field, value || '');
        
        if (error) {
          missingFields.push(field);
          newErrors[field] = error;
        }
      }

      if (missingFields.length > 0) {
        // 에러 상태 업데이트
        setEditableInputRows(prev => 
          prev.map(r => 
            r.id === rowId 
              ? { ...r, errors: newErrors }
              : r
          )
        );
        
        setError(`데이터 저장 실패: 필수 입력 항목 ${missingFields.join(', ')}을 입력해주세요.`);
        return;
      }
    }

    try {
      setEditableInputRows(prev => 
        prev.map(r => 
          r.id === rowId 
            ? { 
                ...r, 
                isEditing: false,
                originalData: { ...r.modifiedData },
                errors: {}
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
  }, [editableInputRows, validateField]);

  // 드래그 앤 드롭
  const handleDrop = useCallback((e: React.DragEvent) => {
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
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 메모이제이션된 값들
  const hasErrors = useMemo(() => {
    return editableInputRows.some(row => 
      row.errors && Object.values(row.errors).some(error => error !== '')
    );
  }, [editableInputRows]);

  return (
    <CommonShell>
      <div className="w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/data-upload">
            <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <div>
            <h1 className="stitch-h1 text-xl lg:text-2xl xl:text-3xl font-bold">운송정보</h1>
            <p className="stitch-caption text-white/60 text-xs lg:text-sm">
              생산품의 운송 과정과 관련된 데이터를 업로드하고 분석합니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-h-0 space-y-6">
          {/* 1. 템플릿 다운로드 */}
          <div className="stitch-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">템플릿 다운로드</h2>
                <p className="text-sm text-white/60">운송 데이터 입력을 위한 표준 템플릿을 다운로드하세요</p>
              </div>
            </div>
            <Button
              onClick={handleTemplateDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              템플릿 다운로드
            </Button>
          </div>
          
          {/* 2. Excel 업로드 */}
          <div className="stitch-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Excel 업로드</h2>
                <p className="text-sm text-white/60">운송 정보가 포함된 Excel 파일을 업로드하여 분석합니다</p>
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
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputFileSelect}
                className="hidden"
              />
              
              {!inputFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                    <Truck className="w-8 h-8 text-white/60" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-2">
                      파일을 드래그하여 업로드하거나 클릭하여 선택하세요
                    </p>
                    <p className="text-sm text-white/60 mb-4">
                      지원 형식: .xlsx, .xls
                    </p>
                    <Button
                      onClick={() => inputFileRef.current?.click()}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-2">
                      선택된 파일: {inputFile.name}
                    </p>
                    <p className="text-sm text-white/60 mb-4">
                      파일 크기: {(inputFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleInputUpload}
                        disabled={isInputUploading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isInputUploading ? '업로드 중...' : '업로드 시작'}
                      </Button>
                      <Button
                        onClick={() => {
                          setInputFile(null);
                          setInputData(null);
                          setEditableInputRows([]);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        파일 변경
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. 데이터 미리보기 및 편집 */}
          {inputData && editableInputRows.length > 0 && (
            <div className="stitch-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">운송 데이터 미리보기</h3>
                  <p className="text-sm text-white/60">
                    파일: {inputData.filename} | 
                    크기: {inputData.fileSize} MB | 
                    행 수: {inputData.data.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={isSavingToDB || hasErrors}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingToDB ? '저장 중...' : 'DB에 저장하기'}
                  </Button>
                </div>
              </div>

              {/* DB 저장 상태 */}
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/20">
                  <thead>
                    <tr className="bg-white/10">
                      {inputData.columns.map((column) => (
                        <th key={column} className="border border-white/20 px-3 py-2 text-left text-sm font-medium text-white">
                          {column}
                        </th>
                      ))}
                      <th className="border border-white/20 px-3 py-2 text-left text-sm font-medium text-white">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableInputRows.map((row) => (
                      <tr key={row.id} className="border-b border-white/10 hover:bg-white/5">
                        {inputData.columns.map((column) => (
                          <td key={column} className="border border-white/20 px-3 py-2 text-sm text-white">
                            {row.isEditing ? (
                              renderInputField(row, column)
                            ) : (
                              <span>{row.modifiedData[column] || '-'}</span>
                            )}
                          </td>
                        ))}
                        <td className="border border-white/20 px-3 py-2 text-sm">
                          {row.isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveRow(row.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                저장
                              </Button>
                              <Button
                                onClick={() => cancelRowEdit(row.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                              >
                                <X className="w-3 h-3 mr-1" />
                                취소
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {row.isNewlyAdded ? (
                                <>
                                  <Button
                                    onClick={() => toggleRowEdit(row.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                  >
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    편집
                                  </Button>
                                  <Button
                                    onClick={() => deleteRow(row.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    삭제
                                  </Button>
                                </>
                              ) : (
                                <span className="text-white/40 text-xs">수정 불가</span>
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
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={addNewRow}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  데이터 추가
                </Button>
              </div>
            </div>
          )}

          {/* 4. 오류 메시지 */}
          {error && (
            <div className="stitch-card p-6 bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400">오류 발생</h3>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CommonShell>
  );
};

export default TransportDataPage;
