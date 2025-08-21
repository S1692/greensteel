'use client';

import { ReactNode } from 'react';
import LcaSidebar from './LcaSidebar';

interface LcaLayoutProps {
  children: ReactNode;
}

export default function LcaLayout({ children }: LcaLayoutProps) {
  return (
    <div className="min-h-screen bg-ecotrace-background text-ecotrace-text">
      {/* 상단 네비게이션 바 - CommonShell과 동일한 스타일 */}
      <header className="border-b border-ecotrace-border bg-ecotrace-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 및 브랜드 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-ecotrace-accent to-ecotrace-accent/70 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">GreenSteel</span>
                <span className="text-xs text-ecotrace-textSecondary">ESG Platform</span>
              </div>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-6">
              <a 
                href="/dashboard" 
                className="text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-ecotrace-textSecondary hover:text-ecotrace-text hover:bg-ecotrace-secondary/10"
              >
                홈
              </a>
              <a 
                href="/cbam" 
                className="text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-ecotrace-textSecondary hover:text-ecotrace-text hover:bg-ecotrace-secondary/10"
              >
                CBAM
              </a>
              <a 
                href="/data-upload" 
                className="text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-ecotrace-textSecondary hover:text-ecotrace-text hover:bg-ecotrace-secondary/10"
              >
                데이터 업로드
              </a>
              <a 
                href="/settings" 
                className="text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-ecotrace-textSecondary hover:text-ecotrace-text hover:bg-ecotrace-secondary/10"
              >
                설정
              </a>
            </nav>

            {/* 우측 액션 */}
            <div className="flex items-center gap-4">
              {/* 알림 */}
              <button className="p-2 rounded-lg hover:bg-ecotrace-secondary/10 relative">
                <svg className="w-5 h-5 text-ecotrace-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M15 11h.01M15 8h.01M15 5h.01M9 5h.01" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* 프로필 */}
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-ecotrace-secondary/10">
                <div className="w-8 h-8 bg-ecotrace-accent rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex">
        {/* 좌측 사이드바 */}
        <LcaSidebar />
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 lg:ml-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
