'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CommonShell from '@/components/CommonShell';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 처리
    // 실제로는 API 호출
    localStorage.setItem('auth_token', 'dummy_token');
    localStorage.setItem('user_email', formData.email);
    router.push('/dashboard');
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />

                  <Button type="submit" className="w-full" size="lg">
                    로그인
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-ecotrace-textSecondary text-sm">
                    계정이 없으신가요?{' '}
                    <button
                      onClick={() => router.push('/register')}
                      className="text-ecotrace-accent hover:underline cursor-pointer"
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
