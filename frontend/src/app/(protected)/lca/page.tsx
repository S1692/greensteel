'use client';

import React, { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';
import LcaTabsNav from '@/components/atomic/molecules/LcaTabsNav';
import LcaDataPanels from '@/components/atomic/organisms/LcaDataPanels';
import InfoPanel from '@/components/atomic/molecules/InfoPanel';
import { LcaTabKey, ManageSegment } from '@/lib/lcaEndpoints';

const LcaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LcaTabKey | 'manage'>('base');
  const [activeSegment, setActiveSegment] = useState<ManageSegment>('mat');

  const handleTabChange = (tab: LcaTabKey | 'manage') => {
    setActiveTab(tab);
    // 데이터관리 탭으로 변경 시 기본 세그먼트로 설정
    if (tab === 'manage') {
      setActiveSegment('mat');
    }
  };

  const handleSegmentChange = (segment: ManageSegment) => {
    setActiveSegment(segment);
  };

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8'>
        <div className='flex gap-4 lg:gap-6 xl:gap-8'>
          {/* 메인 컨텐츠 */}
          <div className='flex-1 min-w-0'>
            <LcaTabsNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeSegment={activeSegment}
              onSegmentChange={setActiveSegment}
            />
            <div className='mt-4 lg:mt-6 xl:mt-8'>
              <LcaDataPanels
                activeTab={activeTab}
                activeSegment={activeSegment}
              />
            </div>
          </div>

          {/* 우측 정보 패널 */}
          <div className='hidden xl:block'>
            <InfoPanel tab={activeTab} />
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default LcaPage;
