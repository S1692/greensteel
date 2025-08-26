'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Settings } from 'lucide-react';
import { Node } from '@xyflow/react';

interface ProcessStepData extends Record<string, unknown> {
  name: string;
  type: 'input' | 'process' | 'output' | 'transport' | 'storage';
  description: string;
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'warning';
  carbonIntensity?: number;
  energyConsumption?: number;
  materialFlow?: number;
}

interface ProcessStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node<ProcessStepData> | null;
  onSave: (data: ProcessStepData) => void;
}

const ProcessStepModal: React.FC<ProcessStepModalProps> = ({
  isOpen,
  onClose,
  node,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProcessStepData>({
    name: '',
    type: 'process',
    description: '',
    parameters: {},
    status: 'active',
  });

  const [newParameterKey, setNewParameterKey] = useState('');
  const [newParameterValue, setNewParameterValue] = useState('');

  // 노드 데이터가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen && node) {
      setFormData(node.data);
    }
  }, [isOpen, node]);

  const handleInputChange = (field: keyof ProcessStepData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParameterChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value,
      },
    }));
  };

  const addParameter = () => {
    if (newParameterKey.trim() && newParameterValue.trim()) {
      handleParameterChange(newParameterKey.trim(), newParameterValue.trim());
      setNewParameterKey('');
      setNewParameterValue('');
    }
  };

  const removeParameter = (key: string) => {
    setFormData(prev => {
      const newParameters = { ...prev.parameters };
      delete newParameters[key];
      return {
        ...prev,
        parameters: newParameters,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'process',
      description: '',
      parameters: {},
      status: 'active',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              프로세스 단계 편집
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단계 이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 고로 공정"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단계 유형 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="input">📥 입력 (Input)</option>
                <option value="process">⚙️ 처리 (Process)</option>
                <option value="transport">🚚 운송 (Transport)</option>
                <option value="storage">📦 저장 (Storage)</option>
                <option value="output">📤 출력 (Output)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이 단계에 대한 상세 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">🟢 활성 (Active)</option>
              <option value="inactive">⚪ 비활성 (Inactive)</option>
              <option value="warning">🟡 경고 (Warning)</option>
              <option value="error">🔴 오류 (Error)</option>
            </select>
          </div>

          {/* 환경 영향 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏭 탄소 배출량 (tCO2/t)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.carbonIntensity || ''}
                onChange={(e) => handleInputChange('carbonIntensity', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚡ 에너지 소비량 (GJ/t)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.energyConsumption || ''}
                onChange={(e) => handleInputChange('energyConsumption', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 물질 흐름 (t/h)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.materialFlow || ''}
                onChange={(e) => handleInputChange('materialFlow', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* 파라미터 관리 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">파라미터</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newParameterKey}
                  onChange={(e) => setNewParameterKey(e.target.value)}
                  placeholder="파라미터 이름"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newParameterValue}
                  onChange={(e) => setNewParameterValue(e.target.value)}
                  placeholder="값"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addParameter}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 기존 파라미터 목록 */}
            <div className="space-y-2">
              {Object.entries(formData.parameters).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{key}:</span>
                    <span className="ml-2 text-gray-600">{String(value)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParameter(key)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {Object.keys(formData.parameters).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  파라미터가 없습니다. 위에서 추가해보세요.
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessStepModal;
