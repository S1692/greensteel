import React from 'react';
import { CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { AIProcessedData } from '@/types/inputData';

interface AIProcessingResultProps {
  isAiProcessing: boolean;
  aiProcessedData: AIProcessedData | null;
}

const AIProcessingResult: React.FC<AIProcessingResultProps> = ({
  isAiProcessing,
  aiProcessedData
}) => {
  if (isAiProcessing) {
    return (
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
    );
  }

  if (!aiProcessedData) {
    return (
      <div className='stitch-card p-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
            <Brain className='w-5 h-5 text-gray-600' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>AI 처리 결과</h3>
            <p className='text-sm text-white/60'>파일을 업로드하고 AI 처리를 실행하면 결과가 표시됩니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stitch-card p-6 ${aiProcessedData.status === 'failed' ? 'bg-yellow-500/10 border border-yellow-500/20' : ''}`}>
      <div className='flex items-center gap-3 mb-4'>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          aiProcessedData.status === 'failed' 
            ? 'bg-yellow-100' 
            : 'bg-green-100'
        }`}>
          {aiProcessedData.status === 'failed' ? (
            <AlertCircle className='w-5 h-5 text-yellow-600' />
          ) : (
            <CheckCircle className='w-5 h-5 text-green-600' />
          )}
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            aiProcessedData.status === 'failed' ? 'text-yellow-400' : 'text-white'
          }`}>
            {aiProcessedData.status === 'failed' ? 'AI 처리 실패' : 'AI 처리 완료'}
          </h3>
          <p className={`text-sm ${
            aiProcessedData.status === 'failed' ? 'text-yellow-300' : 'text-white/60'
          }`}>
            {aiProcessedData.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIProcessingResult;
