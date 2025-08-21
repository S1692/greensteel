'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Eye, Share2, CheckCircle, Clock } from 'lucide-react';

// 새로운 라우팅 구조에 맞게 수정
const lcaRoute = (
  leaf: 'scope' | 'lci' | 'lcia' | 'interpretation' | 'report'
) => `/lca/${leaf}`;

interface ReportSection {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'final';
  lastModified: string;
}

const ProjectReportPage: React.FC = () => {
  const router = useRouter();
  const projectId = 'current'; // 현재 프로젝트 ID

  const [reportSections, setReportSections] = useState<ReportSection[]>([
    {
      id: '1',
      title: '요약',
      content:
        '이 LCA 분석은 철강 제품의 생명주기 환경영향을 평가한 것으로, 제철공정에서 가장 큰 환경부하가 발생함을 확인했습니다.',
      status: 'final',
      lastModified: '2024-01-15',
    },
    {
      id: '2',
      title: '목적 및 범위',
      content:
        '분석 목적: 철강 제품의 환경영향 평가 및 개선 방안 도출\n기능 단위: 1톤 철강 제품\n시스템 경계: Cradle-to-Gate',
      status: 'final',
      lastModified: '2024-01-15',
    },
    {
      id: '3',
      title: 'LCI 데이터',
      content:
        '제철공정, 제강공정, 압연공정의 입출력 데이터를 수집하여 분석에 활용했습니다.',
      status: 'final',
      lastModified: '2024-01-15',
    },
    {
      id: '4',
      title: 'LCIA 결과',
      content: 'GWP100: 1,850 kg CO₂-eq\nAP: 12.4 mol H+ eq\nEP: 3.2 kg PO4 eq',
      status: 'final',
      lastModified: '2024-01-15',
    },
    {
      id: '5',
      title: '해석',
      content:
        '제철공정이 전체 환경영향의 65%를 차지하며, 전력 사용량이 주요 개선 포인트입니다.',
      status: 'review',
      lastModified: '2024-01-14',
    },
    {
      id: '6',
      title: '결론 및 권고사항',
      content:
        '전력 효율성 향상과 청정에너지 전환이 주요 개선 방안이며, 추가적인 데이터 수집이 필요합니다.',
      status: 'draft',
      lastModified: '2024-01-13',
    },
  ]);

  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'word' | 'html'>(
    'pdf'
  );

  const updateSectionContent = (id: string, content: string) => {
    setReportSections(prev =>
      prev.map(section =>
        section.id === id
          ? {
              ...section,
              content,
              lastModified: new Date().toISOString().split('T')[0],
            }
          : section
      )
    );
  };

  const updateSectionStatus = (
    id: string,
    status: 'draft' | 'review' | 'final'
  ) => {
    setReportSections(prev =>
      prev.map(section =>
        section.id === id
          ? {
              ...section,
              status,
              lastModified: new Date().toISOString().split('T')[0],
            }
          : section
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'final':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'review':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      default:
        return <Clock className='h-4 w-4 text-blue-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'final':
        return '최종';
      case 'review':
        return '검토 중';
      default:
        return '초안';
    }
  };

  const generateReport = () => {
    alert(`${selectedFormat.toUpperCase()} 형식으로 보고서를 생성합니다.`);
  };

  const downloadReport = () => {
    alert('보고서를 다운로드합니다.');
  };

  const shareReport = () => {
    alert('보고서를 공유합니다.');
  };

  return (
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>LCA 보고서</h1>
          <p className='text-muted-foreground'>현재 프로젝트</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>보고서 섹션</h2>
                <div className='flex items-center gap-3'>
                  <select
                    value={selectedFormat}
                    onChange={e => setSelectedFormat(e.target.value as any)}
                    className='px-3 py-2 border border-input rounded-md bg-background'
                  >
                    <option value='pdf'>PDF</option>
                    <option value='word'>Word</option>
                    <option value='html'>HTML</option>
                  </select>
                  <Button
                    onClick={generateReport}
                    className='flex items-center gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    보고서 생성
                  </Button>
                </div>
              </div>

              <div className='space-y-6'>
                {reportSections.map(section => (
                  <div
                    key={section.id}
                    className='p-6 bg-muted/50 rounded-lg border border-border/30'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        {getStatusIcon(section.status)}
                        <h3 className='text-lg font-medium'>{section.title}</h3>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm text-muted-foreground'>
                          수정: {section.lastModified}
                        </span>
                        <select
                          value={section.status}
                          onChange={e =>
                            updateSectionStatus(
                              section.id,
                              e.target.value as any
                            )
                          }
                          className='px-3 py-1 border border-input rounded-md bg-background text-sm'
                        >
                          <option value='draft'>초안</option>
                          <option value='review'>검토 중</option>
                          <option value='final'>최종</option>
                        </select>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <textarea
                        value={section.content}
                        onChange={e =>
                          updateSectionContent(section.id, e.target.value)
                        }
                        placeholder='보고서 내용을 입력하세요...'
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
                <Button variant='outline' onClick={downloadReport}>
                  <Download className='h-4 w-4 mr-2' />
                  다운로드
                </Button>
                <Button variant='outline' onClick={shareReport}>
                  <Share2 className='h-4 w-4 mr-2' />
                  공유
                </Button>
                <Button onClick={() => router.push(lcaRoute('scope'))}>
                  새 프로젝트 시작
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6'>
            {/* Report Status */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>보고서 상태</h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>최종 완료</span>
                  <span className='font-semibold text-green-600'>
                    {reportSections.filter(s => s.status === 'final').length}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>검토 중</span>
                  <span className='font-semibold text-yellow-600'>
                    {reportSections.filter(s => s.status === 'review').length}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>초안</span>
                  <span className='font-semibold text-blue-600'>
                    {reportSections.filter(s => s.status === 'draft').length}
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
                <Button
                  variant='outline'
                  className='w-full flex items-center gap-2'
                  onClick={() => router.push(lcaRoute('interpretation'))}
                >
                  해석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectReportPage;
