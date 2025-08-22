'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Table,
  Database,
  ArrowRight,
  FileText,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

interface DataPreview {
  data: any[];
  columns: string[];
  filename: string;
  fileSize: string;
}

const DataUploadPage: React.FC = () => {
  // Input 데이터 관련 상태
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<DataPreview | null>(null);
  const [isInputUploading, setIsInputUploading] = useState(false);
  const [inputUploadResult, setInputUploadResult] = useState<UploadResponse | null>(null);
  
  // Output 데이터 관련 상태
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [outputData, setOutputData] = useState<DataPreview | null>(null);
  const [isOutputUploading, setIsOutputUploading] = useState(false);
  const [outputUploadResult, setOutputUploadResult] = useState<UploadResponse | null>(null);
  
  // 공통 상태
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'output'>('input');
  const inputFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);

  // Input 파일 선택
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
      setInputUploadResult(null);
      setInputData(null);
    }
  };

  // Output 파일 선택
  const handleOutputFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
        setOutputFile(null);
        return;
      }

      setOutputFile(selectedFile);
      setError(null);
      setOutputUploadResult(null);
      setOutputData(null);
    }
  };

  // Input 데이터 업로드
  const handleInputUpload = async () => {
    if (!inputFile) return;

    setIsInputUploading(true);
    setError(null);
    setInputUploadResult(null);

    try {
      // 엑셀 파일을 JSON으로 변환
      const arrayBuffer = await inputFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Input 데이터 미리보기 설정
      setInputData({
        data: jsonData,
        columns: Object.keys(jsonData[0] || {}),
        filename: inputFile.name,
        fileSize: (inputFile.size / 1024 / 1024).toFixed(2)
      });

      // 게이트웨이로 Input 데이터 전송
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway-production-da31.up.railway.app';
      const response = await axios.post(`${gatewayUrl}/input-data`, {
        filename: inputFile.name,
        data: jsonData,
        rows_count: jsonData.length,
        columns: Object.keys(jsonData[0] || {}),
        shape: [jsonData.length, Object.keys(jsonData[0] || {}).length],
        data_type: 'input'
      });

      const result: UploadResponse = response.data;
      setInputUploadResult(result);
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            'Input 파일 업로드 중 오류가 발생했습니다'
        );
      } else {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      }
    } finally {
      setIsInputUploading(false);
    }
  };

  // Output 데이터 업로드
  const handleOutputUpload = async () => {
    if (!outputFile) return;

    setIsOutputUploading(true);
    setError(null);
    setOutputUploadResult(null);

    try {
      // 엑셀 파일을 JSON으로 변환
      const arrayBuffer = await outputFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Output 데이터 미리보기 설정
      setOutputData({
        data: jsonData,
        columns: Object.keys(jsonData[0] || {}),
        filename: outputFile.name,
        fileSize: (outputFile.size / 1024 / 1024).toFixed(2)
      });

      // 게이트웨이로 Output 데이터 전송
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway-production-da31.up.railway.app';
      const response = await axios.post(`${gatewayUrl}/output-data`, {
        filename: outputFile.name,
        data: jsonData,
        rows_count: jsonData.length,
        columns: Object.keys(jsonData[0] || {}),
        shape: [jsonData.length, Object.keys(jsonData[0] || {}).length],
        data_type: 'output'
      });

      const result: UploadResponse = response.data;
      setOutputUploadResult(result);
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            'Output 파일 업로드 중 오류가 발생했습니다'
        );
      } else {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      }
    } finally {
      setIsOutputUploading(false);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, type: 'input' | 'output') => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      if (type === 'input') {
        setInputFile(droppedFile);
        setError(null);
        setInputUploadResult(null);
        setInputData(null);
      } else {
        setOutputFile(droppedFile);
        setError(null);
        setOutputUploadResult(null);
        setOutputData(null);
      }
    } else {
      setError('엑셀 파일만 업로드 가능합니다 (.xlsx, .xls)');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 폼 리셋
  const resetForm = () => {
    setInputFile(null);
    setOutputFile(null);
    setInputData(null);
    setOutputData(null);
    setError(null);
    setInputUploadResult(null);
    setOutputUploadResult(null);
    setCurrentStep('input');
    if (inputFileRef.current) inputFileRef.current.value = '';
    if (outputFileRef.current) outputFileRef.current.value = '';
  };

  // Input 단계로 돌아가기
  const goBackToInput = () => {
    setCurrentStep('input');
    setOutputFile(null);
    setOutputData(null);
    setOutputUploadResult(null);
  };

  // CBAM 페이지로 이동
  const goToCBAM = () => {
    window.location.href = '/cbam';
  };

  // Output 단계로 이동
  const goToOutput = () => {
    setCurrentStep('output');
  };

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-gray-900'>데이터 업로드</h1>
          <p className='text-gray-600'>
            Input과 Output 데이터를 순차적으로 업로드하여 데이터를 수집하고 처리합니다
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className='flex items-center justify-center space-x-4'>
          <div className={`flex items-center space-x-2 ${currentStep === 'input' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className='font-medium'>Input 데이터</span>
          </div>
          
          <ArrowRight className='w-6 h-6 text-gray-400' />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'output' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'output' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className='font-medium'>Output 데이터</span>
          </div>
        </div>

        {/* Input 데이터 업로드 섹션 */}
        {currentStep === 'input' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <FileText className='h-6 w-6 text-blue-600' />
                <h2 className='text-xl font-semibold text-gray-900'>Input 데이터 업로드</h2>
              </div>
              
              <p className='text-gray-600 mb-6'>
                먼저 Input 데이터를 업로드해주세요. Input 데이터는 시스템에서 처리할 원본 데이터입니다.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  inputFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={(e) => handleDrop(e, 'input')}
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
                    <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <p className='text-lg text-gray-600 mb-2'>
                      Input 데이터 파일을 여기에 드래그하거나 클릭하여 선택하세요
                    </p>
                    <p className='text-sm text-gray-500 mb-4'>지원 형식: .xlsx, .xls</p>
                    <Button
                      onClick={() => inputFileRef.current?.click()}
                      variant='outline'
                    >
                      파일 선택
                    </Button>
                  </div>
                ) : (
                  <div>
                    <FileSpreadsheet className='mx-auto h-12 w-12 text-green-500 mb-4' />
                    <p className='text-lg text-gray-900 mb-2'>{inputFile.name}</p>
                    <p className='text-sm text-gray-500 mb-4'>
                      파일 크기: {(inputFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className='space-x-3'>
                      <Button
                        onClick={handleInputUpload}
                        disabled={isInputUploading}
                        className='disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isInputUploading ? (
                          <>
                            <Loader2 className='inline h-4 w-4 mr-2 animate-spin' />
                            업로드 중...
                          </>
                        ) : (
                          'Input 데이터 업로드'
                        )}
                      </Button>
                      <Button onClick={resetForm} variant='ghost'>
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input 데이터 미리보기 */}
            {inputData && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <Table className='h-5 w-5 text-blue-600' />
                  <h3 className='text-lg font-semibold text-gray-900'>Input 데이터 미리보기</h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div className='bg-blue-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-blue-900'>파일명</p>
                    <p className='text-sm text-blue-700'>{inputData.filename}</p>
                  </div>
                  <div className='bg-blue-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-blue-900'>크기</p>
                    <p className='text-sm text-blue-700'>{inputData.fileSize} MB</p>
                  </div>
                  <div className='bg-blue-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-blue-900'>데이터</p>
                    <p className='text-sm text-blue-700'>{inputData.data.length}행 × {inputData.columns.length}열</p>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full border border-gray-200'>
                    <thead>
                      <tr className='bg-gray-50'>
                        {inputData.columns.map((column, index) => (
                          <th
                            key={index}
                            className='border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700'
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inputData.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className='hover:bg-gray-50'>
                          {inputData.columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className='border border-gray-200 px-3 py-2 text-sm text-gray-900'
                            >
                              {String(row[column] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Input 업로드 결과 및 진행 버튼 */}
            {inputUploadResult && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center mb-4'>
                  <CheckCircle className='h-6 w-6 text-green-500 mr-2' />
                  <h3 className='text-lg font-semibold text-gray-900'>Input 데이터 업로드 성공</h3>
                </div>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                  <div className='flex items-center'>
                    <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
                    <p className='text-green-800 font-medium'>
                      Input 데이터가 성공적으로 업로드되었습니다! 다음 단계를 선택해주세요.
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium text-gray-700 mb-2'>파일 정보</h4>
                    <p className='text-sm text-gray-600'>
                      파일명: {inputUploadResult.data.filename}
                    </p>
                    <p className='text-sm text-gray-600'>
                      크기: {inputUploadResult.data.shape[0]}행 × {inputUploadResult.data.shape[1]}열
                    </p>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium text-gray-700 mb-2'>데이터 요약</h4>
                    <p className='text-sm text-gray-600'>
                      총 행 수: {inputUploadResult.data.rows_count}
                    </p>
                    <p className='text-sm text-gray-600'>
                      총 열 수: {inputUploadResult.data.columns.length}
                    </p>
                  </div>
                </div>

                {/* 진행 버튼들 */}
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button 
                    onClick={goToOutput} 
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    <ArrowRight className='w-4 h-4 mr-2' />
                    Output 데이터 업로드로 진행
                  </Button>
                  
                  <Button 
                    onClick={goToCBAM} 
                    variant='outline'
                    className='flex-1 border-blue-600 text-blue-600 hover:bg-blue-50'
                  >
                    <ExternalLink className='w-4 h-4 mr-2' />
                    CBAM 페이지로 이동
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Output 데이터 업로드 섹션 */}
        {currentStep === 'output' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <BarChart3 className='h-6 w-6 text-green-600' />
                <h2 className='text-xl font-semibold text-gray-900'>Output 데이터 업로드</h2>
              </div>
              
              <p className='text-gray-600 mb-6'>
                이제 Output 데이터를 업로드해주세요. Output 데이터는 Input 데이터를 처리한 결과 데이터입니다.
              </p>

              <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Input 데이터:</strong> {inputData?.filename} ({inputData?.data.length}행 × {inputData?.columns.length}열)
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  outputFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={(e) => handleDrop(e, 'output')}
                onDragOver={handleDragOver}
              >
                <input
                  ref={outputFileRef}
                  type='file'
                  accept='.xlsx,.xls'
                  onChange={handleOutputFileSelect}
                  className='hidden'
                />

                {!outputFile ? (
                  <div>
                    <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <p className='text-lg text-gray-600 mb-2'>
                      Output 데이터 파일을 여기에 드래그하거나 클릭하여 선택하세요
                    </p>
                    <p className='text-sm text-gray-500 mb-4'>지원 형식: .xlsx, .xls</p>
                    <Button
                      onClick={() => outputFileRef.current?.click()}
                      variant='outline'
                    >
                      파일 선택
                    </Button>
                  </div>
                ) : (
                  <div>
                    <FileSpreadsheet className='mx-auto h-12 w-12 text-green-500 mb-4' />
                    <p className='text-lg text-gray-900 mb-2'>{outputFile.name}</p>
                    <p className='text-sm text-gray-500 mb-4'>
                      파일 크기: {(outputFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className='space-x-3'>
                      <Button
                        onClick={handleOutputUpload}
                        disabled={isOutputUploading}
                        className='disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isOutputUploading ? (
                          <>
                            <Loader2 className='inline h-4 w-4 mr-2 animate-spin' />
                            업로드 중...
                          </>
                        ) : (
                          'Output 데이터 업로드'
                        )}
                      </Button>
                      <Button onClick={goBackToInput} variant='ghost'>
                        Input으로 돌아가기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Output 데이터 미리보기 */}
            {outputData && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <Table className='h-5 w-5 text-green-600' />
                  <h3 className='text-lg font-semibold text-gray-900'>Output 데이터 미리보기</h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div className='bg-green-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-green-900'>파일명</p>
                    <p className='text-sm text-green-700'>{outputData.filename}</p>
                  </div>
                  <div className='bg-green-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-green-900'>크기</p>
                    <p className='text-sm text-green-700'>{outputData.fileSize} MB</p>
                  </div>
                  <div className='bg-green-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-green-900'>데이터</p>
                    <p className='text-sm text-green-700'>{outputData.data.length}행 × {outputData.columns.length}열</p>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full border border-gray-200'>
                    <thead>
                      <tr className='bg-gray-50'>
                        {outputData.columns.map((column, index) => (
                          <th
                            key={index}
                            className='border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700'
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outputData.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className='hover:bg-gray-50'>
                          {outputData.columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className='border border-gray-200 px-3 py-2 text-sm text-gray-900'
                            >
                              {String(row[column] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Output 업로드 결과 */}
            {outputUploadResult && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center mb-4'>
                  <CheckCircle className='h-6 w-6 text-green-500 mr-2' />
                  <h3 className='text-lg font-semibold text-gray-900'>Output 데이터 업로드 성공</h3>
                </div>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <div className='flex items-center'>
                    <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
                    <p className='text-green-800 font-medium'>
                      Output 데이터가 성공적으로 업로드되었습니다!
                    </p>
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium text-gray-700 mb-2'>Input 데이터</h4>
                    <p className='text-sm text-gray-600'>
                      파일명: {inputData?.filename}
                    </p>
                    <p className='text-sm text-gray-600'>
                      크기: {inputData?.data.length}행 × {inputData?.columns.length}열
                    </p>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium text-gray-700 mb-2'>Output 데이터</h4>
                    <p className='text-sm text-gray-600'>
                      파일명: {outputData?.filename}
                    </p>
                    <p className='text-sm text-gray-600'>
                      크기: {outputData?.data.length}행 × {outputData?.columns.length}열
                    </p>
                  </div>
                </div>

                <div className='mt-6'>
                  <Button onClick={resetForm} className='w-full'>
                    새로운 데이터 업로드 시작
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-800'>{error}</p>
            </div>
          </div>
        )}

        {/* 시스템 상태 정보 */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>시스템 상태</h3>
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
              <h4 className='font-medium text-purple-900'>DataGather Service</h4>
              <p className='text-sm text-purple-700'>포트 8083</p>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DataUploadPage;
