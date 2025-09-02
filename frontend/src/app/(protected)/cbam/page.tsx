'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import ProcessManager from '@/components/cbam/ProcessManager';
import CommonShell from '@/components/common/CommonShell';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
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
  const [products, setProducts] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 모달 상태
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedInstallForProducts, setSelectedInstallForProducts] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProcessFormForProduct, setShowProcessFormForProduct] = useState<number | null>(null);

  // 로딩 상태 표시
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 제품 폼 상태
  const [productForm, setProductForm] = useState({
    product_name: '',
    product_category: '단순제품',
    prostart_period: '',
    proend_period: '',
    product_amount: 0,
    product_cncode: '',
    goods_name: '',
    aggrgoods_name: '',
    product_sell: 0,
    product_eusell: 0
  });

  // 공정 폼 상태
  const [processForm, setProcessForm] = useState({
    process_name: ''
  });

  // 사업장 추가 함수
  const handleAddBusinessSite = useCallback(async () => {
    if (businessSiteName && reportingYear) {
              try {
          setIsSubmitting(true);
          
          const response = await axiosClient.post(apiEndpoints.cbam.install.create, {
            name: businessSiteName,
            reporting_year: parseInt(reportingYear)
          });
        
        console.log('✅ 사업장 생성 성공:', response.data);
        
        // 새로 생성된 사업장을 목록에 추가
        setRegisteredSites(prev => [...prev, response.data]);
        setBusinessSiteName(''); // 입력 필드 초기화
        setToast({
          message: '사업장이 성공적으로 생성되었습니다!',
          type: 'success'
        });
        setShowInstallModal(false); // 모달 닫기
      } catch (error: any) {
        console.error('❌ 사업장 생성 실패:', error);
        setToast({
          message: `사업장 생성에 실패했습니다: ${error.response?.data?.detail || error.message}`,
          type: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setToast({
        message: '사업장명과 보고기간을 입력해주세요.',
        type: 'error'
      });
    }
  }, [businessSiteName, reportingYear]);

  // 사업장 삭제 함수
  const handleDeleteBusinessSite = useCallback(async (id: number) => {
    if (!confirm('정말로 이 사업장을 삭제하시겠습니까?')) {
      return;
    }
    
          try {
        setIsSubmitting(true);
        
        await axiosClient.delete(apiEndpoints.cbam.install.delete(id));
      
      console.log('✅ 사업장 삭제 성공:', id);
      
      // 로컬 상태에서 제거
      setRegisteredSites(prev => prev.filter(site => site.id !== id));
      setToast({
        message: '사업장이 삭제되었습니다.',
        type: 'info'
      });
    } catch (error: any) {
      console.error('❌ 사업장 삭제 실패:', error);
      setToast({
        message: `사업장 삭제에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
          } finally {
        setIsSubmitting(false);
      }
    }, []);
    
    // 제품 관리 모달 열기
    const handleOpenProductModal = useCallback((install: any) => {
    setSelectedInstallForProducts(install);
    setShowProductModal(true);
    // 해당 사업장의 제품과 공정 목록 불러오기
    fetchProductsByInstall(install.id);
    fetchProcessesByInstall(install.id);
  }, []);

  // 사업장별 제품 목록 조회
  const fetchProductsByInstall = useCallback(async (installId: number) => {
    try {
      setLoading(true);
      
      // 해당 사업장의 제품 목록 조회
      const response = await axiosClient.get(apiEndpoints.cbam.product.list, {
        params: { install_id: installId }
      });
      
      console.log('✅ 제품 목록 조회 성공:', response.data);
      setProducts(response.data);
    } catch (error: any) {
      console.error('❌ 제품 목록 조회 실패:', error);
      setToast({
        message: `제품 목록 조회에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사업장별 공정 목록 조회
  const fetchProcessesByInstall = useCallback(async (installId: number) => {
    try {
      setLoading(true);
      
      // 해당 사업장의 공정 목록 조회
      const response = await axiosClient.get(apiEndpoints.cbam.process.list, {
        params: { install_id: installId }
      });
      
      console.log('✅ 공정 목록 조회 성공:', response.data);
      setProcesses(response.data);
    } catch (error: any) {
      console.error('❌ 공정 목록 조회 실패:', error);
      setToast({
        message: `공정 목록 조회에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 사업장 목록 로딩
  const fetchInstalls = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axiosClient.get(apiEndpoints.cbam.install.list);
      
      console.log('✅ 사업장 목록 조회 성공:', response.data);
      setRegisteredSites(response.data.map((install: any) => ({
        id: install.id,
        name: install.name,
        reportingYear: install.reporting_year ? install.reporting_year.toString() : 'N/A'
      })));
    } catch (error: any) {
      console.error('❌ 사업장 목록 조회 실패:', error);
      setToast({
        message: `사업장 목록 조회에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 제품 입력 변경 핸들러
  const handleProductInputChange = (field: string, value: string | number) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    fetchInstalls();
  }, [fetchInstalls]);

  // 공정 입력 변경 핸들러
  const handleProcessInputChange = (field: string, value: string) => {
    setProcessForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 제품 추가 함수
  const handleAddProduct = useCallback(async () => {
    if (!productForm.product_name || !productForm.prostart_period || !productForm.proend_period) {
      setToast({
        message: '필수 필드를 모두 입력해주세요.',
        type: 'error'
      });
      return;
    }

    try {
      // API로 제품 생성
      const response = await axiosClient.post(apiEndpoints.cbam.product.create, {
        install_id: selectedInstallForProducts?.id,
        ...productForm
      });
      
      console.log('✅ 제품 생성 성공:', response.data);
      
      // 새로 생성된 제품을 목록에 추가
      setProducts(prev => [...prev, response.data]);
      
      setToast({
        message: '제품이 성공적으로 생성되었습니다.',
        type: 'success'
      });

      // 폼 초기화
      setProductForm({
        product_name: '',
        product_category: '단순제품',
        prostart_period: '',
        proend_period: '',
        product_amount: 0,
        product_cncode: '',
        goods_name: '',
        aggrgoods_name: '',
        product_sell: 0,
        product_eusell: 0
      });
      setShowProductForm(false);
    } catch (error: any) {
      console.error('❌ 제품 생성 실패:', error);
      setToast({
        message: `제품 생성에 실패했습니다: ${error.message}`,
        type: 'error'
      });
    }
  }, [productForm, selectedInstallForProducts, products]);

  // 공정 추가 함수
  const handleAddProcess = useCallback(async (productId: number) => {
    if (!processForm.process_name) {
      setToast({
        message: '공정명을 입력해주세요.',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // API로 공정 생성
      const response = await axiosClient.post(apiEndpoints.cbam.process.create, {
        product_id: productId,
        process_name: processForm.process_name,
        start_period: new Date().toISOString().split('T')[0],
        end_period: new Date().toISOString().split('T')[0]
      });
      
      console.log('✅ 공정 생성 성공:', response.data);
      
      // 새로 생성된 공정을 목록에 추가
      setProcesses(prev => [...prev, response.data]);
      
      setToast({
        message: '공정이 성공적으로 생성되었습니다.',
        type: 'success'
      });

      // 폼 초기화
      setProcessForm({
        process_name: ''
      });
      setShowProcessFormForProduct(null);
    } catch (error: any) {
      console.error('❌ 공정 생성 실패:', error);
      setToast({
        message: `공정 생성에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [processForm]);

  // 제품 삭제 함수
  const handleDeleteProduct = useCallback(async (productId: number, productName: string) => {
    if (!confirm(`"${productName}" 제품을 삭제하시겠습니까?\n\n⚠️ 주의: 이 제품과 연결된 모든 공정이 함께 삭제됩니다.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // API로 제품 삭제
      await axiosClient.delete(apiEndpoints.cbam.product.delete(productId));
      
      console.log('✅ 제품 삭제 성공:', productId);
      
      // 로컬 상태에서 제품 삭제
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      // 연결된 공정도 삭제
      setProcesses(prev => prev.filter(p => !p.products?.some((prod: any) => prod.id === productId)));
      
      setToast({
        message: `"${productName}" 제품이 성공적으로 삭제되었습니다.`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('❌ 제품 삭제 실패:', error);
      setToast({
        message: `제품 삭제에 실패했습니다: ${error.message}`,
        type: 'error'
      });
    }
  }, []);

  // 공정 삭제 함수
  const handleDeleteProcess = useCallback(async (processId: number, processName: string) => {
    if (!confirm(`"${processName}" 공정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // API로 공정 삭제
      await axiosClient.delete(apiEndpoints.cbam.process.delete(processId));
      
      console.log('✅ 공정 삭제 성공:', processId);
      
      // 로컬 상태에서 공정 삭제
      setProcesses(prev => prev.filter(p => p.id !== processId));
      
      setToast({
        message: `"${processName}" 공정이 성공적으로 삭제되었습니다.`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('❌ 공정 삭제 실패:', error);
      setToast({
        message: `공정 삭제에 실패했습니다: ${error.response?.data?.detail || error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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
                      onClick={() => handleOpenProductModal(site)}
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
             <div className='space-y-6 max-w-[90%] mx-auto'>
         {/* 페이지 헤더 */}
         <div className='flex flex-col gap-3 pt-6'>
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

      {/* 제품 관리 모달 */}
      {showProductModal && selectedInstallForProducts && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                📦 제품 관리 - {selectedInstallForProducts.name}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 제품 생성 폼 */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-white">📦 제품 생성</h4>
                  <button
                    onClick={() => setShowProductForm(!showProductForm)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    {showProductForm ? '취소' : '제품 추가'}
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">제품명 *</label>
                        <input
                          type="text"
                          value={productForm.product_name}
                          onChange={(e) => handleProductInputChange('product_name', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="예: 철강, 알루미늄"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">제품 카테고리</label>
                        <select
                          value={productForm.product_category}
                          onChange={(e) => handleProductInputChange('product_category', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="단순제품">단순제품</option>
                          <option value="복합제품">복합제품</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">기간 시작일 *</label>
                        <input
                          type="date"
                          value={productForm.prostart_period}
                          onChange={(e) => handleProductInputChange('prostart_period', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">기간 종료일 *</label>
                        <input
                          type="date"
                          value={productForm.proend_period}
                          onChange={(e) => handleProductInputChange('proend_period', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 text-sm"
                    >
                      📦 제품 생성
                    </button>
                  </form>
                )}
              </div>

              {/* 제품 목록 */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-md font-semibold text-white mb-4">
                  📋 등록된 제품 목록 ({products.length}개)
                </h4>

                {products.length === 0 ? (
                  <p className="text-gray-300 text-center py-4">등록된 제품이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => {
                      // 다대다 관계에 맞게 제품과 연결된 공정들 필터링
                      const productProcesses = processes.filter((process: any) =>
                        process.products && process.products.some((p: any) => p.id === product.id)
                      );
                      const isShowingProcessForm = showProcessFormForProduct === product.id;

                      return (
                        <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-semibold text-md">{product.product_name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.product_category === '단순제품' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {product.product_category}
                            </span>
                          </div>

                          <div className="space-y-1 mb-3">
                            <p className="text-gray-300 text-xs">기간: {product.prostart_period} ~ {product.proend_period}</p>
                            <p className="text-gray-300 text-xs">수량: {product.product_amount.toLocaleString()}</p>
                            <p className="text-gray-300 text-xs">공정 수: {productProcesses.length}개</p>
                          </div>

                          {/* 공정 목록 */}
                          {productProcesses.length > 0 && (
                            <div className="mb-3 p-2 bg-white/5 rounded-lg">
                              <h6 className="text-xs font-medium text-white mb-2">📋 등록된 공정:</h6>
                              <div className="space-y-1">
                                {productProcesses.map((process) => (
                                  <div key={process.id} className="flex justify-between items-center p-1 bg-white/5 rounded text-xs">
                                    <span className="text-gray-300">{process.process_name}</span>
                                    <button
                                      onClick={() => handleDeleteProcess(process.id, process.process_name)}
                                      className="px-1 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 공정 추가 폼 */}
                          {isShowingProcessForm && (
                            <div className="mb-3 p-3 bg-white/5 rounded-lg border border-purple-500/30">
                              <h6 className="text-xs font-medium text-white mb-2">🔄 공정 추가</h6>
                              <form onSubmit={(e) => { e.preventDefault(); handleAddProcess(product.id); }} className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">공정명 *</label>
                                  <input
                                    type="text"
                                    value={processForm.process_name}
                                    onChange={(e) => handleProcessInputChange('process_name', e.target.value)}
                                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                                    placeholder="예: 압연, 용해, 주조"
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="submit"
                                    className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                                  >
                                    🔄 공정 생성
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowProcessFormForProduct(null)}
                                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                                  >
                                    취소
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowProcessFormForProduct(isShowingProcessForm ? null : product.id)}
                              className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                            >
                              {isShowingProcessForm ? '공정 추가 취소' : '공정 추가'}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.product_name)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </CommonShell>
  );
}
