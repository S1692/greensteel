import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Eye } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface ProcessModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Process {
  id: number;
  process_name: string;
  start_period?: string;
  end_period?: string;
  created_at?: string;
  updated_at?: string;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({ onClose, onSuccess }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    process_name: '',
    start_period: '',
    end_period: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.process.list);
      setProcesses(response.data || []);
    } catch (error) {
      console.error('공정 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(apiEndpoints.cbam.process.update(editingId), formData);
      } else {
        await axiosClient.post(apiEndpoints.cbam.process.create, formData);
      }
      setFormData({ process_name: '', process_code: '', description: '', process_type: '' });
      setEditingId(null);
      fetchProcesses();
      onSuccess();
    } catch (error) {
      console.error('공정 저장 실패:', error);
    }
  };

  const handleEdit = (process: Process) => {
    setFormData({
      process_name: process.process_name,
      start_period: process.start_period || '',
      end_period: process.end_period || ''
    });
    setEditingId(process.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 공정을 삭제하시겠습니까?')) {
      try {
        await axiosClient.delete(apiEndpoints.cbam.process.delete(id));
        fetchProcesses();
        onSuccess();
      } catch (error) {
        console.error('공정 삭제 실패:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ process_name: '', start_period: '', end_period: '' });
    setEditingId(null);
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">공정 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 공정 추가/수정 폼 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingId ? '공정 수정' : '새 공정 추가'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="공정명"
                value={formData.process_name}
                onChange={(e) => setFormData(prev => ({ ...prev, process_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="date"
                placeholder="시작일"
                value={formData.start_period}
                onChange={(e) => setFormData(prev => ({ ...prev, start_period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                placeholder="종료일"
                value={formData.end_period}
                onChange={(e) => setFormData(prev => ({ ...prev, end_period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="md:col-span-2 flex space-x-2">
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

          {/* 공정 목록 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">공정 목록</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">로딩 중...</div>
              ) : processes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">등록된 공정이 없습니다.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">공정명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">시작일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">종료일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processes.map((process) => (
                      <tr key={process.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{process.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{process.process_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{process.start_period || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{process.end_period || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {process.created_at ? new Date(process.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEdit(process)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(process.id)}
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
