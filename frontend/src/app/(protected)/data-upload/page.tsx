'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import CommonShell from '@/components/CommonShell';

interface UploadResponse {
  message: string;
  status: string;
  data: {
    filename: string;
    rows_count: number;
    columns: string[];
    shape: [number, number];
  };
}

const DataUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // 엑셀 파일 확장자 검증
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      // 엑셀 파일을 JSON으로 변환
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // JSON 데이터를 게이트웨이로 전송
      const response = await axios.post('http://localhost:8080/process-data', {
        filename: file.name,
        data: jsonData,
        rows_count: jsonData.length,
        columns: Object.keys(jsonData[0] || {}),
        shape: [jsonData.length, Object.keys(jsonData[0] || {}).length],
      });

      const result: UploadResponse = response.data;
      setUploadResult(result);

      // 성공 메시지 표시
      alert('서비스까지 전송 성공!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            '파일 업로드 중 오류가 발생했습니다'
        );
      } else {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      setFile(droppedFile);
      setError(null);
      setUploadResult(null);
    } else {
      setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-ecotrace-text'>
            데이터 업로드
          </h1>
          <p className='text-ecotrace-textSecondary'>
            엑셀 파일을 업로드하여 데이터를 수집하고 처리합니다
          </p>
        </div>

        {/* 파일 업로드 영역 */}
        <div className='bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6'>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xls'
              onChange={handleFileSelect}
              className='hidden'
            />

            {!file ? (
              <div>
                <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                <p className='text-lg text-gray-600 mb-2'>
                  파일을 여기에 드래그하거나 클릭하여 선택하세요
                </p>
                <p className='text-sm text-gray-500 mb-4'>
                  지원 형식: .xlsx, .xls
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'
                >
                  파일 선택
                </button>
              </div>
            ) : (
              <div>
                <FileSpreadsheet className='mx-auto h-12 w-12 text-green-500 mb-4' />
                <p className='text-lg text-gray-900 mb-2'>{file.name}</p>
                <p className='text-sm text-gray-500 mb-4'>
                  파일 크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className='space-x-3'>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className='bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className='inline h-4 w-4 mr-2 animate-spin' />
                        업로드 중...
                      </>
                    ) : (
                      '업로드'
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className='bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors'
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-800'>{error}</p>
            </div>
          </div>
        )}

        {/* 업로드 결과 */}
        {uploadResult && (
          <div className='bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6'>
            <div className='flex items-center mb-4'>
              <CheckCircle className='h-6 w-6 text-green-500 mr-2' />
              <h3 className='text-lg font-semibold text-ecotrace-text'>
                업로드 성공
              </h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-700 mb-2'>파일 정보</h4>
                <p className='text-sm text-gray-600'>
                  파일명: {uploadResult.data.filename}
                </p>
                <p className='text-sm text-gray-600'>
                  크기: {uploadResult.data.shape[0]}행 ×{' '}
                  {uploadResult.data.shape[1]}열
                </p>
              </div>

              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-700 mb-2'>데이터 요약</h4>
                <p className='text-sm text-gray-600'>
                  총 행 수: {uploadResult.data.rows_count}
                </p>
                <p className='text-sm text-gray-600'>
                  총 열 수: {uploadResult.data.columns.length}
                </p>
              </div>
            </div>

            <div className='mt-4'>
              <h4 className='font-medium text-gray-700 mb-2'>컬럼 목록</h4>
              <div className='flex flex-wrap gap-2'>
                {uploadResult.data.columns.map((column, index) => (
                  <span
                    key={index}
                    className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center'>
                <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
                <p className='text-green-800 font-medium'>
                  게이트웨이를 통해 datagather_service로 전송 성공!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 시스템 상태 정보 */}
        <div className='bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-ecotrace-text mb-4'>
            시스템 상태
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <h4 className='font-medium text-blue-900'>프론트엔드</h4>
              <p className='text-sm text-blue-700'>정상 작동</p>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <h4 className='font-medium text-green-900'>게이트웨이</h4>
              <p className='text-sm text-green-700'>포트 8080</p>
            </div>
            <div className='text-center p-4 bg-purple-50 rounded-lg'>
              <h4 className='font-medium text-purple-900'>
                DataGather Service
              </h4>
              <p className='text-sm text-purple-700'>포트 8083</p>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DataUploadPage;
