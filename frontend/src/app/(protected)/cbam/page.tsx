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

// ============================================================================
// 🎯 CBAM 관리 페이지 - 아토믹 구조 적용
// ============================================================================

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'install' | 'boundary' | 'reports' | 'settings'
  >('overview');

  // 모달 상태 관리
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showBoundaryModal, setShowBoundaryModal] = useState(false);
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

  // 경계 설정 탭
  const BoundaryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">경계 설정</h2>
        <button
          onClick={() => setShowBoundaryModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <span>경계 설정</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">경계 설정이 필요합니다</p>
          <p className="text-sm">사업장과 공정 간의 연결을 설정하여 CBAM 계산을 위한 경계를 정의하세요.</p>
          <button
            onClick={() => setShowBoundaryModal(true)}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            경계 설정 시작
          </button>
        </div>
      </div>
    </div>
  );

  // 보고서 탭
  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">CBAM 보고서</h2>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <span>내보내기</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <span>계산 실행</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 배출량 요약 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">배출량 요약</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 배출량 (tCO2e)</span>
              <span className="text-sm font-medium text-gray-900">0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">직접 배출량</span>
              <span className="text-sm font-medium text-gray-900">0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">간접 배출량</span>
              <span className="text-sm font-medium text-gray-900">0.00</span>
            </div>
          </div>
        </div>

        {/* 제품별 배출량 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">제품별 배출량</h3>
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">제품 데이터가 없습니다</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 설정 탭
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">CBAM 설정</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 일반 설정 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">일반 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기본 보고 연도</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기본 통화</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="KRW">KRW (원)</option>
                <option value="USD">USD (달러)</option>
                <option value="EUR">EUR (유로)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 계산 설정 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">계산 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GWP 버전</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="AR6">AR6 (IPCC 6차 보고서)</option>
                <option value="AR5">AR5 (IPCC 5차 보고서)</option>
                <option value="AR4">AR4 (IPCC 4차 보고서)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정밀도</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="4">소수점 4자리</option>
                <option value="2">소수점 2자리</option>
                <option value="0">정수</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // 🎯 메인 렌더링
  // ============================================================================
  return (
    <CommonShell>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CBAM 관리</h1>
                <p className="text-sm text-gray-600">탄소국경조정메커니즘 통합 관리 시스템</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    fetchInstalls();
                    fetchProducts();
                    fetchProcesses();
                    fetchMappings();
                  }}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>새로고침</span>
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

        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <CBAMOverviewTab
              installs={installs}
              products={products}
              processes={processes}
              mappings={mappings}
              onShowInstallModal={() => setShowInstallModal(true)}
              onShowProductModal={() => setShowProductModal(true)}
              onShowProcessModal={() => setShowProcessModal(true)}
            />
          )}
          {activeTab === 'install' && (
            <CBAMInstallTab
              installs={installs}
              onShowInstallModal={() => setShowInstallModal(true)}
            />
          )}
          {activeTab === 'boundary' && <BoundaryTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* 모달들 */}
        {showInstallModal && (
          <InstallModal
            onClose={() => setShowInstallModal(false)}
            onSuccess={fetchInstalls}
          />
        )}

        {/* TODO: 다른 모달들도 별도 컴포넌트로 분리 */}
        {showBoundaryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg font-medium">경계 설정 기능</p>
                <p className="text-sm">ReactFlow를 사용한 시각적 경계 설정이 구현될 예정입니다.</p>
                <button
                  onClick={() => setShowBoundaryModal(false)}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonShell>
  );
}
