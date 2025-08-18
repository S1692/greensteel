'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  latitude?: number;
  longitude?: number;
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (addressData: AddressData) => void;
}

interface KakaoMapData {
  address: string;
  address_name: string;
  bname: string;
  bname1: string;
  bname2: string;
  building_name: string;
  main_address_no: string;
  mountain_yn: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  sub_address_no: string;
  zip_code: string;
  zone_no: string;
  x: string;
  y: string;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
}

interface KakaoMarker {
  setPosition(latlng: KakaoLatLng): void;
  setMap(map: KakaoMap | null): void;
}

interface KakaoInfoWindow {
  setContent(content: string): void;
  open(map: KakaoMap, marker: KakaoMarker): void;
}

interface KakaoGeocoder {
  coord2Address(
    lng: number,
    lat: number,
    callback: (result: KakaoMapData[], status: string) => void
  ): void;
}

interface KakaoPlaces {
  keywordSearch(
    keyword: string,
    callback: (results: any[], status: string) => void
  ): void;
}

interface KakaoMapsServices {
  Status: {
    OK: string;
  };
  Geocoder: new () => KakaoGeocoder;
  Places: new () => KakaoPlaces;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (
          container: HTMLElement,
          options: Record<string, unknown>
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options?: Record<string, unknown>) => KakaoMarker;
        InfoWindow: new (options: Record<string, unknown>) => KakaoInfoWindow;
        services: KakaoMapsServices;
        event: {
          addListener(
            map: KakaoMap,
            event: string,
            callback: (event: { latLng: KakaoLatLng }) => void
          ): void;
        };
      };
    };
  }
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onAddressSelect,
}: AddressSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [marker, setMarker] = useState<KakaoMarker | null>(null);
  const [infoWindow, setInfoWindow] = useState<KakaoInfoWindow | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const getCityEnglish = useCallback((city: string): string => {
    const cityMap: { [key: string]: string } = {
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

  const createAddressDataFromKakao = useCallback(
    (addressData: KakaoMapData, latlng: KakaoLatLng): AddressData => {
      const city = addressData.region_1depth_name || '서울특별시';
      const district = addressData.region_2depth_name || '';
      const neighborhood = addressData.region_3depth_name || '';

      return {
        address: `${city} ${district} ${neighborhood}`.trim(),
        address_eng: `${city} ${district} ${neighborhood}`.trim(),
        zipcode: addressData.zip_code || '00000',
        country: 'KR',
        country_eng: 'Korea',
        city: city,
        city_eng: getCityEnglish(city),
        address1: `${addressData.bname} ${
          addressData.building_name || ''
        }`.trim(),
        address1_eng: `${addressData.bname} ${
          addressData.building_name || ''
        }`.trim(),
        latitude: latlng.getLat(),
        longitude: latlng.getLng(),
      };
    },
    [getCityEnglish]
  );

  const handleMapClick = useCallback(
    async (latlng: KakaoLatLng) => {
      if (!map || !marker || !infoWindow) return;

      // 마커 위치 설정
      marker.setPosition(latlng);
      marker.setMap(map);

      // 좌표를 주소로 변환
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
        latlng.getLng(),
        latlng.getLat(),
        (result: KakaoMapData[], status: string) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const addressData = result[0];
            const addressInfo = createAddressDataFromKakao(addressData, latlng);
            setSelectedAddress(addressInfo);

            // 정보창 표시
            infoWindow.setContent(`
              <div style="padding:10px;min-width:200px;">
                <h4 style="margin:0 0 10px 0;font-size:14px;">선택된 주소</h4>
                <p style="margin:5px 0;font-size:12px;"><strong>주소:</strong> ${addressInfo.address}</p>
                <p style="margin:5px 0;font-size:12px;"><strong>우편번호:</strong> ${addressInfo.zipcode}</p>
                <p style="margin:5px 0;font-size:12px;"><strong>지역:</strong> ${addressInfo.city}</p>
                <button onclick="window.selectAddress()" style="margin-top:10px;padding:5px 10px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer;">
                  이 주소 선택
                </button>
              </div>
            `);
            infoWindow.open(map, marker);

            // 전역 함수로 주소 선택 함수 등록
            (window as unknown as Record<string, unknown>).selectAddress =
              () => {
                onAddressSelect(addressInfo);
                onClose();
              };
          }
        }
      );
    },
    [
      map,
      marker,
      infoWindow,
      createAddressDataFromKakao,
      onAddressSelect,
      onClose,
    ]
  );

  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청
      level: 3,
    };

    const kakaoMap = new window.kakao.maps.Map(
      mapContainerRef.current,
      options
    );
    const kakaoMarker = new window.kakao.maps.Marker();
    const kakaoInfoWindow = new window.kakao.maps.InfoWindow({
      content:
        '<div style="padding:5px;font-size:12px;">위치를 클릭하세요</div>',
    });

    setMap(kakaoMap);
    setMarker(kakaoMarker);
    setInfoWindow(kakaoInfoWindow);

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(
      kakaoMap,
      'click',
      (mouseEvent: { latLng: KakaoLatLng }) => {
        const latlng = mouseEvent.latLng;
        handleMapClick(latlng);
      }
    );
  }, [handleMapClick]);

  useEffect(() => {
    // 카카오 지도 API 스크립트가 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      initializeMap();
      return;
    }

    // 새 스크립트 생성 및 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'YOUR_KAKAO_MAP_API_KEY'
    }&libraries=services`;
    script.async = true;
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 초기화
      setTimeout(initializeMap, 100); // 약간의 지연을 두어 API가 완전히 준비되도록 함
    };
    script.onerror = () => {
      console.error('카카오 지도 API 스크립트 로드 실패');
      // 에러 발생 시 사용자에게 알림
      alert('지도 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.');
    };

    document.head.appendChild(script);

    return () => {
      // 클린업: 스크립트 제거
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    // 모달 외부 클릭 시 닫기
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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

  const handleSearch = async () => {
    if (!searchKeyword.trim() || !map) return;

    setIsSearching(true);

    try {
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(searchKeyword, (results: any[], status: string) => {
        setIsSearching(false);

        if (
          status === window.kakao.maps.services.Status.OK &&
          results.length > 0
        ) {
          const place = results[0];
          const latlng = new window.kakao.maps.LatLng(place.y, place.x);

          // 지도 중심을 검색 결과로 이동
          map.setCenter(latlng);
          map.setLevel(3);

          // 마커 표시
          handleMapClick(latlng);
        } else {
          alert('검색 결과가 없습니다. 다른 키워드로 검색해보세요.');
        }
      });
    } catch (error) {
      setIsSearching(false);
      alert('주소 검색 중 오류가 발생했습니다.');
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !map) {
      alert('현재 위치를 가져올 수 없습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const latlng = new window.kakao.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );

        map.setCenter(latlng);
        map.setLevel(3);
        handleMapClick(latlng);
      },
      () => {
        alert('현재 위치를 가져오는데 실패했습니다.');
      }
    );
  };

  const handleConfirmSelection = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      onClose();
    } else {
      alert('지도에서 주소를 선택해주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🗺️ 지도로 주소 검색
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 검색 입력 및 컨트롤 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="주소, 건물명, 지점명을 입력하세요 (예: 강남대로, 홍대입구, 롯데월드타워)"
              className="flex-1"
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchKeyword.trim()}
              className="px-6"
            >
              {isSearching ? '검색 중...' : '🔍 검색'}
            </Button>
            <Button
              onClick={handleCurrentLocation}
              variant="outline"
              className="px-4"
            >
              📍 현재 위치
            </Button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>지도에서 위치 클릭</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>검색어로 주소 찾기</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>현재 위치 사용</span>
            </div>
          </div>
        </div>

        {/* 지도 컨테이너 */}
        <div className="flex-1 p-6">
          <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <div
              ref={mapContainerRef}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />

            {/* 지도 로딩 오버레이 */}
            {!map && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    지도를 불러오는 중...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 선택된 주소 정보 */}
        {selectedAddress && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                📍 선택된 주소 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>주소:</strong> {selectedAddress.address}
                  </p>
                  <p>
                    <strong>상세주소:</strong> {selectedAddress.address1}
                  </p>
                  <p>
                    <strong>우편번호:</strong> {selectedAddress.zipcode}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>도시:</strong> {selectedAddress.city}
                  </p>
                  <p>
                    <strong>국가:</strong> {selectedAddress.country_eng}
                  </p>
                  {selectedAddress.latitude && (
                    <p>
                      <strong>좌표:</strong>{' '}
                      {selectedAddress.latitude.toFixed(6)},{' '}
                      {selectedAddress.longitude?.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 지도에서 원하는 위치를 클릭하거나 검색어를 입력하여 주소를
            찾으세요
          </div>
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="outline">
              취소
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedAddress}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {selectedAddress ? '✅ 주소 선택 완료' : '주소를 선택해주세요'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
