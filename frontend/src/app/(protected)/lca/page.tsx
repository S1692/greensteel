'use client';

import { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';
import LcaTabsNav from '@/components/atomic/molecules/LcaTabsNav';
import { LcaTabKey, ManageSegment } from '@/lib';

export default function LcaPage() {
  const [activeTab, setActiveTab] = useState<LcaTabKey | 'manage'>('base');
  const [activeSegment, setActiveSegment] = useState<ManageSegment>('mat');

  const handleTabChange = (tab: LcaTabKey | 'manage') => {
    setActiveTab(tab);
    if (tab !== 'manage') {
      setActiveSegment('mat');
    }
  };

  const handleSegmentChange = (segment: ManageSegment) => {
    setActiveSegment(segment);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'base':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ecotrace-text">기준데이터</h2>
            <p className="text-ecotrace-text-secondary">
              LCA 분석을 위한 기준 데이터를 관리합니다.
            </p>
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
              <p className="text-center text-ecotrace-text-secondary">
                기준데이터 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        );
      case 'actual':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ecotrace-text">실적데이터</h2>
            <p className="text-ecotrace-text-secondary">
              실제 운영 데이터를 입력하고 관리합니다.
            </p>
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
              <p className="text-center text-ecotrace-text-secondary">
                실적데이터 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        );
      case 'manage':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ecotrace-text">데이터관리</h2>
            <p className="text-ecotrace-text-secondary">
              데이터를 분류별로 체계적으로 관리합니다.
            </p>
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
              <p className="text-center text-ecotrace-text-secondary">
                데이터 분류 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        );
      case 'transport':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ecotrace-text">운송데이터</h2>
            <p className="text-ecotrace-text-secondary">
              운송 관련 데이터를 관리합니다.
            </p>
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
              <p className="text-center text-ecotrace-text-secondary">
                운송데이터 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        );
      case 'process':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ecotrace-text">공정데이터</h2>
            <p className="text-ecotrace-text-secondary">
              공정 관련 데이터를 관리합니다.
            </p>
            <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
              <p className="text-center text-ecotrace-text-secondary">
                공정데이터 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CommonShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ecotrace-text">LCA 관리</h1>
          <p className="text-ecotrace-text-secondary mt-2">
            생명주기 평가(Life Cycle Assessment) 데이터를 관리합니다.
          </p>
        </div>

        <LcaTabsNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
        />

        {renderTabContent()}
      </div>
    </CommonShell>
  );
}
