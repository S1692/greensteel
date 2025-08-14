'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

interface CommonShellProps {
  children: React.ReactNode;
}

const CommonShell: React.FC<CommonShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: '홈', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'LCA', href: '/lca', current: pathname.startsWith('/lca') },
    { name: 'CBAM', href: '/cbam', current: pathname.startsWith('/cbam') },
    { name: '데이터 업로드', href: '/data-upload', current: pathname === '/data-upload' },
    { name: '설정', href: '/settings', current: pathname === '/settings' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-ecotrace-background text-ecotrace-text">
      {/* 헤더 */}
      <header className="border-b border-ecotrace-border bg-ecotrace-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 및 브랜드 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-ecotrace-accent to-ecotrace-accent/70 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  {env.NEXT_PUBLIC_APP_NAME}
                </span>
                <span className="text-xs text-ecotrace-textSecondary">ESG Platform</span>
              </div>
            </div>

            {/* 네비게이션 - 항상 표시 */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer',
                    item.current
                      ? 'text-ecotrace-text bg-ecotrace-secondary/20 border border-ecotrace-accent/30'
                      : 'text-ecotrace-textSecondary hover:text-ecotrace-text hover:bg-ecotrace-secondary/10'
                  )}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* 우측 액션 */}
            <div className="flex items-center gap-4">
              {/* 개발 중이므로 아무것도 표시하지 않음 */}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default CommonShell;
