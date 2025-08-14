'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CommonShell from '@/components/CommonShell';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 로그인 API 호출
      const response = await axiosClient.post(apiEndpoints.auth.login, {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        // 로그인 성공 시 토큰 저장
        const { access_token, refresh_token, user } = response.data;
        
        if (access_token) {
          localStorage.setItem('auth_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          if (user?.email) {
            localStorage.setItem('user_email', user.email);
          }
          
          // 로그인 성공 후 대시보드로 이동
          router.push('/dashboard');
        } else {
          setError('로그인 토큰을 받지 못했습니다.');
        }
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CommonShell>
      <div className="space-y-12">
        {/* 메인 섹션 - 로그인 폼과 함께 */}
        <section className="text-center py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 왼쪽: 브랜딩 및 소개 */}
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-ecotrace-text mb-8">
                  <span className="bg-gradient-to-r from-ecotrace-accent to-ecotrace-primary bg-clip-text text-transparent">
                    greensteel
                  </span>
                </h1>

                <p className="text-xl text-ecotrace-textSecondary mb-8">
                  ESG 관리 플랫폼
                </p>

                <p className="text-ecotrace-textSecondary mb-8">
                  생명주기 평가(LCA), 탄소 국경 조정(CBAM), 지속가능성 보고서를
                  한 곳에서 관리하고 분석하세요.
                </p>
              </div>

              {/* 오른쪽: 로그인 폼 */}
              <div className="bg-ecotrace-surface border border-ecotrace-border rounded-xl p-8">
                <h2 className="text-2xl font-bold text-ecotrace-text mb-6 text-center">
                  로그인
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />

                  <Input
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? '로그인 중...' : '로그인'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-ecotrace-textSecondary text-sm">
                    계정이 없으신가요?{' '}
                    <button
                      onClick={() => router.push('/register')}
                      className="text-ecotrace-accent hover:underline cursor-pointer"
                      disabled={isLoading}
                    >
                      회원가입
                    </button>
                  </p>

                  {/* 테스트용 아이디 정보 */}
                  <div className="mt-4 p-3 bg-ecotrace-secondary/10 rounded-lg border border-ecotrace-border">
                    <p className="text-xs text-ecotrace-textSecondary mb-2">
                      🧪 테스트용 계정
                    </p>
                    <p className="text-xs text-ecotrace-textSecondary">
                      이메일: test@greensteel.com
                    </p>
                    <p className="text-xs text-ecotrace-textSecondary">
                      비밀번호: test123
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 섹션 */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-ecotrace-text text-center mb-12">
              주요 기능
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-ecotrace-secondary/5 border border-ecotrace-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-ecotrace-text mb-3">
                  LCA
                </h3>
                <p className="text-ecotrace-textSecondary text-sm">
                  생명주기 평가
                </p>
              </div>

              <div className="bg-ecotrace-secondary/5 border border-ecotrace-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-ecotrace-text mb-3">
                  CBAM
                </h3>
                <p className="text-ecotrace-textSecondary text-sm">
                  탄소 국경 조정
                </p>
              </div>

              <div className="bg-ecotrace-secondary/5 border border-ecotrace-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-ecotrace-text mb-3">
                  데이터
                </h3>
                <p className="text-ecotrace-textSecondary text-sm">
                  업로드 및 관리
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CommonShell>
  );
};

export default LandingPage;
