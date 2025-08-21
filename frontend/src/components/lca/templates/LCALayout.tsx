'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LCASidebar } from '../organisms/LCASidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LCALayoutProps {
  children: React.ReactNode;
  isMainPage?: boolean;
}

export const LCALayout: React.FC<LCALayoutProps> = ({
  children,
  isMainPage = false,
}) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // LCA 폴더 아래의 페이지인지 확인 (대시보드 제외)
  const isLCAPage = pathname.startsWith('/lca') && !isMainPage;

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='min-h-screen bg-ecotrace-background text-ecotrace-text'>
      {/* LCA 사이드바 - LCA 페이지에서만 표시 (대시보드 제외) */}
      {isLCAPage && (
        <LCASidebar
          isMainPage={isMainPage}
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          onClose={handleSidebarClose}
        />
      )}

      {/* 메인 컨텐츠 - 사이드바가 있을 때만 여백 추가 */}
      <div className={isLCAPage && isMobile ? 'lg:ml-64' : ''}>
        <main className='min-h-screen'>{children}</main>
      </div>
    </div>
  );
};
