'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axiosClient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';

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
    confirm_password: '',
  });

  // User 회원가입 상태
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirm_password: '',
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
      !companyData.confirm_password
    ) {
      setError({ message: '필수 필드를 모두 입력해주세요.' });
      return;
    }

    if (companyData.password !== companyData.confirm_password) {
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
      // Auth Service 스키마에 맞는 데이터만 전송
      const requestData = {
        name_ko: companyData.name_ko,
        name_en: companyData.name_en,
        biz_no: companyData.biz_no,
        ceo_name: companyData.ceo_name,
        country: companyData.country,
        zipcode: companyData.zipcode,
        city: companyData.city,
        address1: companyData.address1,
        sector: companyData.sector,
        industry_code: companyData.industry_code,
        manager_name: companyData.manager_name,
        manager_phone: companyData.manager_phone,
        manager_email: companyData.manager_email,
        username: companyData.name_ko.toLowerCase().replace(/\s+/g, ''), // 기업명을 기반으로 username 생성
        password: companyData.password,
        confirm_password: companyData.confirm_password,
      };

      const response = await axiosClient.post(
        '/auth/register/company',
        requestData
      );

      // 응답 데이터 안전한 검증
      if (response && response.data) {
        const responseData = response.data;

        // 응답 데이터 구조 확인
        if (typeof responseData === 'object' && responseData.id) {
          setSuccess(`기업 등록이 완료되었습니다! 기업 ID: ${responseData.id}`);

          // 기업 ID를 User 회원가입에 설정
          setUserData((prev: typeof userData) => ({
            ...prev,
            company_id: responseData.id.toString(),
          }));
          setActiveTab('user');
        } else if (responseData.message) {
          // 메시지만 있는 경우
          setSuccess(responseData.message);
        } else {
          setError({ message: '기업 등록은 성공했지만 ID를 받지 못했습니다.' });
        }
      } else {
        setError({ message: '기업 등록 응답을 받지 못했습니다.' });
      }
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

    if (userData.password !== userData.confirm_password) {
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
    <div className="min-h-screen stitch-bg py-14 px-4">
      <div className="stitch-card max-w-4xl mx-auto p-8">
        <h1 className="stitch-h1 text-2xl font-semibold text-center">
          GreenSteel
        </h1>
        <p
          className="text-center text-[13px] mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          회원가입
        </p>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 bg-[rgba(255,255,255,.05)] p-1 rounded-full w-full max-w-md mx-auto mb-6">
          <button
            className="stitch-tab w-1/2"
            data-active={activeTab === 'company'}
            onClick={() => setActiveTab('company')}
          >
            기업 회원가입
          </button>
          <button
            className="stitch-tab w-1/2"
            data-active={activeTab === 'user'}
            onClick={() => setActiveTab('user')}
          >
            User 회원가입
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-[rgba(239,68,68,.1)] border border-[rgba(239,68,68,.35)] rounded-md p-3">
            <p className="stitch-error">{error.message}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-[rgba(34,197,94,.1)] border border-[rgba(34,197,94,.35)] rounded-md p-3">
            <p className="text-[var(--text-1)] text-sm">{success}</p>
          </div>
        )}

        {/* 기업 회원가입 폼 */}
        {activeTab === 'company' && (
          <form
            onSubmit={handleCompanySubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <SectionTitle>기업 정보</SectionTitle>
            <div className="md:col-span-1">
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
            <div className="md:col-span-1">
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

            <div className="md:col-span-1">
              <label className="stitch-label mb-1 block">사업자번호 *</label>
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
            <div className="md:col-span-1">
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

            <SectionTitle>주소 정보</SectionTitle>
            <div>
              <label className="stitch-label mb-1 block">국가</label>
              <Input
                type="text"
                value={companyData.country}
                onChange={e =>
                  handleCompanyInputChange('country', e.target.value)
                }
                placeholder="예: KR"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="stitch-label mb-1 block">우편번호</label>
              <Input
                type="text"
                value={companyData.zipcode}
                onChange={e =>
                  handleCompanyInputChange('zipcode', e.target.value)
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="stitch-label mb-1 block">광역 도시명</label>
              <Input
                type="text"
                value={companyData.city}
                onChange={e => handleCompanyInputChange('city', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="stitch-label mb-1 block">상세 주소</label>
              <Input
                type="text"
                value={companyData.address1}
                onChange={e =>
                  handleCompanyInputChange('address1', e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <SectionTitle>업종 정보</SectionTitle>
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

            <SectionTitle>담당자 정보</SectionTitle>
            <div>
              <label className="stitch-label mb-1 block">당직자 이름 *</label>
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
              <label className="stitch-label mb-1 block">당직자 연락처 *</label>
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
              <label className="stitch-label mb-1 block">당직자 이메일</label>
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

            <SectionTitle>계정 정보</SectionTitle>
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
            <div>
              <label className="stitch-label mb-1 block">비밀번호 확인 *</label>
              <Input
                type="password"
                value={companyData.confirm_password}
                onChange={e =>
                  handleCompanyInputChange('confirm_password', e.target.value)
                }
                placeholder="********"
                disabled={isLoading}
                required
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <Button disabled={isLoading}>
                {isLoading ? '등록 중...' : '기업 등록'}
              </Button>
            </div>
          </form>
        )}

        {/* User 회원가입 폼 */}
        {activeTab === 'user' && (
          <form
            onSubmit={handleUserSubmit}
            className="space-y-4 max-w-md mx-auto"
          >
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
            <div>
              <label className="stitch-label mb-1 block">비밀번호 확인 *</label>
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
            <Button disabled={isLoading}>
              {isLoading ? '등록 중...' : '사용자 등록'}
            </Button>
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
      </div>
    </div>
  );
}
