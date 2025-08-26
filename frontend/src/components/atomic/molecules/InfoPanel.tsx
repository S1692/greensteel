'use client';

import React from 'react';

interface InfoPanelProps {
  tab: 'base' | 'actual' | 'manage' | 'transport' | 'process';
}

const InfoPanel: React.FC<InfoPanelProps> = ({ tab }) => {
  const getGuidanceText = () => {
    switch (tab) {
      case 'manage':
        return [
          '분류 기준에 따른 데이터 조회 화면입니다.',
          '세부 수정은 별도 편집 페이지에서 수행하세요.'
        ];
      default:
        return [
          'LCA 확인 화면입니다.',
          '세부 수정은 별도 편집 페이지에서 수행하세요.'
        ];
    }
  };

  const guidanceText = getGuidanceText();

  return (
    <div className="w-80 bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">안내</h3>
      <div className="space-y-3">
        {guidanceText.map((text, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-sm font-medium text-blue-600 mt-0.5">
              {index + 1}.
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
