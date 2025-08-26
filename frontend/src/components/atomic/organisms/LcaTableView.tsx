'use client';

import React from 'react';
import { useFetchTable } from '@/hooks/useFetchTable';
import { DataTable } from '@/components/atomic/atoms';

interface LcaTableViewProps {
  endpoint: string;
}

const LcaTableView: React.FC<LcaTableViewProps> = ({ endpoint }) => {
  const { data, status, error, refetch } = useFetchTable(endpoint);

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success' && data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-sm text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">데이터가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            현재 선택된 탭에 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  // 첫 번째 행의 키에서 컬럼 추론
  const columns = data.length > 0 ? Object.keys(data[0]).map(key => ({
    key,
    label: key,
    align: 'left' as const,
  })) : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          데이터 테이블 ({data.length}개 행, {columns.length}개 컬럼)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={data}
          className="min-w-full"
        />
      </div>
    </div>
  );
};

export default LcaTableView;
