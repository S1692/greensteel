'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ReportPageTemplate from '@/components/templates/ReportPageTemplate';

const ProjectReportPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  // Mock report data
  const report = {
    productInfo: {
      name: '고강도 철강',
      type: '열간압연강재',
      specification: 'SS400',
      functionalUnit: '1톤',
      owner: '김철수 (환경기술팀)',
      period: '2024.01.01 - 2024.12.31',
    },
    methodTable: [
      {
        method: 'IPCC 2021 GWP',
        category: '기후변화',
        indicator: 'GWP100',
        unit: 'kg CO₂-eq',
      },
      {
        method: 'EF 3.1',
        category: '산성화',
        indicator: 'AP',
        unit: 'mol H+ eq',
      },
      {
        method: 'EF 3.1',
        category: '부영양화',
        indicator: 'EP',
        unit: 'kg PO4 eq',
      },
    ],
    lcaResults: [
      {
        category: '기후변화 (GWP100)',
        manufacturing: 1850.2,
        total: 1850.2,
        unit: 'kg CO₂-eq',
        manufacturingShare: 100,
        totalShare: 100,
      },
      {
        category: '산성화 (AP)',
        manufacturing: 12.4,
        total: 12.4,
        unit: 'mol H+ eq',
        manufacturingShare: 100,
        totalShare: 100,
      },
      {
        category: '부영양화 (EP)',
        manufacturing: 3.2,
        total: 3.2,
        unit: 'kg PO4 eq',
        manufacturingShare: 100,
        totalShare: 100,
      },
    ],
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'word') => {
    // TODO: Implement report generation
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`Generating ${format} report for project ${projectId}`);
    }
    alert(`${format.toUpperCase()} 보고서 생성 예정`);
  };

  const handleDownloadPDF = () => {
    alert('PDF 다운로드 예정');
  };

  const handleDownloadExcel = () => {
    alert('Excel 다운로드 예정');
  };

  return (
    <ReportPageTemplate
      projectId={projectId}
      productInfo={report.productInfo}
      methodTable={report.methodTable}
      lcaResults={report.lcaResults}
      onGenerateReport={handleGenerateReport}
      onDownloadPDF={handleDownloadPDF}
      onDownloadExcel={handleDownloadExcel}
    />
  );
};

export default ProjectReportPage;
