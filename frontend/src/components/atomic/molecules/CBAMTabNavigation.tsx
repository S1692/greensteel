import React from 'react';
import { BarChart3, Factory, Network, FileText, Settings, LucideIcon } from 'lucide-react';
import { CBAMTabButton } from '../atoms/CBAMTabButton';

interface CBAMTabNavigationProps {
  activeTab: 'overview' | 'install' | 'boundary' | 'reports' | 'settings';
  onTabChange: (tabId: 'overview' | 'install' | 'boundary' | 'reports' | 'settings') => void;
}

export const CBAMTabNavigation: React.FC<CBAMTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: Array<{
    id: 'overview' | 'install' | 'boundary' | 'reports' | 'settings';
    name: string;
    icon: LucideIcon;
  }> = [
    { id: 'overview', name: '개요', icon: BarChart3 },
    { id: 'install', name: '사업장', icon: Factory },
    { id: 'boundary', name: '경계설정', icon: Network },
    { id: 'reports', name: '보고서', icon: FileText },
    { id: 'settings', name: '설정', icon: Settings }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <CBAMTabButton
              key={tab.id}
              id={tab.id}
              name={tab.name}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={onTabChange}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};
