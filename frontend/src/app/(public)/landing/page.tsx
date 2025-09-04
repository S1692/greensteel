'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LandingPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [loginData, setLoginData] = useState({
    id: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 모바일 디바이스 감지
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;

      setIsMobile(isMobileDevice);
      setIsPWAInstalled(isStandalone);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // 로그인 검증 로직
      if (!loginData.id || !loginData.password) {
        alert('ID와 비밀번호를 모두 입력해주세요.');
        return;
      }
      
      // 임시 로그인 검증 (실제로는 API 호출)
      const isValidLogin = await validateLogin(loginData.id, loginData.password);
      
      if (isValidLogin) {
        // 로그인 성공 시 리다이렉트
        const redirectUrl = `/dashboard?companyId=${encodeURIComponent(loginData.id)}`;
        router.push(redirectUrl);
      } else {
        alert('ID 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 검증 함수 (실제 API 호출)
  const validateLogin = async (id: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: id,
          password: password
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 로그인 성공 시 사용자 정보를 localStorage에 저장
        localStorage.setItem('user_id', id);
        localStorage.setItem('user_email', id); // 기존 호환성을 위해
        localStorage.setItem('auth_token', 'logged_in'); // 간단한 토큰
        
        // 사용자 정보가 있으면 추가로 저장
        if (result.data && result.data.user) {
          localStorage.setItem('user_info', JSON.stringify(result.data.user));
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('로그인 API 호출 실패:', error);
      return false;
    }
  };


  const handleRegister = () => {
    router.push('/register');
  };

  const handleInstallPWA = () => {
    // PWA 설치 로직
    console.log('PWA 설치 시작');
  };

  // 모바일 첫 화면 (로그인 화면)
  if (isMobile) {
    return (
      <div className='min-h-screen bg-ecotrace-background flex items-center justify-center p-4'>
        <div className='w-full max-w-md text-center'>
          {/* 헤더 */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>GreenSteel</h1>
            <p className='text-white/60 text-lg'>로그인</p>
          </div>

          {/* 로그인 카드 */}
          <div className='bg-ecotrace-card rounded-2xl p-6 shadow-lg border border-white/10'>
            <div className='space-y-4'>

              {/* ID 입력 필드 */}
              <div className='text-left'>
                <label className='block text-white text-sm font-medium mb-2'>
                  ID *
                </label>
                <Input
                  type='text'
                  value={loginData.id}
                  onChange={(e) => setLoginData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder='예: company1, greensteel'
                  className='w-full bg-ecotrace-input border-white/20 text-white placeholder:text-white/50'
                />
              </div>

              {/* 비밀번호 입력 필드 */}
              <div className='text-left'>
                <label className='block text-white text-sm font-medium mb-2'>
                  비밀번호 *
                </label>
                <Input
                  type='password'
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder='비밀번호를 입력하세요'
                  className='w-full bg-ecotrace-input border-white/20 text-white placeholder:text-white/50'
                />
              </div>

              {/* 로그인 버튼 */}
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg py-3 mt-6 disabled:opacity-50'
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>


              {/* 회원가입 버튼 */}
              <Button
                onClick={handleRegister}
                variant='outline'
                className='w-full border-white/30 text-white hover:bg-white/10 transition-colors py-3'
              >
                회원가입
              </Button>
            </div>
          </div>

          {/* 푸터 */}
          <div className='mt-8'>
            <p className='text-white/60 text-sm'>
              GreenSteel은 LCA, CBAM, ESG 관리의 모든 것을 제공합니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 웹 일반 로그인 화면
  return (
    <div className='min-h-screen bg-ecotrace-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* 로고 및 제목 */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>GreenSteel</h1>
          <p className='text-white/60'>로그인</p>
        </div>

        {/* 로그인 폼 */}
        <div className='bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10'>
          <form onSubmit={handleLogin} className='space-y-6'>

            {/* ID 입력 */}
            <div>
              <label
                htmlFor='id'
                className='block text-sm font-medium text-white mb-2'
              >
                ID *
              </label>
              <Input
                id='id'
                type='text'
                value={loginData.id}
                onChange={(e) => setLoginData(prev => ({ ...prev, id: e.target.value }))}
                placeholder='예: company1, greensteel'
                className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-white mb-2'
              >
                비밀번호 *
              </label>
              <Input
                id='password'
                type='password'
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                placeholder='********'
                className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
              />
            </div>

            {/* 로그인 버튼 - 정중앙 위치, 입력칸과 너비 맞춤 */}
            <div className='flex justify-center'>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50'
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type='button'
              onClick={handleRegister}
              variant='outline'
              className='w-full border-white/30 text-white hover:bg-white/10 transition-colors'
            >
              회원가입
            </Button>
          </form>
        </div>

        {/* 하단 설명 */}
        <div className='text-center mt-8'>
          <p className='text-white/60 text-sm'>
            GreenSteel은 LCA, CBAM, ESG 관리의 모든 것을 제공합니다
          </p>
        </div>
      </div>
    </div>
  );
}
