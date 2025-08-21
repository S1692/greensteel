'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LCALayout } from '@/components/lca/templates/LCALayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Download,
  Database,
  BarChart3,
} from 'lucide-react';

// 새로운 라우팅 구조에 맞게 수정
const lcaRoute = (
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/${leaf}`;

interface LCIProcess {
  id: string;
  name: string;
  category: string;
  inputs: LCIInput[];
  outputs: LCIOutput[];
}

interface LCIInput {
  id: string;
  name: string;
  amount: number;
  unit: string;
  source: string;
  quality: 'high' | 'medium' | 'low';
}

interface LCIOutput {
  id: string;
  name: string;
  amount: number;
  unit: string;
  type: 'product' | 'waste' | 'emission';
}

const LCIPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const [lciProcesses, setLciProcesses] = useState<LCIProcess[]>([
    {
      id: '1',
      name: '제철공정',
      category: '제조공정',
      inputs: [
        {
          id: '1',
          name: '철광석',
          amount: 1.5,
          unit: '톤',
          source: '국내 광산',
          quality: 'high',
        },
        {
          id: '2',
          name: '코크스',
          amount: 0.5,
          unit: '톤',
          source: '국내 제철소',
          quality: 'high',
        },
        {
          id: '3',
          name: '전력',
          amount: 800,
          unit: 'kWh',
          source: '국내 전력망',
          quality: 'medium',
        },
      ],
      outputs: [
        {
          id: '1',
          name: '선철',
          amount: 1.0,
          unit: '톤',
          type: 'product',
        },
        {
          id: '2',
          name: '슬래그',
          amount: 0.3,
          unit: '톤',
          type: 'waste',
        },
        {
          id: '3',
          name: 'CO2',
          amount: 1.8,
          unit: '톤',
          type: 'emission',
        },
      ],
    },
    {
      id: '2',
      name: '제강공정',
      category: '제조공정',
      inputs: [
        {
          id: '4',
          name: '선철',
          amount: 1.0,
          unit: '톤',
          source: '제철공정',
          quality: 'high',
        },
        {
          id: '5',
          name: '전력',
          amount: 200,
          unit: 'kWh',
          source: '국내 전력망',
          quality: 'medium',
        },
      ],
      outputs: [
        {
          id: '4',
          name: '강재',
          amount: 0.95,
          unit: '톤',
          type: 'product',
        },
        {
          id: '5',
          name: 'CO2',
          amount: 0.2,
          unit: '톤',
          type: 'emission',
        },
      ],
    },
  ]);

  const addProcess = () => {
    const newProcess: LCIProcess = {
      id: Date.now().toString(),
      name: '',
      category: '',
      inputs: [],
      outputs: [],
    };
    setLciProcesses([...lciProcesses, newProcess]);
    setSelectedProcess(newProcess.id);
  };

  const removeProcess = (processId: string) => {
    setLciProcesses(lciProcesses.filter(p => p.id !== processId));
    if (selectedProcess === processId) {
      setSelectedProcess(null);
    }
  };

  const updateProcess = (
    processId: string,
    field: keyof LCIProcess,
    value: any
  ) => {
    setLciProcesses(prev =>
      prev.map(p => (p.id === processId ? { ...p, [field]: value } : p))
    );
  };

  const addInput = (processId: string) => {
    const newInput: LCIInput = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      unit: '',
      source: '',
      quality: 'medium',
    };
    updateProcess(processId, 'inputs', [
      ...lciProcesses.find(p => p.id === processId)!.inputs,
      newInput,
    ]);
  };

  const removeInput = (processId: string, inputId: string) => {
    const process = lciProcesses.find(p => p.id === processId);
    if (process) {
      updateProcess(
        processId,
        'inputs',
        process.inputs.filter(i => i.id !== inputId)
      );
    }
  };

  const addOutput = (processId: string) => {
    const newOutput: LCIOutput = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      unit: '',
      type: 'product',
    };
    updateProcess(processId, 'outputs', [
      ...lciProcesses.find(p => p.id === processId)!.outputs,
      newOutput,
    ]);
  };

  const removeOutput = (processId: string, outputId: string) => {
    const process = lciProcesses.find(p => p.id === processId);
    if (process) {
      updateProcess(
        processId,
        'outputs',
        process.outputs.filter(o => o.id !== outputId)
      );
    }
  };

  const handleSaveAndContinue = () => {
    // 저장 로직 구현
    router.push(lcaRoute('lcia'));
  };

  const handleSave = () => {
    // 저장 로직 구현
  };

  const handleBack = () => {
    router.push(lcaRoute('scope'));
  };

  const selectedProcessData = lciProcesses.find(p => p.id === selectedProcess);

  return (
    <LCALayout>
      <div className='p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-4'>
            <Button
              variant='outline'
              size='md'
              onClick={handleBack}
              className='border-ecotrace-border text-ecotrace-textSecondary hover:bg-ecotrace-secondary/20'
            >
              <ChevronLeft className='w-4 h-4 mr-2' />
              뒤로
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                생명주기 인벤토리 (LCI)
              </h1>
              <p className='text-ecotrace-textSecondary'>
                각 프로세스의 입력과 출력 데이터를 수집하고 관리하세요
              </p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className='flex items-center gap-2 mb-6'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-secondary/40 rounded-full flex items-center justify-center text-ecotrace-textSecondary text-sm font-bold'>
                1
              </div>
              <span className='text-ecotrace-textSecondary'>스코프 설정</span>
            </div>
            <ChevronRight className='w-4 h-4 text-ecotrace-textSecondary' />
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-accent rounded-full flex items-center justify-center text-white text-sm font-bold'>
                2
              </div>
              <span className='text-white font-medium'>LCI 데이터</span>
            </div>
            <ChevronRight className='w-4 h-4 text-ecotrace-textSecondary' />
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-secondary/40 rounded-full flex items-center justify-center text-ecotrace-textSecondary text-sm font-bold'>
                3
              </div>
              <span className='text-ecotrace-textSecondary'>LCIA 분석</span>
            </div>
            <ChevronRight className='w-4 h-4 text-ecotrace-textSecondary' />
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-secondary/40 rounded-full flex items-center justify-center text-ecotrace-textSecondary text-sm font-bold'>
                4
              </div>
              <span className='text-ecotrace-textSecondary'>해석</span>
            </div>
            <ChevronRight className='w-4 h-4 text-ecotrace-textSecondary' />
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-secondary/40 rounded-full flex items-center justify-center text-ecotrace-textSecondary text-sm font-bold'>
                5
              </div>
              <span className='text-ecotrace-textSecondary'>보고서</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* 프로세스 목록 */}
          <div className='lg:col-span-1'>
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-white'>
                  프로세스 목록
                </h3>
                <Button
                  onClick={addProcess}
                  size='md'
                  className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  추가
                </Button>
              </div>

              <div className='space-y-3'>
                {lciProcesses.map(process => (
                  <div
                    key={process.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProcess === process.id
                        ? 'bg-ecotrace-accent text-white'
                        : 'bg-ecotrace-secondary/10 hover:bg-ecotrace-secondary/30 text-white'
                    }`}
                    onClick={() => setSelectedProcess(process.id)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium'>
                          {process.name || '새 프로세스'}
                        </div>
                        <div className='text-xs opacity-75'>
                          {process.category || '카테고리 미설정'}
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeProcess(process.id);
                        }}
                        className='p-1 rounded hover:bg-red-500/20 text-red-400'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 프로세스 상세 정보 */}
          <div className='lg:col-span-2'>
            {selectedProcessData ? (
              <div className='space-y-6'>
                {/* 프로세스 기본 정보 */}
                <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    프로세스 정보
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                        프로세스명
                      </label>
                      <Input
                        value={selectedProcessData.name}
                        onChange={e =>
                          updateProcess(
                            selectedProcessData.id,
                            'name',
                            e.target.value
                          )
                        }
                        className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                        카테고리
                      </label>
                      <Input
                        value={selectedProcessData.category}
                        onChange={e =>
                          updateProcess(
                            selectedProcessData.id,
                            'category',
                            e.target.value
                          )
                        }
                        className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                      />
                    </div>
                  </div>
                </div>

                {/* 입력 데이터 */}
                <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-white'>
                      입력 데이터
                    </h3>
                    <Button
                      onClick={() => addInput(selectedProcessData.id)}
                      size='md'
                      className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      입력 추가
                    </Button>
                  </div>

                  <div className='space-y-4'>
                    {selectedProcessData.inputs.map(input => (
                      <div
                        key={input.id}
                        className='bg-ecotrace-secondary/10 border border-ecotrace-border rounded-lg p-4'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
                          <Input
                            value={input.name}
                            onChange={e => {
                              const updatedInputs =
                                selectedProcessData.inputs.map(i =>
                                  i.id === input.id
                                    ? { ...i, name: e.target.value }
                                    : i
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'inputs',
                                updatedInputs
                              );
                            }}
                            placeholder='입력명'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={input.amount}
                            onChange={e => {
                              const updatedInputs =
                                selectedProcessData.inputs.map(i =>
                                  i.id === input.id
                                    ? {
                                        ...i,
                                        amount: parseFloat(e.target.value) || 0,
                                      }
                                    : i
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'inputs',
                                updatedInputs
                              );
                            }}
                            type='number'
                            placeholder='수량'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={input.unit}
                            onChange={e => {
                              const updatedInputs =
                                selectedProcessData.inputs.map(i =>
                                  i.id === input.id
                                    ? { ...i, unit: e.target.value }
                                    : i
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'inputs',
                                updatedInputs
                              );
                            }}
                            placeholder='단위'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={input.source}
                            onChange={e => {
                              const updatedInputs =
                                selectedProcessData.inputs.map(i =>
                                  i.id === input.id
                                    ? { ...i, source: e.target.value }
                                    : i
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'inputs',
                                updatedInputs
                              );
                            }}
                            placeholder='출처'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <div className='flex items-center gap-2'>
                            <select
                              value={input.quality}
                              onChange={e => {
                                const updatedInputs =
                                  selectedProcessData.inputs.map(i =>
                                    i.id === input.id
                                      ? {
                                          ...i,
                                          quality: e.target.value as
                                            | 'high'
                                            | 'medium'
                                            | 'low',
                                        }
                                      : i
                                  );
                                updateProcess(
                                  selectedProcessData.id,
                                  'inputs',
                                  updatedInputs
                                );
                              }}
                              className='flex-1 px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-white'
                            >
                              <option value='high'>높음</option>
                              <option value='medium'>보통</option>
                              <option value='low'>낮음</option>
                            </select>
                            <button
                              onClick={() =>
                                removeInput(selectedProcessData.id, input.id)
                              }
                              className='p-1 rounded hover:bg-red-500/20 text-red-400'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 출력 데이터 */}
                <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-white'>
                      출력 데이터
                    </h3>
                    <Button
                      onClick={() => addOutput(selectedProcessData.id)}
                      size='md'
                      className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      출력 추가
                    </Button>
                  </div>

                  <div className='space-y-4'>
                    {selectedProcessData.outputs.map(output => (
                      <div
                        key={output.id}
                        className='bg-ecotrace-secondary/10 border border-ecotrace-border rounded-lg p-4'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
                          <Input
                            value={output.name}
                            onChange={e => {
                              const updatedOutputs =
                                selectedProcessData.outputs.map(o =>
                                  o.id === output.id
                                    ? { ...o, name: e.target.value }
                                    : o
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'outputs',
                                updatedOutputs
                              );
                            }}
                            placeholder='출력명'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={output.amount}
                            onChange={e => {
                              const updatedOutputs =
                                selectedProcessData.outputs.map(o =>
                                  o.id === output.id
                                    ? {
                                        ...o,
                                        amount: parseFloat(e.target.value) || 0,
                                      }
                                    : o
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'outputs',
                                updatedOutputs
                              );
                            }}
                            type='number'
                            placeholder='수량'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={output.unit}
                            onChange={e => {
                              const updatedOutputs =
                                selectedProcessData.outputs.map(o =>
                                  o.id === output.id
                                    ? { ...o, unit: e.target.value }
                                    : o
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'outputs',
                                updatedOutputs
                              );
                            }}
                            placeholder='단위'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <select
                            value={output.type}
                            onChange={e => {
                              const updatedOutputs =
                                selectedProcessData.outputs.map(o =>
                                  o.id === output.id
                                    ? {
                                        ...o,
                                        type: e.target.value as
                                          | 'product'
                                          | 'waste'
                                          | 'emission',
                                      }
                                    : o
                                );
                              updateProcess(
                                selectedProcessData.id,
                                'outputs',
                                updatedOutputs
                              );
                            }}
                            className='px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-white'
                          >
                            <option value='product'>제품</option>
                            <option value='waste'>폐기물</option>
                            <option value='emission'>배출</option>
                          </select>
                          <button
                            onClick={() =>
                              removeOutput(selectedProcessData.id, output.id)
                            }
                            className='p-1 rounded hover:bg-red-500/20 text-red-400'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-12 text-center'>
                <Database className='w-16 h-16 text-ecotrace-textSecondary mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-white mb-2'>
                  프로세스를 선택하세요
                </h3>
                <p className='text-ecotrace-textSecondary'>
                  왼쪽에서 프로세스를 선택하여 LCI 데이터를 입력하거나 새
                  프로세스를 추가하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className='flex items-center justify-between mt-8 pt-6 border-t border-ecotrace-border'>
          <Button
            variant='outline'
            size='md'
            onClick={handleBack}
            className='border-ecotrace-border text-ecotrace-textSecondary hover:bg-ecotrace-secondary/20'
          >
            <ChevronLeft className='w-4 h-4 mr-2' />
            뒤로
          </Button>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='md'
              onClick={handleSave}
              className='border-ecotrace-border text-ecotrace-textSecondary hover:bg-ecotrace-secondary/20'
            >
              저장
            </Button>
            <Button
              size='md'
              onClick={handleSaveAndContinue}
              className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
            >
              저장하고 계속
              <ChevronRight className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </div>
      </div>
    </LCALayout>
  );
};

export default LCIPage;
