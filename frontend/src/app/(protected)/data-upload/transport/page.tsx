'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Download,
  FileText,
  Home,
  BarChart3,
  Shield,
  Settings,
  Grid3X3,
  Truck,
  Cog,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Edit3,
  CheckCircle,
  X,
  Trash2,
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

export default function TransportDataPage() {
  const [error, setError] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<InputData | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);

  // refs
  const inputFileRef = useRef<HTMLInputElement>(null);

    // 템플릿 컬럼명 확인 함수
  const checkTemplateColumns = async () => {
    try {
      const templateUrl = '/templates/실적_데이터_운송정보.xlsx';
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error(`템플릿 읽기 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        console.log('🔍 템플릿 파일의 실제 컬럼명:', headers);
        console.log('🔍 템플릿 컬럼 개수:', headers.length);
        console.log('🔍 각 컬럼명 (공백 포함):');
        headers.forEach((header, index) => {
          console.log(`  ${index + 1}. "${header}" (길이: ${header.length})`);
        });
      }
      
    } catch (err) {
      console.error('템플릿 컬럼명 확인 오류:', err);
    }
  };

  // 템플릿 다운로드 (간단한 방식)
  const handleTemplateDownload = async () => {
    try {
      // 템플릿 컬럼명 먼저 확인
      await checkTemplateColumns();
      
      // 간단하게 public/templates에서 직접 다운로드
      const templateUrl = '/templates/실적_데이터_운송정보.xlsx';
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error(`템플릿 다운로드 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '실적 데이터 (운송정보).xlsx';
      
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
    } else {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  // 파일 업로드
  const handleInputUpload = async () => {
    if (!inputFile) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    console.log('🚀 파일 업로드 시작:', inputFile.name);
    setIsInputUploading(true);
    setError(null);

    try {
      // 파일 읽기
      console.log('📖 Excel 파일 읽기 시작...');
      const data = await readExcelFile(inputFile);
      console.log('✅ Excel 파일 읽기 완료');
      console.log('📊 읽은 데이터:', {
        columns: data.columns,
        rowCount: data.data.length,
        sampleData: data.data.slice(0, 2)
      });
      
      // 템플릿 형식 검증
      console.log('🔍 템플릿 형식 검증 시작...');
      const isValidFormat = validateTemplateFormat(data.columns);
      console.log('✅ 템플릿 형식 검증 완료:', isValidFormat);
      
      if (!isValidFormat) {
        const errorMsg = '템플릿 형식과 맞지 않습니다. 다운로드한 템플릿을 확인해주세요.';
        console.log('❌ 템플릿 형식 검증 실패:', errorMsg);
        setError(errorMsg);
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
      
      console.log('📊 데이터 객체 생성 완료:', inputDataObj);
      setInputData(inputDataObj);

      // 편집 가능한 행으로 변환
      const editableRows: EditableRow[] = data.data.map((row, index) => ({
        id: `input-${index}`,
        originalData: row,
        modifiedData: { ...row },
        isEditing: false
      }));
      
      console.log('✏️ 편집 가능한 행 변환 완료:', editableRows.length, '행');
      setEditableInputRows(editableRows);
      setError(null);
      console.log('🎉 파일 업로드 완료!');

    } catch (err) {
      console.error('❌ 파일 업로드 오류:', err);
      setError(`파일 업로드 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setIsInputUploading(false);
      console.log('🔄 업로드 상태 초기화 완료');
    }
  };

  // Excel 파일 읽기
  const readExcelFile = (file: File): Promise<{ data: any[], columns: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log('🔍 Excel 파일 읽기 시작:', file.name);
          console.log('🔍 파일 크기:', file.size, 'bytes');
          
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          console.log('🔍 ArrayBuffer 크기:', data.length);
          
          const workbook = XLSX.read(data, { type: 'array' });
          console.log('🔍 워크북 시트 목록:', workbook.SheetNames);
          
          const sheetName = workbook.SheetNames[0];
          console.log('🔍 첫 번째 시트명:', sheetName);
          
          const worksheet = workbook.Sheets[sheetName];
          console.log('🔍 워크시트 범위:', worksheet['!ref']);
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log('🔍 JSON 데이터 길이:', jsonData.length);
          console.log('🔍 첫 번째 행 (헤더):', jsonData[0]);
          console.log('🔍 두 번째 행 (데이터):', jsonData[1]);
          
          if (jsonData.length < 2) {
            reject(new Error('데이터가 충분하지 않습니다.'));
            return;
          }

          const headers = jsonData[0] as string[];
          console.log('🔍 추출된 헤더:', headers);
          console.log('🔍 헤더 개수:', headers.length);
          
          const rows = jsonData.slice(1).map((row: any) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          console.log('🔍 변환된 행 데이터:', rows.slice(0, 2)); // 처음 2행만 로그
          console.log('🔍 총 행 수:', rows.length);

          resolve({ data: rows, columns: headers });
        } catch (err) {
          console.error('❌ Excel 파일 읽기 오류:', err);
          reject(err);
        }
      };
      reader.onerror = () => {
        console.error('❌ FileReader 오류');
        reject(new Error('파일 읽기 실패'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // 템플릿 형식 검증 (운송정보용)
  const validateTemplateFormat = (columns: string[]): boolean => {
    // 디버깅: 실제 업로드된 파일의 컬럼명 출력
    console.log('🔍 템플릿 형식 검증 시작');
    console.log('🔍 실제 업로드된 파일의 컬럼명:', columns);
    console.log('🔍 컬럼 개수:', columns.length);
    
    // 실제 운송정보 템플릿의 컬럼명 (실제 파일 기준)
    const expectedColumns = [
      '생산품명', '로트번호', '운송 물질', '운송 수량', '운송 일자', '도착 공정', '출발지', '이동 수단'
    ];
    
    console.log('🔍 예상 컬럼명:', expectedColumns);
    console.log('🔍 예상 컬럼 개수:', expectedColumns.length);
    
    // 컬럼 개수가 다르면 false
    if (columns.length !== expectedColumns.length) {
      console.log('❌ 컬럼 개수가 다릅니다!');
      console.log('❌ 실제:', columns.length, '개, 예상:', expectedColumns.length, '개');
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
      
      // 실제 컬럼과 예상 컬럼을 비교하여 차이점 출력
      console.log('🔍 컬럼 비교:');
      expectedColumns.forEach((expected, index) => {
        const actual = columns[index];
        console.log(`  ${index + 1}. 예상: "${expected}" | 실제: "${actual}" | 일치: ${expected.trim() === actual?.trim()}`);
      });
    }
    
    return isValid;
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
    } else {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // 새 행 추가
  const handleAddNewRow = () => {
    const newRow: EditableRow = {
      id: `new-${Date.now()}`,
      originalData: {},
      modifiedData: {
        '생산품명': '',
        '로트번호': '',
        '운송 물질': '',
        '운송 수량': '',
        '운송 일자': '',
        '도착 공정': '',
        '출발지': '',
        '이동 수단': ''
      },
      isEditing: true,
      isNewlyAdded: true
    };

    setEditableInputRows(prev => [...prev, newRow]);
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
    const row = editableInputRows.find(r => r.id === id);
    if (!row) return;

    // 새로 추가된 행인지 확인
    const isNewRow = row.isNewlyAdded;
    
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
        r.id === id 
          ? { 
              ...r, 
              isEditing: false,
              originalData: { ...r.modifiedData }, // 수정된 데이터를 원본으로 저장
              isNewlyAdded: isNewRow ? true : (r.isNewlyAdded || false) // 새로 추가된 행 플래그 유지
            }
          : r
      )
    );
    
    setError(null);
  };

  // 행 편집 취소
  const handleCancelRow = (id: string) => {
    const row = editableInputRows.find(r => r.id === id);
    if (!row) return;

    if (row.isNewlyAdded) {
      // 새로 추가된 행인 경우 삭제
      setEditableInputRows(prev => prev.filter(r => r.id !== id));
    } else {
      // 기존 행인 경우 원래 데이터로 복원
      setEditableInputRows(prev => 
        prev.map(row => 
          row.id === id 
            ? { ...row, isEditing: false, modifiedData: { ...row.originalData } }
            : row
        )
      );
    }
    setError(null);
  };

  // 행 삭제
  const handleDeleteRow = (id: string) => {
    const row = editableInputRows.find(r => r.id === id);
    if (!row) return;

    // 새로 추가된 행만 삭제 가능
    if (!row.isNewlyAdded) {
      // 새로 추가되지 않은 행은 삭제 불가
      setError('Excel로 업로드된 기존 데이터는 삭제할 수 없습니다.');
      return;
    }

    // 새로 추가된 행만 삭제 가능
    setEditableInputRows(prev => prev.filter(r => r.id !== id));
    setError(null);
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

  // 필수 필드 검증
  const validateRequiredFields = (data: any): boolean => {
    const requiredFields = [
      '생산품명', '로트번호', '운송 물질', '운송 수량', 
      '운송 일자', '도착 공정', '출발지', '이동 수단'
    ];
    
    return requiredFields.every(field => {
      const value = data[field];
      return value && value.toString().trim() !== '';
    });
  };

  // 저장 가능 여부 확인
  const canSaveRow = (row: EditableRow) => {
    if (!row.isEditing) return false;
    
    // 새로 추가된 행인지 확인
    if (row.isNewlyAdded) {
      return validateRequiredFields(row.modifiedData);
    }
    
    // 기존 행은 수정된 데이터가 있을 때만 저장 가능
    return JSON.stringify(row.modifiedData) !== JSON.stringify(row.originalData);
  };

  // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    const value = row.modifiedData[column] || '';
    const isNewRow = row.isNewlyAdded;
    
    // 새로 추가된 행만 편집 가능
    if (isNewRow) {
      let inputType = 'text';
      let placeholder = '';
      
      // 컬럼별 입력 타입 제한
      if (column === '로트번호' || column === '운송 수량') {
        inputType = 'number';
        placeholder = '숫자만 입력';
      } else if (column === '운송 일자') {
        inputType = 'date';
        placeholder = 'YYYY-MM-DD';
      } else {
        // 생산품명, 운송 물질, 도착 공정, 출발지, 이동 수단은 텍스트
        placeholder = '텍스트 입력';
      }

      return (
        <input
          type={inputType}
          value={value}
          onChange={(e) => handleInputChange(row.id, column, e.target.value)}
          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder={placeholder}
          maxLength={column === '로트번호' || column === '운송 수량' ? 10 : 50}
        />
      );
    }
    
    // 기존 Excel 데이터는 편집 불가능 (읽기 전용)
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
                <tr key={row.id} className={`${row.isNewlyAdded ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
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
                        {/* 편집 버튼 - 새로 추가된 행에만 표시 */}
                        {row.isNewlyAdded && (
                          <Button
                            onClick={() => handleEditRow(row.id)}
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          >
                            <Edit3 className='w-4 h-4 mr-1' />
                            편집
                          </Button>
                        )}
                        {/* 삭제 버튼 - 새로 추가된 행에만 표시 */}
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
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 새 행 추가 버튼 - 테이블 하단에 배치 (산출물 페이지와 동일한 디자인) */}
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

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* 왼쪽 사이드바 메뉴 */}
      <div className='w-64 bg-white shadow-lg border-r border-gray-200'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center'>
              <div className='w-6 h-6 text-white'>GS</div>
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
                <span className='text-sm font-medium'>데이터 업로드</span>
              </div>
              <div className='ml-6 space-y-1'>
                <a href='/data-upload' className='block px-3 py-2 text-xs text-gray-700 font-medium'>실적정보(투입물)</a>
                <a href='/data-upload/output' className='block px-3 py-2 text-xs text-gray-700 font-medium'>실적정보(산출물)</a>
                <a href='/data-upload/transport' className='block px-3 py-2 text-xs text-blue-600 font-medium bg-blue-50 rounded border border-blue-200'>운송정보</a>
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
                <h1 className='text-2xl font-bold text-gray-900'>운송정보</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 p-8 overflow-y-auto bg-gray-50'>
          <div className='max-w-6xl mx-auto'>
            {/* 페이지 헤더 */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>운송정보</h1>
                  <p className='text-gray-600 mt-2'>운송 관련 데이터를 업로드하고 관리할 수 있습니다</p>
                </div>
              </div>
            </div>

            {/* 1. 템플릿 다운로드 섹션 */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
              <div className='flex items-center gap-4 mb-4'>
                <Download className='w-8 h-8 text-blue-600' />
                <h2 className='text-xl font-semibold text-gray-900'>템플릿 다운로드</h2>
              </div>
              <p className='text-gray-600 mb-6'>표준 형식의 운송정보 템플릿을 다운로드하여 데이터 입력에 활용하세요</p>
              <Button 
                onClick={handleTemplateDownload}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-lg transition-colors'
              >
                <Download className='w-5 h-5 mr-2' />
                템플릿 다운로드
              </Button>
            </div>

            {/* 2. Excel 업로드 섹션 */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
              <div className='flex items-center gap-4 mb-4'>
                <Upload className='w-8 h-8 text-green-600' />
                <h2 className='text-xl font-semibold text-gray-900'>Excel 업로드</h2>
              </div>
              <p className='text-gray-600 mb-6'>템플릿 형식에 맞는 Excel 파일을 업로드하면 데이터를 확인하고 편집할 수 있습니다</p>
              
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
                        {isInputUploading ? '업로드 중...' : '업로드'}
                      </Button>
                      <Button onClick={() => setInputFile(null)} variant='ghost' className='text-gray-600 hover:bg-gray-100 px-6 py-3 text-lg rounded-lg transition-colors'>
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-6 mb-8'>
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
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 text-xl'>✅</span>
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
            )}

            {/* 데이터가 없을 때 안내 */}
            {!inputData && (
              <div className='text-center py-12 text-gray-500'>
                <FileText className='mx-auto h-12 w-12 mb-4' />
                <p>Excel 파일을 업로드하면 데이터가 여기에 표시됩니다</p>
              </div>
            )}

            {/* 데이터 테이블 표시 */}
            {renderDataTable()}


          </div>
        </div>
      </div>
    </div>
  );
}
