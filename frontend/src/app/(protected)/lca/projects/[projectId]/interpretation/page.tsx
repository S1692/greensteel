'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';


// Placeholder Chart Component
const PlaceholderChart = ({
  title,
  height,
}: {
  title: string;
  height: number;
}) => (
  <div
    className='bg-muted/50 border border-border/30 rounded-lg flex items-center justify-center'
    style={{ height: `${height}px` }}
  >
    <div className='text-center text-muted-foreground'>
      <BarChart3 className='h-8 w-8 mx-auto mb-2' />
      <p className='text-sm'>{title}</p>
    </div>
  </div>
);

const ProjectInterpretationPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
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
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>해석 및 결론</h1>
          <p className='text-muted-foreground'>프로젝트 ID: {projectId}</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1 space-y-6'>
            {/* 기여도 분석 */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4 flex items-center'>
                <TrendingUp className='h-5 w-5 mr-2 text-blue-500' />
                기여도 분석
              </h2>

              <div className='mb-4'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-border/30'>
                      <th className='text-left py-2 font-medium'>공정</th>
                      <th className='text-right py-2 font-medium'>
                        기여율 (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributionData.map((item, index) => (
                      <tr key={index} className='border-b border-border/20'>
                        <td className='py-2'>{item.name}</td>
                        <td className='text-right py-2 font-medium'>
                          {item.share}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PlaceholderChart title='기여도 차트' height={200} />
            </div>

            {/* 민감도 분석 */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4 flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-2 text-yellow-500' />
                민감도 분석
              </h2>

              <div className='mb-4'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-border/30'>
                      <th className='text-left py-2 font-medium'>매개변수</th>
                      <th className='text-right py-2 font-medium'>
                        변화율 (%)
                      </th>
                      <th className='text-right py-2 font-medium'>
                        영향 변화 (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityData.map((item, index) => (
                      <tr key={index} className='border-b border-border/20'>
                        <td className='py-2'>{item.parameter}</td>
                        <td className='text-right py-2'>{item.delta}%</td>
                        <td className='text-right py-2 font-medium'>
                          {item.impactDelta}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PlaceholderChart title='민감도 차트' height={200} />
            </div>

            {/* Bottom CTA */}
            <div className='flex justify-end'>
              <Button
                onClick={() => router.push(lcaRoute(projectId, 'report'))}
              >
                보고서로 이동
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>해석 요약</h3>

              <div className='space-y-4'>
                {/* 주요 기여 공정 */}
                <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                  <h4 className='text-blue-600 font-medium mb-2'>
                    주요 기여 공정
                  </h4>
                  <p className='text-sm text-blue-700'>
                    제철공정이 전체 환경영향의 45.2%를 차지하여 가장 큰 기여도를
                    보임
                  </p>
                </div>

                {/* 민감도 핵심 */}
                <div className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                  <h4 className='text-yellow-600 font-medium mb-2'>
                    민감도 핵심
                  </h4>
                  <p className='text-sm text-yellow-700'>
                    전력 사용량이 가장 민감한 변수로 확인되어 에너지 효율성
                    개선이 중요
                  </p>
                </div>

                {/* 개선 권고 */}
                <div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
                  <h4 className='text-green-600 font-medium mb-2'>개선 권고</h4>
                  <p className='text-sm text-green-700'>
                    제철공정의 에너지 효율성 향상과 재생에너지 사용 비중 확대
                    권고
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

export default ProjectInterpretationPage;
