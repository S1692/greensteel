import React from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { CBAMStatsGrid } from '../molecules/CBAMStatsGrid';
import { useInputData } from '@/hooks/useInputData';

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
  const { data: inputData, loading, error, refetch } = useInputData();

  return (
    <div className="space-y-6">
      <CBAMStatsGrid
        installs={installs}
        products={products}
        processes={processes}
        mappings={mappings}
      />

      {/* 투입물 데이터 테이블 */}
      <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg">
        <div className="px-6 py-4 border-b border-ecotrace-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-ecotrace-text">투입물 데이터</h3>
              <p className="text-sm text-ecotrace-textSecondary mt-1">실적정보(투입물) 데이터 현황</p>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-ecotrace-textSecondary">
              데이터를 불러오는 중...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-ecotrace-border">
              <thead className="bg-ecotrace-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">로트번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">생산품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">생산수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">투입일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">공정</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">투입물명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">단위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-ecotrace-surface divide-y divide-ecotrace-border">
                {inputData.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-ecotrace-secondary/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.로트번호}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.생산품명}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.생산수량}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-textSecondary">
                      {item.투입일 ? new Date(item.투입일).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.공정}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.투입물명}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{item.수량}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-textSecondary">{item.단위}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {inputData.length > 10 && (
            <div className="px-6 py-3 border-t border-ecotrace-border text-center">
              <span className="text-sm text-ecotrace-textSecondary">
                총 {inputData.length}개 중 최근 10개 표시
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg">
        <div className="px-6 py-4 border-b border-ecotrace-border">
          <h3 className="text-lg font-medium text-ecotrace-text">최근 활동</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-ecotrace-textSecondary">새로운 사업장이 등록되었습니다.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-ecotrace-textSecondary">제품 매핑이 업데이트되었습니다.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-ecotrace-textSecondary">공정 데이터가 수정되었습니다.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg">
        <div className="px-6 py-4 border-b border-ecotrace-border">
          <h3 className="text-lg font-medium text-ecotrace-text">빠른 액션</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onShowInstallModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-ecotrace-border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-ecotrace-textSecondary mr-2" />
              <span className="text-sm font-medium text-ecotrace-textSecondary">사업장 추가</span>
            </button>
            <button
              onClick={onShowProductModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-ecotrace-border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-ecotrace-textSecondary mr-2" />
              <span className="text-sm font-medium text-ecotrace-textSecondary">제품 추가</span>
            </button>
            <button
              onClick={onShowProcessModal}
              className="flex items-center justify-center p-4 border-2 border-dashed border-ecotrace-border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-ecotrace-textSecondary mr-2" />
              <span className="text-sm font-medium text-ecotrace-textSecondary">공정 추가</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
