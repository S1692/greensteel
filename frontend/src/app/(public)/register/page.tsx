'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CommonShell from '@/components/CommonShell';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

            // 회원가입 처리
        // 실제로는 API 호출
    alert('회원가입이 완료되었습니다. 로그인해주세요.');
    router.push('/');
  };

  return (
    <CommonShell>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ecotrace-text mb-2">
              <span className="bg-gradient-to-r from-ecotrace-accent to-ecotrace-primary bg-clip-text text-transparent">
                greensteel
              </span>
            </h1>
            <p className="text-ecotrace-textSecondary">회원가입</p>
          </div>

          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="이름"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <Input
                label="회사명"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange}
                required
              />

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

              <Input
                label="비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />

              <Button type="submit" className="w-full" size="lg">
                회원가입
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-ecotrace-textSecondary text-sm">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-ecotrace-accent hover:underline cursor-pointer"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default RegisterPage;
