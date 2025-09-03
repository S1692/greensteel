import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Eye, Search, Upload, Download } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface MappingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Mapping {
  id: number;
  hscode: string;
  aggregoods_name?: string;
  aggregoods_engname?: string;
  cncode_total: string;
  goods_name?: string;
  goods_engname?: string;
}

export const MappingModal: React.FC<MappingModalProps> = ({ onClose, onSuccess }) => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hscode: '',
    aggregoods_name: '',
    aggregoods_engname: '',
    cncode_total: '',
    goods_name: '',
    goods_engname: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'hs' | 'cn' | 'goods'>('hs');

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.mapping.list);
      setMappings(response.data || []);
    } catch (error) {
      console.error('매핑 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(apiEndpoints.cbam.mapping.update(editingId), formData);
      } else {
        await axiosClient.post(apiEndpoints.cbam.mapping.create, formData);
      }
      setFormData({ 
        hscode: '', 
        aggregoods_name: '', 
        aggregoods_engname: '', 
        cncode_total: '', 
        goods_name: '', 
        goods_engname: '' 
      });
      setEditingId(null);
      fetchMappings();
      onSuccess();
    } catch (error) {
      console.error('매핑 저장 실패:', error);
    }
  };

  const handleEdit = (mapping: Mapping) => {
    setFormData({
      hscode: mapping.hscode,
      aggregoods_name: mapping.aggregoods_name || '',
      aggregoods_engname: mapping.aggregoods_engname || '',
      cncode_total: mapping.cncode_total,
      goods_name: mapping.goods_name || '',
      goods_engname: mapping.goods_engname || ''
    });
    setEditingId(mapping.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 매핑을 삭제하시겠습니까?')) {
      try {
        await axiosClient.delete(apiEndpoints.cbam.mapping.delete(id));
        fetchMappings();
        onSuccess();
      } catch (error) {
        console.error('매핑 삭제 실패:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ 
      hscode: '', 
      aggregoods_name: '', 
      aggregoods_engname: '', 
      cncode_total: '', 
      goods_name: '', 
      goods_engname: '' 
    });
    setEditingId(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      let response;
      switch (searchType) {
        case 'hs':
          response = await axiosClient.get(apiEndpoints.cbam.mapping.search.hs(searchTerm));
          break;
        case 'cn':
          response = await axiosClient.get(apiEndpoints.cbam.mapping.search.cn(searchTerm));
          break;
        case 'goods':
          response = await axiosClient.get(apiEndpoints.cbam.mapping.search.goods(searchTerm));
          break;
      }
      if (response?.data) {
        setMappings(response.data);
      }
    } catch (error) {
      console.error('매핑 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axiosClient.post(apiEndpoints.cbam.mapping.batch, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMappings();
      onSuccess();
    } catch (error) {
      console.error('배치 업로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">매핑 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 검색 및 배치 업로드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex space-x-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'hs' | 'cn' | 'goods')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hs">HS 코드</option>
                <option value="cn">CN 코드</option>
                <option value="goods">상품명</option>
              </select>
              <input
                type="text"
                placeholder="검색어 입력"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <label className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>배치 업로드</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleBatchUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => fetchMappings()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>전체 조회</span>
              </button>
            </div>
          </div>

          {/* 매핑 추가/수정 폼 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingId ? '매핑 수정' : '새 매핑 추가'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="HS 코드 (6자리)"
                value={formData.hscode}
                onChange={(e) => setFormData(prev => ({ ...prev, hscode: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
                required
              />
              <input
                type="text"
                placeholder="CN 코드 (8자리)"
                value={formData.cncode_total}
                onChange={(e) => setFormData(prev => ({ ...prev, cncode_total: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={8}
                required
              />
              <input
                type="text"
                placeholder="품목명"
                value={formData.goods_name}
                onChange={(e) => setFormData(prev => ({ ...prev, goods_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="품목영문명"
                value={formData.goods_engname}
                onChange={(e) => setFormData(prev => ({ ...prev, goods_engname: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="품목군명"
                value={formData.aggregoods_name}
                onChange={(e) => setFormData(prev => ({ ...prev, aggregoods_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="품목군영문명"
                value={formData.aggregoods_engname}
                onChange={(e) => setFormData(prev => ({ ...prev, aggregoods_engname: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="md:col-span-4 flex space-x-2">
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

          {/* 매핑 목록 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">매핑 목록</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">로딩 중...</div>
              ) : mappings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">등록된 매핑이 없습니다.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">HS 코드</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CN 코드</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">품목명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">품목군명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{mapping.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mapping.hscode}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mapping.cncode_total}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mapping.goods_name || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mapping.aggregoods_name || '-'}</td>
                        <td className="px-4 py-2 text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEdit(mapping)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(mapping.id)}
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
