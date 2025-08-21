'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axiosClient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginError {
  message: string;
}

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/auth/login', {
        username,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user_email', username);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          setError({ message: axiosError.response.data.detail });
        } else {
          setError({ message: '로그인에 실패했습니다.' });
        }
      } else {
        setError({ message: '로그인 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnter = () => {
    router.push('/dashboard');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className='min-h-screen stitch-bg flex items-center justify-center px-4'>
      <div className='stitch-card w-full max-w-md p-8'>
        <h1 className='stitch-h1 text-3xl font-semibold text-center'>
          GreenSteel
        </h1>
        <p className='stitch-caption text-center mt-1'>로그인</p>

        <form onSubmit={handleSubmit} className='space-y-4 mt-6'>
          <div>
            <label className='stitch-label mb-1 block'>ID *</label>
            <Input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder='예: smartuser'
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className='stitch-label mb-1 block'>비밀번호 *</label>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='********'
              disabled={isLoading}
              required
            />
          </div>

          {error && <p className='stitch-error mt-1'>{error.message}</p>}

          <Button className='mt-2' size='lg' disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className='stitch-section'>
          <p className='stitch-caption text-center mb-4'>또는</p>

          <div className='space-y-3'>
            <Button onClick={handleEnter} size='lg'>
              들어가기
            </Button>

            <Button onClick={handleRegister} variant='outline' size='lg'>
              회원가입
            </Button>
          </div>
        </div>

        <p className='stitch-caption text-center mt-6'>
          GreenSteel은 LCA, CBAM, ESG 관리의 모든 것을 제공합니다
        </p>
      </div>
    </div>
  );
}
