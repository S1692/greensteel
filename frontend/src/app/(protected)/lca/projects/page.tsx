'use client';

import React from 'react';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/lca/atoms/ProjectCard';
import { Plus, Search, Filter } from 'lucide-react';

export default function LCAProjectsPage() {
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
    window.location.href = `/lca/projects/${projectId}/scope`;
  };

  const handleCreateNewProject = () => {
    window.location.href = '/lca/projects/new/scope';
  };

  return (
    <ProjectLayout
      title='프로젝트 관리'
      description='LCA 프로젝트 생성 및 관리'
      isMainPage={true}
    >
      <div className='space-y-6'>
        {/* 헤더 액션 */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='stitch-h2 text-2xl font-bold'>프로젝트 목록</h2>
            <p className='stitch-caption'>
              생명주기 평가 프로젝트를 관리하세요
            </p>
          </div>
          <Button
            onClick={handleCreateNewProject}
            className='stitch-button-primary'
          >
            <Plus className='h-4 w-4 mr-2' />새 프로젝트
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40' />
            <input
              type='text'
              placeholder='프로젝트 검색...'
              className='w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            />
          </div>
          <Button variant='outline' className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            필터
          </Button>
        </div>

        {/* 프로젝트 그리드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {mockProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>

        {/* 통계 정보 */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='stitch-card p-4 text-center'>
            <div className='text-2xl font-bold text-blue-400'>
              {mockProjects.length}
            </div>
            <div className='text-sm text-white/60'>총 프로젝트</div>
          </div>
          <div className='stitch-card p-4 text-center'>
            <div className='text-2xl font-bold text-green-400'>
              {mockProjects.filter(p => p.status === '진행 중').length}
            </div>
            <div className='text-sm text-white/60'>진행 중</div>
          </div>
          <div className='stitch-card p-4 text-center'>
            <div className='text-2xl font-bold text-purple-400'>
              {mockProjects.filter(p => p.status === '완료').length}
            </div>
            <div className='text-sm text-white/60'>완료</div>
          </div>
          <div className='stitch-card p-4 text-center'>
            <div className='text-2xl font-bold text-orange-400'>15일</div>
            <div className='text-sm text-white/60'>평균 소요시간</div>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
