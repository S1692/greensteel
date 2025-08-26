'use client';

import React from 'react';
import LcaTableView from './LcaTableView';
import { LCA_ENDPOINTS, LcaTabKey, ManageSegment } from '@/lib';

interface LcaDataPanelsProps {
  activeTab: LcaTabKey | 'manage';
  activeSegment?: ManageSegment;
}

const LcaDataPanels: React.FC<LcaDataPanelsProps> = ({ activeTab, activeSegment }) => {
  if (activeTab === 'manage') {
    if (!activeSegment) return null;
    
    return (
      <div className="space-y-6">
        <LcaTableView
          endpoint={LCA_ENDPOINTS.manage(activeSegment)}
        />
      </div>
    );
  }

  const endpoint = LCA_ENDPOINTS[activeTab as LcaTabKey];
  
  return (
    <div className="space-y-6">
      <LcaTableView endpoint={endpoint} />
    </div>
  );
};

export default LcaDataPanels;
