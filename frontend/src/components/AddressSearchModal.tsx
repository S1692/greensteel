'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/Button';

interface KakaoAddressData {
  address: string;
  address1: string;
  zipcode: string;
  country: string;
  city: string;
  country_eng: string;
  city_eng: string;
  address_eng: string;
  address1_eng: string;
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (data: KakaoAddressData) => void;
}

// Daum Postcode 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcode;
    };
  }
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose: () => void;
}

interface DaumPostcode {
  open: () => void;
}

interface DaumPostcodeData {
  address: string;
  addressDetail?: string;
  zonecode?: string;
  sido?: string;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onAddressSelect,
}: AddressSearchModalProps) {
  const [selectedAddress, setSelectedAddress] = useState<KakaoAddressData | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 도시명 영문화
  const getCityEnglish = useCallback((city: string): string => {
    const cityMap: Record<string, string> = {
      서울특별시: 'Seoul',
      부산광역시: 'Busan',
      대구광역시: 'Daegu',
      인천광역시: 'Incheon',
      광주광역시: 'Gwangju',
      대전광역시: 'Daejeon',
      울산광역시: 'Ulsan',
      세종특별자치시: 'Sejong',
      경기도: 'Gyeonggi-do',
      강원도: 'Gangwon-do',
      충청북도: 'Chungcheongbuk-do',
      충청남도: 'Chungcheongnam-do',
      전라북도: 'Jeollabuk-do',
      전라남도: 'Jeollanam-do',
      경상북도: 'Gyeongsangbuk-do',
      경상남도: 'Gyeongsangnam-do',
      제주특별자치도: 'Jeju-do',
    };
    return cityMap[city] || city;
  }, []);

  // 주소 선택 처리
  const handleAddressSelect = useCallback(
    (data: DaumPostcodeData) => {
      const addressData: KakaoAddressData = {
        address: data.address,
        address1: data.addressDetail || data.address,
        zipcode: data.zonecode || '',
        country: '대한민국',
        city: data.sido || '',
        country_eng: 'South Korea',
        city_eng: getCityEnglish(data.sido || ''),
        address_eng: data.address,
        address1_eng: data.addressDetail || data.address,
      };

      setSelectedAddress(addressData);
    },
    [getCityEnglish]
  );

  // 주소 검색 실행
  const handleSearch = useCallback(() => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        handleAddressSelect(data);
      },
      onclose: function () {
        // 팝업이 닫힐 때 실행
      },
    }).open();
  }, [handleAddressSelect]);

  // 주소 선택 확인
  const handleConfirm = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      onClose();
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = useCallback(() => {
    setSelectedAddress(null);
    onClose();
  }, [onClose]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;

    script.onload = () => {
      // 스크립트 로드 완료
    };

    script.onerror = () => {
      alert('주소 검색 서비스 로드에 실패했습니다.');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ minHeight: '400px' }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">주소 검색</h2>
          <Button
            onClick={handleClose}
            variant="outline"
            className="px-3 py-1 hover:bg-gray-100"
          >
            ✕
          </Button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="text-center space-y-6">
            {/* 주소 검색 버튼 */}
            <div>
              <Button
                onClick={handleSearch}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
              >
                🔍 주소 검색하기
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                클릭하면 카카오 주소 검색 서비스가 팝업으로 열립니다
              </p>
            </div>

            {/* 선택된 주소 표시 */}
            {selectedAddress && (
              <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
                <h3 className="font-semibold text-lg text-blue-800 mb-4">
                  ✅ 선택된 주소
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">주소:</span>
                    <span className="text-gray-900">
                      {selectedAddress.address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">상세주소:</span>
                    <span className="text-gray-900">
                      {selectedAddress.address1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">우편번호:</span>
                    <span className="text-gray-900">
                      {selectedAddress.zipcode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">도시:</span>
                    <span className="text-gray-900">
                      {selectedAddress.city}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 사용 안내 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📋 사용 방법</h4>
              <ol className="text-sm text-blue-700 space-y-1 text-left">
                <li>1. &quot;주소 검색하기&quot; 버튼을 클릭합니다</li>
                <li>2. 팝업에서 주소를 검색하고 선택합니다</li>
                <li>3. 선택한 주소가 위에 표시됩니다</li>
                <li>4. &quot;주소 선택&quot; 버튼을 클릭하여 완료합니다</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-white">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAddress}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
          >
            주소 선택
          </Button>
        </div>
      </div>
    </div>
  );
}
