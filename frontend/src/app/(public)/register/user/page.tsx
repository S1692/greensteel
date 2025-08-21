'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CountrySearchModal from '@/components/CountrySearchModal';

interface Country {
  id: string;
  korean_name: string;
  country_name: string;
  code: string;
  unlocode?: string;
}

interface UserData {
  user_id: string;
  password: string;
  confirm_password: string;
  email: string;
  name: string;
  name_en: string;
  phone: string;
  country: string;
  country_en: string;
  country_code: string;
  unlocode: string;
}

export default function UserRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserData>({
    user_id: '',
    password: '',
    confirm_password: '',
    email: '',
    name: '',
    name_en: '',
    phone: '',
    country: '',
    country_en: '',
    country_code: '',
    unlocode: '',
  });

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountrySelect = (countryData: Country) => {
    setFormData(prev => ({
      ...prev,
      country: countryData.korean_name,
      country_en: countryData.country_name,
      country_code: countryData.code,
      unlocode: countryData.unlocode || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 비밀번호 확인
    if (formData.password !== formData.confirm_password) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/register/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          password: formData.password,
          email: formData.email,
          name: formData.name,
          name_en: formData.name_en,
          phone: formData.phone,
          country: formData.country,
          country_en: formData.country_en,
          country_code: formData.country_code,
          unlocode: formData.unlocode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '회원가입에 실패했습니다.');
      }

      setSuccess('회원가입이 완료되었습니다!');
      setTimeout(() => {
        router.push('/landing');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen stitch-bg py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='stitch-card p-8'>
          <div className='text-center mb-8'>
            <h1 className='stitch-h1 text-3xl font-bold'>
              개인 사용자 회원가입
            </h1>
            <p className='stitch-caption mt-2'>
              개인 정보를 입력하여 회원가입을 완료하세요.
            </p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded'>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 계정 정보 */}
            <div className='stitch-section'>
              <h2 className='stitch-h1 text-xl font-semibold mb-4'>
                계정 정보
              </h2>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='stitch-label mb-1 block'>사용자 ID *</label>
                  <Input
                    type='text'
                    value={formData.user_id}
                    onChange={e => handleInputChange('user_id', e.target.value)}
                    required
                    placeholder='사용자 ID를 입력하세요'
                  />
                </div>
                <div>
                  <label className='stitch-label mb-1 block'>비밀번호 *</label>
                  <Input
                    type='password'
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    required
                    placeholder='비밀번호를 입력하세요'
                  />
                </div>
                <div>
                  <label className='stitch-label mb-1 block'>
                    비밀번호 확인 *
                  </label>
                  <Input
                    type='password'
                    value={formData.confirm_password}
                    onChange={e =>
                      handleInputChange('confirm_password', e.target.value)
                    }
                    required
                    placeholder='비밀번호를 다시 입력하세요'
                  />
                </div>
                <div>
                  <label className='stitch-label mb-1 block'>이메일 *</label>
                  <Input
                    type='email'
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    required
                    placeholder='이메일을 입력하세요'
                  />
                </div>
              </div>
            </div>

            {/* 개인 정보 */}
            <div className='stitch-section'>
              <h2 className='stitch-h1 text-xl font-semibold mb-4'>
                개인 정보
              </h2>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='stitch-label mb-1 block'>
                    이름 (한글) *
                  </label>
                  <Input
                    type='text'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    placeholder='한글 이름을 입력하세요'
                  />
                </div>
                <div>
                  <label className='stitch-label mb-1 block'>
                    이름 (영문) *
                  </label>
                  <Input
                    type='text'
                    value={formData.name_en}
                    onChange={e => handleInputChange('name_en', e.target.value)}
                    required
                    placeholder='영문 이름을 입력하세요'
                  />
                </div>
                <div>
                  <label className='stitch-label mb-1 block'>전화번호 *</label>
                  <Input
                    type='tel'
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    required
                    placeholder='전화번호를 입력하세요'
                  />
                </div>
              </div>
            </div>

            {/* 국가 정보 */}
            <div className='stitch-section'>
              <h2 className='stitch-h1 text-xl font-semibold mb-4'>
                국가 정보
              </h2>

              {/* 국가 검색 */}
              <div className='mt-4'>
                <label className='stitch-label mb-1 block'>국가</label>
                <div className='flex gap-2'>
                  <Input
                    type='text'
                    value={formData.country}
                    onChange={e => handleInputChange('country', e.target.value)}
                    placeholder='국가를 선택하세요'
                    readOnly
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    onClick={() => setIsCountryModalOpen(true)}
                    variant='outline'
                    size='lg'
                  >
                    검색
                  </Button>
                </div>
                {(formData.country_code || formData.unlocode) && (
                  <div className='mt-1 stitch-caption space-y-1'>
                    {formData.country_code && (
                      <p>국가 코드: {formData.country_code}</p>
                    )}
                    {formData.unlocode && <p>UNLOCODE: {formData.unlocode}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={loading}
                className='w-full sm:w-auto'
                size='lg'
              >
                {loading ? '처리 중...' : '회원가입'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 국가 검색 모달 */}
      <CountrySearchModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleCountrySelect}
      />
    </div>
  );
}
