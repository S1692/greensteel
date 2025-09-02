import React, { useState, useEffect } from 'react';
import { X, Play, Download, RefreshCw, BarChart3, FileText, Settings } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface CalculationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Calculation {
  id: number;
  calculation_name: string;
  reporting_year: number;
  total_emissions: number;
  direct_emissions: number;
  indirect_emissions: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at?: string;
  completed_at?: string;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({ onClose, onSuccess }) => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    calculation_name: '',
    reporting_year: new Date().getFullYear(),
    install_id: '',
    product_ids: [] as number[]
  });
  const [installs, setInstalls] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedInstall, setSelectedInstall] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const fetchCalculations = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.calculation.list);
      setCalculations(response.data || []);
    } catch (error) {
      console.error('계산 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalls = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.install.list);
      setInstalls(response.data || []);
    } catch (error) {
      console.error('사업장 목록 조회 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.product.list);
      setProducts(response.data || []);
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstall || selectedProducts.length === 0) {
      alert('사업장과 제품을 선택해주세요.');
      return;
    }

    try {
      const calculationData = {
        ...formData,
        install_id: selectedInstall.id,
        product_ids: selectedProducts.map(p => p.id)
      };

      await axiosClient.post(apiEndpoints.cbam.calculation.create, calculationData);
      setFormData({
        calculation_name: '',
        reporting_year: new Date().getFullYear(),
        install_id: '',
        product_ids: []
      });
      setSelectedInstall(null);
      setSelectedProducts([]);
      fetchCalculations();
      onSuccess();
    } catch (error) {
      console.error('계산 생성 실패:', error);
    }
  };

  const handleRunCalculation = async (id: number) => {
    try {
      await axiosClient.post(apiEndpoints.cbam.calculation.run(id));
      fetchCalculations();
    } catch (error) {
      console.error('계산 실행 실패:', error);
    }
  };

  const handleExportReport = async (id: number) => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.calculation.export(id), {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cbam_report_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('보고서 내보내기 실패:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '대기중' },
      running: { color: 'bg-blue-100 text-blue-800', text: '계산중' },
      completed: { color: 'bg-green-100 text-green-800', text: '완료' },
      failed: { color: 'bg-red-100 text-red-800', text: '실패' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    fetchCalculations();
    fetchInstalls();
    fetchProducts();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">CBAM 계산 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 계산 생성 폼 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">새 계산 생성</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="계산명"
                  value={formData.calculation_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, calculation_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="보고 연도"
                  value={formData.reporting_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporting_year: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사업장 선택</label>
                <select
                  value={selectedInstall?.id || ''}
                  onChange={(e) => {
                    const install = installs.find(i => i.id === parseInt(e.target.value));
                    setSelectedInstall(install);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">사업장을 선택하세요</option>
                  {installs.map((install) => (
                    <option key={install.id} value={install.id}>
                      {install.install_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제품 선택 (다중 선택 가능)</label>
                <select
                  multiple
                  value={selectedProducts.map(p => p.id.toString())}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => 
                      products.find(p => p.id === parseInt(option.value))
                    ).filter(Boolean);
                    setSelectedProducts(selectedOptions);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  required
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} ({product.product_code})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Ctrl/Cmd + 클릭으로 여러 제품을 선택할 수 있습니다.
                </p>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                계산 생성
              </button>
            </form>
          </div>

          {/* 계산 목록 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">계산 목록</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">로딩 중...</div>
              ) : calculations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">생성된 계산이 없습니다.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">계산명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">보고연도</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">총 배출량</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">직접 배출량</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">간접 배출량</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {calculations.map((calculation) => (
                      <tr key={calculation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{calculation.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{calculation.calculation_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{calculation.reporting_year}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {calculation.total_emissions?.toFixed(2) || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {calculation.direct_emissions?.toFixed(2) || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {calculation.indirect_emissions?.toFixed(2) || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {getStatusBadge(calculation.status)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {calculation.created_at ? new Date(calculation.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium space-x-2">
                          {calculation.status === 'pending' && (
                            <button
                              onClick={() => handleRunCalculation(calculation.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="계산 실행"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {calculation.status === 'completed' && (
                            <button
                              onClick={() => handleExportReport(calculation.id)}
                              className="text-green-600 hover:text-green-900"
                              title="보고서 내보내기"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => fetchCalculations()}
                            className="text-gray-600 hover:text-gray-900"
                            title="새로고침"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
