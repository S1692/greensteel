'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Save, Trash2 } from 'lucide-react';
import { Node } from '@xyflow/react';

interface ProcessStepData extends Record<string, unknown> {
  name: string;
  type: 'input' | 'process' | 'output';
  description: string;
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
}

interface ProcessStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node<ProcessStepData> | null;
  onSave: (data: ProcessStepData) => void;
}

export default function ProcessStepModal({
  isOpen,
  onClose,
  node,
  onSave,
}: ProcessStepModalProps) {
  const [formData, setFormData] = useState<ProcessStepData>({
    name: '',
    type: 'process',
    description: '',
    parameters: {},
    status: 'active',
  });

  const [newParameterKey, setNewParameterKey] = useState('');
  const [newParameterValue, setNewParameterValue] = useState('');

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

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

  const handleParameterDelete = (key: string) => {
    setFormData(prev => {
      const newParameters = { ...prev.parameters };
      delete newParameters[key];
      return {
        ...prev,
        parameters: newParameters,
      };
    });
  };

  const addParameter = () => {
    if (newParameterKey.trim() && newParameterValue.trim()) {
      handleParameterChange(newParameterKey.trim(), newParameterValue.trim());
      setNewParameterKey('');
      setNewParameterValue('');
    }
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
    setNewParameterKey('');
    setNewParameterValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/20 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {node ? '프로세스 단계 편집' : '새 프로세스 단계'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              단계 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="단계 이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              단계 유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="input">입력</option>
              <option value="process">처리</option>
              <option value="output">출력</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="단계에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="error">오류</option>
            </select>
          </div>

          {/* 매개변수 관리 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              매개변수
            </label>
            
            {/* 기존 매개변수 표시 */}
            {Object.keys(formData.parameters).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.parameters).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                    <span className="text-white/80 text-sm flex-1">{key}</span>
                    <span className="text-white text-sm flex-1">{String(value)}</span>
                    <button
                      type="button"
                      onClick={() => handleParameterDelete(key)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 새 매개변수 추가 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newParameterKey}
                onChange={(e) => setNewParameterKey(e.target.value)}
                placeholder="키"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="text"
                value={newParameterValue}
                onChange={(e) => setNewParameterValue(e.target.value)}
                placeholder="값"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <Button
                type="button"
                onClick={addParameter}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2"
              >
                추가
              </Button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700"
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
