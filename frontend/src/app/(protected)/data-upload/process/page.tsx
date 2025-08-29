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

// 타입 정의
interface DataPreview {
  filename: string;
  fileSize: string;
  data: any[];
  columns: string[];
}

interface EditableRow {
  id: string;
  originalData: any;
  modifiedData: any;
  isEditing: boolean;
  editReason?: string;
  isNewlyAdded?: boolean;
}

const ProcessDataPage: React.FC = () => {
  // 상태 관리
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [editableInputRows, setEditableInputRows] = useState<EditableRow[]>([]);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editReasons, setEditReasons] = useState<{ [key: string]: string }>({});
  const inputFileRef = useRef<HTMLInputElement>(null);

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

      // 데이터 읽기 (첫 번째 행 제외)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: columns,
        range: 1,
        defval: ''
      });

      // 편집 가능한 행 데이터 생성
      const editableRows: EditableRow[] = jsonData.map((row: any, index) => ({
        id: `process-${index}`,
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
    setDbSaveStatus(null);
    setError(null);

    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/save-process-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: inputData.filename,
          data: inputData.data,
          columns: inputData.columns
        }),
      });

      if (!response.ok) {
        throw new Error(`데이터베이스 저장 실패: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success) {
        setDbSaveStatus({ success: true, message: '데이터베이스에 성공적으로 저장되었습니다.' });
        console.log('데이터베이스 저장 성공:', responseData);
      } else {
        throw new Error(responseData.message || '데이터베이스 저장 실패');
      }

    } catch (err) {
      console.error('데이터베이스 저장 오류:', err);
      setError(`데이터베이스 저장 중 오류가 발생했습니다: ${err}`);
      setDbSaveStatus({ success: false, message: `데이터베이스 저장 실패: ${err}` });
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

  // 행 편집 토글
  const toggleRowEdit = (rowId: string) => {
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

    const reason = editReasons[rowId] || '';
    if (!reason.trim()) {
      setError('수정 사유를 입력해주세요.');
      return;
    }

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

      // 수정 사유 초기화
      setEditReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[rowId];
        return newReasons;
      });

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

          {/* 3. 데이터 미리보기 및 편집 */}
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
                              <Input
                                type='text'
                                value={row.modifiedData[column] || ''}
                                onChange={(e) => handleInputChange(row.id, column, e.target.value)}
                                className='w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary/50'
                              />
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
                            <Button
                              onClick={() => toggleRowEdit(row.id)}
                              className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs'
                            >
                              <Edit3 className='w-3 h-3 mr-1' />
                              편집
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      dbSaveStatus.success 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {dbSaveStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* 수정 사유 입력 */}
              {editableInputRows.some(row => row.isEditing) && (
                <div className='mt-4 p-4 bg-white/5 rounded-lg'>
                  <h4 className='text-sm font-medium text-white mb-2'>수정 사유 입력</h4>
                  <div className='flex gap-4'>
                    {editableInputRows
                      .filter(row => row.isEditing)
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
                            placeholder='수정 사유를 입력하세요'
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. 오류 메시지 */}
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
