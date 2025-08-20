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
} from 'lucide-react';

interface LCASidebarProps {
  projectId: string;
  onClose?: () => void;
}

export const LCASidebar: React.FC<LCASidebarProps> = ({
  projectId,
  onClose,
}) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: '목적 및 범위',
      href: `/lca/projects/${projectId}/scope`,
      icon: FileText,
      description: '프로젝트 목적과 분석 범위 정의',
    },
    {
      name: 'LCI',
      href: `/lca/projects/${projectId}/lci`,
      icon: Database,
      description: '생명주기 인벤토리 데이터 입력',
    },
    {
      name: 'LCIA',
      href: `/lca/projects/${projectId}/lcia`,
      icon: Zap,
      description: '생명주기 영향평가 실행',
    },
    {
      name: '해석',
      href: `/lca/projects/${projectId}/interpretation`,
      icon: TrendingUp,
      description: '결과 해석 및 결론 도출',
    },
    {
      name: '보고서',
      href: `/lca/projects/${projectId}/report`,
      icon: CheckCircle,
      description: 'LCA 보고서 생성 및 관리',
    },
  ];

  return (
    <aside className='h-full flex flex-col bg-white/5 border-r border-white/10'>
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-white mb-2'>
            LCA 프로젝트
          </h2>
          <p className='text-xs text-white/60'>프로젝트 ID: {projectId}</p>
        </div>

        <nav className='space-y-6'>
          <div>
            <h3 className='text-xs font-semibold text-white/60 uppercase tracking-wider mb-3'>
              LCA 워크플로우
            </h3>
            <ul className='space-y-1'>
              {navigationItems.map(item => {
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
        </nav>
      </div>

      {/* 모바일에서 닫기 버튼 */}
      {onClose && (
        <div className='p-4 border-t border-white/10 md:hidden'>
          <button
            className='w-full rounded-lg bg-primary text-white py-2 font-medium hover:bg-primary/90 transition-colors'
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      )}
    </aside>
  );
};
