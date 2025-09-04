'use client';

import { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import { 
  Building2, 
  Edit
} from 'lucide-react';

interface CompanyInfo {
  company_id: string;
  Installation: string;
  Installation_en: string;
  economic_activity: string;
  economic_activity_en: string;
  representative: string;
  representative_en: string;
  email: string;
  telephone: string;
  street: string;
  street_en: string;
  number: string;
  number_en: string;
  postcode: string;
  city: string;
  city_en: string;
  country: string;
  country_en: string;
  country_code: string;
  unlocode: string;
  source_latitude: number | null;
  source_longitude: number | null;
}


const CompanySettingsPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  // 기업 정보 상태
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_id: 'greensteel',
    Installation: 'GreenSteel Corporation',
    Installation_en: 'GreenSteel Corporation',
    economic_activity: '철강 및 금속 제조업',
    economic_activity_en: 'Steel and Metal Manufacturing',
    representative: '김대표',
    representative_en: 'Kim CEO',
    email: 'contact@greensteel.com',
    telephone: '02-1234-5678',
    street: '테헤란로',
    street_en: 'Teheran-ro',
    number: '123',
    number_en: '123',
    postcode: '06142',
    city: '강남구',
    city_en: 'Gangnam-gu',
    country: '대한민국',
    country_en: 'South Korea',
    country_code: 'KR',
    unlocode: 'KR',
    source_latitude: 37.5665,
    source_longitude: 126.9780
  });

  const [tempCompanyInfo, setTempCompanyInfo] = useState<CompanyInfo>(companyInfo);

  // 기업 정보 편집 처리
  const handleCompanyInfoSave = () => {
    setCompanyInfo(tempCompanyInfo);
    setIsEditing(false);
  };

  const handleCompanyInfoCancel = () => {
    setTempCompanyInfo(companyInfo);
    setIsEditing(false);
  };

  const handleCompanyInfoEdit = () => {
    setTempCompanyInfo(companyInfo);
    setIsEditing(true);
  };

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setTempCompanyInfo(prev => ({ ...prev, [field]: value }));
  };


  const renderCompanyInfoTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">기업 정보</h3>
        {!isEditing ? (
          <Button onClick={handleCompanyInfoEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            편집
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleCompanyInfoSave} size="sm">
              저장
            </Button>
            <Button onClick={handleCompanyInfoCancel} variant="outline" size="sm">
              취소
            </Button>
          </div>
        )}
      </div>

      {/* 계정 정보 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">계정 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ID</label>
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.company_id}
            </div>
          </div>
        </div>
      </div>

      {/* 기업 정보 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">기업 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">사업장명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.Installation}
                onChange={(e) => handleCompanyInfoChange('Installation', e.target.value)}
                placeholder="사업장명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.Installation}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">사업장 영문명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.Installation_en}
                onChange={(e) => handleCompanyInfoChange('Installation_en', e.target.value)}
                placeholder="사업장 영문명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.Installation_en}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">업종명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.economic_activity}
                onChange={(e) => handleCompanyInfoChange('economic_activity', e.target.value)}
                placeholder="업종명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.economic_activity}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">업종명 영문명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.economic_activity_en}
                onChange={(e) => handleCompanyInfoChange('economic_activity_en', e.target.value)}
                placeholder="업종명 영문명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.economic_activity_en}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">대표자명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.representative}
                onChange={(e) => handleCompanyInfoChange('representative', e.target.value)}
                placeholder="대표자명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.representative}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">영문대표자명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.representative_en}
                onChange={(e) => handleCompanyInfoChange('representative_en', e.target.value)}
                placeholder="영문대표자명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.representative_en}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.email}
                onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                type="email"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">전화번호</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.telephone}
                onChange={(e) => handleCompanyInfoChange('telephone', e.target.value)}
                placeholder="전화번호를 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.telephone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 주소 정보 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">주소 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">도로명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.street}
                onChange={(e) => handleCompanyInfoChange('street', e.target.value)}
                placeholder="도로명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.street}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">건물 번호</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.number}
                onChange={(e) => handleCompanyInfoChange('number', e.target.value)}
                placeholder="건물 번호를 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.number}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">우편번호</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.postcode}
                onChange={(e) => handleCompanyInfoChange('postcode', e.target.value)}
                placeholder="우편번호를 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.postcode}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">도시명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.city}
                onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                placeholder="도시명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.city}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">국가명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.country}
                onChange={(e) => handleCompanyInfoChange('country', e.target.value)}
                placeholder="국가명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.country}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">국가영문명</label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.country_en}
                onChange={(e) => handleCompanyInfoChange('country_en', e.target.value)}
                placeholder="영문 국가명을 입력하세요"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {companyInfo.country_en}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900'>기업 설정</h1>
          <p className='text-gray-600 text-xs lg:text-sm'>
            회원가입 시 입력한 기업 정보를 관리합니다.
          </p>
        </div>

        {/* 기업 정보 콘텐츠 */}
        <div className='flex-1 min-h-0'>
          {renderCompanyInfoTab()}
        </div>
      </div>

    </CommonShell>
  );
};

export default CompanySettingsPage;
