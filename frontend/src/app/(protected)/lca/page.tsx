'use client';

import React from 'react';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
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
    <ProjectLayout
      title='LCA 관리'
      description='생명주기 평가 시스템'
      isMainPage={true}
    >
      <div className='space-y-6'>
        {/* 새 프로젝트 시작 버튼 */}
        <div className='stitch-card p-6'>
          <div className='text-center'>
            <Button
              onClick={handleCreateNewProject}
              className='stitch-button-primary text-lg px-8 py-4'
            >
              <Plus className='h-6 w-6 mr-2' />새 프로젝트 시작
            </Button>
            <p className='stitch-caption mt-3'>
              새로운 LCA 프로젝트를 생성하여 생명주기 환경영향을 분석하세요
            </p>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className='space-y-4'>
          <h2 className='stitch-h2 text-xl font-semibold'>프로젝트 목록</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {mockProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        </div>

        {/* LCA 개요 정보 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='stitch-card p-4'>
            <div className='flex items-center gap-3'>
              <BarChart3 className='h-8 w-8 text-blue-400' />
              <div>
                <h3 className='font-semibold text-white'>총 프로젝트</h3>
                <p className='text-2xl font-bold text-blue-400'>
                  {mockProjects.length}
                </p>
              </div>
            </div>
          </div>

          <div className='stitch-card p-4'>
            <div className='flex items-center gap-3'>
              <TrendingUp className='h-8 w-8 text-green-400' />
              <div>
                <h3 className='font-semibold text-white'>진행 중</h3>
                <p className='text-2xl font-bold text-green-400'>
                  {mockProjects.filter(p => p.status === '진행 중').length}
                </p>
              </div>
            </div>
          </div>

          <div className='stitch-card p-4'>
            <div className='flex items-center gap-3'>
              <CheckCircle className='h-8 w-8 text-purple-400' />
              <div>
                <h3 className='font-semibold text-white'>완료</h3>
                <p className='text-2xl font-bold text-purple-400'>
                  {mockProjects.filter(p => p.status === '완료').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
