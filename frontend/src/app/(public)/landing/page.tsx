'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axiosClient';

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

    // 클라이언트 측 유효성 검사
    if (!username.trim() || !password.trim()) {
      setError({ message: 'ID와 비밀번호를 모두 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/auth/login', {
        username: username.trim(),
        password: password,
      });

      // 토큰과 사용자 정보 저장
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_email', response.data.user.username); // username으로 변경

      // 대시보드로 리다이렉트
      router.push('/dashboard');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenSteel</h1>
          <p className="text-gray-600">지속가능한 미래를 위한 ESG 솔루션</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            로그인
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="예: smartuser"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <a
                href="/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                회원가입
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
