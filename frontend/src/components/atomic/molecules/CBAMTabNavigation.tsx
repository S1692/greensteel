import React from 'react';
import { CBAMTabButton } from '../atoms/CBAMTabButton';

interface CBAMTabNavigationProps {
  activeTab: 'overview' | 'install' | 'boundary';
  onTabChange: (tab: 'overview' | 'install' | 'boundary') => void;
}

export const CBAMTabNavigation: React.FC<CBAMTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'overview' as const, label: '개요' },
    { id: 'install' as const, label: '사업장관리' },
    { id: 'boundary' as const, label: '산정경계설정' }
  ];

  return (
    <div className="bg-ecotrace-surface border-b border-ecotrace-border shadow-sm">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <CBAMTabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </CBAMTabButton>
        ))}
      </nav>
    </div>
  );
};
