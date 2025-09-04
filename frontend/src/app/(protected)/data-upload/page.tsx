'use client';

import React from 'react';
import CommonShell from '@/components/common/CommonShell';
import {
  Upload,
  FileText,
  Database,
  Truck,
  Cog,
  ArrowRight,
  Download,
  FileSpreadsheet,
  Brain,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import Link from 'next/link';

const DataUploadPage: React.FC = () => {
  const uploadPages = [
    {
      id: 'input',
      title: '실적정보(투입물)',
      subtitle: '투입물 데이터 업로드 및 관리',
      description: '생산 과정에서 투입되는 원재료, 부재료 등의 데이터를 업로드하고 AI로 표준화합니다.',
      icon: Upload,
      href: '/data-upload/input',
      color: 'from-blue-500 to-blue-600',
      features: ['Excel 템플릿 다운로드', 'AI 기반 데이터 표준화', '실시간 편집 및 검증'],
      templateFile: '실적_데이터_인풋.xlsx'
    },
    {
      id: 'output',
      title: '실적정보(산출물)',
      subtitle: '산출물 데이터 업로드 및 관리',
      description: '생산 과정에서 나오는 제품, 부산물 등의 데이터를 업로드하고 분석합니다.',
      icon: FileSpreadsheet,
      href: '/data-upload/output',
      color: 'from-green-500 to-green-600',
      features: ['제품 정보 관리', '생산량 추적', '품질 데이터 분석'],
      templateFile: '실적_데이터_아웃풋.xlsx'
    },
    {
      id: 'transport',
      title: '운송정보',
      subtitle: '운송 데이터 업로드 및 관리',
      description: '원재료 및 제품의 운송 과정에서 발생하는 데이터를 관리합니다.',
      icon: Truck,
      href: '/data-upload/transport',
      color: 'from-purple-500 to-purple-600',
      features: ['운송 경로 관리'],
      templateFile: '실적_데이터_운송정보.xlsx'
    },
    {
      id: 'process',
      title: '공정정보',
      subtitle: '공정 데이터 업로드 및 관리',
      description: '생산 공정의 세부 정보와 공정별 데이터를 체계적으로 관리합니다.',
      icon: Cog,
      href: '/data-upload/process',
      color: 'from-orange-500 to-orange-600',
      features: ['설비 정보 관리'],
      templateFile: '실적_데이터_공정정보.xlsx'
    }
  ];

  // 템플릿 다운로드 함수
  const handleTemplateDownload = (templateFile: string) => {
    const link = document.createElement('a');
    link.href = `/templates/${templateFile}`;
    link.download = templateFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='stitch-h1 text-xl lg:text-2xl xl:text-3xl font-bold'>데이터 업로드</h1>
          <p className='stitch-caption text-white/60 text-xs lg:text-sm'>
            AI 기반 데이터 관리 시스템을 통해 각종 데이터를 업로드하고 처리합니다.
          </p>
        </div>

        {/* 개요 카드 */}
        <div className='stitch-card p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <Brain className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-white'>AI 기반 데이터 관리</h2>
              <p className='text-sm text-white/60'>
                업로드된 데이터를 AI가 자동으로 분석하고 표준화하여 일관성 있는 데이터베이스를 구축합니다.
              </p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='p-3 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-blue-400'>4</div>
              <div className='text-xs text-white/60'>데이터 유형</div>
            </div>
            <div className='p-3 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-green-400'>AI</div>
              <div className='text-xs text-white/60'>자동 표준화</div>
            </div>
            <div className='p-3 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-purple-400'>실시간</div>
              <div className='text-xs text-white/60'>편집 및 검증</div>
            </div>
            <div className='p-3 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-orange-400'>템플릿</div>
              <div className='text-xs text-white/60'>표준 형식</div>
            </div>
          </div>
        </div>

        {/* 업로드 페이지 그리드 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {uploadPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <div key={page.id} className='stitch-card p-6 hover:bg-white/5 transition-colors'>
                <div className='flex items-start gap-4'>
                  <div className={`w-12 h-12 bg-gradient-to-r ${page.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className='w-6 h-6 text-white' />
                  </div>
                  
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-semibold text-white mb-1'>{page.title}</h3>
                    <p className='text-sm text-white/80 mb-2'>{page.subtitle}</p>
                    <p className='text-sm text-white/60 mb-4'>{page.description}</p>
                    
                    {/* 주요 기능 */}
                    <div className='space-y-2 mb-4'>
                      {page.features.map((feature, index) => (
                        <div key={index} className='flex items-center gap-2 text-xs text-white/70'>
                          <CheckCircle className='w-3 h-3 text-green-400' />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className='flex gap-3'>
                      <Link href={page.href}>
                        <Button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2'>
                          <span>데이터 업로드</span>
                          <ArrowRight className='w-4 h-4' />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant='outline'
                        className='border-white/20 text-white/80 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors'
                        onClick={() => handleTemplateDownload(page.templateFile)}
                      >
                        <Download className='w-4 h-4 mr-2' />
                        템플릿
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 데이터 삭제 관리 섹션 */}
        <div className='stitch-card p-6'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center'>
              <Trash2 className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-white'>데이터 삭제 관리</h2>
              <p className='text-sm text-white/60'>
                업로드된 데이터를 삭제하고 삭제 로그를 관리합니다.
              </p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='p-4 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-red-400'>4</div>
              <div className='text-xs text-white/60'>데이터 유형</div>
            </div>
            <div className='p-4 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-orange-400'>실시간</div>
              <div className='text-xs text-white/60'>삭제 처리</div>
            </div>
            <div className='p-4 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-yellow-400'>로그</div>
              <div className='text-xs text-white/60'>삭제 기록</div>
            </div>
            <div className='p-4 bg-white/5 rounded-lg text-center'>
              <div className='text-2xl font-bold text-purple-400'>복구</div>
              <div className='text-xs text-white/60'>데이터 추적</div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link href='/data-upload/delete'>
              <Button className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2'>
                <Trash2 className='w-5 h-5' />
                <span>데이터 삭제 관리</span>
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className='stitch-card p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>데이터 업로드 가이드</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-white/5 rounded-lg'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-3'>
                <span className='text-white text-sm font-bold'>1</span>
              </div>
              <h4 className='font-medium text-white mb-2'>템플릿 다운로드</h4>
              <p className='text-xs text-white/60'>각 데이터 유형에 맞는 표준 템플릿을 다운로드합니다.</p>
            </div>
            
            <div className='p-4 bg-white/5 rounded-lg'>
              <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-3'>
                <span className='text-white text-sm font-bold'>2</span>
              </div>
              <h4 className='font-medium text-white mb-2'>데이터 입력</h4>
              <p className='text-xs text-white/60'>템플릿에 맞춰 데이터를 입력하고 Excel 파일로 저장합니다.</p>
            </div>
            
            <div className='p-4 bg-white/5 rounded-lg'>
              <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-3'>
                <span className='text-white text-sm font-bold'>3</span>
              </div>
              <h4 className='font-medium text-white mb-2'>AI 처리</h4>
              <p className='text-xs text-white/60'>업로드된 데이터를 AI가 자동으로 분석하고 표준화합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DataUploadPage;
