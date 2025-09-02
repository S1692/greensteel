import React from 'react';
import { Plus } from 'lucide-react';
import { CBAMStatsGrid } from '../molecules/CBAMStatsGrid';

interface CBAMOverviewTabProps {
  installs: any[];
  products: any[];
  processes: any[];
  mappings: any[];
  onShowInstallModal: () => void;
  onShowProductModal: () => void;
  onShowProcessModal: () => void;
}

export const CBAMOverviewTab: React.FC<CBAMOverviewTabProps> = ({
  installs,
  products,
  processes,
  mappings,
  onShowInstallModal,
  onShowProductModal,
  onShowProcessModal
}) => {
  return (
    <div className="space-y-6">
      <CBAMStatsGrid
        installs={installs}
        products={products}
        processes={processes}
        mappings={mappings}
      />

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">새로운 사업장이 등록되었습니다.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">제품 매핑이 업데이트되었습니다.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">공정 데이터가 수정되었습니다.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">빠른 액션</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onShowInstallModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">사업장 추가</span>
            </button>
            <button
              onClick={onShowProductModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">제품 추가</span>
            </button>
            <button
              onClick={onShowProcessModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">공정 추가</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
