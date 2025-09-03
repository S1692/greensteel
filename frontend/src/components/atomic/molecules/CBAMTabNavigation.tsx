import React from 'react';
import { CBAMTabButton } from '../atoms/CBAMTabButton';

interface CBAMTabNavigationProps {
  activeTab: 'inputs' | 'workplace' | 'boundary' | 'report';
  onTabChange: (tab: 'inputs' | 'workplace' | 'boundary' | 'report') => void;
}

export const CBAMTabNavigation: React.FC<CBAMTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'inputs' as const, label: '투입물' },
    { id: 'workplace' as const, label: '사업장관리' },
    { id: 'boundary' as const, label: '산정경계설정' },
    { id: 'report' as const, label: '보고서' }
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
