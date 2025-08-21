'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// 새로운 라우팅 구조에 맞게 수정
const lcaRoute = (
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/${leaf}`;

interface InterpretationSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'completed' | 'review';
}

const ProjectInterpretationPage: React.FC = () => {
  const router = useRouter();
  const projectId = 'current'; // 현재 프로젝트 ID

  const [interpretationSections, setInterpretationSections] = useState<
    InterpretationSection[]
  >([
    {
      id: '1',
      title: '주요 영향 요인 분석',
      content:
        '기후변화에 가장 큰 영향을 미치는 공정은 제철공정으로, 전체의 65%를 차지합니다.',
      status: 'completed',
    },
    {
      id: '2',
      title: '데이터 품질 평가',
      content:
        '철광석 데이터는 높은 품질(1-2)을 보이지만, 전력 데이터는 중간 품질(3-4)입니다.',
      status: 'completed',
    },
    {
      id: '3',
      title: '불확실성 분석',
      content:
        'Monte Carlo 시뮬레이션 결과, GWP100 값의 95% 신뢰구간은 1,750-1,950 kg CO₂-eq입니다.',
      status: 'review',
    },
    {
      id: '4',
      title: '민감도 분석',
      content:
        '철광석 투입량이 10% 증가할 때 GWP100이 8.5% 증가하는 것으로 나타났습니다.',
      status: 'pending',
    },
  ]);

  const updateSectionContent = (id: string, content: string) => {
    setInterpretationSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, content } : section
      )
    );
  };

  const updateSectionStatus = (
    id: string,
    status: 'pending' | 'completed' | 'review'
  ) => {
    setInterpretationSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, status } : section
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'review':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      default:
        return <BarChart3 className='h-4 w-4 text-blue-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료됨';
      case 'review':
        return '검토 필요';
      default:
        return '진행 중';
    }
  };

  return (
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>LCA 결과 해석</h1>
          <p className='text-muted-foreground'>현재 프로젝트</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>해석 섹션</h2>
                <Button
                  onClick={() => router.push(lcaRoute('report'))}
                  className='flex items-center gap-2'
                >
                  <TrendingUp className='h-4 w-4' />
                  보고서 생성
                </Button>
              </div>

              <div className='space-y-6'>
                {interpretationSections.map(section => (
                  <div
                    key={section.id}
                    className='p-6 bg-muted/50 rounded-lg border border-border/30'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        {getStatusIcon(section.status)}
                        <h3 className='text-lg font-medium'>{section.title}</h3>
                      </div>
                      <select
                        value={section.status}
                        onChange={e =>
                          updateSectionStatus(section.id, e.target.value as any)
                        }
                        className='px-3 py-1 border border-input rounded-md bg-background text-sm'
                      >
                        <option value='pending'>진행 중</option>
                        <option value='review'>검토 필요</option>
                        <option value='completed'>완료됨</option>
                      </select>
                    </div>

                    <div className='space-y-3'>
                      <textarea
                        value={section.content}
                        onChange={e =>
                          updateSectionContent(section.id, e.target.value)
                        }
                        placeholder='해석 내용을 입력하세요...'
                        className='w-full p-3 rounded-lg bg-background border border-input resize-none'
                        rows={4}
                      />

                      <div className='flex justify-between items-center text-sm text-muted-foreground'>
                        <span>상태: {getStatusText(section.status)}</span>
                        <span>문자 수: {section.content.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 mt-6'>
                <Button variant='outline'>해석 저장</Button>
                <Button onClick={() => router.push(lcaRoute('report'))}>
                  보고서로 이동
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6'>
            {/* Progress Summary */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>진행 현황</h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>완료됨</span>
                  <span className='font-semibold text-green-600'>
                    {
                      interpretationSections.filter(
                        s => s.status === 'completed'
                      ).length
                    }
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>검토 필요</span>
                  <span className='font-semibold text-yellow-600'>
                    {
                      interpretationSections.filter(s => s.status === 'review')
                        .length
                    }
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>진행 중</span>
                  <span className='font-semibold text-blue-600'>
                    {
                      interpretationSections.filter(s => s.status === 'pending')
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>빠른 이동</h3>
              <div className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('scope'))}
                >
                  범위 설정
                </Button>
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('lci'))}
                >
                  LCI 데이터
                </Button>
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('lcia'))}
                >
                  LCIA 결과
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInterpretationPage;
