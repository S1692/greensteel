'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionTitle } from '@/components/ui/SectionTitle';
import TabGroup from '@/components/molecules/TabGroup';
import AddressSearchModal from '@/components/AddressSearchModal';

interface CompanyData {
  username: string;
  password: string;
  confirm_password: string;
  name_ko: string;
  name_en: string;
  biz_no: string;
  ceo_name: string;
  ceo_name_en: string;
  country: string;
  country_eng: string;
  zipcode: string;
  city: string;
  city_eng: string;
  address: string;
  address_eng: string;
  address1: string;
  address1_eng: string;
  sector: string;
  industry_code: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
}

interface UserData {
  username: string;
  password: string;
  confirm_password: string;
  full_name: string;
  company_id: string;
}

interface AddressData {
  address: string;
  address_eng: string;
  zipcode: string;
  country: string;
  country_eng: string;
  city: string;
  city_eng: string;
  address1: string;
  address1_eng: string;
}

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'user'>('company');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyData>({
    username: '',
    password: '',
    confirm_password: '',
    name_ko: '',
    name_en: '',
    biz_no: '',
    ceo_name: '',
    ceo_name_en: '',
    country: '',
    country_eng: '',
    zipcode: '',
    city: '',
    city_eng: '',
    address: '',
    address_eng: '',
    address1: '',
    address1_eng: '',
    sector: '',
    industry_code: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
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

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 기업 등록 로직
      console.log('기업 등록 데이터:', companyData);

      // API 호출 로직
      await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 지연

      alert('기업 등록이 완료되었습니다.');
    } catch (error) {
      console.error('기업 등록 오류:', error);
      alert('기업 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 사용자 등록 로직
      console.log('사용자 등록 데이터:', userData);

      // API 호출 로직
      await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 지연

      alert('사용자 등록이 완료되었습니다.');
    } catch (error) {
      console.error('사용자 등록 오류:', error);
      alert('사용자 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (addressData: AddressData) => {
    setCompanyData(prev => ({
      ...prev,
      country: addressData.country,
      country_eng: addressData.country_eng,
      zipcode: addressData.zipcode,
      city: addressData.city,
      city_eng: addressData.city_eng,
      address: addressData.address,
      address_eng: addressData.address_eng,
      address1: addressData.address1,
      address1_eng: addressData.address1_eng,
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
            {/* 계정 정보를 상단으로 이동 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>계정 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">ID *</label>
                  <Input
                    type="text"
                    value={companyData.username}
                    onChange={e =>
                      handleCompanyInputChange('username', e.target.value)
                    }
                    placeholder="예: smartesg"
                    disabled={isLoading}
                    required
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
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="stitch-label mb-1 block">
                    비밀번호 확인 *
                  </label>
                  <Input
                    type="password"
                    value={companyData.confirm_password}
                    onChange={e =>
                      handleCompanyInputChange(
                        'confirm_password',
                        e.target.value
                      )
                    }
                    placeholder="********"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 기업 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>기업 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">
                    사업자(상점) 국문 이름 *
                  </label>
                  <Input
                    type="text"
                    value={companyData.name_ko}
                    onChange={e =>
                      handleCompanyInputChange('name_ko', e.target.value)
                    }
                    placeholder="예: 스마트에스지"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">
                    사업자(상점) 영문 이름
                  </label>
                  <Input
                    type="text"
                    value={companyData.name_en}
                    onChange={e =>
                      handleCompanyInputChange('name_en', e.target.value)
                    }
                    placeholder="예: Smart ESG"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">
                    사업자번호 *
                  </label>
                  <Input
                    type="text"
                    value={companyData.biz_no}
                    onChange={e =>
                      handleCompanyInputChange('biz_no', e.target.value)
                    }
                    placeholder="예: 1234567890"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">대표자명</label>
                  <Input
                    type="text"
                    value={companyData.ceo_name}
                    onChange={e =>
                      handleCompanyInputChange('ceo_name', e.target.value)
                    }
                    placeholder="예: 홍길동"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">
                    대표자명 (영문)
                  </label>
                  <Input
                    type="text"
                    value={companyData.ceo_name_en}
                    onChange={e =>
                      handleCompanyInputChange('ceo_name_en', e.target.value)
                    }
                    placeholder="예: Hong Gil-dong"
                    disabled={isLoading}
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
                  주소 검색을 통해 자동으로 우편번호, 국가, 도시 정보를 입력할
                  수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 우편번호 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">우편번호 *</label>
                  <Input
                    type="text"
                    value={companyData.zipcode}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 국가 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">국가 *</label>
                  <Input
                    type="text"
                    value={companyData.country}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 광역 도시명 - 자동 입력, 읽기 전용 */}
                <div>
                  <label className="stitch-label mb-1 block">
                    광역 도시명 *
                  </label>
                  <Input
                    type="text"
                    value={companyData.city}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="주소 검색으로 자동 입력"
                    disabled={true}
                  />
                </div>

                {/* 상세 주소 - 사용자 입력 */}
                <div>
                  <label className="stitch-label mb-1 block">상세 주소</label>
                  <Input
                    type="text"
                    value={companyData.address1}
                    onChange={e =>
                      handleCompanyInputChange('address1', e.target.value)
                    }
                    placeholder="상세 주소를 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 영문 주소 정보 (숨김 처리) */}
              <div className="hidden">
                <input type="hidden" value={companyData.country_eng} />
                <input type="hidden" value={companyData.city_eng} />
                <input type="hidden" value={companyData.address_eng} />
                <input type="hidden" value={companyData.address1_eng} />
              </div>
            </div>

            {/* 업종 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>업종 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">업태/업종</label>
                  <Input
                    type="text"
                    value={companyData.sector}
                    onChange={e =>
                      handleCompanyInputChange('sector', e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">업종 코드</label>
                  <Input
                    type="text"
                    value={companyData.industry_code}
                    onChange={e =>
                      handleCompanyInputChange('industry_code', e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* 담당자 정보 */}
            <div className="bg-[rgba(255,255,255,.03)] p-6 rounded-lg border border-[rgba(255,255,255,.1)]">
              <SectionTitle>담당자 정보</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stitch-label mb-1 block">
                    당직자 이름 *
                  </label>
                  <Input
                    type="text"
                    value={companyData.manager_name}
                    onChange={e =>
                      handleCompanyInputChange('manager_name', e.target.value)
                    }
                    placeholder="예: 김길동"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="stitch-label mb-1 block">
                    당직자 연락처 *
                  </label>
                  <Input
                    type="text"
                    value={companyData.manager_phone}
                    onChange={e =>
                      handleCompanyInputChange('manager_phone', e.target.value)
                    }
                    placeholder="예: 010-1234-5678"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="stitch-label mb-1 block">
                    당직자 이메일
                  </label>
                  <Input
                    type="email"
                    value={companyData.manager_email}
                    onChange={e =>
                      handleCompanyInputChange('manager_email', e.target.value)
                    }
                    placeholder="예: manager@smartesg.com"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button disabled={isLoading} className="w-full max-w-md">
                {isLoading ? '등록 중...' : '기업 등록'}
              </Button>
            </div>
          </form>
        )}

        {/* User 회원가입 폼 */}
        {activeTab === 'user' && (
          <form
            onSubmit={handleUserSubmit}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* 계정 정보를 상단으로 이동 */}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="md:col-span-2">
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
                    disabled={isLoading}
                    required
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button disabled={isLoading} className="w-full max-w-md">
                {isLoading ? '등록 중...' : '사용자 등록'}
              </Button>
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
