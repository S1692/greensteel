'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CommonShell from '@/components/CommonShell';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface RegisterError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      const response = await axiosClient.post(apiEndpoints.auth.register, {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        router.push('/');
      }
    } catch (error: unknown) {
      const registerError = error as RegisterError;

      if (registerError.response?.data?.detail) {
        setError(registerError.response.data.detail);
      } else if (registerError.response?.data?.message) {
        setError(registerError.response.data.message);
      } else if (registerError.message) {
        setError(registerError.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="이름"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />

              <Input
                label="회사명"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />

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
                minLength={8}
              />

              <Input
                label="비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={8}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-ecotrace-textSecondary text-sm">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-ecotrace-accent hover:underline cursor-pointer"
                  disabled={isLoading}
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
