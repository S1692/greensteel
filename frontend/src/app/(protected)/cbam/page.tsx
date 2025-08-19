'use client';

import React from 'react';
import CommonShell from '@/components/CommonShell';

const CBAMPage: React.FC = () => {
  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-ecotrace-text'>
            CBAM (Carbon Border Adjustment Mechanism)
          </h1>
          <p className='text-ecotrace-textSecondary'>
            탄소 국경 조정 메커니즘 보고서를 관리하세요
          </p>
        </div>

        <div className='bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-ecotrace-text mb-4'>
            보고서 목록
          </h2>
          <p className='text-ecotrace-textSecondary'>
            아직 보고서가 없습니다. 새 보고서를 생성해보세요.
          </p>
        </div>
      </div>
    </CommonShell>
  );
};

export default CBAMPage;
