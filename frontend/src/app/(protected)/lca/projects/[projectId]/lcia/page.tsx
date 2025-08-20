'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import { Play, BarChart3, Download } from 'lucide-react';

interface LciaResult {
  category: string;
  value: number;
  unit: string;
  contribution: number;
}

const ProjectLCIAPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [isRunning, setIsRunning] = useState(false);
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

  const runLCIA = async () => {
    setIsRunning(true);
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
  };

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>
            생명주기 영향평가 (LCIA)
          </h1>
          <p className='stitch-caption'>프로젝트 ID: {projectId}</p>
        </div>

        <div className='stitch-card p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='stitch-h1 text-xl font-semibold'>영향평가 실행</h2>
            <Button
              onClick={runLCIA}
              disabled={isRunning}
              className='flex items-center gap-2'
            >
              {isRunning ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
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
              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <h3 className='stitch-h1 text-lg font-medium mb-2'>방법론</h3>
                <p className='stitch-caption'>EF 3.1 (European Commission)</p>
              </div>

              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <h3 className='stitch-h1 text-lg font-medium mb-2'>영향범주</h3>
                <p className='stitch-caption'>
                  7개 범주 (기후변화, 산성화, 부영양화 등)
                </p>
              </div>
            </div>

            {results.length > 0 && (
              <div className='mt-6'>
                <h3 className='stitch-h1 text-lg font-medium mb-4'>결과</h3>
                <div className='space-y-3'>
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'
                    >
                      <div className='flex-1'>
                        <h4 className='text-white font-medium'>
                          {result.category}
                        </h4>
                        <p className='stitch-caption'>
                          {result.contribution}% 기여
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-white font-bold text-lg'>
                          {result.value.toFixed(1)}
                        </div>
                        <div className='stitch-caption'>{result.unit}</div>
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
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default ProjectLCIAPage;
