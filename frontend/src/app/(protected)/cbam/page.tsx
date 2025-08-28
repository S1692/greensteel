'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ProcessManager from '@/components/cbam/ProcessManager';
import CommonShell from '@/components/common/CommonShell';
import axiosClient from '@/lib/axiosClient';
import { Plus, Download, Upload, FileText, Settings, BarChart3, Calculator, Database, Globe, Truck, Factory, Package, GitBranch, Building2, Network, RefreshCcw, ChevronDown, ArrowUp, Trash2, X } from 'lucide-react';

// ============================================================================
// 🎯 CBAM 관리 페이지 - 탭 기반 구조
// ============================================================================

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'install' | 'boundary' | 'reports' | 'settings'
  >('overview');

  // 사업장 관리 관련 상태
  const [businessSiteName, setBusinessSiteName] = useState<string>('');
  const [reportingYear, setReportingYear] = useState<string>('2025');
  const [registeredSites, setRegisteredSites] = useState<Array<{ id: number; name: string; reportingYear: string }>>([
    { id: 11, name: '포항제철소', reportingYear: '2025' }
  ]);

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

  // 모달 상태
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

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
      setShowInstallModal(false); // 모달 닫기
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

  // 제품 추가 함수
  const handleAddProduct = useCallback(() => {
    if (productForm.name && productForm.period_start && productForm.period_end) {
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        ...productForm,
        created_at: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
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
      setToast({
        message: '제품이 성공적으로 추가되었습니다!',
        type: 'success'
      });
      setShowProductModal(false); // 모달 닫기
    } else {
      setToast({
        message: '필수 필드를 모두 입력해주세요.',
        type: 'error'
      });
    }
  }, [productForm, products]);

  // 제품 삭제 함수
  const handleDeleteProduct = useCallback((id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    setToast({
      message: '제품이 삭제되었습니다.',
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

  // CBAM 계산 함수 (모의)
  const handleCalculateCBAM = useCallback(() => {
    setToast({
      message: 'CBAM 계산이 완료되었습니다.',
      type: 'success'
    });
  }, []);

  // ============================================================================
  // 렌더링 함수들
  // ============================================================================

  const renderOverview = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 개요</h3>
        <p className='stitch-caption text-white/60'>
          탄소국경조정메커니즘(CBAM)은 EU가 수입되는 특정 상품의 탄소 배출량에
          대해 탄소 가격을 부과하는 제도입니다.
        </p>
        <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>적용 대상</h4>
            <p className='text-white/60 text-sm'>
              철강, 시멘트, 알루미늄, 비료, 전기, 수소 등
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>탄소 가격</h4>
            <p className='text-white/60 text-sm'>
              EU ETS 평균 가격 기준으로 계산
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>시행 일정</h4>
            <p className='text-white/60 text-sm'>2023년 10월부터 단계적 시행</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstall = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>
          CBAM 사업장 관리
        </h3>
        <p className='stitch-caption text-white/60'>
          CBAM 적용 대상 사업장 정보를 생성하고 관리합니다.
        </p>
        
        {/* 사업장 생성 카드 */}
        <div className='mt-6 bg-white/5 rounded-lg p-6 border border-white/10'>
          <h4 className='font-semibold text-white mb-4 flex items-center gap-2'>
            🏭 사업장 생성
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                사업장명 *
              </label>
              <input
                type="text"
                placeholder="예: 포항제철소"
                value={businessSiteName}
                onChange={(e) => setBusinessSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                보고기간 *
              </label>
              <input
                type="number"
                placeholder="예: 2025"
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="2000"
                max="2100"
              />
            </div>
          </div>
          <div className='flex justify-end'>
            <button
              onClick={handleAddBusinessSite}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200'
            >
              🏭 사업장 생성
            </button>
          </div>
        </div>

        {/* 등록된 사업장 목록 */}
        <div className='mt-6 bg-white/5 rounded-lg p-6 border border-white/10'>
          <h4 className='font-semibold text-white mb-4 flex items-center gap-2'>
            📋 등록된 사업장 목록 ({registeredSites.length}개)
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {registeredSites.map((site) => (
              <div
                key={site.id}
                className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-200'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h5 className='text-white font-semibold text-lg'>{site.name}</h5>
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
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBoundary = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>
          CBAM 산정경계설정
        </h3>
        <p className='stitch-caption text-white/60'>
          CBAM 배출량 산정을 위한 경계를 설정하고 노드를 생성합니다.
        </p>
        <div className='mt-6'>
          <ProcessManager />
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 보고서</h3>
        <p className='stitch-caption text-white/60'>
          탄소국경조정메커니즘 관련 보고서를 생성하고 관리합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/40 text-sm'>
            보고서 기능은 개발 중입니다...
          </p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 설정</h3>
        <p className='stitch-caption text-white/60'>
          CBAM 관련 설정을 구성합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/40 text-sm'>설정 기능은 개발 중입니다...</p>
        </div>
      </div>
    </div>
  );

  return (
    <CommonShell>
      <div className='space-y-6'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>CBAM 관리</h1>
          <p className='stitch-caption'>
            탄소국경조정메커니즘(CBAM) 프로세스 및 계산 관리
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className='flex space-x-1 p-1 bg-white/5 rounded-lg'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'install'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            사업장관리
          </button>
          <button
            onClick={() => setActiveTab('boundary')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'boundary'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            산정경계설정
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            보고서
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            설정
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'install' && renderInstall()}
        {activeTab === 'boundary' && renderBoundary()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* 토스트 메시지 */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </CommonShell>
  );
}
