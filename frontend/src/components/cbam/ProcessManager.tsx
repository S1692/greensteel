'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  Settings,
} from 'lucide-react';
import ProcessStepModal from './ProcessStepModal';

// ============================================================================
// 🎯 CBAM 프로세스 타입 정의
// ============================================================================

interface ProcessStep {
  id: string;
  name: string;
  type: 'input' | 'process' | 'output';
  description: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
  status: 'active' | 'inactive' | 'error';
}

interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

// ============================================================================
// 🎯 CBAM 프로세스 매니저 컴포넌트
// ============================================================================

export default function ProcessManager() {
  const [flows, setFlows] = useState<ProcessFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [draggedStep, setDraggedStep] = useState<ProcessStep | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ============================================================================
  // 🎯 초기 데이터 로드
  // ============================================================================

  useEffect(() => {
    const savedFlows = localStorage.getItem('cbam-process-flows');
    if (savedFlows) {
      try {
        setFlows(JSON.parse(savedFlows));
      } catch (error) {
        // console.error('저장된 플로우 로드 실패:', error);
      }
    }
  }, []);

  // ============================================================================
  // 🎯 플로우 저장
  // ============================================================================

  const saveFlows = useCallback((newFlows: ProcessFlow[]) => {
    localStorage.setItem('cbam-process-flows', JSON.stringify(newFlows));
    setFlows(newFlows);
  }, []);

  // ============================================================================
  // 🎯 새 플로우 생성
  // ============================================================================

  const createNewFlow = useCallback(() => {
    const newFlow: ProcessFlow = {
      id: `flow-${Date.now()}`,
      name: '새 CBAM 프로세스',
      description: '새로 생성된 CBAM 프로세스 플로우',
      steps: [
        {
          id: 'step-1',
          name: '원료 입력',
          type: 'input',
          description: '철광석, 코크스 등 원료 투입',
          parameters: { material: 'iron_ore', quantity: 1000, unit: 'ton' },
          position: { x: 100, y: 100 },
          connections: [],
          status: 'active',
        },
        {
          id: 'step-2',
          name: '고로 공정',
          type: 'process',
          description: '철광석 환원 및 용융 공정',
          parameters: { temperature: 1500, pressure: 1.2, duration: 8 },
          position: { x: 300, y: 100 },
          connections: ['step-1'],
          status: 'active',
        },
        {
          id: 'step-3',
          name: '제강 공정',
          type: 'process',
          description: '탄소 함량 조절 및 정련',
          parameters: { carbon_content: 0.15, oxygen_blow: true, duration: 4 },
          position: { x: 500, y: 100 },
          connections: ['step-2'],
          status: 'active',
        },
        {
          id: 'step-4',
          name: '최종 제품',
          type: 'output',
          description: '철강 제품 (강판, 강재)',
          parameters: {
            product_type: 'steel_plate',
            quantity: 800,
            unit: 'ton',
          },
          position: { x: 700, y: 100 },
          connections: ['step-3'],
          status: 'active',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const updatedFlows = [...flows, newFlow];
    saveFlows(updatedFlows);
    setSelectedFlow(newFlow);
    setIsEditing(true);
  }, [flows, saveFlows]);

  // ============================================================================
  // 🎯 플로우 선택
  // ============================================================================

  const selectFlow = useCallback((flow: ProcessFlow) => {
    setSelectedFlow(flow);
    setIsEditing(false);
  }, []);

  // ============================================================================
  // 🎯 플로우 삭제
  // ============================================================================

  const deleteFlow = useCallback(
    (flowId: string) => {
      if (window.confirm('정말로 이 플로우를 삭제하시겠습니까?')) {
        const updatedFlows = flows.filter(flow => flow.id !== flowId);
        saveFlows(updatedFlows);
        if (selectedFlow?.id === flowId) {
          setSelectedFlow(null);
          setIsEditing(false);
        }
      }
    },
    [flows, selectedFlow, saveFlows]
  );

  // ============================================================================
  // 🎯 플로우 내보내기
  // ============================================================================

  const exportFlow = useCallback((flow: ProcessFlow) => {
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${flow.name.replace(/\s+/g, '_')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, []);

  // ============================================================================
  // 🎯 플로우 가져오기
  // ============================================================================

  const importFlow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedFlow: ProcessFlow = JSON.parse(
            e.target?.result as string
          );
          importedFlow.id = `flow-${Date.now()}`;
          importedFlow.createdAt = new Date().toISOString();
          importedFlow.updatedAt = new Date().toISOString();

          const updatedFlows = [...flows, importedFlow];
          saveFlows(updatedFlows);
          setSelectedFlow(importedFlow);
          alert('플로우가 성공적으로 가져와졌습니다!');
        } catch (error) {
          alert('플로우 파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    },
    [flows, saveFlows]
  );

  // ============================================================================
  // 🎯 프로세스 단계 편집
  // ============================================================================

  const editStep = useCallback((step: ProcessStep) => {
    setEditingStep(step);
    setShowProcessModal(true);
  }, []);

  // ============================================================================
  // 🎯 프로세스 단계 저장
  // ============================================================================

  const saveStep = useCallback(
    (updatedStep: ProcessStep) => {
      if (!selectedFlow) return;

      const updatedSteps = selectedFlow.steps.map(step =>
        step.id === updatedStep.id ? updatedStep : step
      );

      const updatedFlow: ProcessFlow = {
        ...selectedFlow,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };

      const updatedFlows = flows.map(flow =>
        flow.id === selectedFlow.id ? updatedFlow : flow
      );

      saveFlows(updatedFlows);
      setSelectedFlow(updatedFlow);
      setShowProcessModal(false);
      setEditingStep(null);
    },
    [selectedFlow, flows, saveFlows]
  );

  // ============================================================================
  // 🎯 프로세스 단계 삭제
  // ============================================================================

  const deleteStep = useCallback(
    (stepId: string) => {
      if (!selectedFlow) return;

      if (window.confirm('정말로 이 단계를 삭제하시겠습니까?')) {
        const updatedSteps = selectedFlow.steps.filter(
          step => step.id !== stepId
        );

        // 연결된 단계들의 connections 배열에서도 제거
        const cleanedSteps = updatedSteps.map(step => ({
          ...step,
          connections: step.connections.filter(conn => conn !== stepId),
        }));

        const updatedFlow: ProcessFlow = {
          ...selectedFlow,
          steps: cleanedSteps,
          updatedAt: new Date().toISOString(),
        };

        const updatedFlows = flows.map(flow =>
          flow.id === selectedFlow.id ? updatedFlow : flow
        );

        saveFlows(updatedFlows);
        setSelectedFlow(updatedFlow);
      }
    },
    [selectedFlow, flows, saveFlows]
  );

  // ============================================================================
  // 🎯 새 프로세스 단계 추가
  // ============================================================================

  const addNewStep = useCallback(() => {
    if (!selectedFlow) return;

    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      name: '새 단계',
      type: 'process',
      description: '새로 추가된 프로세스 단계',
      parameters: {},
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      connections: [],
      status: 'active',
    };

    const updatedFlow: ProcessFlow = {
      ...selectedFlow,
      steps: [...selectedFlow.steps, newStep],
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(flow =>
      flow.id === selectedFlow.id ? updatedFlow : flow
    );

    saveFlows(updatedFlows);
    setSelectedFlow(updatedFlow);
  }, [selectedFlow, flows, saveFlows]);

  // ============================================================================
  // 🎯 드래그 앤 드롭 기능
  // ============================================================================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, step: ProcessStep) => {
      if (!isEditing) return;

      setIsDragging(true);
      setDraggedStep(step);
      e.preventDefault();
    },
    [isEditing]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !draggedStep || !selectedFlow) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updatedStep = {
        ...draggedStep,
        position: { x, y },
      };

      const updatedSteps = selectedFlow.steps.map(step =>
        step.id === draggedStep.id ? updatedStep : step
      );

      const updatedFlow: ProcessFlow = {
        ...selectedFlow,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };

      setSelectedFlow(updatedFlow);
    },
    [isDragging, draggedStep, selectedFlow]
  );

  const handleMouseUp = useCallback(() => {
    if (draggedStep && selectedFlow) {
      const updatedFlows = flows.map(flow =>
        flow.id === selectedFlow.id ? selectedFlow : flow
      );
      saveFlows(updatedFlows);
    }

    setIsDragging(false);
    setDraggedStep(null);
  }, [draggedStep, selectedFlow, flows, saveFlows]);

  // ============================================================================
  // 🎯 플로우 시각화 렌더링
  // ============================================================================

  const renderFlowVisualization = () => {
    if (!selectedFlow) return null;

    return (
      <div
        className='relative w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden'
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {selectedFlow.steps.map((step, index) => (
          <div
            key={step.id}
            className={`absolute p-3 rounded-lg border-2 cursor-move transition-all ${
              step.type === 'input'
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : step.type === 'process'
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-purple-100 border-purple-300 text-purple-800'
            } ${step.status === 'error' ? 'border-red-500 bg-red-50' : ''} ${
              isDragging && draggedStep?.id === step.id
                ? 'shadow-lg scale-105'
                : ''
            }`}
            style={{
              left: step.position.x,
              top: step.position.y,
              minWidth: '120px',
              zIndex: index + 1,
            }}
            onMouseDown={e => handleMouseDown(e, step)}
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-medium uppercase opacity-70'>
                {step.type}
              </span>
              <div className='flex gap-1'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    editStep(step);
                  }}
                  className='p-1 hover:bg-white/50 rounded'
                >
                  <Edit className='h-3 w-3' />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                  className='p-1 hover:bg-red-100 rounded text-red-600'
                >
                  <Trash2 className='h-3 w-3' />
                </button>
              </div>
            </div>
            <div className='font-semibold text-sm mb-1'>{step.name}</div>
            <div className='text-xs opacity-70'>{step.description}</div>

            {/* 연결선 표시 */}
            {step.connections.map(connectionId => {
              const connectedStep = selectedFlow.steps.find(
                s => s.id === connectionId
              );
              if (!connectedStep) return null;

              return (
                <div
                  key={`${step.id}-${connectionId}`}
                  className='absolute w-0.5 bg-gray-400 transform origin-left'
                  style={{
                    left:
                      step.position.x - connectedStep.position.x > 0 ? -6 : 126,
                    top: '50%',
                    width: Math.abs(step.position.x - connectedStep.position.x),
                    height: 2,
                    transform: `translateY(-50%) rotate(${
                      Math.atan2(
                        step.position.y - connectedStep.position.y,
                        step.position.x - connectedStep.position.x
                      ) *
                      (180 / Math.PI)
                    }deg)`,
                  }}
                />
              );
            })}
          </div>
        ))}

        {/* 드래그 안내 메시지 */}
        {isEditing && (
          <div className='absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm'>
            ✨ 편집 모드: 프로세스 단계를 드래그하여 위치를 조정할 수 있습니다
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // 🎯 메인 렌더링
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* 플로우 목록 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {flows.map(flow => (
          <div
            key={flow.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedFlow?.id === flow.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => selectFlow(flow)}
          >
            <div className='flex items-start justify-between mb-3'>
              <h3 className='font-semibold text-gray-900'>{flow.name}</h3>
              <div className='flex gap-2'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    exportFlow(flow);
                  }}
                  className='p-1 hover:bg-gray-100 rounded'
                  title='내보내기'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteFlow(flow.id);
                  }}
                  className='p-1 hover:bg-red-100 rounded text-red-600'
                  title='삭제'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
            <p className='text-sm text-gray-600 mb-3'>{flow.description}</p>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>단계: {flow.steps.length}개</span>
              <span>v{flow.version}</span>
            </div>
          </div>
        ))}

        {/* 새 플로우 생성 버튼 */}
        <button
          onClick={createNewFlow}
          className='p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-gray-700'
        >
          <Plus className='h-8 w-8 mb-2' />
          <span className='font-medium'>새 플로우 생성</span>
        </button>
      </div>

      {/* 선택된 플로우 상세 보기 */}
      {selectedFlow && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {selectedFlow.name}
              </h2>
              <p className='text-gray-600'>{selectedFlow.description}</p>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'outline' : 'primary'}
                className='flex items-center gap-2'
              >
                <Edit className='h-4 w-4' />
                {isEditing ? '편집 완료' : '편집'}
              </Button>
              <Button
                onClick={addNewStep}
                className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
              >
                <Plus className='h-4 w-4' />
                단계 추가
              </Button>
            </div>
          </div>

          {/* 플로우 시각화 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              프로세스 플로우
            </h3>
            {renderFlowVisualization()}
          </div>

          {/* 단계 상세 정보 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              단계 상세 정보
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {selectedFlow.steps.map(step => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 ${
                    step.type === 'input'
                      ? 'border-blue-200 bg-blue-50'
                      : step.type === 'process'
                        ? 'border-green-200 bg-green-50'
                        : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  <div className='flex items-center justify-between mb-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        step.type === 'input'
                          ? 'bg-blue-100 text-blue-800'
                          : step.type === 'process'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {step.type}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => editStep(step)}
                        className='p-1 hover:bg-white/50 rounded'
                      >
                        <Edit className='h-3 w-3' />
                      </button>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className='p-1 hover:bg-red-100 rounded text-red-600'
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    </div>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    {step.name}
                  </h4>
                  <p className='text-sm text-gray-600 mb-3'>
                    {step.description}
                  </p>

                  {/* 파라미터 표시 */}
                  {Object.keys(step.parameters).length > 0 && (
                    <div className='space-y-2'>
                      <h5 className='text-xs font-medium text-gray-700 uppercase'>
                        파라미터
                      </h5>
                      {Object.entries(step.parameters).map(([key, value]) => (
                        <div key={key} className='flex justify-between text-xs'>
                          <span className='text-gray-600'>{key}:</span>
                          <span className='font-medium'>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 플로우 가져오기 */}
      <div className='border-t pt-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          플로우 가져오기
        </h3>
        <div className='flex items-center gap-4'>
          <input
            type='file'
            accept='.json'
            onChange={importFlow}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90'
          />
          <p className='text-sm text-gray-500'>
            JSON 형식의 CBAM 프로세스 플로우 파일을 선택하세요
          </p>
        </div>
      </div>

      {/* 프로세스 단계 편집 모달 */}
      <ProcessStepModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setEditingStep(null);
        }}
        step={editingStep}
        onSave={saveStep}
      />
    </div>
  );
}
