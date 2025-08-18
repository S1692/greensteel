'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, any>>({});
  const [kakaoStatus, setKakaoStatus] = useState<string>('확인 중...');

  useEffect(() => {
    // 환경 변수 상태 수집
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
      NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    };

    setEnvVars(envStatus);

    // 카카오 API 상태 확인
    const checkKakaoAPI = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        setKakaoStatus('✅ 정상 로드됨');
      } else {
        setKakaoStatus('❌ 로드되지 않음');
      }
    };

    // 페이지 로드 후 확인
    setTimeout(checkKakaoAPI, 1000);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 환경 변수 디버깅 페이지</h1>
        
        {/* 환경 변수 상태 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 환경 변수 상태</h2>
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span className="font-mono text-sm">{key}</span>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    value ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {value ? '설정됨' : '설정되지 않음'}
                  </span>
                  <span className="font-mono text-sm max-w-xs truncate">
                    {value || 'undefined'}
                  </span>
                  {value && (
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      복사
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카카오 API 상태 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🗺️ 카카오 지도 API 상태</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>API 로드 상태</span>
              <span className={kakaoStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                {kakaoStatus}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>API 키 유효성</span>
              <span className={
                envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY && 
                envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY !== 'YOUR_KAKAO_MAP_API_KEY' &&
                envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY.length > 20
                  ? 'text-green-400' 
                  : 'text-red-400'
              }">
                {envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY && 
                 envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY !== 'YOUR_KAKAO_MAP_API_KEY' &&
                 envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY.length > 20
                  ? '✅ 유효한 키' 
                  : '❌ 무효한 키'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>API 키 길이</span>
              <span className="font-mono">
                {envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY?.length || 0}자
              </span>
            </div>
          </div>
        </div>

        {/* 문제 해결 가이드 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ 문제 해결 가이드</h2>
          
          {(!envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 
            envVars.NEXT_PUBLIC_KAKAO_MAP_API_KEY === 'YOUR_KAKAO_MAP_API_KEY') && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-300 mb-2">🚨 카카오 API 키 문제</h3>
              <p className="text-red-200 mb-3">
                카카오 API 키가 설정되지 않았거나 기본값으로 설정되어 있습니다.
              </p>
              <div className="space-y-2 text-sm text-red-200">
                <p>1. Vercel 대시보드 → Settings → Environment Variables</p>
                <p>2. NEXT_PUBLIC_KAKAO_MAP_API_KEY 추가</p>
                <p>3. 실제 JavaScript 키 값 입력 (your_key_here 아님)</p>
                <p>4. Redeploy 실행</p>
              </div>
            </div>
          )}

          {kakaoStatus.includes('❌') && (
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-300 mb-2">⚠️ 카카오 API 로드 실패</h3>
              <p className="text-yellow-200 mb-3">
                카카오 API가 로드되지 않았습니다. 다음을 확인하세요:
              </p>
              <div className="space-y-2 text-sm text-yellow-200">
                <p>1. API 키가 올바르게 설정되었는지 확인</p>
                <p>2. 카카오 개발자 콘솔에서 도메인 설정 확인</p>
                <p>3. 브라우저 캐시 삭제 후 새로고침</p>
                <p>4. 네트워크 탭에서 에러 상태 확인</p>
              </div>
            </div>
          )}

          <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">📚 추가 정보</h3>
            <p className="text-blue-200 mb-3">
              자세한 설정 방법은 다음 문서를 참조하세요:
            </p>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• <a href="/KAKAO_API_SETUP.md" className="underline hover:text-blue-100">카카오 API 설정 가이드</a></p>
              <p>• <a href="https://developers.kakao.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">카카오 개발자 콘솔</a></p>
              <p>• <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">Vercel 환경 변수 문서</a></p>
            </div>
          </div>
        </div>

        {/* 브라우저 정보 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🌐 브라우저 정보</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>현재 도메인</span>
              <span className="font-mono text-sm">{typeof window !== 'undefined' ? window.location.origin : 'SSR'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>User Agent</span>
              <span className="font-mono text-sm max-w-xs truncate">
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span>온라인 상태</span>
              <span className={typeof navigator !== 'undefined' && navigator.onLine ? 'text-green-400' : 'text-red-400'}>
                {typeof navigator !== 'undefined' && navigator.onLine ? '✅ 온라인' : '❌ 오프라인'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
