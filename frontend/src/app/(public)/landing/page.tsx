'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LandingPage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push('/dashboard');
  };

  const handleRegister = () => {
    router.push('/register');
  };

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
          <form className='space-y-6'>
            {/* ID 입력 */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-white mb-2'
              >
                ID *
              </label>
              <Input
                id='username'
                type='text'
                placeholder='예: smartuser'
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
                placeholder='********'
                className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
              />
            </div>

            {/* 로그인 버튼 - 정중앙 위치, 입력칸과 너비 맞춤 */}
            <div className='flex justify-center'>
              <Button
                type='submit'
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
              >
                로그인
              </Button>
            </div>

            {/* 구분선 */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/20' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-ecotrace-background text-white/60'>
                  또는
                </span>
              </div>
            </div>

            {/* 추가 버튼들 - 위아래로 세로 배치 */}
            <div className='space-y-3'>
              <Button
                type='button'
                onClick={handleEnter}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
              >
                들어가기
              </Button>
              <Button
                type='button'
                onClick={handleRegister}
                variant='outline'
                className='w-full border-white/30 text-white hover:bg-white/10 transition-colors'
              >
                회원가입
              </Button>
            </div>
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
