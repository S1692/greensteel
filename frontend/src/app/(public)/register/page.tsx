'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AddressSearchModal from '@/components/AddressSearchModal';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  bizNo: string;
  country: string;
  city: string;
  zipcode: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'company' | 'user'>('company');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    bizNo: '',
    country: '',
    city: '',
    zipcode: '',
    address: '',
  });

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.roadAddress,
      city: addressData.cityName,
      zipcode: addressData.postalCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 회원가입 로직 구현
    console.log('회원가입 데이터:', formData);
  };

  return (
    <div className='min-h-screen bg-ecotrace-background flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        {/* 탭 네비게이션 */}
        <div className='flex mb-8 bg-white/5 rounded-lg p-1'>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'company'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            기업 회원가입
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            개인 사용자 회원가입
          </button>
        </div>

        {/* 회원가입 폼 */}
        <div className='bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10'>
          {activeTab === 'company' ? (
            // 기업 회원가입 폼
            <form onSubmit={handleSubmit} className='space-y-6'>
              <h2 className='text-2xl font-bold text-white text-center mb-6'>
                기업 회원가입
              </h2>
              <p className='text-white/60 text-center mb-8'>
                기업 정보를 입력하여 회원가입을 완료하세요.
              </p>

              {/* 기업 정보 */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    기업명 *
                  </label>
                  <Input
                    type='text'
                    value={formData.companyName}
                    onChange={e =>
                      handleInputChange('companyName', e.target.value)
                    }
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='기업명을 입력하세요'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    사업자등록번호 *
                  </label>
                  <Input
                    type='text'
                    value={formData.bizNo}
                    onChange={e => handleInputChange('bizNo', e.target.value)}
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='123-45-67890'
                    required
                  />
                </div>
              </div>

              {/* 계정 정보 */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    사용자명 *
                  </label>
                  <Input
                    type='text'
                    value={formData.username}
                    onChange={e =>
                      handleInputChange('username', e.target.value)
                    }
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='사용자명을 입력하세요'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    담당자명 *
                  </label>
                  <Input
                    type='text'
                    value={formData.fullName}
                    onChange={e =>
                      handleInputChange('fullName', e.target.value)
                    }
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='담당자명을 입력하세요'
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    비밀번호 *
                  </label>
                  <Input
                    type='password'
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='비밀번호를 입력하세요'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    비밀번호 확인 *
                  </label>
                  <Input
                    type='password'
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='비밀번호를 다시 입력하세요'
                    required
                  />
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    이메일 *
                  </label>
                  <Input
                    type='email'
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='이메일을 입력하세요'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    연락처 *
                  </label>
                  <Input
                    type='tel'
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                    placeholder='010-1234-5678'
                    required
                  />
                </div>
              </div>

              {/* 주소 정보 */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    주소 *
                  </label>
                  <div className='flex gap-2'>
                    <Input
                      type='text'
                      value={formData.address}
                      onChange={e =>
                        handleInputChange('address', e.target.value)
                      }
                      className='flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                      placeholder='주소를 입력하세요'
                      readOnly
                    />
                    <Button
                      type='button'
                      onClick={() => setIsAddressModalOpen(true)}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                    >
                      주소 검색
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      도시 *
                    </label>
                    <Input
                      type='text'
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                      placeholder='도시명'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      우편번호 *
                    </label>
                    <Input
                      type='text'
                      value={formData.zipcode}
                      onChange={e =>
                        handleInputChange('zipcode', e.target.value)
                      }
                      className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                      placeholder='우편번호'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      국가 *
                    </label>
                    <Input
                      type='text'
                      value={formData.country}
                      onChange={e =>
                        handleInputChange('country', e.target.value)
                      }
                      className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/20'
                      placeholder='국가명'
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 제출 버튼 - 정중앙 위치, 입력칸과 너비 맞춤 */}
              <div className='flex justify-center pt-4'>
                <Button
                  type='submit'
                  className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                >
                  기업 회원가입
                </Button>
              </div>
            </form>
          ) : (
            // 개인 사용자 회원가입 폼
            <div className='text-center space-y-6'>
              <h2 className='text-2xl font-bold text-white'>
                개인 사용자 회원가입
              </h2>
              <p className='text-white/60'>
                개인 정보를 입력하여 회원가입을 완료하세요.
              </p>
              <p className='text-white/60'>
                개인 사용자 회원가입을 원하시면 아래 버튼을 클릭하세요.
              </p>

              {/* 개인 사용자 회원가입 버튼 - 정중앙 위치, 입력칸과 너비 맞춤 */}
              <div className='flex justify-center pt-4'>
                <Button
                  onClick={() => router.push('/register/user')}
                  className='w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                >
                  개인 사용자 회원가입으로 이동
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
      />
    </div>
  );
}
