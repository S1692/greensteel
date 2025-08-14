'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import Button from '@/components/atoms/Button';

const DashboardPage: React.FC = () => {
  const router = useRouter();

  return (
    <CommonShell>
      <div className="space-y-8">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-ecotrace-primary to-ecotrace-accent rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            greensteel에 오신 것을 환영합니다
          </h1>
          <p className="text-white/90 text-lg">
            ESG 관리 플랫폼을 시작해보세요
          </p>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer" onClick={() => router.push('/lca')}>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">LCA 프로젝트</h3>
            <p className="text-ecotrace-textSecondary text-sm">생명주기 평가 시작</p>
          </div>

          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer" onClick={() => router.push('/cbam')}>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">CBAM 보고서</h3>
            <p className="text-ecotrace-textSecondary text-sm">탄소 국경 조정</p>
          </div>

          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer" onClick={() => router.push('/data-upload')}>
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">데이터 업로드</h3>
            <p className="text-ecotrace-textSecondary text-sm">파일 업로드</p>
          </div>

          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer" onClick={() => router.push('/settings')}>
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">설정</h3>
            <p className="text-ecotrace-textSecondary text-sm">애플리케이션 설정</p>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ecotrace-text mb-4">최근 활동</h2>
          <div className="text-center py-8 text-ecotrace-textSecondary">
            아직 활동이 없습니다. 위의 카드를 클릭하여 시작해보세요.
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">프로젝트</h3>
            <p className="text-3xl font-bold text-ecotrace-accent">0</p>
            <p className="text-sm text-ecotrace-textSecondary">생성된 프로젝트</p>
          </div>
          
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">계산</h3>
            <p className="text-3xl font-bold text-ecotrace-accent">0</p>
            <p className="text-sm text-ecotrace-textSecondary">완료된 계산</p>
          </div>
          
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">보고서</h3>
            <p className="text-3xl font-bold text-ecotrace-accent">0</p>
            <p className="text-sm text-ecotrace-textSecondary">생성된 보고서</p>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DashboardPage;
