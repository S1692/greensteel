'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axiosClient';

interface RegisterError {
  message: string;
}

type TabType = 'company' | 'user';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RegisterError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // 기업 회원가입 상태
  const [companyData, setCompanyData] = useState({
    name_ko: '',
    name_en: '',
    biz_no: '',
    ceo_name: '',
    country: '',
    zipcode: '',
    city: '',
    address1: '',
    sector: '',
    industry_code: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    password: '',
    confirmPassword: '',
  });

  // User 회원가입 상태
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_id: '',
  });

  const handleCompanyInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 필수 필드 검증
    if (
      !companyData.name_ko ||
      !companyData.biz_no ||
      !companyData.manager_name ||
      !companyData.manager_phone ||
      !companyData.password ||
      !companyData.confirmPassword
    ) {
      setError({ message: '필수 필드를 모두 입력해주세요.' });
      return;
    }

    if (companyData.password !== companyData.confirmPassword) {
      setError({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (companyData.password.length < 8) {
      setError({ message: '비밀번호는 최소 8자 이상이어야 합니다.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosClient.post(
        '/auth/register/company',
        {
          ...companyData,
          password: companyData.password,
        }
      );
      setSuccess(`기업 등록이 완료되었습니다! 기업 ID: ${response.data.id}`);

      // 기업 ID를 User 회원가입에 설정
      setUserData(prev => ({
        ...prev,
        company_id: response.data.id.toString(),
      }));
      setActiveTab('user');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          setError({ message: axiosError.response.data.detail });
        } else {
          setError({ message: '기업 등록에 실패했습니다.' });
        }
      } else {
        setError({ message: '기업 등록 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 유효성 검사
    if (
      !userData.username ||
      !userData.password ||
      !userData.full_name ||
      !userData.company_id
    ) {
      setError({ message: '모든 필드를 입력해주세요.' });
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (userData.password.length < 8) {
      setError({ message: '비밀번호는 최소 8자 이상이어야 합니다.' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axiosClient.post('/auth/register/user', {
        username: userData.username,
        password: userData.password,
        full_name: userData.full_name,
        company_id: parseInt(userData.company_id),
      });

      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => {
        router.push('/landing');
      }, 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          setError({ message: axiosError.response.data.detail });
        } else {
          setError({ message: '사용자 등록에 실패했습니다.' });
        }
      } else {
        setError({ message: '사용자 등록 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenSteel</h1>
          <p className="text-gray-600">회원가입</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'company'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              기업 회원가입
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              User 회원가입
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* 기업 회원가입 폼 */}
          {activeTab === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                기업 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자(상점) 국문 이름{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.name_ko}
                    onChange={e =>
                      handleCompanyInputChange('name_ko', e.target.value)
                    }
                    placeholder="예: 스마트에스지"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자(상점) 영문 이름
                  </label>
                  <input
                    type="text"
                    value={companyData.name_en}
                    onChange={e =>
                      handleCompanyInputChange('name_en', e.target.value)
                    }
                    placeholder="예: Smart ESG"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.biz_no}
                    onChange={e =>
                      handleCompanyInputChange('biz_no', e.target.value)
                    }
                    placeholder="예: 1234567890"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={companyData.ceo_name}
                    onChange={e =>
                      handleCompanyInputChange('ceo_name', e.target.value)
                    }
                    placeholder="예: 홍길동"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">
                주소 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    국가
                  </label>
                  <input
                    type="text"
                    value={companyData.country}
                    onChange={e =>
                      handleCompanyInputChange('country', e.target.value)
                    }
                    placeholder="예: KR"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우편번호
                  </label>
                  <input
                    type="text"
                    value={companyData.zipcode}
                    onChange={e =>
                      handleCompanyInputChange('zipcode', e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    광역 도시명
                  </label>
                  <input
                    type="text"
                    value={companyData.city}
                    onChange={e =>
                      handleCompanyInputChange('city', e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    value={companyData.address1}
                    onChange={e =>
                      handleCompanyInputChange('address1', e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">
                업종 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업태/업종
                  </label>
                  <input
                    type="text"
                    value={companyData.sector}
                    onChange={e =>
                      handleCompanyInputChange('sector', e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업종 코드
                  </label>
                  <input
                    type="text"
                    value={companyData.industry_code}
                    onChange={e =>
                      handleCompanyInputChange('industry_code', e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">
                담당자 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    당직자 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.manager_name}
                    onChange={e =>
                      handleCompanyInputChange('manager_name', e.target.value)
                    }
                    placeholder="예: 김길동"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    당직자 연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.manager_phone}
                    onChange={e =>
                      handleCompanyInputChange('manager_phone', e.target.value)
                    }
                    placeholder="예: 010-1234-5678"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    당직자 이메일
                  </label>
                  <input
                    type="email"
                    value={companyData.manager_email}
                    onChange={e =>
                      handleCompanyInputChange('manager_email', e.target.value)
                    }
                    placeholder="예: manager@smartesg.com"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">
                계정 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={companyData.password}
                    onChange={e =>
                      handleCompanyInputChange('password', e.target.value)
                    }
                    placeholder="********"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={companyData.confirmPassword}
                    onChange={e =>
                      handleCompanyInputChange('confirmPassword', e.target.value)
                    }
                    placeholder="********"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '등록 중...' : '기업 등록'}
              </button>
            </form>
          )}

          {/* User 회원가입 폼 */}
          {activeTab === 'user' && (
            <form onSubmit={handleUserSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                사용자 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userData.username}
                    onChange={e =>
                      handleUserInputChange('username', e.target.value)
                    }
                    placeholder="예: smartuser"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userData.full_name}
                    onChange={e =>
                      handleUserInputChange('full_name', e.target.value)
                    }
                    placeholder="예: 홍길동"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={e =>
                      handleUserInputChange('password', e.target.value)
                    }
                    placeholder="********"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={userData.confirmPassword}
                    onChange={e =>
                      handleUserInputChange('confirmPassword', e.target.value)
                    }
                    placeholder="********"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기업 ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userData.company_id}
                    onChange={e =>
                      handleUserInputChange('company_id', e.target.value)
                    }
                    placeholder="기업 등록 후 발급된 ID"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    기업 회원가입을 먼저 완료한 후 발급받은 기업 ID를
                    입력해주세요.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '등록 중...' : '사용자 등록'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a
                href="/landing"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                로그인
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
