'use client';

import React, { useState } from 'react';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import {
  GitBranch,
  Save,
  Plus,
  Database,
  Zap,
  Settings,
  BarChart3,
  FileText,
} from 'lucide-react';
import ConnectedReactFlow from '@/components/templates/ConnectedReactFlow';
import ErrorBoundary from '@/components/templates/ErrorBoundary';

// ============================================================================
// 🎯 CBAM 프로세스 플로우 페이지
// ============================================================================

export default function CBAMPage() {
  const [currentFlowId, setCurrentFlowId] = useState<string | undefined>(
    undefined
  );
  const [autoSave, setAutoSave] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'flow' | 'reports' | 'settings'
  >('overview');

  const handleCreateNewFlow = () => {
    setCurrentFlowId(undefined);
    setActiveTab('flow');
  };

  const handleLoadFlow = (flowId: string) => {
    setCurrentFlowId(flowId);
    setActiveTab('flow');
  };

  const renderOverview = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* CBAM 계산 카드 */}
        <div className='stitch-card p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <BarChart3 className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h3 className='stitch-h1 text-lg font-semibold'>CBAM 계산</h3>
              <p className='stitch-caption'>탄소 배출량 계산 및 보고</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>총 계산 건수</span>
              <span className='font-medium'>1,247</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>이번 달</span>
              <span className='font-medium'>89</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>승인 대기</span>
              <span className='font-medium text-yellow-500'>12</span>
            </div>
          </div>
          <Button className='w-full mt-4' onClick={() => setActiveTab('flow')}>
            계산 시작
          </Button>
        </div>

        {/* 프로세스 플로우 카드 */}
        <div className='stitch-card p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <GitBranch className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <h3 className='stitch-h1 text-lg font-semibold'>
                프로세스 플로우
              </h3>
              <p className='stitch-caption'>CBAM 프로세스 시각화</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>저장된 플로우</span>
              <span className='font-medium'>23</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>최근 수정</span>
              <span className='font-medium'>2시간 전</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>공유됨</span>
              <span className='font-medium text-green-500'>8</span>
            </div>
          </div>
          <Button
            variant='outline'
            className='w-full mt-4'
            onClick={() => setActiveTab('flow')}
          >
            플로우 보기
          </Button>
        </div>

        {/* 보고서 카드 */}
        <div className='stitch-card p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <FileText className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <h3 className='stitch-h1 text-lg font-semibold'>보고서</h3>
              <p className='stitch-caption'>CBAM 보고서 생성 및 관리</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>생성된 보고서</span>
              <span className='font-medium'>156</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>이번 분기</span>
              <span className='font-medium'>23</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-white/60'>승인 완료</span>
              <span className='font-medium text-green-500'>18</span>
            </div>
          </div>
          <Button
            variant='outline'
            className='w-full mt-4'
            onClick={() => setActiveTab('reports')}
          >
            보고서 보기
          </Button>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>최근 활동</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3 p-3 bg-white/5 rounded-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-sm text-white/80'>
              CBAM 계산 완료: 철강 제품 A-2024-001
            </span>
            <span className='text-xs text-white/40 ml-auto'>10분 전</span>
          </div>
          <div className='flex items-center gap-3 p-3 bg-white/5 rounded-lg'>
            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
            <span className='text-sm text-white/80'>
              프로세스 플로우 수정: 표준 CBAM 프로세스
            </span>
            <span className='text-xs text-white/40 ml-auto'>2시간 전</span>
          </div>
          <div className='flex items-center gap-3 p-3 bg-white/5 rounded-lg'>
            <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
            <span className='text-sm text-white/80'>
              보고서 승인 대기: Q1 2024 CBAM 보고서
            </span>
            <span className='text-xs text-white/40 ml-auto'>1일 전</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFlow = () => (
    <div className='h-full flex flex-col'>
      {/* 플로우 헤더 */}
      <div className='stitch-card p-4 mb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='stitch-h1 text-xl font-semibold'>
              CBAM 프로세스 플로우
            </h2>
            <p className='stitch-caption'>
              탄소국경조정메커니즘 프로세스 시각화
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <label className='flex items-center gap-2 text-sm text-white/80'>
                <input
                  type='checkbox'
                  checked={autoSave}
                  onChange={e => setAutoSave(e.target.checked)}
                  className='rounded bg-white/10 border-white/20'
                />
                자동 저장
              </label>
            </div>

            <Button onClick={handleCreateNewFlow} variant='outline'>
              <Plus className='h-4 w-4 mr-2' />새 플로우
            </Button>

            <Button>
              <Save className='h-4 w-4 mr-2' />
              저장
            </Button>
          </div>
        </div>
      </div>

      {/* 플로우 캔버스 */}
      <div className='flex-1 stitch-card p-6'>
        <ErrorBoundary>
          <ConnectedReactFlow />
        </ErrorBoundary>
      </div>

      {/* 플로우 상태 바 */}
      <div className='stitch-card p-4 mt-4'>
        <div className='flex items-center justify-between text-sm text-white/60'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              백엔드 연동됨
            </span>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              PostgreSQL 저장
            </span>
            <span className='flex items-center gap-1'>
              <span
                className={`w-2 h-2 rounded-full ${autoSave ? 'bg-green-500' : 'bg-gray-400'}`}
              ></span>
              자동 저장: {autoSave ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className='text-white/40 font-medium'>
            {currentFlowId ? `플로우 ID: ${currentFlowId}` : '새 플로우'}
          </div>
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
            onClick={() => setActiveTab('flow')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'flow'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            프로세스 플로우
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

        {/* 탭 컨텐츠 */}
        <div className='min-h-[600px]'>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'flow' && renderFlow()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </CommonShell>
  );
}
