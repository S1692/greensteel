'use client';

import { useState, useRef } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Upload, FileText, Database, Brain, CheckCircle, AlertCircle, ArrowRight, Download } from 'lucide-react';

interface EditableRow {
  id: string;
  material: string;
  input_qty: number;
  output_qty: number;
  loss_rate: number;
  editReason?: string;
}

interface AIProcessedData {
  material: string;
  corrected_qty: number;
  confidence: number;
  suggestion: string;
}

const DataUploadPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<EditableRow[]>([]);
  const [outputData, setOutputData] = useState<EditableRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProcessedData, setAiProcessedData] = useState<AIProcessedData[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const inputFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, title: 'Input 데이터 업로드', description: 'Input 데이터 파일을 업로드합니다' },
    { id: 2, title: 'AI 처리', description: 'AI를 통해 데이터를 분석하고 보정합니다' },
    { id: 3, title: 'Output 데이터 업로드', description: 'Output 데이터 파일을 업로드합니다' },
    { id: 4, title: '데이터 검증', description: '업로드된 데이터를 검증합니다' }
  ];

  const handleFileUpload = (file: File, type: 'input' | 'output') => {
    if (type === 'input') {
      setInputFile(file);
      // 파일 내용을 파싱하여 데이터로 변환 (간단한 예시)
      const mockData: EditableRow[] = [
        { id: '1', material: '철광석', input_qty: 1000, output_qty: 0, loss_rate: 0 },
        { id: '2', material: '석탄', input_qty: 500, output_qty: 0, loss_rate: 0 },
        { id: '3', material: '석회석', input_qty: 300, output_qty: 0, loss_rate: 0 }
      ];
      setInputData(mockData);
    } else {
      setOutputFile(file);
      const mockData: EditableRow[] = [
        { id: '1', material: '철광석', input_qty: 0, output_qty: 950, loss_rate: 5 },
        { id: '2', material: '석탄', input_qty: 0, output_qty: 480, loss_rate: 4 },
        { id: '3', material: '석회석', input_qty: 0, output_qty: 285, loss_rate: 5 }
      ];
      setOutputData(mockData);
    }
    
    setToast({
      message: `${type === 'input' ? 'Input' : 'Output'} 파일이 성공적으로 업로드되었습니다!`,
      type: 'success'
    });
  };

  const handleAIProcess = async () => {
    setIsAiProcessing(true);
    
    try {
      // Gateway를 통해 AI 처리 요청
      const response = await fetch('/ai-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputData, outputData })
      });

      if (response.ok) {
        const result = await response.json();
        setAiProcessedData(result.processedData || []);
        setToast({
          message: 'AI 처리가 완료되었습니다!',
          type: 'success'
        });
        setCurrentStep(3);
      } else {
        throw new Error('AI 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 처리 오류:', error);
      setToast({
        message: 'AI 처리 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleInputUpload = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleOutputUpload = () => {
    if (outputFileRef.current) {
      outputFileRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'input' | 'output') => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white' 
              : 'border-gray-300 text-gray-500'
          }`}>
            {currentStep > step.id ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <span className="font-semibold">{step.id}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderInputUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Input 데이터 업로드</h2>
        <p className="text-gray-600">Input 데이터 파일을 업로드하여 AI 처리를 위한 데이터를 준비합니다</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
        <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">파일을 드래그하여 업로드하거나 클릭하여 선택하세요</h3>
        <p className="text-gray-600 mb-4">Excel, CSV 파일을 지원합니다</p>
        <button
          onClick={handleInputUpload}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          파일 선택
        </button>
        <input
          ref={inputFileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileChange(e, 'input')}
          className="hidden"
        />
      </div>

      {inputFile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">업로드된 파일</h3>
            <span className="text-sm text-gray-500">{inputFile.name}</span>
          </div>
          <button
            onClick={handleAIProcess}
            disabled={isAiProcessing}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isAiProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI 처리 중...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>AI 처리 시작</span>
              </>
            )}
          </button>
        </div>
      )}

      {inputData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Input 데이터 미리보기</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재료</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입력량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출력량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">손실률</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inputData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.material}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.input_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.output_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.loss_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderAIProcessing = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 데이터 처리</h2>
        <p className="text-gray-600">AI가 데이터를 분석하고 보정하여 정확성을 향상시킵니다</p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 text-center">
        <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 처리 중...</h3>
        <p className="text-gray-600 mb-4">데이터를 분석하고 보정하고 있습니다</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>

      {aiProcessedData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 처리 결과</h3>
          <div className="space-y-4">
            {aiProcessedData.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.material}</h4>
                    <p className="text-sm text-gray-600">보정된 수량: {item.corrected_qty}</p>
                    <p className="text-sm text-gray-600">신뢰도: {item.confidence}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderOutputUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Output 데이터 업로드</h2>
        <p className="text-gray-600">Output 데이터 파일을 업로드하여 데이터 검증을 진행합니다</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
        <Database className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Output 데이터 파일을 업로드하세요</h3>
        <p className="text-gray-600 mb-4">AI 처리된 데이터와 비교하여 검증합니다</p>
        <button
          onClick={handleOutputUpload}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
        >
          파일 선택
        </button>
        <input
          ref={outputFileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileChange(e, 'output')}
          className="hidden"
        />
      </div>

      {outputData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Output 데이터 미리보기</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재료</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입력량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출력량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">손실률</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outputData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.material}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.input_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.output_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.loss_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDataValidation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">데이터 검증 완료</h2>
        <p className="text-gray-600">업로드된 모든 데이터가 성공적으로 검증되었습니다</p>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 업로드 완료!</h3>
        <p className="text-gray-600 mb-4">모든 데이터가 성공적으로 처리되었습니다</p>
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-emerald-100 rounded-full px-4 py-2">
            <span className="text-emerald-800 font-medium">Input: {inputData.length}개</span>
          </div>
          <div className="bg-emerald-100 rounded-full px-4 py-2">
            <span className="text-emerald-800 font-medium">Output: {outputData.length}개</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">처리 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Input 파일</p>
            <p className="text-lg font-semibold text-blue-900">{inputFile?.name || '없음'}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">AI 처리</p>
            <p className="text-lg font-semibold text-purple-900">완료</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Database className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Output 파일</p>
            <p className="text-lg font-semibold text-green-900">{outputFile?.name || '없음'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderInputUpload();
      case 2:
        return renderAIProcessing();
      case 3:
        return renderOutputUpload();
      case 4:
        return renderDataValidation();
      default:
        return renderInputUpload();
    }
  };

  return (
    <CommonShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900">데이터 업로드</h1>
          <p className="text-gray-600">
            Input과 Output 데이터를 순차적으로 업로드하여 데이터를 수집하고 처리합니다
          </p>
        </div>

        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderCurrentStep()}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>다음</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </CommonShell>
  );
};

export default DataUploadPage;
