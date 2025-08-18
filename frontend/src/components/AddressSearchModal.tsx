'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

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

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (addressData: AddressData) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onAddressSelect,
}: AddressSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 카카오 주소 검색 API 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // 모달 외부 클릭 시 닫기
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    
    // 카카오 주소 검색 API 호출
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data: any) => {
          const addressData: AddressData = {
            address: data.address,
            address_eng: data.addressEng || data.address,
            zipcode: data.zonecode,
            country: 'KR', // 한국 기본값
            country_eng: 'Korea',
            city: data.sido,
            city_eng: getCityEnglish(data.sido),
            address1: data.address,
            address1_eng: data.addressEng || data.address,
          };
          
          onAddressSelect(addressData);
          onClose();
          setIsSearching(false);
        },
        onclose: () => {
          setIsSearching(false);
        },
        onresize: (size: any) => {
          // 모달 크기 조정
        },
        width: '100%',
        height: '100%',
      }).open();
    } else {
      // API가 로드되지 않은 경우 대체 검색
      performFallbackSearch();
    }
  };

  const performFallbackSearch = async () => {
    // 대체 검색 로직 (실제 구현에서는 다른 주소 API 사용)
    setIsSearching(false);
    // 임시로 더미 데이터 반환
    const dummyData: AddressData = {
      address: `${searchKeyword} 주소`,
      address_eng: `${searchKeyword} Address`,
      zipcode: '12345',
      country: 'KR',
      country_eng: 'Korea',
      city: '서울특별시',
      city_eng: 'Seoul',
      address1: `${searchKeyword} 상세주소`,
      address1_eng: `${searchKeyword} Detail Address`,
    };
    
    onAddressSelect(dummyData);
    onClose();
  };

  const getCityEnglish = (city: string): string => {
    const cityMap: { [key: string]: string } = {
      '서울특별시': 'Seoul',
      '부산광역시': 'Busan',
      '대구광역시': 'Daegu',
      '인천광역시': 'Incheon',
      '광주광역시': 'Gwangju',
      '대전광역시': 'Daejeon',
      '울산광역시': 'Ulsan',
      '세종특별자치시': 'Sejong',
      '경기도': 'Gyeonggi-do',
      '강원도': 'Gangwon-do',
      '충청북도': 'Chungcheongbuk-do',
      '충청남도': 'Chungcheongnam-do',
      '전라북도': 'Jeollabuk-do',
      '전라남도': 'Jeollanam-do',
      '경상북도': 'Gyeongsangbuk-do',
      '경상남도': 'Gyeongsangnam-do',
      '제주특별자치도': 'Jeju-do',
    };
    
    return cityMap[city] || city;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            주소 검색
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="p-6">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="주소를 입력하세요 (예: 강남대로, 홍대입구)"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchKeyword.trim()}
              className="px-6"
            >
              {isSearching ? '검색 중...' : '검색'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            도로명, 건물명, 지번 등을 입력하여 주소를 검색하세요.
          </p>
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              검색 결과
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.address}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.zipcode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline" className="mr-2">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
