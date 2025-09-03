import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Eye } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface ProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id: number;
  install_id: number;
  product_name: string;
  product_category: string;
  prostart_period: string;
  proend_period: string;
  product_amount?: number;
  product_cncode?: string;
  goods_name?: string;
  aggrgoods_name?: string;

  product_sell?: number;
  product_eusell?: number;

  created_at?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({ onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    install_id: 1,
    product_name: '',
    product_category: '단순제품',
    prostart_period: '',
    proend_period: '',
    product_amount: 0,
    product_cncode: '',
    goods_name: '',
    aggrgoods_name: '',

    product_sell: 0,
    product_eusell: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.product.list);
      setProducts(response.data || []);
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(apiEndpoints.cbam.product.update(editingId), formData);
      } else {
        await axiosClient.post(apiEndpoints.cbam.product.create, formData);
      }
      setFormData({
        install_id: 1,
        product_name: '',
        product_category: '단순제품',
        prostart_period: '',
        proend_period: '',
        product_amount: 0,
        product_cncode: '',
        goods_name: '',
        aggrgoods_name: '',
        product_sell: 0,
        product_eusell: 0
      });
      setEditingId(null);
      fetchProducts();
      onSuccess();
    } catch (error) {
      console.error('제품 저장 실패:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      install_id: product.install_id,
      product_name: product.product_name,
      product_category: product.product_category,
      prostart_period: product.prostart_period,
      proend_period: product.proend_period,
      product_amount: product.product_amount || 0,
      product_cncode: product.product_cncode || '',
      goods_name: product.goods_name || '',
      aggrgoods_name: product.aggrgoods_name || '',
      product_sell: product.product_sell || 0,
      product_eusell: product.product_eusell || 0,

    });
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      try {
        await axiosClient.delete(apiEndpoints.cbam.product.delete(id));
        fetchProducts();
        onSuccess();
      } catch (error) {
        console.error('제품 삭제 실패:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      install_id: 1,
      product_name: '',
      product_category: '단순제품',
      prostart_period: '',
      proend_period: '',
      product_amount: 0,
      product_cncode: '',
      goods_name: '',
      aggrgoods_name: '',
      product_sell: 0,
      product_eusell: 0
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">제품 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 제품 추가/수정 폼 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingId ? '제품 수정' : '새 제품 추가'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="제품명"
                value={formData.product_name}
                onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <select
                value={formData.product_category}
                onChange={(e) => setFormData(prev => ({ ...prev, product_category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="단순제품">단순제품</option>
                <option value="복합제품">복합제품</option>
              </select>
              <input
                type="date"
                placeholder="시작일"
                value={formData.prostart_period}
                onChange={(e) => setFormData(prev => ({ ...prev, prostart_period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="date"
                placeholder="종료일"
                value={formData.proend_period}
                onChange={(e) => setFormData(prev => ({ ...prev, proend_period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="number"
                placeholder="제품 수량"
                value={formData.product_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, product_amount: parseFloat(e.target.value) || 0 }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="CN 코드"
                value={formData.product_cncode}
                onChange={(e) => setFormData(prev => ({ ...prev, product_cncode: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="md:col-span-3 flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 제품 목록 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">제품 목록</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">로딩 중...</div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center text-gray-500">등록된 제품이 없습니다.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">제품명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">시작일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">종료일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{product.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.product_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.product_category}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.prostart_period}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.proend_period}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.product_amount || 0}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
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
