'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionTitle } from '@/components/ui/SectionTitle';
import TabGroup from '@/components/molecules/TabGroup';
import AddressSearchModal from '@/components/AddressSearchModal';

// 이미지의 데이터 구조에 맞춘 CompanyData 인터페이스
interface CompanyData {
  // 계정 정보 (유지)
  company_id: string;
  password: string;
  confirmPassword: string;
  
  // 사용자 직접 입력 필드
  Installation: string; // 사업장명
  Installation_en: string; // 사업장영문명
  economic_activity: string; // 업종명
  economic_activity_en: string; // 업종영문명
  representative: string; // 대표자명
  representative_en: string; // 영문대표자명
  email: string; // 이메일
  telephone: string; // 전화번호
  
  // 주소 검색 모달을 통해 자동 입력되는 필드 (읽기 전용)
  street: string; // 도로명
  street_en: string; // 도로영문명
  number: string; // 건물번호
  number_en: string; // 건물번호영문명
  postcode: string; // 우편번호
  city: string; // 도시명
  city_en: string; // 도시영문명
  country: string; // 국가명
  country_en: string; // 국가영문명
  unlocode: string; // UNLOCODE (DB 참조 - 미구현)
  sourcelatitude: string; // 사업장위도
  sourcelongitude: string; // 사업장경도
}

interface UserData {
  username: string;
  password: string;
  confirm_password: string;
  full_name: string;
  company_id: string;
}

// 주소 검색 모달에서 반환되는 데이터 구조 (KakaoAddressData와 동일)
interface AddressData {
  address: string;
  address1: string;
  zipcode: string;
  country: string;
  city: string;
  country_eng: string;
  city_eng: string;
  address_eng: string;
  address1_eng: string;
  // 추가 주소 관련 필드들
  street: string;
  street_en: string;
  number: string;
  number_en: string;
  sourcelatitude: string;
  sourcelongitude: string;
}

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'user'>('company');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    // 계정 정보
    company_id: '',
    password: '',
    confirmPassword: '',
    
    // 사용자 직접 입력 필드
    Installation: '',
    Installation_en: '',
    economic_activity: '',
    economic_activity_en: '',
    representative: '',
    representative_en: '',
    email: '',
    telephone: '',
    
    // 주소 검색 모달을 통해 자동 입력되는 필드
    street: '',
    street_en: '',
    number: '',
    number_en: '',
    postcode: '',
    city: '',
    city_en: '',
    country: '',
    country_en: '',
    unlocode: '', // DB 참조 - 미구현
    sourcelatitude: '',
    sourcelongitude: '',
  });

  const [userData, setUserData] = useState<UserData>({
    username: '',
    password: '',
    confirm_password: '',
    full_name: '',
    company_id: '',
  });

  const handleCompanyInputChange = (
    field: keyof CompanyData,
    value: string
  ) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 API 호출로 교체
    console.log('Company Data:', companyData);
    alert('기업 등록이 완료되었습니다!');
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 API 호출로 교체
    console.log('User Data:', userData);
    alert('사용자 등록이 완료되었습니다!');
  };

  const handleAddressSelect = (addressData: AddressData) => {
    setCompanyData(prev => ({
      ...prev,
      // 주소 검색 모달을 통해 자동 입력되는 필드들
      street: addressData.street,
      street_en: addressData.street_en,
      number: addressData.number,
      number_en: addressData.number_en,
      postcode: addressData.zipcode,
      city: addressData.city,
      city_en: addressData.city_eng,
      country: addressData.country,
      country_en: addressData.country_eng,
      sourcelatitude: addressData.sourcelatitude,
      sourcelongitude: addressData.sourcelongitude,
    }));
  };

  const tabs = [
    { id: 'company', label: '기업 회원가입' },
    { id: 'user', label: '사용자 회원가입' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            GreenSteel 회원가입
          </h1>
          <p className="text-lg text-gray-300">
            지속 가능한 미래를 위한 ESG 관리 플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'company' | 'user')}
          className="mb-8"
        />

        {/* Company 회원가입 폼 */}
        {activeTab === 'company' && (
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            {/* 계정 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>계정 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">ID *</label>
                  <Input
                    type="text"
                    value={companyData.company_id}
                    onChange={e =>
                      handleCompanyInputChange('company_id', e.target.value)
                    }
                    placeholder="예: smartesg"
                    required
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">비밀번호 *</label>
                  <Input
                    type="password"
                    value={companyData.password}
                    onChange={e =>
                      handleCompanyInputChange('password', e.target.value)
                    }
                    placeholder="********"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="stitch-label mb-1 block">
                    비밀번호 확인 *
                  </label>
                  <Input
                    type="password"
                    value={companyData.confirmPassword}
                    onChange={e =>
                      handleCompanyInputChange(
                        'confirmPassword',
                        e.target.value
                      )
                    }
                    placeholder="********"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* 기업 기본 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>기업 기본 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">사업장명 *</label>
                  <Input
                    type="text"
                    value={companyData.Installation}
                    onChange={e =>
                      handleCompanyInputChange('Installation', e.target.value)
                    }
                    placeholder="예: 스마트에스지"
                    required
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">사업장영문명</label>
                  <Input
                    type="text"
                    value={companyData.Installation_en}
                    onChange={e =>
                      handleCompanyInputChange('Installation_en', e.target.value)
                    }
                    placeholder="예: Smart ESG"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">업종명</label>
                  <Input
                    type="text"
                    value={companyData.economic_activity}
                    onChange={e =>
                      handleCompanyInputChange('economic_activity', e.target.value)
                    }
                    placeholder="예: 제조업"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">업종영문명</label>
                  <Input
                    type="text"
                    value={companyData.economic_activity_en}
                    onChange={e =>
                      handleCompanyInputChange('economic_activity_en', e.target.value)
                    }
                    placeholder="예: Manufacturing"
                  />
                </div>
              </div>
            </div>

            {/* 주소 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>주소 정보</SectionTitle>

              {/* 주소 검색 버튼 */}
              <div className="mb-4">
                <Button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  🔍 주소 검색
                </Button>
                <p className="text-sm text-gray-400 mt-2">
                  주소 검색을 통해 도로명, 건물번호, 우편번호, 도시, 국가 정보를 자동으로 입력할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 도로명 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">도로명 *</label>
                  <Input
                    type="text"
                    value={companyData.street}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 건물번호 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">건물번호 *</label>
                  <Input
                    type="text"
                    value={companyData.number}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 우편번호 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">우편번호 *</label>
                  <Input
                    type="text"
                    value={companyData.postcode}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 도시명 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">도시명 *</label>
                  <Input
                    type="text"
                    value={companyData.city}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 국가명 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">국가명 *</label>
                  <Input
                    type="text"
                    value={companyData.country}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* UNLOCODE - DB 참조 (미구현) */}
                <div>
                  <label className="stitch-label mb-1 block">UNLOCODE *</label>
                  <Input
                    type="text"
                    value={companyData.unlocode}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="DB 참조 (미구현)"
                    disabled={true}
                  />
                </div>
              </div>

              {/* 영문 주소 정보 (숨김 처리) */}
              <div className="hidden">
                <input type="hidden" value={companyData.street_en} />
                <input type="hidden" value={companyData.number_en} />
                <input type="hidden" value={companyData.city_en} />
                <input type="hidden" value={companyData.country_en} />
                <input type="hidden" value={companyData.sourcelatitude} />
                <input type="hidden" value={companyData.sourcelongitude} />
              </div>
            </div>

            {/* 대표자 및 연락처 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>대표자 및 연락처 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">대표자명</label>
                  <Input
                    type="text"
                    value={companyData.representative}
                    onChange={e =>
                      handleCompanyInputChange('representative', e.target.value)
                    }
                    placeholder="예: 홍길동"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">영문대표자명</label>
                  <Input
                    type="text"
                    value={companyData.representative_en}
                    onChange={e =>
                      handleCompanyInputChange('representative_en', e.target.value)
                    }
                    placeholder="예: Hong Gil-dong"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">이메일</label>
                  <Input
                    type="email"
                    value={companyData.email}
                    onChange={e =>
                      handleCompanyInputChange('email', e.target.value)
                    }
                    placeholder="예: contact@smartesg.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">전화번호</label>
                  <Input
                    type="tel"
                    value={companyData.telephone}
                    onChange={e =>
                      handleCompanyInputChange('telephone', e.target.value)
                    }
                    placeholder="예: 02-1234-5678"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button className="w-full max-w-md">기업 등록</Button>
            </div>
          </form>
        )}

        {/* User 회원가입 폼 */}
        {activeTab === 'user' && (
          <form
            onSubmit={handleUserSubmit}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* 계정 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>계정 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">ID *</label>
                  <Input
                    type="text"
                    value={userData.username}
                    onChange={e =>
                      handleUserInputChange('username', e.target.value)
                    }
                    placeholder="예: smartuser"
                    required
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">비밀번호 *</label>
                  <Input
                    type="password"
                    value={userData.password}
                    onChange={e =>
                      handleUserInputChange('password', e.target.value)
                    }
                    placeholder="********"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">
                    비밀번호 확인 *
                  </label>
                  <Input
                    type="password"
                    value={userData.confirm_password}
                    onChange={e =>
                      handleUserInputChange('confirm_password', e.target.value)
                    }
                    placeholder="********"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* 개인 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>개인 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">이름 *</label>
                  <Input
                    type="text"
                    value={userData.full_name}
                    onChange={e =>
                      handleUserInputChange('full_name', e.target.value)
                    }
                    placeholder="예: 홍길동"
                    required
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">기업 ID *</label>
                  <Input
                    type="text"
                    value={userData.company_id}
                    onChange={e =>
                      handleUserInputChange('company_id', e.target.value)
                    }
                    placeholder="기업 등록 후 발급된 ID"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button className="w-full max-w-md">사용자 등록</Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            이미 계정이 있으신가요?{' '}
            <a href="/landing" className="text-[var(--accent)] hover:underline">
              로그인
            </a>
          </p>
        </div>

        {/* 주소 검색 모달 */}
        <AddressSearchModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onAddressSelect={handleAddressSelect}
        />
      </div>
    </div>
  );
}
