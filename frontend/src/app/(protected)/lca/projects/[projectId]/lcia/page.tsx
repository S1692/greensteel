'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Play, BarChart3, Download, Clock, CheckCircle } from 'lucide-react';
// lcaRoute 함수 정의
const lcaRoute = (
  projectId: string,
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/projects/${projectId}/${leaf}`;

interface LciaResult {
  category: string;
  value: number;
  unit: string;
  contribution: number;
}

const ProjectLCIAPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [isRunning, setIsRunning] = useState(false);
  const [runHistory, setRunHistory] = useState<LciaResult[]>([]);
  const [results, setResults] = useState<LciaResult[]>([
    {
      category: '기후변화 (GWP100)',
      value: 1850.2,
      unit: 'kg CO₂-eq',
      contribution: 100,
    },
    {
      category: '산성화 (AP)',
      value: 12.4,
      unit: 'mol H+ eq',
      contribution: 100,
    },
    {
      category: '부영양화 (EP)',
      value: 3.2,
      unit: 'kg PO4 eq',
      contribution: 100,
    },
  ]);

  const startLciaRun = async () => {
    setIsRunning(true);
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock 결과 생성
    const mockResults: LciaResult[] = [
      {
        category: '기후변화 (GWP100)',
        value: Math.random() * 2000 + 1000,
        unit: 'kg CO₂-eq',
        contribution: 100,
      },
      {
        category: '산성화 (AP)',
        value: Math.random() * 20 + 10,
        unit: 'mol H+ eq',
        contribution: 100,
      },
      {
        category: '부영양화 (EP)',
        value: Math.random() * 5 + 2,
        unit: 'kg PO4 eq',
        contribution: 100,
      },
    ];

    setResults(mockResults);
    setRunHistory(mockResults);
    setIsRunning(false);
  };

  const subscribe = (callback: (data: any) => void) => {
    // Mock subscription
    setTimeout(() => callback({ status: 'completed' }), 100);
  };

  return (
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>
            생명주기 영향평가 (LCIA)
          </h1>
          <p className='text-muted-foreground'>프로젝트 ID: {projectId}</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>영향평가 실행</h2>
                <Button
                  onClick={startLciaRun}
                  disabled={isRunning}
                  className='flex items-center gap-2'
                >
                  {isRunning ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
                      실행 중...
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4' />
                      LCIA 실행
                    </>
                  )}
                </Button>
              </div>

              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 bg-muted/50 rounded-lg border border-border/30'>
                    <h3 className='text-lg font-medium mb-2'>방법론</h3>
                    <p className='text-muted-foreground'>
                      EF 3.1 (European Commission)
                    </p>
                  </div>

                  <div className='p-4 bg-muted/50 rounded-lg border border-border/30'>
                    <h3 className='text-lg font-medium mb-2'>영향범주</h3>
                    <p className='text-muted-foreground'>
                      7개 범주 (기후변화, 산성화, 부영양화 등)
                    </p>
                  </div>
                </div>

                {results.length > 0 && (
                  <div className='mt-6'>
                    <h3 className='text-lg font-medium mb-4'>결과</h3>
                    <div className='space-y-3'>
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30'
                        >
                          <div className='flex-1'>
                            <h4 className='font-medium'>{result.category}</h4>
                            <p className='text-muted-foreground'>
                              {result.contribution}% 기여
                            </p>
                          </div>
                          <div className='text-right'>
                            <div className='font-bold text-lg'>
                              {result.value.toFixed(1)}
                            </div>
                            <div className='text-muted-foreground'>
                              {result.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className='flex gap-3 mt-6'>
                  <Button variant='outline' className='flex items-center gap-2'>
                    <BarChart3 className='h-4 w-4' />
                    차트 보기
                  </Button>
                  <Button variant='outline' className='flex items-center gap-2'>
                    <Download className='h-4 w-4' />
                    결과 다운로드
                  </Button>
                </div>

                {/* Bottom CTA */}
                <div className='flex justify-end mt-6'>
                  <Button
                    onClick={() =>
                      router.push(lcaRoute(projectId, 'interpretation'))
                    }
                    disabled={isRunning}
                  >
                    해석으로 이동
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6'>
            {/* Execution Status */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>실행 상태</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  {isRunning ? (
                    <>
                      <Clock className='h-5 w-5 text-yellow-500' />
                      <span className='text-yellow-600 font-medium'>
                        실행 중
                      </span>
                    </>
                  ) : runHistory.length > 0 ? (
                    <>
                      <CheckCircle className='h-5 w-5 text-green-500' />
                      <span className='text-green-600 font-medium'>완료</span>
                    </>
                  ) : (
                    <>
                      <Clock className='h-5 w-5 text-muted-foreground' />
                      <span className='text-muted-foreground'>대기 중</span>
                    </>
                  )}
                </div>

                {runHistory.length > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    결과 수: {runHistory.length}개
                  </div>
                )}
              </div>
            </div>

            {/* LCIA Run Panel */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>LCIA 실행 패널</h3>

              <div className='space-y-3'>
                <div className='text-sm text-muted-foreground'>
                  <p>• 방법론: EF 3.1</p>
                  <p>• 영향범주: 7개</p>
                  <p>• 데이터 품질: 고품질</p>
                </div>

                <Button
                  onClick={startLciaRun}
                  disabled={isRunning}
                  className='w-full'
                  variant='outline'
                >
                  {isRunning ? '실행 중...' : '새로 실행'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLCIAPage;
