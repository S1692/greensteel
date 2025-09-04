'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SettingsPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // 바로 기업 설정 페이지로 리다이렉트
    router.replace('/settings/company');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">설정 페이지로 이동 중...</p>
      </div>
    </div>
  );
};

export default SettingsPage;
