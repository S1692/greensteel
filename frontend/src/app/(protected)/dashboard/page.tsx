'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/axiosClient';

export default function DashboardPage() {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 인증 상태 확인
    if (!authUtils.isAuthenticated()) {
      router.push('/landing');
      return;
    }

    // 사용자 정보 가져오기
    const userEmail = authUtils.getUserEmail();
    if (userEmail) {
      setUsername(userEmail);
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await authUtils.logout();
      router.push('/landing');
    } catch (error) {
      // 로그아웃 오류는 무시하고 진행
    } finally {
      setLogoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              GreenSteel 대시보드
            </h1>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logoutLoading ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              환영합니다!
            </h2>
            <p className="text-green-700">
              ID: <span className="font-medium">{username}</span>님,
              GreenSteel에 오신 것을 환영합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">LCA</h3>
              <p className="text-blue-700 text-sm">생명주기 평가</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                CBAM
              </h3>
              <p className="text-purple-700 text-sm">탄소 국경 조정</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                데이터
              </h3>
              <p className="text-orange-700 text-sm">업로드 및 관리</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
