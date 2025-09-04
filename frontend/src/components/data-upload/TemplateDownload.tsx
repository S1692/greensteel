import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/atomic/atoms';

const TemplateDownload: React.FC = () => {
  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = '/templates/실적_데이터_인풋.xlsx';
    link.download = '실적_데이터_인풋.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
  );
};

export default TemplateDownload;
