'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import { Button } from './ui/Button';

interface KakaoMapData {
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
  onAddressSelect: (data: KakaoMapData) => void;
}

// 카카오 맵 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options?: any) => any;
        InfoWindow: new (options?: any) => any;
        services: {
          Geocoder: new () => any;
          Places: new () => any;
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
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
  const [selectedAddress, setSelectedAddress] = useState<KakaoMapData | null>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
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

  // 카카오 API 데이터를 주소 데이터로 변환
  const createAddressDataFromKakao = useCallback(
    (result: any): KakaoMapData => {
      const address = result.address.address_name;
      const address1 = result.address.address_name;
      const zipcode = result.address.zone_no || '';
      const country = '대한민국';
      const city = result.address.region_1depth_name || '';
      const country_eng = 'South Korea';
      const city_eng = getCityEnglish(city);
      const address_eng = address;
      const address1_eng = address1;

      return {
        address,
        address1,
        zipcode,
        country,
        city,
        country_eng,
        city_eng,
        address_eng,
        address1_eng,
      };
    },
    [getCityEnglish]
  );

  // 지도 클릭 시 주소 정보 가져오기
  const handleMapClick = useCallback(
    (latlng: any) => {
      if (!map || !marker || !infoWindow) return;

      // 마커 위치 설정
      marker.setPosition(latlng);
      marker.setMap(map);

      // 주소 정보 가져오기
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
        latlng.getLng(),
        latlng.getLat(),
        (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const addressData = createAddressDataFromKakao(result[0]);
            setSelectedAddress(addressData);

            // 정보창에 주소 표시
            infoWindow.setContent(`
              <div style="padding:10px;min-width:200px;">
                <strong>선택된 주소</strong><br/>
                ${addressData.address}<br/>
                ${addressData.city}
              </div>
            `);
            infoWindow.open(map, marker);
          }
        }
      );
    },
    [map, marker, infoWindow, createAddressDataFromKakao]
  );

  // 카카오 맵 초기화
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 3,
    };

    const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
    setMap(newMap);

    // 지도 클릭 이벤트
    newMap.addListener('click', (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      handleMapClick(latlng);
    });

    // 마커와 정보창 초기화
    const newMarker = new window.kakao.maps.Marker({});
    const newInfoWindow = new window.kakao.maps.InfoWindow({});
    setMarker(newMarker);
    setInfoWindow(newInfoWindow);
  }, [handleMapClick]);

  // 검색 실행
  const handleSearch = useCallback(() => {
    if (!searchKeyword.trim() || !map) return;

    setIsLoading(true);
    setSearchResults([]);

    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(searchKeyword, (results: any, status: any) => {
      setIsLoading(false);
      
      if (status === window.kakao.maps.services.Status.OK && results.length > 0) {
        setSearchResults(results);
        
        // 첫 번째 결과로 지도 이동
        const place = results[0];
        const latlng = new window.kakao.maps.LatLng(place.y, place.x);
        
        map.setCenter(latlng);
        map.setLevel(3);
        
        // 마커 표시
        if (marker) {
          marker.setPosition(latlng);
          marker.setMap(map);
        }
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 없습니다.');
      } else {
        alert('검색 중 오류가 발생했습니다.');
      }
    });
  }, [searchKeyword, map, marker]);

  // 검색 결과 선택
  const handleResultSelect = useCallback((place: any) => {
    if (!map) return;

    const latlng = new window.kakao.maps.LatLng(place.y, place.x);
    
    map.setCenter(latlng);
    map.setLevel(3);
    
    if (marker) {
      marker.setPosition(latlng);
      marker.setMap(map);
    }

    // 주소 정보 가져오기
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(
      latlng.getLng(),
      latlng.getLat(),
      (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addressData = createAddressDataFromKakao(result[0]);
          setSelectedAddress(addressData);
          
          if (infoWindow) {
            infoWindow.setContent(`
              <div style="padding:10px;min-width:200px;">
                <strong>선택된 주소</strong><br/>
                ${addressData.address}<br/>
                ${addressData.city}
              </div>
            `);
            infoWindow.open(map, marker);
          }
        }
      }
    );
  }, [map, marker, infoWindow, createAddressDataFromKakao]);

  // 현재 위치로 이동
  const handleCurrentLocation = useCallback(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new window.kakao.maps.LatLng(lat, lng);

          map.setCenter(latlng);
          map.setLevel(3);

          if (marker) {
            marker.setPosition(latlng);
            marker.setMap(map);
          }

          handleMapClick(latlng);
        },
        () => {
          alert('현재 위치를 가져올 수 없습니다.');
        }
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  }, [map, marker, handleMapClick]);

  // 주소 선택 확인
  const handleConfirm = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      onClose();
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setSearchKeyword('');
    setSelectedAddress(null);
    setSearchResults([]);
    setIsLoading(false);
    onClose();
  };

  // 카카오 맵 SDK 로드 완료 후 초기화
  useEffect(() => {
    if (isKakaoReady && mapContainerRef.current) {
      window.kakao.maps.load(() => {
        initializeMap();
      });
    }
  }, [isKakaoReady, initializeMap]);

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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 카카오 맵 SDK 로드 */}
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsKakaoReady(true);
        }}
        onError={() => {
          alert(
            '카카오 맵 SDK 로드에 실패했습니다. API 키와 도메인 설정을 확인해주세요.'
          );
        }}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">주소 검색</h2>
            <Button onClick={handleClose} variant="outline" className="px-3 py-1">
              ✕
            </Button>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* 왼쪽 검색 패널 */}
            <div className="w-full lg:w-80 p-4 border-r border-gray-200 space-y-4 overflow-y-auto">
              {/* 검색 입력 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  장소 검색
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    placeholder="장소명을 입력하세요"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isLoading || !searchKeyword.trim()}
                    className="px-4 py-2"
                  >
                    {isLoading ? '검색중...' : '🔍'}
                  </Button>
                </div>
              </div>

              {/* 버튼들 */}
              <div className="space-y-2">
                <Button
                  onClick={handleCurrentLocation}
                  variant="outline"
                  className="w-full"
                >
                  📍 현재 위치
                </Button>
              </div>

              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">검색 결과</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((place, index) => (
                      <div
                        key={index}
                        onClick={() => handleResultSelect(place)}
                        className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 text-sm"
                      >
                        <div className="font-medium">{place.place_name}</div>
                        <div className="text-gray-600 text-xs">{place.address_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 주소 */}
              {selectedAddress && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-800">선택된 주소</h3>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>주소:</strong> {selectedAddress.address}</p>
                    <p><strong>도시:</strong> {selectedAddress.city}</p>
                    <p><strong>우편번호:</strong> {selectedAddress.zipcode || '정보 없음'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽 지도 */}
            <div className="flex-1 p-4">
              <div
                ref={mapContainerRef}
                className="w-full h-full border border-gray-300 rounded-lg"
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
            <Button onClick={handleClose} variant="outline">
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedAddress}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              주소 선택
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
