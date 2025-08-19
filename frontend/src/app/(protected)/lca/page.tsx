'use client';

import React from 'react';
import CommonShell from '@/components/CommonShell';

const LCAPage: React.FC = () => {
  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-ecotrace-text'>
            LCA (Life Cycle Assessment)
          </h1>
          <p className='text-ecotrace-textSecondary'>
            생명주기 평가 프로젝트를 관리하세요
          </p>
        </div>

        <div className='bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-ecotrace-text mb-4'>
            프로젝트 목록
          </h2>
          <p className='text-ecotrace-textSecondary'>
            아직 프로젝트가 없습니다. 새 프로젝트를 생성해보세요.
          </p>
        </div>
      </div>
    </CommonShell>
  );
};

export default LCAPage;
