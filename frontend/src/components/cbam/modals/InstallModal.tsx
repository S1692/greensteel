import React, { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface InstallModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🚀 사업장 생성 요청 시작:', {
        url: apiEndpoints.cbam.install.create,
        data: formData
      });
      
      const response = await axiosClient.post(apiEndpoints.cbam.install.create, formData);
      
      console.log('✅ 사업장 생성 성공:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ 사업장 생성 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">새 사업장 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사업장명 *</label>
            <input
              type="text"
              required
                          value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>





          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
