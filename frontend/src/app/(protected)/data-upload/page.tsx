'use client';

import React from 'react';
import CommonShell from '@/components/CommonShell';

const DataUploadPage: React.FC = () => {
  return (
    <CommonShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-ecotrace-text">
            데이터 업로드
          </h1>
          <p className="text-ecotrace-textSecondary">
            엑셀 파일을 업로드하여 데이터를 분석하세요
          </p>
        </div>

        <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ecotrace-text mb-4">
            파일 업로드
          </h2>
          <p className="text-ecotrace-textSecondary">
            지원 형식: .xlsx, .xls, .csv
          </p>
        </div>
      </div>
    </CommonShell>
  );
};

export default DataUploadPage;
