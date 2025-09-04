'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CommonShell from '@/components/common/CommonShell';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
import { RefreshCw, Plus, ZoomIn, ZoomOut, Minus, Map } from 'lucide-react';

// 아토믹 컴포넌트들
import { CBAMTabNavigation } from '@/components/atomic/molecules/CBAMTabNavigation';
import { CBAMOverviewTab } from '@/components/atomic/organisms/CBAMOverviewTab';
import { CBAMInstallTab } from '@/components/atomic/organisms/CBAMInstallTab';

// CBAM 컴포넌트들
import ProcessManager from '@/components/cbam/ProcessManager';
import GasEmissionReport from '@/components/cbam/GasEmissionReport';

// 모달 컴포넌트들
import { InstallModal } from '@/components/cbam/modals/InstallModal';
import { ProductModal } from '@/components/cbam/modals/ProductModal';
import { ProcessModal } from '@/components/cbam/modals/ProcessModal';
import { MappingModal } from '@/components/cbam/modals/MappingModal';
import { CalculationModal } from '@/components/cbam/modals/CalculationModal';

// ============================================================================
// 🎯 CBAM 관리 페이지
// ============================================================================

function CBAMPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'install' | 'boundary' | 'reports' | 'settings'>('overview');

  // 모달 상태 관리
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  // 데이터 상태 관리
  const [installs, setInstalls] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [inputData, setInputData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 데이터 로딩 함수들
  const fetchInstalls = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.install.list);
      setInstalls(response.data || []);
    } catch (error) {
      console.error('사업장 목록 조회 실패:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.product.list);
      setProducts(response.data || []);
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    }
  }, []);

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.process.list);
      setProcesses(response.data || []);
    } catch (error) {
      console.error('공정 목록 조회 실패:', error);
    }
  }, []);

  const fetchMappings = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.cbam.mapping.list);
      setMappings(response.data || []);
    } catch (error) {
      console.error('매핑 목록 조회 실패:', error);
    }
  }, []);

  const fetchInputData = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.datagather.inputData);
      const data = response.data || [];
      setInputData(data);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('cbam_input_data', JSON.stringify(data));
      console.log('Input 데이터를 로컬 스토리지에 저장:', data.length, '개 항목');
    } catch (error) {
      console.error('Input 데이터 조회 실패:', error);
      // 로컬 스토리지에서 데이터 가져오기 시도
      try {
        const storedData = localStorage.getItem('cbam_input_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setInputData(parsedData);
          console.log('로컬 스토리지에서 Input 데이터 로드:', parsedData.length, '개 항목');
        }
      } catch (storageError) {
        console.error('로컬 스토리지 데이터 로드 실패:', storageError);
      }
    }
  }, []);

  // URL 쿼리 파라미터에서 탭 정보 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'overview' || tabParam === 'install' || tabParam === 'boundary' || tabParam === 'reports' || tabParam === 'settings')) {
      setActiveTab(tabParam as 'overview' | 'install' | 'boundary' | 'reports' | 'settings');
    }
  }, [searchParams]);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchInstalls();
    fetchProducts();
    fetchProcesses();
    fetchMappings();
    fetchInputData();
  }, [fetchInstalls, fetchProducts, fetchProcesses, fetchMappings, fetchInputData]);

  // ============================================================================
  // 🎯 탭 컴포넌트들
  // ============================================================================

  // 개요 탭
  const OverviewTab = () => (
    <CBAMOverviewTab
      installs={installs}
      products={products}
      processes={processes}
      mappings={mappings}
    />
  );

  // 사업장 관리 탭
  const InstallTab = () => (
    <CBAMInstallTab
      installs={installs}
      onShowInstallModal={() => setShowInstallModal(true)}
      onRefresh={fetchInstalls}
      inputData={inputData}
    />
  );

  // 산정경계 설정 탭
  const BoundaryTab = () => (
    <div className="w-full h-screen">
      <ProcessManager />
    </div>
  );

  // 보고서 탭
  const ReportsTab = () => (
    <div className="bg-ecotrace-surface rounded-lg p-6">
      <h3 className="text-xl font-semibold text-ecotrace-text mb-4">CBAM 보고서</h3>
      <p className="text-ecotrace-textSecondary">
        CBAM 관련 보고서 및 분석 결과를 확인할 수 있습니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-ecotrace-secondary/20 p-4 rounded-lg">
          <h4 className="font-medium text-ecotrace-text">탄소 배출량 보고서</h4>
          <p className="text-sm text-ecotrace-textSecondary mt-2">월별/연간 탄소 배출량 현황</p>
        </div>
        <div className="bg-ecotrace-secondary/20 p-4 rounded-lg">
          <h4 className="font-medium text-ecotrace-text">CBAM 신고서</h4>
          <p className="text-sm text-ecotrace-textSecondary mt-2">EU CBAM 신고 관련 서류</p>
        </div>
        <div className="bg-ecotrace-secondary/20 p-4 rounded-lg">
          <h4 className="font-medium text-ecotrace-text">데이터 분석 보고서</h4>
          <p className="text-sm text-ecotrace-textSecondary mt-2">투입물 및 공정 분석 결과</p>
        </div>
      </div>
    </div>
  );

  // 설정 탭
  const SettingsTab = () => (
    <div className="bg-ecotrace-surface rounded-lg p-6">
      <h3 className="text-xl font-semibold text-ecotrace-text mb-4">CBAM 설정</h3>
      <p className="text-ecotrace-textSecondary">
        CBAM 관련 설정을 구성합니다.
      </p>
      <div className="mt-4 p-4 bg-ecotrace-secondary/20 rounded-lg">
        <p className="text-ecotrace-textSecondary text-sm">설정 기능은 개발 중입니다...</p>
      </div>
    </div>
  );

  // ============================================================================
  // 🎯 렌더링
  // ============================================================================

  return (
    <CommonShell>
      <div className="min-h-screen bg-ecotrace-background">
        {/* 헤더 */}
        <div className="bg-ecotrace-surface border-b border-ecotrace-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-ecotrace-text">CBAM 관리</h1>
                  <p className="mt-2 text-ecotrace-textSecondary">
                    CBAM (Carbon Border Adjustment Mechanism) 데이터 관리 및 설정
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetchInstalls();
                    fetchProducts();
                    fetchProcesses();
                    fetchMappings();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-ecotrace-border rounded-lg shadow-sm text-sm font-medium text-ecotrace-text bg-ecotrace-surface hover:bg-ecotrace-secondary/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <CBAMTabNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            // URL 업데이트
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', tab);
            router.push(`/cbam?${params.toString()}`);
          }}
        />

        {/* 탭 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && <div className="py-8"><OverviewTab /></div>}
          {activeTab === 'install' && <div className="py-8"><InstallTab /></div>}
          {activeTab === 'boundary' && <BoundaryTab />}
          {activeTab === 'reports' && <div className="py-8"><GasEmissionReport /></div>}
          {activeTab === 'settings' && <div className="py-8"><SettingsTab /></div>}
        </div>
      </div>

      {/* 모달들 */}
      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
          onSuccess={() => {
            setShowInstallModal(false);
            fetchInstalls();
          }}
        />
      )}

      {showProductModal && (
        <ProductModal
          onClose={() => setShowProductModal(false)}
          onSuccess={() => {
            setShowProductModal(false);
            fetchProducts();
          }}
        />
      )}

      {showProcessModal && (
        <ProcessModal
          onClose={() => setShowProcessModal(false)}
          onSuccess={() => {
            setShowProcessModal(false);
            fetchProcesses();
          }}
        />
      )}

      {showMappingModal && (
        <MappingModal
          onClose={() => setShowMappingModal(false)}
          onSuccess={() => {
            setShowMappingModal(false);
            fetchMappings();
          }}
        />
      )}

      {showCalculationModal && (
        <CalculationModal
          onClose={() => setShowCalculationModal(false)}
          onSuccess={() => {
            setShowCalculationModal(false);
          }}
        />
      )}
    </CommonShell>
  );
}

export default function CBAMPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CBAMPageContent />
    </Suspense>
  );
}
