'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  FileText,
  Upload,
  Settings,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';

interface CommonShellProps {
  children: React.ReactNode;
}

const CommonShell: React.FC<CommonShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigation = [
    {
      name: '홈',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard',
      description: 'ESG 요약 및 최근 활동',
    },
    {
      name: 'LCA',
      href: '/lca',
      icon: BarChart3,
      current: pathname.startsWith('/lca'),
      description: '생명주기 평가 프로젝트 관리',
    },
    {
      name: 'CBAM',
      href: '/cbam',
      icon: FileText,
      current: pathname.startsWith('/cbam'),
      description: 'CBAM 보고서 및 계산',
    },
    {
      name: '데이터 업로드',
      href: '/data-upload',
      icon: Upload,
      current: pathname.startsWith('/data-upload'),
      description: 'ESG 데이터 업로드 및 관리',
    },
    {
      name: '설정',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings',
      description: '계정 및 환경설정',
    },
  ];

  // 하위 페이지 정의
  const subPages = {
    '/lca': [
      { name: '기준데이터', href: '/lca', description: 'LCA 기준 데이터 관리' },
      { name: '실적데이터', href: '/lca', description: 'LCA 실적 데이터 관리' },
      { name: '데이터관리', href: '/lca', description: 'LCA 데이터 분류 관리' },
      { name: '운송데이터', href: '/lca', description: 'LCA 운송 데이터 관리' },
      { name: '공정데이터', href: '/lca', description: 'LCA 공정 데이터 관리' },
    ],
    '/cbam': [
      { name: '개요', href: '/cbam', description: 'CBAM 개요 및 정보' },
      { name: '프로세스 관리', href: '/cbam', description: 'CBAM 프로세스 플로우' },
      { name: '계산', href: '/cbam', description: 'CBAM 계산 및 제품 관리' },
      { name: '보고서', href: '/cbam', description: 'CBAM 보고서 생성' },
      { name: '설정', href: '/cbam', description: 'CBAM 설정 관리' },
    ],
    '/data-upload': [
      { name: '실적정보(투입물)', href: '/data-upload/input', description: '실적정보(투입물) 업로드' },
      { name: '실적정보(산출물)', href: '/data-upload/output', description: '실적정보(산출물) 업로드' },
      { name: '운송 데이터', href: '/data-upload/transport', description: '운송 정보 업로드' },
      { name: '공정 데이터', href: '/data-upload/process', description: '공정 정보 업로드' },
      { name: '데이터 관리', href: '/data-upload/data-management', description: '데이터 통합 및 분류 관리' },
    ],
  };

  // 현재 페이지의 하위 페이지들 가져오기
  const getCurrentSubPages = () => {
    // 데이터 업로드 섹션의 모든 페이지에서 하위 페이지 표시
    if (pathname.startsWith('/data-upload')) {
      return subPages['/data-upload'];
    }
    // LCA 섹션의 모든 페이지에서 하위 페이지 표시
    if (pathname.startsWith('/lca')) {
      return subPages['/lca'];
    }
    // CBAM 섹션의 모든 페이지에서 하위 페이지 표시
    if (pathname.startsWith('/cbam')) {
      return subPages['/cbam'];
    }
    return null;
  };

  const currentSubPages = getCurrentSubPages();

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsSidebarOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // 모바일에서 사이드바 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isSidebarOpen && !target.closest('.sidebar')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className='min-h-screen bg-ecotrace-background text-ecotrace-text flex'>
      {/* 데스크톱 사이드바 */}
      <div className='hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 sidebar'>
        <div className='flex-1 flex flex-col min-h-0 bg-ecotrace-surface border-r border-ecotrace-border'>
          {/* 로고 및 브랜드 */}
          <div className='flex items-center h-16 px-4 border-b border-ecotrace-border flex-shrink-0'>
            <button
              onClick={handleGoHome}
              className='flex items-center space-x-2 text-xl font-bold text-ecotrace-accent hover:text-ecotrace-accent/80 transition-colors'
            >
              <div className='w-8 h-8 bg-ecotrace-accent rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>G</span>
              </div>
              <span>GreenSteel</span>
            </button>
          </div>

          {/* 사이드바 네비게이션 */}
          <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
            {navigation.map(item => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group',
                  item.current
                    ? 'bg-ecotrace-accent text-white'
                    : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5',
                    item.current
                      ? 'text-white'
                      : 'text-ecotrace-textSecondary group-hover:text-white'
                  )}
                />
                <div className='flex-1'>
                  <div className='font-medium'>{item.name}</div>
                  <div className='text-xs opacity-75'>{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          {/* 하위 페이지 네비게이션 - 하위 페이지가 있는 경우에만 표시 */}
          {currentSubPages && (
            <div className='border-t border-ecotrace-border pt-4 px-4 pb-4'>
              <h3 className='text-xs font-semibold text-ecotrace-textSecondary uppercase tracking-wider mb-3'>
                하위 페이지
              </h3>
              <nav className='space-y-1'>
                {currentSubPages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(page.href)}
                    className={cn(
                      'w-full text-left p-2 rounded-md transition-all duration-200 flex items-center gap-2 group text-sm',
                      pathname === page.href
                        ? 'bg-ecotrace-accent/20 text-ecotrace-accent border border-ecotrace-accent/30'
                        : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/30'
                    )}
                  >
                    <ChevronRight className='w-3 h-3' />
                    <div className='flex-1 text-left'>
                      <div className='font-medium'>{page.name}</div>
                      <div className='text-xs opacity-75'>{page.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* 사이드바 푸터 */}
          <div className='p-4 border-t border-ecotrace-border flex-shrink-0'>
            <div className='text-xs text-ecotrace-textSecondary text-center'>
              GreenSteel v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className='lg:pl-64 flex-1 flex flex-col'>
        {/* 상단 헤더 */}
        <header className='bg-ecotrace-surface border-b border-ecotrace-border flex-shrink-0'>
          <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='lg:hidden p-2 rounded-md text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50 transition-colors'
            >
              <Menu className='w-6 h-6' />
            </button>

            {/* 페이지 제목 */}
            <div className='flex-1 lg:flex-none'>
              <h1 className='text-lg font-semibold text-ecotrace-text'>
                {navigation.find(item => item.current)?.name || 'GreenSteel'}
              </h1>
            </div>

            {/* 사용자 프로필 */}
            <div className='relative'>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className='flex items-center space-x-2 p-2 rounded-lg text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50 transition-colors'
              >
                <User className='w-5 h-5' />
                <span className='hidden sm:block text-sm font-medium'>사용자</span>
              </button>

              {/* 프로필 드롭다운 */}
              {isProfileDropdownOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-ecotrace-surface border border-ecotrace-border rounded-lg shadow-lg z-50'>
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        // 로그아웃 로직
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50 transition-colors flex items-center gap-2'
                    >
                      <LogOut className='w-4 h-4' />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 - 전체 너비와 높이 사용 */}
        <main className='flex-1 min-w-0 overflow-auto'>
          {children}
        </main>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden' />
      )}

      {/* 모바일 사이드바 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-ecotrace-surface border-r border-ecotrace-border transform transition-transform duration-300 ease-in-out lg:hidden sidebar',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-ecotrace-border'>
          <button
            onClick={handleGoHome}
            className='flex items-center space-x-2 text-xl font-bold text-ecotrace-accent'
          >
            <div className='w-8 h-8 bg-ecotrace-accent rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>G</span>
            </div>
            <span>GreenSteel</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className='p-2 rounded-md text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {/* 모바일 네비게이션 */}
          <nav className='p-4 space-y-2'>
            {navigation.map(item => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group',
                  item.current
                    ? 'bg-ecotrace-accent text-white'
                    : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/50'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5',
                    item.current
                      ? 'text-white'
                      : 'text-ecotrace-textSecondary group-hover:text-white'
                  )}
                />
                <div className='flex-1'>
                  <div className='font-medium'>{item.name}</div>
                  <div className='text-xs opacity-75'>{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          {/* 모바일 하위 페이지 네비게이션 */}
          {currentSubPages && (
            <div className='border-t border-ecotrace-border pt-4 px-4 pb-4'>
              <h3 className='text-xs font-semibold text-ecotrace-textSecondary uppercase tracking-wider mb-3'>
                하위 페이지
              </h3>
              <nav className='space-y-1'>
                {currentSubPages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(page.href)}
                    className={cn(
                      'w-full text-left p-2 rounded-md transition-all duration-200 flex items-center gap-2 group text-sm',
                      pathname === page.href
                        ? 'bg-ecotrace-accent/20 text-ecotrace-accent border border-ecotrace-accent/30'
                        : 'text-ecotrace-textSecondary hover:text-white hover:bg-ecotrace-secondary/30'
                    )}
                  >
                    <ChevronRight className='w-3 h-3' />
                    <div className='flex-1 text-left'>
                      <div className='font-medium'>{page.name}</div>
                      <div className='text-xs opacity-75'>{page.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* 모바일 사이드바 푸터 */}
        <div className='p-4 border-t border-ecotrace-border flex-shrink-0'>
          <div className='text-xs text-ecotrace-textSecondary text-center'>
            GreenSteel v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonShell;
