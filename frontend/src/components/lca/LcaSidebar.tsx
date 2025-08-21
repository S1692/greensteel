'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon, 
  CalculatorIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    name: '대시보드',
    href: '/lca',
    icon: HomeIcon,
  },
  {
    name: '목적 및 범위',
    href: '/lca/scope',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: '생명주기 인벤토리',
    href: '/lca/lci',
    icon: ChartBarIcon,
  },
  {
    name: '생명주기 영향평가',
    href: '/lca/lcia',
    icon: CalculatorIcon,
  },
  {
    name: '해석',
    href: '/lca/interpretation',
    icon: DocumentTextIcon,
  },
  {
    name: '보고서',
    href: '/lca/report',
    icon: DocumentTextIcon,
  },
  {
    name: '설정',
    href: '/lca/settings',
    icon: Cog6ToothIcon,
  },
];

export default function LcaSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border/30 h-screen flex-shrink-0">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground">LCA 모듈</h2>
          <p className="text-sm text-muted-foreground">생명주기 평가 도구</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
