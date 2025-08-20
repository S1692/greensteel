'use client';

import React from 'react';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
import {
  Download,
  FileText,
  Database,
  Calculator,
  CheckCircle,
  Star,
} from 'lucide-react';

export default function LCATemplatesPage() {
  const templates = [
    {
      id: 'lci-basic',
      name: '기본 LCI 템플릿',
      description: '생명주기 인벤토리 데이터 입력을 위한 기본 템플릿',
      category: 'LCI',
      version: '1.0',
      downloads: 1250,
      rating: 4.8,
      fileSize: '45 KB',
      format: 'Excel (.xlsx)',
      icon: Database,
    },
    {
      id: 'lci-advanced',
      name: '고급 LCI 템플릿',
      description: '상세한 LCI 데이터 입력 및 불확실성 분석을 위한 템플릿',
      category: 'LCI',
      version: '2.1',
      downloads: 890,
      rating: 4.9,
      fileSize: '78 KB',
      format: 'Excel (.xlsx)',
      icon: Database,
    },
    {
      id: 'lcia-ipcc',
      name: 'IPCC LCIA 템플릿',
      description: 'IPCC GWP 방법론을 사용한 영향평가 템플릿',
      category: 'LCIA',
      version: '1.2',
      downloads: 2100,
      rating: 4.7,
      fileSize: '32 KB',
      format: 'Excel (.xlsx)',
      icon: Calculator,
    },
    {
      id: 'lcia-recipe',
      name: 'ReCiPe LCIA 템플릿',
      description: 'ReCiPe 2016 방법론을 사용한 영향평가 템플릿',
      category: 'LCIA',
      version: '1.0',
      downloads: 1560,
      rating: 4.6,
      fileSize: '41 KB',
      format: 'Excel (.xlsx)',
      icon: Calculator,
    },
    {
      id: 'process-complete',
      name: '완전한 프로세스 템플릿',
      description: '전체 LCA 프로세스를 포함한 종합 템플릿',
      category: 'Complete',
      version: '3.0',
      downloads: 3200,
      rating: 4.9,
      fileSize: '156 KB',
      format: 'Excel (.xlsx)',
      icon: CheckCircle,
    },
    {
      id: 'report-iso',
      name: 'ISO 14040 보고서 템플릿',
      description: 'ISO 14040/14044 표준을 준수하는 보고서 템플릿',
      category: 'Report',
      version: '2.0',
      downloads: 980,
      rating: 4.8,
      fileSize: '67 KB',
      format: 'Word (.docx)',
      icon: FileText,
    },
  ];

  const handleDownload = (templateId: string, templateName: string) => {
    // 실제 다운로드 로직 구현
    alert(`${templateName} 템플릿을 다운로드합니다.`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LCI':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'LCIA':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Complete':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Report':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <ProjectLayout
      title='템플릿 다운로드'
      description='LCA 템플릿 다운로드'
      isMainPage={true}
    >
      <div className='space-y-6'>
        {/* 헤더 */}
        <div className='text-center'>
          <h2 className='stitch-h2 text-3xl font-bold mb-4'>
            LCA 템플릿 라이브러리
          </h2>
          <p className='stitch-caption text-lg'>
            생명주기 평가를 위한 다양한 템플릿을 다운로드하세요
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className='flex flex-wrap gap-2 justify-center'>
          {['All', 'LCI', 'LCIA', 'Complete', 'Report'].map(category => (
            <Button key={category} variant='outline' className='px-4 py-2'>
              {category}
            </Button>
          ))}
        </div>

        {/* 템플릿 그리드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {templates.map(template => (
            <div
              key={template.id}
              className='stitch-card p-6 hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-white/10 rounded-lg'>
                    <template.icon className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-1 text-yellow-400'>
                  <Star className='h-4 w-4 fill-current' />
                  <span className='text-sm font-medium'>{template.rating}</span>
                </div>
              </div>

              <h3 className='text-lg font-semibold text-white mb-2'>
                {template.name}
              </h3>
              <p className='text-white/60 text-sm mb-4 line-clamp-2'>
                {template.description}
              </p>

              <div className='space-y-2 mb-4 text-xs text-white/40'>
                <div className='flex justify-between'>
                  <span>버전:</span>
                  <span className='font-medium'>{template.version}</span>
                </div>
                <div className='flex justify-between'>
                  <span>다운로드:</span>
                  <span className='font-medium'>
                    {template.downloads.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>파일 크기:</span>
                  <span className='font-medium'>{template.fileSize}</span>
                </div>
                <div className='flex justify-between'>
                  <span>형식:</span>
                  <span className='font-medium'>{template.format}</span>
                </div>
              </div>

              <Button
                onClick={() => handleDownload(template.id, template.name)}
                className='w-full stitch-button-primary flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                다운로드
              </Button>
            </div>
          ))}
        </div>

        {/* 사용 가이드 */}
        <div className='stitch-card p-6'>
          <h3 className='stitch-h2 text-xl font-semibold mb-4'>
            템플릿 사용 가이드
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold text-white mb-2'>LCI 템플릿</h4>
              <ul className='text-sm text-white/60 space-y-1'>
                <li>• 프로세스별 입출력 데이터 입력</li>
                <li>• 단위 및 변환 계수 설정</li>
                <li>• 데이터 품질 정보 포함</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-2'>LCIA 템플릿</h4>
              <ul className='text-sm text-white/60 space-y-1'>
                <li>• 영향 카테고리별 결과 입력</li>
                <li>• 방법론별 특성화 계수 적용</li>
                <li>• 불확실성 분석 결과 포함</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-2'>
                완전한 LCA 템플릿
              </h4>
              <ul className='text-sm text-white/60 space-y-1'>
                <li>• 전체 LCA 워크플로우 포함</li>
                <li>• 모든 단계별 데이터 입력</li>
                <li>• 보고서 생성까지 완성</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-2'>보고서 템플릿</h4>
              <ul className='text-sm text-white/60 space-y-1'>
                <li>• ISO 14040/14044 표준 준수</li>
                <li>• 결과 시각화 및 해석</li>
                <li>• 전문적인 보고서 형식</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
