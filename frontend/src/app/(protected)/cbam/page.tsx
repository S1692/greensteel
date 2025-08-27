'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ProcessManager from '@/components/cbam/ProcessManager';
import CommonShell from '@/components/common/CommonShell';
import axiosClient from '@/lib/axiosClient';
import { Plus, Download, Upload, FileText, Settings, BarChart3, Calculator, Database, Globe, Truck, Factory, Package, GitBranch, Building2, Network, RefreshCcw, ChevronDown, ArrowUp, Trash2 } from 'lucide-react';

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'install' | 'flow' | 'reports' | 'settings'
  >('overview');

  // 사업장 관리 관련 상태
  const [businessSiteName, setBusinessSiteName] = useState<string>('');
  const [reportingYear, setReportingYear] = useState<string>('2025');
  const [registeredSites, setRegisteredSites] = useState<Array<{ id: number; name: string; reportingYear: string }>>([
    { id: 11, name: '포항제철소', reportingYear: '2025' } // 이미지에 보이는 예시 데이터
  ]);

  // CBAM 계산 관련 상태
  const [calculationData, setCalculationData] = useState({
    materialType: '',
    quantity: '',
    carbonIntensity: '',
    transportDistance: '',
    transportMode: 'sea',
    countryOfOrigin: '',
    euEtsPrice: '85.50'
  });

  const [calculationResult, setCalculationResult] = useState<{
    totalEmissions: number;
    cbamCharge: number;
    breakdown: {
      production: number;
      transport: number;
      total: number;
    };
  } | null>(null);

  // 제품 관리 관련 상태
  const [productForm, setProductForm] = useState({
    name: '',
    cn_code: '',
    period_start: '',
    period_end: '',
    production_qty: 0,
    sales_qty: 0,
    export_qty: 0,
    inventory_qty: 0,
    defect_rate: 0
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 사업장 추가 함수
  const handleAddBusinessSite = useCallback(() => {
    if (businessSiteName && reportingYear) {
      const newSite = {
        id: registeredSites.length > 0 ? Math.max(...registeredSites.map(site => site.id)) + 1 : 1,
        name: businessSiteName,
        reportingYear: reportingYear,
      };
      setRegisteredSites(prev => [...prev, newSite]);
      setBusinessSiteName(''); // 입력 필드 초기화
      setToast({
        message: '사업장이 성공적으로 생성되었습니다!',
        type: 'success'
      });
    } else {
      setToast({
        message: '사업장명과 보고기간을 입력해주세요.',
        type: 'error'
      });
    }
  }, [businessSiteName, reportingYear, registeredSites]);

  // 사업장 삭제 함수
  const handleDeleteBusinessSite = useCallback((id: number) => {
    setRegisteredSites(prev => prev.filter(site => site.id !== id));
    setToast({
      message: '사업장이 삭제되었습니다.',
      type: 'info'
    });
  }, []);

  // 제품 관리 페이지로 이동 (모의 함수)
  const handleManageProducts = useCallback((siteId: number) => {
    setToast({
      message: `사업장 ID ${siteId}의 제품 관리 페이지로 이동합니다.`,
      type: 'info'
    });
  }, []);

  // 전체 제품 관리 페이지로 이동 (모의 함수)
  const handleOverallProductManagement = useCallback(() => {
    setToast({
      message: '전체 제품 관리 페이지로 이동합니다.',
      type: 'info'
    });
  }, []);

  // 제품 불러오기
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get('/api/v1/boundary/product');
      setProducts(res.data.products || []);
    } catch {
      setProducts([
        { product_id: 'dummy-1', name: '테스트 제품 1', cn_code: '7208.51.00', production_qty: 1000, sales_qty: 800, export_qty: 200, inventory_qty: 150, defect_rate: 0.05, period_start: '2024-01-01', period_end: '2024-12-31' },
        { product_id: 'dummy-2', name: '테스트 제품 2', cn_code: '7208.52.00', production_qty: 2000, sales_qty: 1800, export_qty: 400, inventory_qty: 300, defect_rate: 0.03, period_start: '2024-01-01', period_end: '2024-12-31' },
        { product_id: 'dummy-3', name: '테스트 제품 3', cn_code: '7208.53.00', production_qty: 1500, sales_qty: 1200, export_qty: 300, inventory_qty: 200, defect_rate: 0.07, period_start: '2024-01-01', period_end: '2024-12-31' },
        { product_id: 'dummy-4', name: '고품질 철강 제품', cn_code: '7208.54.00', production_qty: 2500, sales_qty: 2200, export_qty: 500, inventory_qty: 400, defect_rate: 0.02, period_start: '2024-01-01', period_end: '2024-12-31' },
      ]);
    }
  }, []);

  // CBAM 계산 함수
  const calculateCBAM = () => {
    const quantity = parseFloat(calculationData.quantity) || 0;
    const carbonIntensity = parseFloat(calculationData.carbonIntensity) || 0;
    const transportDistance = parseFloat(calculationData.transportDistance) || 0;
    const euEtsPrice = parseFloat(calculationData.euEtsPrice) || 85.50;

    // 생산 과정 탄소 배출량
    const productionEmissions = quantity * carbonIntensity;

    // 운송 과정 탄소 배출량 (간단한 계산)
    let transportEmissions = 0;
    switch (calculationData.transportMode) {
      case 'sea':
        transportEmissions = quantity * 0.02 * (transportDistance / 1000); // 해운: 0.02 tCO2/t-km
        break;
      case 'rail':
        transportEmissions = quantity * 0.03 * (transportDistance / 1000); // 철도: 0.03 tCO2/t-km
        break;
      case 'road':
        transportEmissions = quantity * 0.08 * (transportDistance / 1000); // 도로: 0.08 tCO2/t-km
        break;
      case 'air':
        transportEmissions = quantity * 0.15 * (transportDistance / 1000); // 항공: 0.15 tCO2/t-km
        break;
    }

    const totalEmissions = productionEmissions + transportEmissions;
    const cbamCharge = totalEmissions * euEtsPrice;

    setCalculationResult({
      totalEmissions,
      cbamCharge,
      breakdown: {
        production: productionEmissions,
        transport: transportEmissions,
        total: totalEmissions
      }
    });
  };

  // 제품 입력 변경 핸들러
  const handleProductInputChange = (field: string, value: string | number) => {
    setProductForm((prev: typeof productForm) => ({
      ...prev,
      [field]: value
    }));
  };

  // 제품 제출 핸들러
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 실제 API 호출 대신 로컬 상태에 추가
      const newProduct = {
        product_id: `product-${Date.now()}`,
        ...productForm
      };
      
      setProducts(prev => [...prev, newProduct]);
      setToast({
        message: '제품이 성공적으로 생성되었습니다!',
        type: 'success'
      });

      // 폼 초기화
      setProductForm({
        name: '',
        cn_code: '',
        period_start: '',
        period_end: '',
        production_qty: 0,
        sales_qty: 0,
        export_qty: 0,
        inventory_qty: 0,
        defect_rate: 0
      });
    } catch (error) {
      console.error('제품 생성 실패:', error);
      setToast({
        message: `제품 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className='h-full space-y-6'>
      {/* CBAM 개요 카드 */}
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4'>CBAM 개요</h3>
        <p className='stitch-caption text-white/60 mb-6'>
          탄소국경조정메커니즘(CBAM)은 EU가 수입되는 특정 상품의 탄소 배출량에
          대해 탄소 가격을 부과하는 제도입니다.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-4 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3 mb-2'>
              <Factory className='w-5 h-5 text-blue-400' />
              <h4 className='font-semibold text-white text-sm'>적용 대상</h4>
            </div>
            <p className='text-white/60 text-xs'>
              철강, 시멘트, 알루미늄, 비료, 전기, 수소 등
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3 mb-2'>
              <Calculator className='w-5 h-5 text-green-400' />
              <h4 className='font-semibold text-white text-sm'>탄소 가격</h4>
            </div>
            <p className='text-white/60 text-xs'>
              EU ETS 평균 가격 기준으로 계산
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3 mb-2'>
              <Globe className='w-5 h-5 text-purple-400' />
              <h4 className='font-semibold text-white text-sm'>시행 일정</h4>
            </div>
            <p className='text-white/60 text-xs'>2023년 10월부터 단계적 시행</p>
          </div>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4'>주요 지표</h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30'>
            <div className='text-2xl font-bold text-blue-400 mb-1'>{registeredSites.length}</div>
            <div className='text-sm text-blue-300'>등록된 사업장</div>
          </div>
          <div className='p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-500/30'>
            <div className='text-2xl font-bold text-green-400 mb-1'>{products.length}</div>
            <div className='text-sm text-green-300'>등록된 제품</div>
          </div>
          <div className='p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30'>
            <div className='text-2xl font-bold text-purple-400 mb-1'>
              {products.reduce((sum, p) => sum + (p.production_qty || 0), 0).toLocaleString()}
            </div>
            <div className='text-sm text-purple-300'>총 생산량 (톤)</div>
          </div>
          <div className='p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-500/30'>
            <div className='text-2xl font-bold text-orange-400 mb-1'>
              {calculationResult ? calculationResult.cbamCharge.toFixed(2) : '0.00'}
            </div>
            <div className='text-sm text-orange-300'>CBAM 부과금 (€)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstall = () => (
    <div className='space-y-6'>
      {/* 사업장 생성 섹션 */}
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4 flex items-center gap-2'>
          <Building2 className='w-5 h-5 text-blue-400' />
          사업장 생성
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); handleAddBusinessSite(); }} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='businessSiteName' className='block text-sm font-medium text-white/80 mb-2'>
                사업장명 *
              </label>
              <input
                type='text'
                id='businessSiteName'
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='예: 포항제철소'
                value={businessSiteName}
                onChange={(e) => setBusinessSiteName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='reportingYear' className='block text-sm font-medium text-white/80 mb-2'>
                보고기간 *
              </label>
              <input
                type='number'
                id='reportingYear'
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='예: 2025'
                min='2000'
                max='2100'
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
                required
              />
            </div>
          </div>
          <div className='flex justify-end pt-6'>
            <button
              type='submit'
              className='px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              사업장 생성
            </button>
          </div>
        </form>
      </div>

      {/* 등록된 사업장 목록 섹션 */}
      <div className='stitch-card p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='stitch-h1 text-xl font-semibold flex items-center gap-2'>
            <FileText className='w-5 h-5 text-purple-400' />
            등록된 사업장 목록 ({registeredSites.length}개)
          </h3>
          <div className='flex gap-2'>
            <select className='px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
              <option value='name'>이름순</option>
              <option value='id'>ID순</option>
            </select>
            <button className='px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm hover:bg-white/20 transition-colors duration-200'>
              <ArrowUp className='w-4 h-4' />
            </button>
            <button className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2'>
              <RefreshCcw className='w-4 h-4' />
              새로고침
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {registeredSites.length === 0 ? (
            <p className='text-white/60 text-center col-span-full py-8'>등록된 사업장이 없습니다.</p>
          ) : (
            registeredSites.map(site => (
              <div key={site.id} className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-200'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='text-white font-semibold text-lg'>{site.name}</h4>
                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300'>
                    ID: {site.id}
                  </span>
                </div>
                <div className='space-y-1 mb-3'>
                  <p className='text-gray-300 text-sm'>보고기간: {site.reportingYear}년</p>
                </div>
                <div className='mt-3 pt-3 border-t border-white/10 flex gap-2'>
                  <button
                    onClick={() => handleManageProducts(site.id)}
                    className='flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200'
                  >
                    제품 관리
                  </button>
                  <button
                    onClick={() => handleDeleteBusinessSite(site.id)}
                    className='px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderFlow = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4 flex items-center gap-2'>
          <Network className='w-5 h-5 text-green-400' />
          CBAM 시설군 설정
        </h3>
        <p className='stitch-caption text-white/60 mb-6'>
          CBAM 배출량 산정을 위한 경계를 설정하고 노드를 생성합니다.
        </p>
        
        <div className='h-[700px] w-full border border-white/20 rounded-lg overflow-hidden'>
          <ReactFlowProvider>
            <ProcessManager />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4 flex items-center gap-2'>
          <FileText className='w-5 h-5 text-yellow-400' />
          CBAM 보고서
        </h3>
        <p className='stitch-caption text-white/60 mb-6'>
          CBAM 관련 보고서를 생성하고 관리합니다.
        </p>
        
        <div className='p-6 bg-white/5 rounded-lg border border-white/20'>
          <p className='text-white/60 text-sm'>보고서 기능은 개발 중입니다...</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-xl font-semibold mb-4 flex items-center gap-2'>
          <Settings className='w-5 h-5 text-gray-400' />
          CBAM 설정
        </h3>
        <p className='stitch-caption text-white/60 mb-6'>
          CBAM 관련 설정을 구성합니다.
        </p>
        
        <div className='p-6 bg-white/5 rounded-lg border border-white/20'>
          <p className='text-white/60 text-sm'>설정 기능은 개발 중입니다...</p>
        </div>
      </div>
    </div>
  );

  // 컴포넌트 마운트 시 제품 데이터 로드
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-6'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-2xl lg:text-3xl xl:text-4xl font-bold'>CBAM 관리</h1>
          <p className='stitch-caption text-white/60 text-sm lg:text-base'>
            탄소국경조정메커니즘(CBAM) 프로세스 및 계산 관리
          </p>
        </div>

        {/* 메인 탭 네비게이션 */}
        <div className='flex space-x-1 p-1 bg-white/5 rounded-lg overflow-x-auto'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className='w-4 h-4' />
            개요
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'install'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className='w-4 h-4' />
            사업장 관리
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'flow'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Network className='w-4 h-4' />
            시설군 설정
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className='w-4 h-4' />
            보고서
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className='w-4 h-4' />
            설정
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className='flex-1 min-h-0'>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'install' && renderInstall()}
          {activeTab === 'flow' && renderFlow()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white'
        }`}>
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className='ml-2 hover:opacity-80'
          >
            ✕
          </button>
        </div>
      )}
    </CommonShell>
  );
}
