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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// 새로운 라우팅 구조에 맞게 수정
const lcaRoute = (
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/${leaf}`;

interface ProcessSubProcess {
  order: number;
  name: string;
  description: string;
}

interface AnalysisScope {
  projectName: string;
  owner: string;
  department: string;
  position: string;
  researchPeriod: string;
  functionalUnit: string;
  productName: string;
  lifecycle: string;
  processName: string;
  methodology: string;
  processOverview: {
    subProcesses: ProcessSubProcess[];
  };
  dataQuality: {
    temporal: string;
    technical: string;
    geographical: string;
  };
}

const ProjectScopePage: React.FC = () => {
  const router = useRouter();
  const projectId = 'current'; // 현재 프로젝트 ID

  const [currentStep, setCurrentStep] = useState(1);
  const [currentTab, setCurrentTab] = useState<'scope' | 'process'>('scope');

  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({
    projectName: '철강 제품 LCA 분석',
    owner: '김철수',
    department: '환경기술팀',
    position: '수석연구원',
    researchPeriod: '2024.01.01 - 2024.12.31',
    functionalUnit: '1톤 철강 제품',
    productName: '고강도 철강',
    lifecycle: 'Cradle-to-Gate',
    processName: '제철-제강-압연 공정',
    methodology: 'IPCC 2021 GWP',
    processOverview: {
      subProcesses: [
        { order: 1, name: '제철공정', description: '철광석 환원 및 용융' },
        { order: 2, name: '제강공정', description: '탄소 함량 조절 및 정련' },
        { order: 3, name: '압연공정', description: '강재 압연 및 성형' },
      ],
    },
    dataQuality: {
      temporal: '2024년 기준',
      technical: '현재 기술 수준',
      geographical: '국내 생산 기준',
    },
  });

  const addSubProcess = () => {
    const newOrder = analysisScope.processOverview.subProcesses.length + 1;
    const newProcess: ProcessSubProcess = {
      order: newOrder,
      name: '',
      description: '',
    };
    setAnalysisScope(prev => ({
      ...prev,
      processOverview: {
        ...prev.processOverview,
        subProcesses: [...prev.processOverview.subProcesses, newProcess],
      },
    }));
  };

  const removeSubProcess = (index: number) => {
    setAnalysisScope(prev => ({
      ...prev,
      processOverview: {
        ...prev.processOverview,
        subProcesses: prev.processOverview.subProcesses.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const moveSubProcess = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' &&
        index === analysisScope.processOverview.subProcesses.length - 1)
    ) {
      return;
    }

    const newSubProcesses = [...analysisScope.processOverview.subProcesses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSubProcesses[index], newSubProcesses[targetIndex]] = [
      newSubProcesses[targetIndex],
      newSubProcesses[index],
    ];

    // 순서 번호 재정렬
    newSubProcesses.forEach((process, idx) => {
      process.order = idx + 1;
    });

    setAnalysisScope(prev => ({
      ...prev,
      processOverview: {
        ...prev.processOverview,
        subProcesses: newSubProcesses,
      },
    }));
  };

  const updateSubProcess = (
    index: number,
    field: keyof ProcessSubProcess,
    value: string
  ) => {
    setAnalysisScope(prev => ({
      ...prev,
      processOverview: {
        ...prev.processOverview,
        subProcesses: prev.processOverview.subProcesses.map((process, i) =>
          i === index ? { ...process, [field]: value } : process
        ),
      },
    }));
  };

  const handleSaveAndContinue = () => {
    // 저장 로직 구현
    router.push(lcaRoute('lci'));
  };

  const handleSave = () => {
    // 저장 로직 구현
  };

  const handleBack = () => {
    router.push('/lca');
  };

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
                프로젝트 스코프 설정
              </h1>
              <p className='text-ecotrace-textSecondary'>
                LCA 분석의 목적과 범위를 정의하고 프로세스 개요를 설정하세요
              </p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className='flex items-center gap-2 mb-6'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-accent rounded-full flex items-center justify-center text-white text-sm font-bold'>
                1
              </div>
              <span className='text-white font-medium'>스코프 설정</span>
            </div>
            <ChevronRight className='w-4 h-4 text-ecotrace-textSecondary' />
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-ecotrace-secondary/40 rounded-full flex items-center justify-center text-ecotrace-textSecondary text-sm font-bold'>
                2
              </div>
              <span className='text-ecotrace-textSecondary'>LCI 데이터</span>
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

        {/* 탭 네비게이션 */}
        <div className='flex gap-1 mb-6 bg-ecotrace-secondary/20 rounded-lg p-1'>
          <button
            onClick={() => setCurrentTab('scope')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'scope'
                ? 'bg-ecotrace-accent text-white'
                : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/30'
            }`}
          >
            분석 범위
          </button>
          <button
            onClick={() => setCurrentTab('process')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'process'
                ? 'bg-ecotrace-accent text-white'
                : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/30'
            }`}
          >
            프로세스 개요
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {currentTab === 'scope' ? (
          <div className='space-y-6'>
            {/* 기본 정보 */}
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                기본 정보
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    프로젝트명
                  </label>
                  <Input
                    value={analysisScope.projectName}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        projectName: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    담당자
                  </label>
                  <Input
                    value={analysisScope.owner}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        owner: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    부서
                  </label>
                  <Input
                    value={analysisScope.department}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    직책
                  </label>
                  <Input
                    value={analysisScope.position}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    연구 기간
                  </label>
                  <Input
                    value={analysisScope.researchPeriod}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        researchPeriod: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
              </div>
            </div>

            {/* 제품 정보 */}
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                제품 정보
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    기능 단위
                  </label>
                  <Input
                    value={analysisScope.functionalUnit}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        functionalUnit: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    제품명
                  </label>
                  <Input
                    value={analysisScope.productName}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    생명주기 범위
                  </label>
                  <Input
                    value={analysisScope.lifecycle}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        lifecycle: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    프로세스명
                  </label>
                  <Input
                    value={analysisScope.processName}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        processName: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    방법론
                  </label>
                  <Input
                    value={analysisScope.methodology}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        methodology: e.target.value,
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
              </div>
            </div>

            {/* 데이터 품질 */}
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                데이터 품질
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    시간적 범위
                  </label>
                  <Input
                    value={analysisScope.dataQuality.temporal}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        dataQuality: {
                          ...prev.dataQuality,
                          temporal: e.target.value,
                        },
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    기술적 범위
                  </label>
                  <Input
                    value={analysisScope.dataQuality.technical}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        dataQuality: {
                          ...prev.dataQuality,
                          technical: e.target.value,
                        },
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-ecotrace-textSecondary mb-2'>
                    지리적 범위
                  </label>
                  <Input
                    value={analysisScope.dataQuality.geographical}
                    onChange={e =>
                      setAnalysisScope(prev => ({
                        ...prev,
                        dataQuality: {
                          ...prev.dataQuality,
                          geographical: e.target.value,
                        },
                      }))
                    }
                    className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* 프로세스 개요 */}
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-white'>
                  프로세스 개요
                </h3>
                <Button
                  onClick={addSubProcess}
                  size='md'
                  className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  하위 프로세스 추가
                </Button>
              </div>

              <div className='space-y-4'>
                {analysisScope.processOverview.subProcesses.map(
                  (process, index) => (
                    <div
                      key={index}
                      className='bg-ecotrace-secondary/10 border border-ecotrace-border rounded-lg p-4'
                    >
                      <div className='flex items-center gap-4 mb-3'>
                        <div className='w-8 h-8 bg-ecotrace-accent rounded-full flex items-center justify-center text-white text-sm font-bold'>
                          {process.order}
                        </div>
                        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <Input
                            value={process.name}
                            onChange={e =>
                              updateSubProcess(index, 'name', e.target.value)
                            }
                            placeholder='프로세스명'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                          <Input
                            value={process.description}
                            onChange={e =>
                              updateSubProcess(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='설명'
                            className='bg-ecotrace-secondary/20 border-ecotrace-border text-white'
                          />
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => moveSubProcess(index, 'up')}
                            disabled={index === 0}
                            className='p-1 rounded hover:bg-ecotrace-secondary/30 disabled:opacity-50'
                          >
                            <ArrowUp className='w-4 h-4 text-ecotrace-textSecondary' />
                          </button>
                          <button
                            onClick={() => moveSubProcess(index, 'down')}
                            disabled={
                              index ===
                              analysisScope.processOverview.subProcesses
                                .length -
                                1
                            }
                            className='p-1 rounded hover:bg-ecotrace-secondary/30 disabled:opacity-50'
                          >
                            <ArrowDown className='w-4 h-4 text-ecotrace-textSecondary' />
                          </button>
                          <button
                            onClick={() => removeSubProcess(index)}
                            className='p-1 rounded hover:bg-red-500/20 text-red-400'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

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

export default ProjectScopePage;
