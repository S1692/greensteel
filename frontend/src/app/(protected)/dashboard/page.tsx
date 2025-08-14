'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { authUtils } from '@/lib/axiosClient';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const email = authUtils.getUserEmail();
    setUserEmail(email);
    if (!authUtils.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      setIsLoggingOut(true);
      try {
        await authUtils.logout();
      } catch (error) {
        // 로그아웃 오류는 무시하고 로컬 스토리지만 정리
        setIsLoggingOut(false);
      }
    }
  };

  // 사용자 이메일이 로드되지 않았으면 로딩 표시
  if (!userEmail) {
    return (
      <CommonShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ecotrace-primary"></div>
        </div>
      </CommonShell>
    );
  }

  return (
    <CommonShell>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-ecotrace-text">대시보드</h1>
            <p className="text-ecotrace-textSecondary">
              안녕하세요, {userEmail}님
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>로그아웃 중...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>로그아웃</span>
              </>
            )}
          </button>
        </div>

        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-ecotrace-primary to-ecotrace-accent rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            ESG 관리 플랫폼을 시작해보세요
          </h2>
          <p className="text-white/90 text-lg">
            생명주기 평가(LCA), 탄소 국경 조정(CBAM), 지속가능성 보고서를 한
            곳에서 관리하고 분석하세요
          </p>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/lca')}
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">
              LCA 프로젝트
            </h3>
            <p className="text-ecotrace-textSecondary text-sm">
              생명주기 평가 시작
            </p>
          </div>

          <div
            className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/cbam')}
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">
              CBAM 보고서
            </h3>
            <p className="text-ecotrace-textSecondary text-sm">
              탄소 국경 조정
            </p>
          </div>

          <div
            className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/data-upload')}
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">
              데이터 업로드
            </h3>
            <p className="text-ecotrace-textSecondary text-sm">
              데이터 수집 및 관리
            </p>
          </div>

          <div
            className="bg-ecotrace-surface border border-ecotrace-border rounded-lg p-6 text-center hover:border-ecotrace-accent/50 transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/settings')}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ecotrace-text mb-2">
              설정
            </h3>
            <p className="text-ecotrace-textSecondary text-sm">
              계정 및 조직 설정
            </p>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-ecotrace-surface border border-ecotrace-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-ecotrace-text mb-4">
            최근 활동
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-ecotrace-textSecondary">
              <div className="w-2 h-2 bg-ecotrace-accent rounded-full"></div>
              <span>로그인 완료</span>
              <span className="text-sm opacity-75">방금 전</span>
            </div>
            <div className="flex items-center space-x-3 text-ecotrace-textSecondary">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>대시보드 접속</span>
              <span className="text-sm opacity-75">방금 전</span>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DashboardPage;
