'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Play, BarChart3, Download, Clock, CheckCircle } from 'lucide-react';

// 새로운 라우팅 구조에 맞게 수정
const lcaRoute = (
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/${leaf}`;

interface LciaResult {
  category: string;
  value: number;
  unit: string;
  contribution: number;
}

const ProjectLCIAPage: React.FC = () => {
  const router = useRouter();
  const projectId = 'current'; // 현재 프로젝트 ID

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
          <p className='text-muted-foreground'>현재 프로젝트</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>LCIA 실행</h2>
                <Button
                  onClick={startLciaRun}
                  disabled={isRunning}
                  className='flex items-center gap-2'
                >
                  <Play className='h-4 w-4' />
                  {isRunning ? '실행 중...' : 'LCIA 실행'}
                </Button>
              </div>

              {/* Results Display */}
              <div className='space-y-4'>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30'
                  >
                    <div className='flex-1'>
                      <h3 className='font-medium'>{result.category}</h3>
                      <p className='text-sm text-muted-foreground'>
                        기여도: {result.contribution}%
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold'>
                        {result.value.toFixed(1)}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {result.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 mt-6'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  상세 분석
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  결과 다운로드
                </Button>
              </div>

              {/* Bottom CTAs */}
              <div className='flex gap-3 mt-6'>
                <Button
                  onClick={() => router.push(lcaRoute('interpretation'))}
                  disabled={isRunning}
                >
                  해석으로 이동
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6'>
            {/* Run Status */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>실행 상태</h3>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  {isRunning ? (
                    <Clock className='h-4 w-4 text-yellow-500' />
                  ) : (
                    <CheckCircle className='h-4 w-4 text-green-500' />
                  )}
                  <span className='text-sm'>
                    {isRunning ? '실행 중...' : '완료됨'}
                  </span>
                </div>
                {runHistory.length > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    마지막 실행: {new Date().toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>빠른 작업</h3>
              <div className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('scope'))}
                >
                  범위 설정으로
                </Button>
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('lci'))}
                >
                  LCI 데이터로
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
