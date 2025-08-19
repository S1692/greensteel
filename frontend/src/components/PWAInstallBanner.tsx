'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA 설치 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // PWA 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    // 이미 설치되었는지 확인
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true);
    }

    // PWA 설치 가능 여부 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // 설치 프롬프트 표시
      deferredPrompt.prompt();

      // 사용자 응답 대기
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        // 사용자가 설치를 수락한 경우
        setShowBanner(false);
      }
    } catch (error) {
      // 설치 중 오류 발생
      setShowBanner(false);
    }

    // 프롬프트 초기화
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // 이미 설치되었거나 배너를 닫았거나 표시하지 않음
  if (
    isInstalled ||
    !showBanner ||
    localStorage.getItem('pwa-banner-dismissed') === 'true'
  ) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center'>
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
                />
              </svg>
            </div>
          </div>

          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-medium text-gray-900 dark:text-white'>
              GreenSteel 앱 설치
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              홈 화면에 추가하여 더 빠르게 접근하세요
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className='flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mt-3 flex space-x-2'>
          <Button
            onClick={handleInstallClick}
            className='flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2'
          >
            설치
          </Button>
          <Button
            onClick={handleDismiss}
            className='flex-1 text-xs py-2 border border-gray-300 text-gray-700 hover:bg-gray-50'
          >
            나중에
          </Button>
        </div>
      </div>
    </div>
  );
}
