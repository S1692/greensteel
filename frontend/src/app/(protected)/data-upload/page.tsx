'use client';

import { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';

const DataUploadPage: React.FC = () => {
  const [message] = useState('데이터 업로드 페이지');

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-gray-900'>데이터 업로드</h1>
          <p className='text-gray-600'>
            Input과 Output 데이터를 순차적으로 업로드하여 데이터를 수집하고 처리합니다
          </p>
        </div>
        
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <p className='text-center text-gray-600'>{message}</p>
        </div>
      </div>
    </CommonShell>
  );
};

export default DataUploadPage;
