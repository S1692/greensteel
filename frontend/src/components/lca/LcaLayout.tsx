'use client';

import { ReactNode } from 'react';
import LcaSidebar from './LcaSidebar';

interface LcaLayoutProps {
  children: ReactNode;
}

export default function LcaLayout({ children }: LcaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 바 */}
      <header className="bg-card border-b border-border/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">GreenSteel LCA</h1>
            <div className="h-6 w-px bg-border/30" />
            <nav className="flex items-center space-x-4">
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                대시보드
              </a>
              <a href="/cbam" className="text-muted-foreground hover:text-foreground transition-colors">
                CBAM
              </a>
              <a href="/data-upload" className="text-muted-foreground hover:text-foreground transition-colors">
                데이터 업로드
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              알림
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              프로필
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex">
        {/* 좌측 사이드바 */}
        <LcaSidebar />
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
