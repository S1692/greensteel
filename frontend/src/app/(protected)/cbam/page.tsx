'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CommonShell from '@/components/common/CommonShell';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
import { RefreshCw } from 'lucide-react';

// 아토믹 컴포넌트들
import { CBAMTabNavigation } from '@/components/atomic/molecules/CBAMTabNavigation';
import { CBAMOverviewTab } from '@/components/atomic/organisms/CBAMOverviewTab';
import { CBAMInstallTab } from '@/components/atomic/organisms/CBAMInstallTab';

// 모달 컴포넌트들
import { InstallModal } from '@/components/cbam/modals/InstallModal';
import { ProductModal } from '@/components/cbam/modals/ProductModal';
import { ProcessModal } from '@/components/cbam/modals/ProcessModal';
import { MappingModal } from '@/components/cbam/modals/MappingModal';
import { CalculationModal } from '@/components/cbam/modals/CalculationModal';
import { BoundaryModal } from '@/components/cbam/modals/BoundaryModal';

// ============================================================================
// 🎯 CBAM 관리 페이지
// ============================================================================

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'install' | 'boundary'>('overview');

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

  // 초기 데이터 로딩
  useEffect(() => {
    fetchInstalls();
    fetchProducts();
    fetchProcesses();
    fetchMappings();
  }, [fetchInstalls, fetchProducts, fetchProcesses, fetchMappings]);

  // ============================================================================
  // 🎯 탭 컴포넌트들
  // ============================================================================

  // 개요 탭 (기존 CBAMOverviewTab 사용)
  const OverviewTab = () => (
    <CBAMOverviewTab
      installs={installs}
      products={products}
      processes={processes}
      mappings={mappings}
      onShowInstallModal={() => setShowInstallModal(true)}
      onShowProductModal={() => setShowProductModal(true)}
      onShowProcessModal={() => setShowProcessModal(true)}
    />
  );

  // 사업장 관리 탭
  const InstallTab = () => (
    <CBAMInstallTab
      installs={installs}
      onShowInstallModal={() => setShowInstallModal(true)}
    />
  );

  // 산정경계 설정 탭 (기존 BoundaryModal을 탭으로 사용)
  const BoundaryTab = () => (
    <BoundaryModal onSuccess={() => {
      // 경계 설정이 성공하면 데이터 새로고침
      fetchInstalls();
      fetchProducts();
      fetchProcesses();
      fetchMappings();
    }} />
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
          onTabChange={setActiveTab}
        />

        {/* 탭 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'install' && <InstallTab />}
          {activeTab === 'boundary' && <BoundaryTab />}
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
