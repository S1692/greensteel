'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
// lcaRoute 함수 정의
const lcaRoute = (
  projectId: string,
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/projects/${projectId}/${leaf}`;

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
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

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
    if (direction === 'up' && index === 0) return;
    if (
      direction === 'down' &&
      index === analysisScope.processOverview.subProcesses.length - 1
    )
      return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSubProcesses = [...analysisScope.processOverview.subProcesses];
    [newSubProcesses[index], newSubProcesses[newIndex]] = [
      newSubProcesses[newIndex],
      newSubProcesses[index],
    ];

    // 순서 재정렬
    newSubProcesses.forEach((process, i) => {
      process.order = i + 1;
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

  const saveScope = async (projectId: string, payload: AnalysisScope) => {
    // TODO: Implement saveScope server action
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving scope:', { projectId, payload });
    }
    alert('범위 설정이 저장되었습니다.');
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          analysisScope.projectName &&
          analysisScope.owner &&
          analysisScope.department
        );
      case 2:
        return (
          analysisScope.functionalUnit &&
          analysisScope.productName &&
          analysisScope.lifecycle
        );
      case 3:
        return analysisScope.processName && analysisScope.methodology;
      case 4:
        return (
          analysisScope.processOverview.subProcesses.every(
            p => p.name && p.description
          ) &&
          analysisScope.dataQuality.temporal &&
          analysisScope.dataQuality.technical &&
          analysisScope.dataQuality.geographical
        );
      default:
        return false;
    }
  };

  const canProceedToLCI = isStepValid(4);

  return (
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>
            목적 및 범위 설정
          </h1>
          <p className='text-muted-foreground'>
            LCA 분석의 목적과 범위를 정의하세요
          </p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            {/* Stepper */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm mb-6'>
              <div className='flex items-center justify-between mb-6'>
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className='flex items-center'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-16 h-0.5 mx-2 ${
                          step < currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className='text-sm text-muted-foreground'>
                {currentStep === 1 && '프로젝트 기본 정보'}
                {currentStep === 2 && '제품 및 기능 단위'}
                {currentStep === 3 && '분석 방법론'}
                {currentStep === 4 && '공정 개요 및 데이터 품질'}
              </div>
            </div>

            {/* Content Tabs */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm mb-6'>
              <div className='flex space-x-1 p-1 bg-muted rounded-lg mb-6'>
                <button
                  onClick={() => setCurrentTab('scope')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'scope'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  분석 범위
                </button>
                <button
                  onClick={() => setCurrentTab('process')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'process'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  공정개요
                </button>
              </div>

              {currentTab === 'scope' && (
                <div className='space-y-4'>
                  {currentStep === 1 && (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
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
                            placeholder='프로젝트명을 입력하세요'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
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
                            placeholder='담당자명'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
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
                            placeholder='부서명'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
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
                            placeholder='직책'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            연구기간
                          </label>
                          <Input
                            value={analysisScope.researchPeriod}
                            onChange={e =>
                              setAnalysisScope(prev => ({
                                ...prev,
                                researchPeriod: e.target.value,
                              }))
                            }
                            placeholder='연구기간'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            기준단위
                          </label>
                          <Input
                            value={analysisScope.functionalUnit}
                            onChange={e =>
                              setAnalysisScope(prev => ({
                                ...prev,
                                functionalUnit: e.target.value,
                              }))
                            }
                            placeholder='기능 단위 (예: 1톤)'
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
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
                            placeholder='제품명'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            생애주기
                          </label>
                          <select
                            value={analysisScope.lifecycle}
                            onChange={e =>
                              setAnalysisScope(prev => ({
                                ...prev,
                                lifecycle: e.target.value,
                              }))
                            }
                            className='w-full px-3 py-2 border border-input rounded-md bg-background'
                          >
                            <option value='gate-to-gate'>Gate-to-Gate</option>
                            <option value='cradle-to-gate'>
                              Cradle-to-Gate
                            </option>
                            <option value='cradle-to-grave'>
                              Cradle-to-Grave
                            </option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            공정명
                          </label>
                          <Input
                            value={analysisScope.processName}
                            onChange={e =>
                              setAnalysisScope(prev => ({
                                ...prev,
                                processName: e.target.value,
                              }))
                            }
                            placeholder='주요 공정명'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            평가 방법론
                          </label>
                          <Input
                            value={analysisScope.methodology}
                            onChange={e =>
                              setAnalysisScope(prev => ({
                                ...prev,
                                methodology: e.target.value,
                              }))
                            }
                            placeholder='LCIA 방법론'
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium mb-2'>
                            데이터 품질 요건
                          </label>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                              <label className='block text-xs text-muted-foreground mb-1'>
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
                                placeholder='시간적 범위'
                              />
                            </div>
                            <div>
                              <label className='block text-xs text-muted-foreground mb-1'>
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
                                placeholder='기술적 범위'
                              />
                            </div>
                            <div>
                              <label className='block text-xs text-muted-foreground mb-1'>
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
                                placeholder='지리적 범위'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentTab === 'process' && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>공정 개요</h3>
                    <Button onClick={addSubProcess} size='sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      공정 추가
                    </Button>
                  </div>

                  <div className='space-y-3'>
                    {analysisScope.processOverview.subProcesses.map(
                      (process, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-3 p-4 bg-muted/50 rounded-lg'
                        >
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => moveSubProcess(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => moveSubProcess(index, 'down')}
                              disabled={
                                index ===
                                analysisScope.processOverview.subProcesses
                                  .length -
                                  1
                              }
                            >
                              <ArrowDown className='h-4 w-4' />
                            </Button>
                          </div>

                          <div className='flex-1 grid grid-cols-2 gap-3'>
                            <Input
                              value={process.name}
                              onChange={e =>
                                updateSubProcess(index, 'name', e.target.value)
                              }
                              placeholder='공정명'
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
                              placeholder='공정 설명'
                            />
                          </div>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeSubProcess(index)}
                            className='text-destructive hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ChevronLeft className='h-4 w-4 mr-2' />
                이전 단계
              </Button>

              <div className='flex gap-3'>
                <Button
                  onClick={() => saveScope(projectId, analysisScope)}
                  variant='outline'
                >
                  저장
                </Button>
                <Button
                  onClick={() => router.push(lcaRoute(projectId, 'lci'))}
                  disabled={!canProceedToLCI}
                >
                  다음 단계 (LCI 입력)
                </Button>
              </div>

              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 4}
              >
                다음 단계
                <ChevronRight className='h-4 w-4 ml-2' />
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>현재 입력값 미리보기</h3>

              <div className='space-y-3 text-sm'>
                <div>
                  <span className='text-muted-foreground'>프로젝트명:</span>
                  <p className='font-medium'>
                    {analysisScope.projectName || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>담당자:</span>
                  <p className='font-medium'>
                    {analysisScope.owner || '-'} (
                    {analysisScope.department || '-'}/
                    {analysisScope.position || '-'})
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>연구기간:</span>
                  <p className='font-medium'>
                    {analysisScope.researchPeriod || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>기준단위:</span>
                  <p className='font-medium'>
                    {analysisScope.functionalUnit || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>제품명:</span>
                  <p className='font-medium'>
                    {analysisScope.productName || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>생애주기:</span>
                  <p className='font-medium'>
                    {analysisScope.lifecycle || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>공정명:</span>
                  <p className='font-medium'>
                    {analysisScope.processName || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>평가 방법론:</span>
                  <p className='font-medium'>
                    {analysisScope.methodology || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectScopePage;
