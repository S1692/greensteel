import React from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface CBAMInstallTabProps {
  installs: any[];
  onShowInstallModal: () => void;
}

export const CBAMInstallTab: React.FC<CBAMInstallTabProps> = ({
  installs,
  onShowInstallModal
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ecotrace-text">사업장 관리</h2>
        <button
          onClick={onShowInstallModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>새 사업장</span>
        </button>
      </div>

      <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ecotrace-border">
            <thead className="bg-ecotrace-secondary/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">사업장명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">보고연도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">생성일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-ecotrace-surface divide-y divide-ecotrace-border">
              {installs.map((install) => (
                <tr key={install.id} className="hover:bg-ecotrace-secondary/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{install.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{install.install_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-text">{install.reporting_year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ecotrace-textSecondary">
                    {install.created_at ? new Date(install.created_at).toLocaleDateString() : '-'}
                  </td>
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
        </div>
      </div>
    </div>
  );
};
