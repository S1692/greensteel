'use client';

import React, { useState, useRef } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import Link from 'next/link';

// 컴포넌트 imports
import TemplateDownload from '@/components/data-upload/TemplateDownload';
import FileUpload from '@/components/data-upload/FileUpload';
import DataPreviewTable from '@/components/data-upload/DataPreviewTable';
import InputFieldRenderer from '@/components/data-upload/InputFieldRenderer';
import AIProcessingResult from '@/components/data-upload/AIProcessingResult';

// 타입 imports
import { DataRow, DataPreview, AIProcessedData, EditableRow } from '@/types/inputData';

// 유틸리티 imports
import {
  validateTemplateFormat,
  validateInput,
  isNewRow,
  convertExcelDate,
  handleNumericInput,
  validateDateComparison
} from '@/utils/inputDataUtils';

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

  // 파일 변경 핸들러
  const handleFileChange = () => {
    setInputFile(null);
    setInputData(null);
    setEditableInputRows([]);
    setAiProcessedData(null);
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
      const validation = validateTemplateFormat(columns);
      if (!validation.isValid) {
        setError(validation.errorMessage || '템플릿 형식이 올바르지 않습니다.');
        setIsInputUploading(false);
        return;
      }

      // 데이터 읽기 (첫 번째 행 제외)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: columns,
        range: 1,
        defval: '',
        raw: false, // 날짜를 문자열로 변환
        dateNF: 'yyyy-mm-dd' // 날짜 형식 지정
      });

      // AI추천답변 컬럼 추가 및 날짜 데이터 변환
      const dataWithAiColumn = jsonData.map((row: any) => {
        const processedRow = { ...row };
        
        // 투입일과 종료일을 날짜 형식으로 변환
        if (processedRow['투입일']) {
          processedRow['투입일'] = convertExcelDate(processedRow['투입일']);
        }
        if (processedRow['종료일']) {
          processedRow['종료일'] = convertExcelDate(processedRow['종료일']);
        }
        
        return {
          ...processedRow,
          'AI추천답변': ''
        };
      });

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
      handleAIProcessImmediate(inputData);

    } catch (err) {
      console.error('파일 업로드 오류:', err);
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsInputUploading(false);
    }
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
      
             const response = await fetch(`${gatewayUrl}/api/datagather/ai-process`, {
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
        // 백엔드에서 ai_results 배열로 반환되는 데이터 처리
        const aiResults = responseData.ai_results || [];
        const totalRows = aiResults.length;
        const processedRows = aiResults.length;
        
        console.log('AI 처리 완료:', {
          totalRows: totalRows,
          processedRows: processedRows,
          aiResults: aiResults,
          columns: inputData.columns
        });
        
        // AI 처리된 데이터로 상태 업데이트
        setAiProcessedData({
          status: 'completed',
          message: 'AI 처리가 완료되었습니다.',
          filename: inputData.filename,
          total_rows: totalRows,
          processed_rows: processedRows,
          data: aiResults,
          columns: inputData.columns
        });

        // AI 처리된 데이터가 있으면 기존 데이터에 AI 추천 답변 추가, 없으면 기존 엑셀 데이터 유지
        let updatedEditableRows: EditableRow[];
        
        if (aiResults.length > 0) {
          // AI 처리된 데이터가 있는 경우: 기존 편집 가능한 행 데이터에 AI 추천 답변만 추가
          updatedEditableRows = editableInputRows.map((existingRow, index) => {
            const aiResult = aiResults[index];
            if (aiResult) {
              return {
                ...existingRow,
                modifiedData: {
                  ...existingRow.modifiedData, // 기존 데이터 유지
                  'AI추천답변': aiResult['AI분류결과'] || '' // AI 분류 결과를 AI 추천 답변으로 사용
                }
              };
            }
            return existingRow;
          });
        } else {
          // AI 처리된 데이터가 없는 경우: 기존 엑셀 데이터를 그대로 유지
          updatedEditableRows = inputData.data.map((row: DataRow, index) => ({
            id: `input-${index}`,
            originalData: row,
            modifiedData: { ...row },
            isEditing: false,
            isNewlyAdded: false
          }));
        }

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
       
       // AI 처리 실패 시에도 기본 데이터로 테이블 표시
       console.log('AI 처리 실패, 기본 데이터로 테이블 표시');
       const fallbackData: DataRow[] = inputData.data.map((row: DataRow) => ({
         ...row,
         'AI추천답변': row['투입물명'] || '' // 원본 투입물명을 AI 추천 답변으로 사용
       }));
       
       // AI 처리된 데이터로 상태 업데이트 (실패 시에도)
       setAiProcessedData({
         status: 'failed',
         message: 'AI 처리 실패, 기본 데이터로 표시됩니다.',
         filename: inputData.filename,
         total_rows: fallbackData.length,
         processed_rows: fallbackData.length,
         data: fallbackData,
         columns: inputData.columns
       });

       // AI 처리 실패 시에도 기존 편집 가능한 행 데이터에 빈 AI 추천 답변 추가
       const updatedEditableRows: EditableRow[] = editableInputRows.map((existingRow) => ({
         ...existingRow,
         modifiedData: {
           ...existingRow.modifiedData,
           'AI추천답변': existingRow.modifiedData['투입물명'] || '' // 원본 투입물명을 AI 추천 답변으로 사용
         }
       }));

       setEditableInputRows(updatedEditableRows);
       console.log('AI 처리 실패 시 기본 데이터로 편집 가능한 행 데이터 업데이트됨');
       
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


  // 행 편집 토글 (Excel 데이터는 AI 추천 답변만, 새로 추가된 데이터는 모든 필드 편집 가능)
  const toggleRowEdit = (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;
    
    if (row.isNewlyAdded) {
      // 새로 추가된 데이터는 모든 필드 편집 가능
      console.log('편집 모드 활성화 - 새로 추가된 데이터, 모든 필드 편집 가능');
    } else {
      // Excel 데이터는 AI 추천 답변만 편집 가능
      console.log('편집 모드 활성화 - Excel 데이터, AI 추천 답변만 편집 가능');
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

  // 행 확인 (DB 저장 없이 편집 완료) - 이미지의 모든 칼럼 포함
  const confirmRow = async (rowId: string) => {
    const row = editableInputRows.find(r => r.id === rowId);
    if (!row) return;

    // 모든 데이터에 대해 필수 필드 검증
    const requiredFields = ['주문처명', '오더번호', '로트번호', '생산품명', '생산수량', '생산수량_단위', '투입일', '종료일', '공정', '투입물명', '수량', '투입물_단위'];
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
  const handleDateComparison = (rowId: string, column: string, value: string): void => {
    validateDateComparison(rowId, column, value, editableInputRows, updateRowError, clearRowError);
  };


  // 입력 필드 렌더링
  const renderInputField = (row: EditableRow, column: string) => {
    return (
      <InputFieldRenderer
        row={row}
        column={column}
        rowErrors={rowErrors}
        onInputChange={handleInputChange}
        onNumericInput={handleNumericInput}
        onDateComparison={handleDateComparison}
        validateInput={validateInput}
        isNewRow={isNewRow}
      />
    );
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

                           // 저장할 데이터 준비 - 사용자 직접 입력 데이터는 투입물명 직접 저장, Excel 데이터는 AI 추천 답변 적용
        const dataToSave = editableInputRows.map(row => {
          const unit = row.modifiedData['단위'] && row.modifiedData['단위'].trim() ? row.modifiedData['단위'] : 't';
          
          // 사용자가 직접 입력한 데이터인지 확인
          if (row.isNewlyAdded) {
            // 사용자 직접 입력 데이터: 투입물명을 직접 사용
            let 투입물명 = row.modifiedData['투입물명'] || '';
            
            // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
            if (투입물명.length > 100) {
              투입물명 = 투입물명.substring(0, 100);
              console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
            }
            
            return {
              '로트번호': row.modifiedData['로트번호'],
              '생산품명': row.modifiedData['생산품명'],
              '생산수량': parseFloat(row.modifiedData['생산수량']?.toString() || '0'),
              '투입일': convertExcelDate(row.modifiedData['투입일']),
              '종료일': convertExcelDate(row.modifiedData['종료일']),
              '공정': row.modifiedData['공정'],
              '투입물명': 투입물명,
              '수량': parseFloat(row.modifiedData['수량']?.toString() || '0'),
              '단위': unit
            };
          } else {
            // Excel 데이터: AI 추천 답변이 있으면 투입물명에 적용
            const aiRecommendation = row.modifiedData['AI추천답변'] || '';
            let 투입물명 = aiRecommendation || row.modifiedData['투입물명'] || '';
            
            // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
            if (투입물명.length > 100) {
              투입물명 = 투입물명.substring(0, 100);
              console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
            }
            
            // DB에 저장할 데이터에서 AI추천답변 제거하고 투입물명만 포함
            const { AI추천답변, ...dataForDB } = row.modifiedData;
            
            return {
              ...dataForDB,
              // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
              '투입물명': 투입물명,
              // 빈 단위 값은 't'로 설정
              '단위': unit,
              // Excel 날짜를 PostgreSQL date 형식으로 변환
              '투입일': convertExcelDate(row.modifiedData['투입일']),
              '종료일': convertExcelDate(row.modifiedData['종료일'])
            };
          }
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


       // 새로운 행 추가 핸들러
    const addNewRow = () => {
     const newRow: EditableRow = {
       id: `input-${editableInputRows.length}`,
       originalData: {
         '주문처명': '',
         '오더번호': '',
         '로트번호': '',
         '생산품명': '',
         '생산수량': '',
         '투입일': '',
         '종료일': '',
         '공정': '',
         '투입물명': '',
         '수량': '',
         '단위': ''
       },
       modifiedData: {
         '주문처명': '',
         '오더번호': '',
         '로트번호': '',
         '생산품명': '',
         '생산수량': '',
         '투입일': '',
         '종료일': '',
         '공정': '',
         '투입물명': '',
         '수량': '',
         '단위': ''
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

                           // 저장할 데이터 준비 - 사용자 직접 입력 데이터는 투입물명 직접 저장, Excel 데이터는 AI 추천 답변 적용
        const dataToSave = editableInputRows.map(row => {
          const unit = row.modifiedData['단위'] && row.modifiedData['단위'].trim() ? row.modifiedData['단위'] : 't';
          
          // 사용자가 직접 입력한 데이터인지 확인
          if (row.isNewlyAdded) {
            // 사용자 직접 입력 데이터: 투입물명을 직접 사용
            let 투입물명 = row.modifiedData['투입물명'] || '';
            
            // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
            if (투입물명.length > 100) {
              투입물명 = 투입물명.substring(0, 100);
              console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
            }
            
            // 데이터 타입 변환
            const 생산수량 = parseFloat(row.modifiedData['생산수량']?.toString() || '0');
            const 수량 = parseFloat(row.modifiedData['수량']?.toString() || '0');
            
            return {
              '로트번호': row.modifiedData['로트번호'],
              '생산품명': row.modifiedData['생산품명'],
              '생산수량': 생산수량,
              '투입일': convertExcelDate(row.modifiedData['투입일']),
              '종료일': convertExcelDate(row.modifiedData['종료일']),
              '공정': row.modifiedData['공정'],
              '투입물명': 투입물명,
              '수량': 수량,
              '단위': unit
            };
          } else {
            // Excel 데이터: AI 추천 답변이 있으면 투입물명에 적용
            const aiRecommendation = row.modifiedData['AI추천답변'] || '';
            let 투입물명 = aiRecommendation || row.modifiedData['투입물명'] || '';
            
            // 투입물명 길이 제한 (데이터베이스 컬럼 제한 고려)
            if (투입물명.length > 100) {
              투입물명 = 투입물명.substring(0, 100);
              console.warn(`투입물명이 너무 길어서 자동으로 잘렸습니다: ${투입물명}`);
            }
            
            // 데이터 타입 변환
            const 생산수량 = parseFloat(row.modifiedData['생산수량']?.toString() || '0');
            const 수량 = parseFloat(row.modifiedData['수량']?.toString() || '0');
            
            // DB에 저장할 데이터에서 AI추천답변 제거하고 투입물명만 포함
            const { AI추천답변, ...dataForDB } = row.modifiedData;
            
            return {
              ...dataForDB,
              // AI 추천 답변이 있으면 투입물명에 적용, 없으면 원본 투입물명 유지
              '투입물명': 투입물명,
              // 빈 단위 값은 't'로 설정
              '단위': unit,
              // 수량을 숫자로 변환
              '생산수량': 생산수량,
              '수량': 수량,
              // Excel 날짜를 PostgreSQL date 형식으로 변환
              '투입일': convertExcelDate(row.modifiedData['투입일']),
              '종료일': convertExcelDate(row.modifiedData['종료일'])
            };
          }
        });

              const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
        const response = await fetch(`${gatewayUrl}/save-input-data`, {
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
          <TemplateDownload />
          
          {/* 2. Excel 업로드 섹션 */}
          <FileUpload
            inputFile={inputFile}
            isInputUploading={isInputUploading}
            onFileSelect={handleInputFileSelect}
            onUpload={handleInputUpload}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />

          {/* 3. AI 처리 상태 표시 및 결과 */}
          <AIProcessingResult
            isAiProcessing={isAiProcessing}
            aiProcessedData={aiProcessedData}
          />

          {/* 4. 데이터 미리보기 및 편집 */}
          <DataPreviewTable
            inputData={inputData}
            editableInputRows={editableInputRows}
            editReasons={editReasons}
            rowErrors={rowErrors}
            onInputChange={handleInputChange}
            onToggleRowEdit={toggleRowEdit}
            onConfirmRow={confirmRow}
            onCancelRowEdit={cancelRowEdit}
            onDeleteRow={deleteRow}
            onAddNewRow={addNewRow}
            onEditReasonChange={(rowId, reason) => setEditReasons(prev => ({ ...prev, [rowId]: reason }))}
            onNumericInput={handleNumericInput}
            onDateComparison={handleDateComparison}
            renderInputField={renderInputField}
          />


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
