'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LCASidebar } from '../organisms/LCASidebar';

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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='min-h-screen bg-ecotrace-background text-ecotrace-text'>
      {/* LCA 사이드바 */}
      <LCASidebar
        isMainPage={isMainPage}
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onClose={handleSidebarClose}
      />

      {/* 메인 컨텐츠 */}
      <div className='lg:ml-64'>
        <main className='min-h-screen'>{children}</main>
      </div>
    </div>
  );
};
