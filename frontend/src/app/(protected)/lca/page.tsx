'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LCALayout } from '@/components/lca/templates/LCALayout';
import { ProjectCard } from '@/components/lca/atoms/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CommonShell from '@/components/CommonShell';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Database,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  lastModified: string;
  progress: number;
  owner: string;
  department: string;
}

const LCAMainPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      name: '철강 제품 LCA 분석',
      description: '고강도 철강 제품의 생명주기 환경영향 평가',
      status: 'completed',
      lastModified: '2024-01-15',
      progress: 100,
      owner: '김철수',
      department: '환경기술팀',
    },
    {
      id: '2',
      name: '알루미늄 합금 LCA',
      description: '경량화를 위한 알루미늄 합금 소재 평가',
      status: 'in-progress',
      lastModified: '2024-01-20',
      progress: 75,
      owner: '이영희',
      department: '소재개발팀',
    },
    {
      id: '3',
      name: '플라스틱 복합재 LCA',
      description: '자동차용 플라스틱 복합재 환경영향 분석',
      status: 'draft',
      lastModified: '2024-01-18',
      progress: 25,
      owner: '박민수',
      department: '자동차팀',
    },
  ];

  const handleProjectClick = (projectId: string) => {
    router.push('/lca/scope');
  };

  const handleCreateNewProject = () => {
    router.push('/lca/new-scope');
  };

  const handleQuickStart = (template: string) => {
    router.push('/lca/scope');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    draft: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    archived: 'bg-yellow-500',
  };

  const statusLabels = {
    draft: '초안',
    'in-progress': '진행중',
    completed: '완료',
    archived: '보관',
  };

  return (
    <LCALayout isMainPage={true}>
      <div className='p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                LCA 프로젝트 관리
              </h1>
              <p className='text-ecotrace-textSecondary'>
                생명주기 평가 프로젝트를 생성하고 관리하세요
              </p>
            </div>
            <Button
              onClick={handleCreateNewProject}
              size='lg'
              className='bg-ecotrace-accent hover:bg-ecotrace-accent/90 text-white'
            >
              <Plus className='w-5 h-5 mr-2' />새 프로젝트
            </Button>
          </div>

          {/* 통계 카드 */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-500/20 rounded-lg'>
                  <BarChart3 className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    전체 프로젝트
                  </p>
                  <p className='text-2xl font-bold text-white'>
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-500/20 rounded-lg'>
                  <CheckCircle className='w-5 h-5 text-green-400' />
                </div>
                <div>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    완료된 프로젝트
                  </p>
                  <p className='text-2xl font-bold text-white'>
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-500/20 rounded-lg'>
                  <TrendingUp className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    진행중인 프로젝트
                  </p>
                  <p className='text-2xl font-bold text-white'>
                    {projects.filter(p => p.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-yellow-500/20 rounded-lg'>
                  <Database className='w-5 h-5 text-yellow-400' />
                </div>
                <div>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    초안 프로젝트
                  </p>
                  <p className='text-2xl font-bold text-white'>
                    {projects.filter(p => p.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ecotrace-textSecondary' />
            <Input
              type='text'
              placeholder='프로젝트 검색...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 bg-ecotrace-secondary/20 border-ecotrace-border text-white placeholder-ecotrace-textSecondary'
            />
          </div>
          <div className='flex gap-2'>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className='px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-white'
            >
              <option value='all'>모든 상태</option>
              <option value='draft'>초안</option>
              <option value='in-progress'>진행중</option>
              <option value='completed'>완료</option>
              <option value='archived'>보관</option>
            </select>
            <Button
              variant='outline'
              size='md'
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className='border-ecotrace-border text-ecotrace-textSecondary hover:bg-ecotrace-secondary/20 min-w-[44px]'
            >
              {viewMode === 'grid' ? (
                <List className='w-5 h-5' />
              ) : (
                <Grid3X3 className='w-5 h-5' />
              )}
            </Button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg overflow-hidden'>
            <table className='w-full'>
              <thead className='bg-ecotrace-secondary/40'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider'>
                    프로젝트명
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider'>
                    상태
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider'>
                    진행률
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider'>
                    담당자
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-ecotrace-textSecondary uppercase tracking-wider'>
                    최종 수정일
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-ecotrace-border'>
                {filteredProjects.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className='hover:bg-ecotrace-secondary/10 cursor-pointer transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-white'>
                          {project.name}
                        </div>
                        <div className='text-sm text-ecotrace-textSecondary'>
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='w-16 bg-ecotrace-secondary rounded-full h-2'>
                          <div
                            className='bg-ecotrace-accent h-2 rounded-full'
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className='text-sm text-ecotrace-textSecondary'>
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-white'>{project.owner}</div>
                      <div className='text-sm text-ecotrace-textSecondary'>
                        {project.department}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-ecotrace-textSecondary'>
                      {project.lastModified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 빠른 시작 템플릿 */}
        <div className='mt-12'>
          <h2 className='text-2xl font-bold text-white mb-6'>
            빠른 시작 템플릿
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div
              className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6 hover:bg-ecotrace-secondary/30 transition-colors cursor-pointer'
              onClick={() => handleQuickStart('steel')}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-blue-500/20 rounded-lg'>
                  <BarChart3 className='w-6 h-6 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    철강 제품 LCA
                  </h3>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    철강 제품의 생명주기 평가
                  </p>
                </div>
              </div>
              <p className='text-ecotrace-textSecondary text-sm'>
                철강 제품의 원료 추출부터 제조, 사용, 폐기까지의 전체 환경영향을
                평가하는 템플릿입니다.
              </p>
            </div>

            <div
              className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6 hover:bg-ecotrace-secondary/30 transition-colors cursor-pointer'
              onClick={() => handleQuickStart('automotive')}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-green-500/20 rounded-lg'>
                  <TrendingUp className='w-6 h-6 text-green-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    자동차 부품 LCA
                  </h3>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    자동차 부품의 환경영향 평가
                  </p>
                </div>
              </div>
              <p className='text-ecotrace-textSecondary text-sm'>
                자동차 부품의 생산부터 사용, 폐기까지의 환경영향을 체계적으로
                분석하는 템플릿입니다.
              </p>
            </div>

            <div
              className='bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg p-6 hover:bg-ecotrace-secondary/30 transition-colors cursor-pointer'
              onClick={() => handleQuickStart('electronics')}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-purple-500/20 rounded-lg'>
                  <Database className='w-6 h-6 text-purple-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    전자제품 LCA
                  </h3>
                  <p className='text-sm text-ecotrace-textSecondary'>
                    전자제품의 환경영향 평가
                  </p>
                </div>
              </div>
              <p className='text-ecotrace-textSecondary text-sm'>
                전자제품의 설계부터 생산, 사용, 폐기까지의 환경영향을 종합적으로
                평가하는 템플릿입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LCALayout>
  );
};

export default LCAMainPage;
