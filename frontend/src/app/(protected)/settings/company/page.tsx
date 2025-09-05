'use client';

import { useState, useEffect, Suspense } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import { authUtils } from '@/lib/axiosClient';
import AddressSearchModal from '@/components/common/AddressSearchModal';
import { enhanceAddressWithEnglish } from '@/lib';
import { 
  Building2, 
  Edit
} from 'lucide-react';

interface CompanyInfo {
  company_id: string;
  installation: string;
  installation_en: string;
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

interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  buildingNumber: string;
  postalCode: string;
  cityName: string;
  latitude: number | null;
  longitude: number | null;
  fullAddress?: string; // 전체 주소 (JSON에서 받아옴)
}


const CompanySettingsContent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 기업 정보 상태
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_id: '',
    installation: '',
    installation_en: '',
    economic_activity: '',
    economic_activity_en: '',
    representative: '',
    representative_en: '',
    email: '',
    telephone: '',
    street: '',
    street_en: '',
    number: '',
    number_en: '',
    postcode: '',
    city: '',
    city_en: '',
    country: '',
    country_en: '',
    country_code: '',
    unlocode: '',
    source_latitude: null,
    source_longitude: null
  });

  const [tempCompanyInfo, setTempCompanyInfo] = useState<CompanyInfo>(companyInfo);

  // 로그인한 사용자 정보 가져오기
  const getCurrentUser = () => {
    return authUtils.getUserId();
  };

  // 기업 정보 로드
  const loadCompanyInfo = async () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    console.log('현재 로그인한 사용자 ID:', currentUser);

    try {
      setIsLoading(true);
      setError(null);

      // 로그인한 사용자의 정보를 가져와서 기업 정보 조회
      const requestBody = {
        username: currentUser
      };
      
      console.log('사용자 정보 조회 요청:', requestBody);

      const response = await fetch('/api/v1/auth/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('사용자 정보 조회 응답:', result);

      if (result.success) {
        setCompanyInfo(result.data);
        setTempCompanyInfo(result.data);
        console.log('기업 정보 로드 성공:', result.data);
      } else {
        setError(result.message || '기업 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('기업 정보 로드 실패:', err);
      setError('기업 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 기업 정보 로드
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  // 기업 정보 편집 처리
  const handleCompanyInfoSave = async () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    console.log('기업 정보 업데이트 - 사용자 ID:', currentUser);

    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        company_id: currentUser,
        installation: tempCompanyInfo.installation,
        installation_en: tempCompanyInfo.installation_en,
        economic_activity: tempCompanyInfo.economic_activity,
        economic_activity_en: tempCompanyInfo.economic_activity_en,
        representative: tempCompanyInfo.representative,
        representative_en: tempCompanyInfo.representative_en,
        email: tempCompanyInfo.email,
        telephone: tempCompanyInfo.telephone,
        street: tempCompanyInfo.street,
        street_en: tempCompanyInfo.street_en,
        number: tempCompanyInfo.number,
        number_en: tempCompanyInfo.number_en,
        postcode: tempCompanyInfo.postcode,
        city: tempCompanyInfo.city,
        city_en: tempCompanyInfo.city_en,
        country: tempCompanyInfo.country,
        country_en: tempCompanyInfo.country_en,
        unlocode: tempCompanyInfo.unlocode,
        source_latitude: tempCompanyInfo.source_latitude,
        source_longitude: tempCompanyInfo.source_longitude
      };

      console.log('기업 정보 업데이트 요청:', requestBody);

      const response = await fetch('/api/v1/auth/company/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('기업 정보 업데이트 응답:', result);

      if (result.success) {
        setCompanyInfo(tempCompanyInfo);
        setIsEditing(false);
        // 성공 메시지 표시 (선택사항)
        alert('기업 정보가 성공적으로 업데이트되었습니다.');
      } else {
        setError(result.message || '기업 정보 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('기업 정보 업데이트 실패:', err);
      setError('기업 정보 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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

  // 주소 선택 핸들러 (회원가입과 동일한 로직)
  const handleAddressSelect = async (addressData: AddressData) => {
    try {
      // 전체 주소 구성 (JSON에서 받아온 전체 주소 사용)
      const fullAddress = addressData.fullAddress || `${addressData.cityName || ''} ${addressData.roadAddress || ''} ${addressData.buildingNumber || ''}`.trim();
      
      console.log('전체 주소로 영문 변환 시작:', fullAddress);
      
      // 행정안전부 API를 통해 영문 주소 변환
      const enhancedAddress = await enhanceAddressWithEnglish({
        roadAddress: addressData.roadAddress,
        buildingNumber: addressData.buildingNumber,
        cityName: addressData.cityName,
        postalCode: addressData.postalCode,
        fullAddress: fullAddress, // 전체 주소 전달
      });

      setTempCompanyInfo(prev => ({
        ...prev,
        street: addressData.roadAddress || '', // 국문 도로명
        street_en: enhancedAddress.englishRoad || '', // 영문 도로명 (직접 사용)
        number: addressData.buildingNumber || '', // 국문 건물번호
        number_en: addressData.buildingNumber || '', // 건물번호 영문 = 국문 (동기화)
        postcode: enhancedAddress.postalCode || addressData.postalCode || '',
        city: addressData.cityName || '', // 국문 도시명
        city_en: enhancedAddress.englishCity || '', // 영문 도시명 (직접 사용)
        source_latitude: addressData.latitude, // 카카오 API에서 받은 위도
        source_longitude: addressData.longitude, // 카카오 API에서 받은 경도
      }));

      console.log('영문 주소 변환 완료:', enhancedAddress);
      console.log('영문 도로명:', enhancedAddress.englishRoad);
      console.log('영문 도시명:', enhancedAddress.englishCity);
      console.log('영문 전체 주소:', enhancedAddress.fullAddress_en);
    } catch (error) {
      console.error('영문 주소 변환 실패:', error);
      // 변환 실패 시 기존 방식으로 처리
      setTempCompanyInfo(prev => ({
        ...prev,
        street: addressData.roadAddress || '',
        street_en: '',
        number: addressData.buildingNumber || '',
        number_en: addressData.buildingNumber || '',
        postcode: addressData.postalCode || '',
        city: addressData.cityName || '',
        city_en: '',
        source_latitude: addressData.latitude,
        source_longitude: addressData.longitude,
      }));
    }
  };


  const renderCompanyInfoTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">기업 정보 관리</h3>
          <p className="text-gray-600">회원가입 시 입력한 기업 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleCompanyInfoEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
            <Edit className="w-4 h-4 mr-2" />
            편집하기
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button onClick={handleCompanyInfoSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
              저장하기
            </Button>
            <Button onClick={handleCompanyInfoCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
              취소
            </Button>
          </div>
        )}
      </div>

      {/* 계정 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800">계정 정보</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              기업 ID
            </label>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <span className="text-gray-800 font-medium">{companyInfo.company_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 기업 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800">기업 정보</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              사업장명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.installation}
                onChange={(e) => handleCompanyInfoChange('installation', e.target.value)}
                placeholder="사업장명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.installation}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              사업장 영문명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.installation_en}
                onChange={(e) => handleCompanyInfoChange('installation_en', e.target.value)}
                placeholder="사업장 영문명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.installation_en}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              업종명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.economic_activity}
                onChange={(e) => handleCompanyInfoChange('economic_activity', e.target.value)}
                placeholder="업종명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.economic_activity}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              업종명 영문명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.economic_activity_en}
                onChange={(e) => handleCompanyInfoChange('economic_activity_en', e.target.value)}
                placeholder="업종명 영문명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.economic_activity_en}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              대표자명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.representative}
                onChange={(e) => handleCompanyInfoChange('representative', e.target.value)}
                placeholder="대표자명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.representative}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              영문대표자명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.representative_en}
                onChange={(e) => handleCompanyInfoChange('representative_en', e.target.value)}
                placeholder="영문대표자명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.representative_en}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              이메일
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.email}
                onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                type="email"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              전화번호
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.telephone}
                onChange={(e) => handleCompanyInfoChange('telephone', e.target.value)}
                placeholder="전화번호를 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.telephone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 주소 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800">주소 정보</h4>
        </div>

        {/* 주소 검색 버튼 (편집 모드일 때만 표시) */}
        {isEditing && (
          <div className="mb-6">
            <Button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            >
              주소 검색
            </Button>
            <div className="mt-2 text-sm text-blue-600">
              📍 주소 검색 시 행정안전부 API를 통해 영문 주소가 자동으로 변환되고, 카카오 지도 API를 통해 위도/경도가 자동으로 설정됩니다.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              도로명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.street}
                onChange={(e) => handleCompanyInfoChange('street', e.target.value)}
                placeholder="도로명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.street}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              건물 번호
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.number}
                onChange={(e) => handleCompanyInfoChange('number', e.target.value)}
                placeholder="건물 번호를 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.number}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              우편번호
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.postcode}
                onChange={(e) => handleCompanyInfoChange('postcode', e.target.value)}
                placeholder="우편번호를 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.postcode}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              도시명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.city}
                onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                placeholder="도시명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.city}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              국가명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.country}
                onChange={(e) => handleCompanyInfoChange('country', e.target.value)}
                placeholder="국가명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.country}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              국가영문명
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.country_en}
                onChange={(e) => handleCompanyInfoChange('country_en', e.target.value)}
                placeholder="영문 국가명을 입력하세요"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.country_en}</span>
              </div>
            )}
          </div>

          {/* 영문 주소 정보 */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              도로명 (영문)
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.street_en}
                onChange={(e) => handleCompanyInfoChange('street_en', e.target.value)}
                placeholder="영문 도로명 (자동 입력)"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                readOnly
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.street_en}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              건물 번호 (영문)
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.number_en}
                onChange={(e) => handleCompanyInfoChange('number_en', e.target.value)}
                placeholder="영문 건물 번호 (자동 입력)"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                readOnly
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.number_en}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              도시명 (영문)
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.city_en}
                onChange={(e) => handleCompanyInfoChange('city_en', e.target.value)}
                placeholder="영문 도시명 (자동 입력)"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                readOnly
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.city_en}</span>
              </div>
            )}
          </div>

          {/* 위도/경도 정보 */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              위도 (Latitude)
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.source_latitude || ''}
                onChange={(e) => handleCompanyInfoChange('source_latitude', e.target.value)}
                placeholder="위도 (자동 입력)"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                readOnly
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.source_latitude || '-'}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              경도 (Longitude)
            </label>
            {isEditing ? (
              <Input
                value={tempCompanyInfo.source_longitude || ''}
                onChange={(e) => handleCompanyInfoChange('source_longitude', e.target.value)}
                placeholder="경도 (자동 입력)"
                className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                readOnly
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">{companyInfo.source_longitude || '-'}</span>
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
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg'>
          <div className='flex items-center mb-4'>
            <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4'>
              <Building2 className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold mb-2'>기업 설정</h1>
              <p className='text-blue-100 text-lg'>
                회원가입 시 입력한 기업 정보를 확인하고 수정할 수 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* 기업 정보 콘텐츠 */}
        <div className='flex-1 min-h-0'>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">기업 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">오류 발생</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadCompanyInfo} className="bg-blue-600 hover:bg-blue-700 text-white">
                  다시 시도
                </Button>
              </div>
            </div>
          ) : (
            renderCompanyInfoTab()
          )}
        </div>
      </div>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
      />

    </CommonShell>
  );
};

const CompanySettingsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <CompanySettingsContent />
    </Suspense>
  );
};

export default CompanySettingsPage;
