'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const ProjectInterpretationPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const contributionData = [
    { name: '제철공정', share: 45.2 },
    { name: '제강공정', share: 28.7 },
    { name: '압연공정', share: 18.3 },
    { name: '열처리공정', share: 7.8 },
  ];

  const sensitivityData = [
    { parameter: '철광석 투입량', delta: 10, impactDelta: 8.5 },
    { parameter: '전력 사용량', delta: 15, impactDelta: 12.3 },
    { parameter: '연료 사용량', delta: 20, impactDelta: 18.7 },
  ];

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>해석 및 결론</h1>
          <p className='stitch-caption'>프로젝트 ID: {projectId}</p>
        </div>

        {/* 주요 기여 공정 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4 flex items-center'>
            <TrendingUp className='h-5 w-5 mr-2 text-blue-400' />
            주요 기여 공정
          </h2>
          <div className='space-y-3'>
            {contributionData.map((item, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-blue-400'></div>
                  <span className='text-white font-medium'>{item.name}</span>
                </div>
                <div className='text-right'>
                  <div className='text-white font-bold text-lg'>
                    {item.share}%
                  </div>
                  <div className='stitch-caption'>기여도</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 민감도 분석 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4 flex items-center'>
            <AlertTriangle className='h-5 w-5 mr-2 text-yellow-400' />
            민감도 분석
          </h2>
          <div className='space-y-3'>
            {sensitivityData.map((item, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'
              >
                <div className='flex-1'>
                  <span className='text-white font-medium'>
                    {item.parameter}
                  </span>
                  <p className='stitch-caption'>변화율: {item.delta}%</p>
                </div>
                <div className='text-right'>
                  <div className='text-white font-bold text-lg'>
                    {item.impactDelta}%
                  </div>
                  <div className='stitch-caption'>영향 변화</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결론 및 권고사항 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4 flex items-center'>
            <CheckCircle className='h-5 w-5 mr-2 text-green-400' />
            결론 및 권고사항
          </h2>
          <div className='space-y-4'>
            <div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
              <h3 className='text-green-400 font-medium mb-2'>주요 발견사항</h3>
              <ul className='text-white/80 text-sm space-y-1'>
                <li>• 제철공정이 전체 환경영향의 45.2%를 차지</li>
                <li>• 전력 사용량이 가장 민감한 변수로 확인</li>
                <li>• 철광석 투입량 감소 시 상당한 환경영향 개선 가능</li>
              </ul>
            </div>

            <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
              <h3 className='text-blue-400 font-medium mb-2'>개선 권고사항</h3>
              <ul className='text-white/80 text-sm space-y-1'>
                <li>• 제철공정의 에너지 효율성 향상</li>
                <li>• 재생에너지 사용 비중 확대</li>
                <li>• 철광석 품질 개선을 통한 투입량 최적화</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button>보고서 생성</Button>
          <Button variant='outline'>결과 공유</Button>
        </div>
      </div>
    </CommonShell>
  );
};

export default ProjectInterpretationPage;
