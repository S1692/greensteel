'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';

// Mock 데이터 (실제로는 별도 파일로 분리할 수 있음)
const mockProjects = [
  {
    id: 'proj-1',
    name: '고강도 강판 LCA',
    description: '고강도 강판 제조 공정의 환경 영향 평가',
    status: '진행 중',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'proj-2',
    name: '자동차용 냉간압연강판 LCA',
    description: '자동차용 냉간압연강판 생산의 환경 영향 분석',
    status: '완료',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
  },
  {
    id: 'proj-3',
    name: '건축용 H형강 LCA',
    description: '건축용 H형강 생산 및 사용의 환경 영향',
    status: '진행 중',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
  },
  {
    id: 'proj-4',
    name: '조선용 후판 LCA',
    description: '조선용 후판 제조 공정의 환경 영향 평가',
    status: '진행 중',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-17',
  },
  {
    id: 'proj-5',
    name: '전기강판 LCA',
    description: '전기강판 생산 공정의 환경 영향 분석',
    status: '완료',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-16',
  },
];

const LCAPage: React.FC = () => {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/lca/projects/${projectId}/scope`);
  };

  const handleNewProject = () => {
    const newProjectId = `proj-${Date.now()}`;
    router.push(`/lca/projects/${newProjectId}/scope`);
  };

  // 최신 프로젝트 가져오기 (updatedAt 기준)
  const latestProject = [...mockProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  return (
    <CommonShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>
            LCA (Life Cycle Assessment)
          </h1>
          <p className='stitch-caption'>진행 중인 LCA 프로젝트를 관리하세요</p>
        </div>

        {/* 프로젝트 통계 섹션 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4 flex items-center'>
            <span className='w-2 h-2 bg-primary rounded-full mr-3'></span>
            프로젝트 통계
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex justify-between items-center p-4 rounded-lg bg-white/5 border border-white/10'>
              <div>
                <span className='text-white/60 font-medium'>전체 프로젝트</span>
                <p className='text-xs text-white/40'>활성 프로젝트</p>
              </div>
              <span className='text-white font-bold text-2xl'>
                {mockProjects.length}개
              </span>
            </div>
            <div className='flex justify-between items-center p-4 rounded-lg bg-white/5 border border-white/10'>
              <div>
                <span className='text-white/60 font-medium'>진행 중</span>
                <p className='text-xs text-white/40'>작업 진행 중</p>
              </div>
              <span className='text-green-500 font-bold text-2xl'>
                {mockProjects.filter(p => p.status === '진행 중').length}개
              </span>
            </div>
            <div className='flex justify-between items-center p-4 rounded-lg bg-white/5 border border-white/10'>
              <div>
                <span className='text-white/60 font-medium'>완료</span>
                <p className='text-xs text-white/40'>분석 완료</p>
              </div>
              <span className='text-blue-500 font-bold text-2xl'>
                {mockProjects.filter(p => p.status === '완료').length}개
              </span>
            </div>
          </div>
        </div>

        {/* 최신 프로젝트 하이라이트 섹션 */}
        {latestProject && (
          <div className='stitch-card p-6'>
            <h2 className='stitch-h1 text-xl font-semibold mb-4 flex items-center'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-3'></span>
              최신 프로젝트
            </h2>
            <div className='bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    {latestProject.name}
                  </h3>
                  <p className='text-white/60 mb-3'>
                    {latestProject.description}
                  </p>
                  <div className='flex items-center gap-4 text-sm'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        latestProject.status === '진행 중'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {latestProject.status}
                    </span>
                    <span className='text-white/60'>
                      최종 업데이트:{' '}
                      {new Date(latestProject.updatedAt).toLocaleDateString(
                        'ko-KR'
                      )}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleProjectClick(latestProject.id)}
                  className='ml-4'
                >
                  프로젝트 보기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 프로젝트 목록 섹션 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>
            모든 프로젝트
          </h2>
          <div className='overflow-x-auto'>
            <div className='flex flex-nowrap gap-4 pb-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 lg:gap-6'>
              {mockProjects.map(project => (
                <div
                  key={project.id}
                  className='bg-white/5 border border-white/10 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow min-w-[300px] lg:min-w-0'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-white'>
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === '진행 중'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className='text-white/60 text-sm mb-4 line-clamp-2'>
                    {project.description}
                  </p>
                  <div className='text-xs text-white/40 mb-4'>
                    <div>생성일: {project.createdAt}</div>
                    <div>수정일: {project.updatedAt}</div>
                  </div>
                  <Button
                    onClick={() => handleProjectClick(project.id)}
                    variant='outline'
                    className='w-full'
                  >
                    열기
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 플로팅 액션 버튼 - 우측 하단 고정 */}
        <div className='fixed right-8 bottom-8 z-50'>
          <button
            onClick={handleNewProject}
            aria-label='새 프로젝트 시작하기'
            className='bg-primary text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
          </button>
        </div>
      </div>
    </CommonShell>
  );
};

export default LCAPage;
