'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileText,
  TrendingUp,
  Database,
  Zap,
  CheckCircle,
  FolderOpen,
  Settings,
  Download,
  Upload,
} from 'lucide-react';

interface LCASidebarProps {
  projectId?: string;
  isMainPage?: boolean;
  onClose?: () => void;
}

export const LCASidebar: React.FC<LCASidebarProps> = ({
  projectId,
  isMainPage = false,
  onClose,
}) => {
  const pathname = usePathname();

  const mainMenuItems = [
    {
      name: 'LCA 대시보드',
      href: '/lca',
      icon: BarChart3,
      description: 'LCA 프로젝트 개요 및 통계',
    },
    {
      name: '프로젝트 관리',
      href: '/lca/projects',
      icon: FolderOpen,
      description: 'LCA 프로젝트 생성 및 관리',
    },
    {
      name: 'LCA 설정',
      href: '/lca/settings',
      icon: Settings,
      description: 'LCA 관련 설정 및 구성',
    },
  ];

  const projectWorkflowItems = [
    {
      name: '프로젝트 스코프',
      href: `/lca/projects/${projectId}/scope`,
      icon: FileText,
      description: '프로젝트 목적과 분석 범위 정의',
    },
    {
      name: '생명주기 인벤토리',
      href: `/lca/projects/${projectId}/lci`,
      icon: Database,
      description: 'LCI 데이터 입력 및 관리',
    },
    {
      name: '생명주기 영향평가',
      href: `/lca/projects/${projectId}/lcia`,
      icon: Zap,
      description: 'LCIA 실행 및 결과 분석',
    },
    {
      name: '결과 해석',
      href: `/lca/projects/${projectId}/interpretation`,
      icon: TrendingUp,
      description: 'LCA 결과 해석 및 결론',
    },
    {
      name: '보고서 생성',
      href: `/lca/projects/${projectId}/report`,
      icon: CheckCircle,
      description: 'LCA 보고서 생성 및 관리',
    },
  ];

  const quickActionItems = [
    {
      name: '데이터 가져오기',
      href: '/lca/import',
      icon: Upload,
      description: '외부 데이터 가져오기',
    },
    {
      name: '템플릿 다운로드',
      href: '/lca/templates',
      icon: Download,
      description: 'LCA 템플릿 다운로드',
    },
  ];

  const renderNavigationItems = (
    items: typeof mainMenuItems,
    title: string
  ) => (
    <div>
      <h3 className='text-xs font-semibold text-white/60 uppercase tracking-wider mb-3'>
        {title}
      </h3>
      <ul className='space-y-1'>
        {items.map(item => {
          const isActive = pathname === item.href;
          const linkClassName = isActive
            ? 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary/20 text-primary border border-primary/30 transition-colors'
            : 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-white/60 hover:bg-white/5 hover:text-white transition-colors';

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={linkClassName}
                onClick={onClose}
              >
                <item.icon className='h-4 w-4' />
                <div className='flex-1'>
                  <div className='font-medium'>{item.name}</div>
                  <div className='text-xs text-white/40'>
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside className='h-full flex flex-col bg-white/5 border-r border-white/10'>
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-white mb-2'>LCA 관리</h2>
          <p className='text-xs text-white/60'>생명주기 평가 시스템</p>
        </div>

        <nav className='space-y-6'>
          {/* 메인 메뉴 */}
          {renderNavigationItems(mainMenuItems, '메인 메뉴')}

          {/* 프로젝트 워크플로우 - 프로젝트 페이지에서만 표시 */}
          {!isMainPage && projectId && (
            <div>
              <h3 className='text-xs font-semibold text-white/60 uppercase tracking-wider mb-3'>
                프로젝트 워크플로우
              </h3>
              <ul className='space-y-1'>
                {projectWorkflowItems.map(item => {
                  const isActive = pathname === item.href;
                  const linkClassName = isActive
                    ? 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary/20 text-primary border border-primary/30 transition-colors'
                    : 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-white/60 hover:bg-white/5 hover:text-white transition-colors';

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={linkClassName}
                        onClick={onClose}
                      >
                        <item.icon className='h-4 w-4' />
                        <div className='flex-1'>
                          <div className='font-medium'>{item.name}</div>
                          <div className='text-xs text-white/40'>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* 빠른 액션 */}
          {renderNavigationItems(quickActionItems, '빠른 액션')}
        </nav>
      </div>
    </aside>
  );
};
