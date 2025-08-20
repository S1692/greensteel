import React from 'react';
import { Button } from '@/components/ui/Button';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: '진행 중' | '완료';
    createdAt: string;
    updatedAt: string;
  };
  onClick: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
}) => {
  return (
    <div className='bg-white/5 border border-white/10 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow min-w-[300px] lg:min-w-0'>
      <div className='flex items-start justify-between mb-3'>
        <h3 className='text-lg font-semibold text-white'>{project.name}</h3>
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
        onClick={() => onClick(project.id)}
        variant='outline'
        className='w-full'
      >
        열기
      </Button>
    </div>
  );
};
