'use client';

import React, { useState } from 'react';
import Tabs from '@/components/atomic/atoms/Tabs';
import { LcaTabKey, ManageSegment } from '@/lib';

interface LcaTabsNavProps {
  activeTab: LcaTabKey | 'manage';
  onTabChange: (tab: LcaTabKey | 'manage') => void;
  activeSegment?: ManageSegment;
  onSegmentChange?: (segment: ManageSegment) => void;
}

const LcaTabsNav: React.FC<LcaTabsNavProps> = ({ 
  activeTab, 
  onTabChange,
  activeSegment,
  onSegmentChange 
}) => {
  const mainTabs = [
    { key: 'actual', label: '실적데이터(투입물)' },
    { key: 'output', label: '실적데이터(산출물)' },
    { key: 'transport', label: '운송정보' },
    { key: 'process', label: '공정정보' },
    { key: 'manage', label: '데이터관리' },
  ];

  const manageSubTabs = [
    { key: 'mat', label: '원료별' },
    { key: 'util', label: '유틸리티별' },
    { key: 'waste', label: '폐기물별' },
    { key: 'source', label: '데이터 출처별' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* 메인 탭 */}
      <Tabs
        items={mainTabs}
        value={activeTab}
        onChange={onTabChange}
        variant="underline"
        className="mb-6"
      />

                                                       {/* 데이터관리 하위탭 */}
         {activeTab === 'manage' && activeSegment && onSegmentChange && (
           <div className="pt-2 mt-2">
             <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 분류</h3>
             <Tabs
               items={manageSubTabs}
               value={activeSegment}
               onChange={onSegmentChange}
               variant="pills"
               className="flex-wrap"
             />
           </div>
         )}
    </div>
  );
};

export default LcaTabsNav;
