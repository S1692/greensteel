'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Home, BarChart3, Settings, Upload } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/data-collection', label: '데이터 수집', icon: Upload },
    { href: '/dashboard', label: '대시보드', icon: BarChart3 },
    { href: '/lca', label: 'LCA', icon: Database },
    { href: '/cbam', label: 'CBAM', icon: Database },
    { href: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <nav className='bg-white shadow-lg border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* 로고 */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>GS</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>
                GreenSteel
              </span>
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className='hidden md:flex items-center space-x-8'>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className='md:hidden flex items-center'>
            <button className='text-gray-600 hover:text-gray-900 p-2'>
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
