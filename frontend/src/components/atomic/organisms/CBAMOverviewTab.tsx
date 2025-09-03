import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CBAMStatsGrid } from '../molecules/CBAMStatsGrid';
import { useInputData } from '@/hooks/useInputData';

interface CBAMOverviewTabProps {
  installs: any[];
  products: any[];
  processes: any[];
  mappings: any[];
}

export const CBAMOverviewTab: React.FC<CBAMOverviewTabProps> = ({
  installs,
  products,
  processes,
  mappings
}) => {
  const { data: inputData, loading, error, totalCount, refetch } = useInputData();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 페이지당 20개씩 표시

  // 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = inputData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
              <p className="text-sm text-ecotrace-textSecondary mt-1">
                실적정보(투입물) 데이터 현황 - 총 {totalCount}개
              </p>
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
            <>
              <table className="min-w-full divide-y divide-ecotrace-border">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 시작일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산 종료일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                    <th className="px-4 py-3 text-sm text-ecotrace-textSecondary">단위</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">주문처명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">오더번호</th>
                  </tr>
                </thead>
                <tbody className="bg-ecotrace-surface divide-y divide-ecotrace-border">
                  {currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-ecotrace-secondary/30">
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.로트번호 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산품명 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산수량 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.투입일 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.종료일 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.공정 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.투입물명 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.수량 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.단위 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.주문처명 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ecotrace-text">{item.오더번호 || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-ecotrace-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-ecotrace-textSecondary">
                      {startIndex + 1}-{Math.min(endIndex, totalCount)} / {totalCount}개
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-ecotrace-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ecotrace-secondary/30 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-ecotrace-border hover:bg-ecotrace-secondary/30'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-ecotrace-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ecotrace-secondary/30 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 기존 모달 버튼들 */}
      {/* 이미지의 버튼들 제거됨 */}
    </div>
  );
};
