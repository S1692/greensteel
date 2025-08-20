'use client';

import React, { useState } from 'react';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import { LCANavigation } from '@/components/lca/organisms/LCANavigation';
import { ProjectCard } from '@/components/lca/atoms/ProjectCard';
import {
  BarChart3,
  Plus,
  TrendingUp,
  Database,
  Zap,
  CheckCircle,
  FolderOpen,
  Settings,
  FileText,
} from 'lucide-react';

// ============================================================================
// 🎯 LCA 메인 페이지
// ============================================================================

export default function LCAPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock 프로젝트 데이터
  const mockProjects = [
    {
      id: '1',
      name: '철강 제품 LCA 분석',
      description: '철강 제조 공정의 생명주기 환경영향 평가',
      status: '진행 중' as const,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
    },
    {
      id: '2',
      name: '전기차 배터리 LCA',
      description: '리튬이온 배터리 생산 및 폐기 과정 분석',
      status: '완료' as const,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
    },
    {
      id: '3',
      name: '플라스틱 포장재 LCA',
      description: 'PET 포장재의 생명주기 환경영향 평가',
      status: '진행 중' as const,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19',
    },
  ];

  const handleProjectClick = (projectId: string) => {
    // 프로젝트 상세 페이지로 이동
    window.location.href = `/lca/projects/${projectId}/scope`;
  };

  const handleCreateNewProject = () => {
    // 새 프로젝트 생성 페이지로 이동
    window.location.href = '/lca/projects/new/scope';
  };

  return (
    <CommonShell>
      <div className='flex h-screen bg-black/50 backdrop-blur-sm'>
        {/* 모바일 사이드바 오버레이 */}
        {sidebarOpen && (
          <div className='fixed inset-0 z-40 md:hidden'>
            <div
              className='fixed inset-0 bg-black/50'
              onClick={() => setSidebarOpen(false)}
            />
            <div className='fixed left-0 top-0 h-full w-80 z-50'>
              <LCANavigation onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* 데스크톱 사이드바 */}
        <div className='hidden md:block w-80'>
          <LCANavigation />
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* 헤더 */}
          <header className='bg-white/5 border-b border-white/10 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className='md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors'
                >
                  <svg
                    className='h-5 w-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  </svg>
                </button>
                <div>
                  <h1 className='text-2xl font-bold text-white'>LCA 관리</h1>
                  <p className='text-white/60 text-sm mt-1'>
                    생명주기 평가 프로젝트 관리
                  </p>
                </div>
              </div>
              <Button onClick={handleCreateNewProject}>
                <Plus className='h-4 w-4 mr-2' />새 프로젝트
              </Button>
            </div>
          </header>

          {/* 콘텐츠 영역 */}
          <main className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-6'>
              {/* 통계 카드들 */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='stitch-card p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <FolderOpen className='h-6 w-6 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='stitch-h1 text-lg font-semibold'>
                        총 프로젝트
                      </h3>
                      <p className='stitch-caption'>전체 LCA 프로젝트 수</p>
                    </div>
                  </div>
                  <div className='text-3xl font-bold text-white'>12</div>
                </div>

                <div className='stitch-card p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <CheckCircle className='h-6 w-6 text-green-600' />
                    </div>
                    <div>
                      <h3 className='stitch-h1 text-lg font-semibold'>
                        완료된 프로젝트
                      </h3>
                      <p className='stitch-caption'>분석 완료된 프로젝트</p>
                    </div>
                  </div>
                  <div className='text-3xl font-bold text-white'>8</div>
                </div>

                <div className='stitch-card p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-yellow-100 rounded-lg'>
                      <TrendingUp className='h-6 w-6 text-yellow-600' />
                    </div>
                    <div>
                      <h3 className='stitch-h1 text-lg font-semibold'>
                        진행 중
                      </h3>
                      <p className='stitch-caption'>현재 진행 중인 프로젝트</p>
                    </div>
                  </div>
                  <div className='text-3xl font-bold text-white'>4</div>
                </div>

                <div className='stitch-card p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <BarChart3 className='h-6 w-6 text-purple-600' />
                    </div>
                    <div>
                      <h3 className='stitch-h1 text-lg font-semibold'>
                        평균 분석 시간
                      </h3>
                      <p className='stitch-caption'>
                        프로젝트당 평균 소요 시간
                      </p>
                    </div>
                  </div>
                  <div className='text-3xl font-bold text-white'>15일</div>
                </div>
              </div>

              {/* 최근 프로젝트 */}
              <div className='stitch-card p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='stitch-h1 text-xl font-semibold'>
                    최근 프로젝트
                  </h2>
                  <Button variant='outline' onClick={handleCreateNewProject}>
                    <Plus className='h-4 w-4 mr-2' />새 프로젝트
                  </Button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {mockProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onProjectClick={handleProjectClick}
                    />
                  ))}
                </div>
              </div>

              {/* 빠른 액션 */}
              <div className='stitch-card p-6'>
                <h2 className='stitch-h1 text-xl font-semibold mb-6'>
                  빠른 액션
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2'
                    onClick={() =>
                      (window.location.href = '/lca/projects/new/scope')
                    }
                  >
                    <FileText className='h-8 w-8' />
                    <span>새 프로젝트 시작</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2'
                    onClick={() =>
                      (window.location.href = '/lca/projects/new/lci')
                    }
                  >
                    <Database className='h-8 w-8' />
                    <span>LCI 데이터 입력</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2'
                    onClick={() =>
                      (window.location.href = '/lca/projects/new/lcia')
                    }
                  >
                    <Zap className='h-8 w-8' />
                    <span>LCIA 실행</span>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </CommonShell>
  );
}
