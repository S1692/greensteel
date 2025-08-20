'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import {
  Download,
  Eye,
  Share2,
  FileText,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

const ProjectReportPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [selectedFormat, setSelectedFormat] = useState<
    'pdf' | 'excel' | 'word'
  >('pdf');

  const reportSections = [
    {
      title: '프로젝트 개요',
      icon: FileText,
      status: '완료',
      description: '프로젝트 목적, 범위, 제품 정보',
    },
    {
      title: '분석 범위',
      icon: BarChart3,
      status: '완료',
      description: '시스템 경계, 가정, 제한사항',
    },
    {
      title: 'LCI 데이터',
      icon: TrendingUp,
      status: '완료',
      description: '입출력 데이터, 공정 정보',
    },
    {
      title: '영향평가 결과',
      icon: BarChart3,
      status: '완료',
      description: 'LCIA 결과, 영향범주별 수치',
    },
    {
      title: '해석 및 결론',
      icon: TrendingUp,
      status: '완료',
      description: '주요 발견사항, 권고사항',
    },
  ];

  const generateReport = async () => {
    // 실제로는 API 호출하여 보고서 생성
    // console.log(`Generating ${selectedFormat} report for project ${projectId}`);
  };

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>LCA 보고서</h1>
          <p className='stitch-caption'>프로젝트 ID: {projectId}</p>
        </div>

        {/* 보고서 섹션 상태 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>
            보고서 구성 요소
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {reportSections.map((section, index) => (
              <div
                key={index}
                className='flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10'
              >
                <div className='p-2 bg-primary/20 rounded-lg'>
                  <section.icon className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-white font-medium'>{section.title}</h3>
                  <p className='stitch-caption'>{section.description}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    section.status === '완료'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {section.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 보고서 생성 옵션 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>보고서 생성</h2>

          <div className='space-y-4'>
            <div>
              <label className='stitch-label mb-2 block'>출력 형식</label>
              <div className='flex gap-3'>
                {(['pdf', 'excel', 'word'] as const).map(format => (
                  <label
                    key={format}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='format'
                      value={format}
                      checked={selectedFormat === format}
                      onChange={e =>
                        setSelectedFormat(
                          e.target.value as 'pdf' | 'excel' | 'word'
                        )
                      }
                      className='text-primary focus:ring-primary'
                    />
                    <span className='text-white capitalize'>
                      {format.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={generateReport}
                className='flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                보고서 생성
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <Eye className='h-4 w-4' />
                미리보기
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <Share2 className='h-4 w-4' />
                공유
              </Button>
            </div>
          </div>
        </div>

        {/* 최근 생성된 보고서 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>최근 보고서</h2>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'>
              <div className='flex items-center gap-3'>
                <FileText className='h-5 w-5 text-blue-400' />
                <div>
                  <h3 className='text-white font-medium'>
                    LCA_Report_v1.0.pdf
                  </h3>
                  <p className='stitch-caption'>2024-01-20 14:30 생성</p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' className='px-3 py-1 text-sm'>
                  다운로드
                </Button>
                <Button variant='ghost' className='px-3 py-1 text-sm'>
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default ProjectReportPage;
