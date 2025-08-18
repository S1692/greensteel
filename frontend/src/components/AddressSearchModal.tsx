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
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options?: KakaoMarkerOptions) => KakaoMarker;
        InfoWindow: new (options?: KakaoInfoWindowOptions) => KakaoInfoWindow;
        services: {
          Geocoder: new () => KakaoGeocoder;
          Places: new () => KakaoPlaces;
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

// 구체적인 타입 정의
interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  addListener: (
    event: string,
    callback: (event: KakaoMouseEvent) => void
  ) => void;
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoMarker {
  setPosition: (latlng: KakaoLatLng) => void;
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoInfoWindow {
  setContent: (content: string) => void;
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

interface KakaoMouseEvent {
  latLng: KakaoLatLng;
}

interface KakaoGeocoder {
  coord2Address: (
    lng: number,
    lat: number,
    callback: (result: KakaoGeocoderResult[], status: string) => void
  ) => void;
}

interface KakaoPlaces {
  keywordSearch: (
    keyword: string,
    callback: (results: KakaoPlaceResult[], status: string) => void
  ) => void;
}

interface KakaoGeocoderResult {
  address: {
    address_name: string;
    zone_no: string;
    region_1depth_name: string;
  };
}

interface KakaoPlaceResult {
  place_name: string;
  address_name: string;
  x: string;
  y: string;
}

interface KakaoMarkerOptions {
  position?: KakaoLatLng;
}

interface KakaoInfoWindowOptions {
  content?: string;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onAddressSelect,
}: AddressSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<KakaoMapData | null>(
    null
  );
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [marker, setMarker] = useState<KakaoMarker | null>(null);
  const [infoWindow, setInfoWindow] = useState<KakaoInfoWindow | null>(null);
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<KakaoPlaceResult[]>([]);

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
    (result: KakaoGeocoderResult): KakaoMapData => {
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
    (latlng: KakaoLatLng) => {
      if (!map || !marker || !infoWindow) return;

      try {
        // 마커 위치 설정
        marker.setPosition(latlng);
        marker.setMap(map);

        // 주소 정보 가져오기
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result: KakaoGeocoderResult[], status: string) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
              const addressData = createAddressDataFromKakao(result[0]);
              
              // 상태 업데이트를 안전하게 처리
              setSelectedAddress(prev => {
                // 이전 상태와 동일한 경우 불필요한 리렌더링 방지
                if (prev && 
                    prev.address === addressData.address && 
                    prev.city === addressData.city) {
                  return prev;
                }
                return addressData;
              });

              // 정보창에 주소 표시 (z-index 문제 방지)
              const infoContent = `
                <div style="padding:10px;min-width:200px;background:white;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                  <strong style="color:#333;">선택된 주소</strong><br/>
                  <span style="color:#666;">${addressData.address}</span><br/>
                  <span style="color:#666;">${addressData.city}</span>
                </div>
              `;
              
              infoWindow.setContent(infoContent);
              infoWindow.open(map, marker);
            }
          }
        );
      } catch (error) {
        console.error('지도 클릭 처리 중 오류 발생:', error);
        // 오류 발생 시 기본 마커만 표시
        marker.setPosition(latlng);
        marker.setMap(map);
      }
    },
    [map, marker, infoWindow, createAddressDataFromKakao]
  );

  // 카카오 맵 초기화
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;

    const options: KakaoMapOptions = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 3,
    };

    const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
    setMap(newMap);

    // 지도 클릭 이벤트 (이벤트 버블링 방지)
    newMap.addListener('click', (mouseEvent: KakaoMouseEvent) => {
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
    places.keywordSearch(
      searchKeyword,
      (results: KakaoPlaceResult[], status: string) => {
        setIsLoading(false);

        if (
          status === window.kakao.maps.services.Status.OK &&
          results.length > 0
        ) {
          setSearchResults(results);

          // 첫 번째 결과로 지도 이동
          const place = results[0];
          const latlng = new window.kakao.maps.LatLng(
            parseFloat(place.y),
            parseFloat(place.x)
          );

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
      }
    );
  }, [searchKeyword, map, marker]);

  // 검색 결과 선택
  const handleResultSelect = useCallback(
    (place: KakaoPlaceResult) => {
      if (!map) return;

      const latlng = new window.kakao.maps.LatLng(
        parseFloat(place.y),
        parseFloat(place.x)
      );

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
        (result: KakaoGeocoderResult[], status: string) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const addressData = createAddressDataFromKakao(result[0]);
            setSelectedAddress(addressData);

            if (infoWindow && marker) {
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
    },
    [map, marker, infoWindow, createAddressDataFromKakao]
  );

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
  const handleClose = useCallback(() => {
    // 카카오 맵 요소들 정리
    if (marker) {
      marker.setMap(null);
    }
    if (infoWindow) {
      infoWindow.close();
    }
    
    // 상태 초기화
    setSearchKeyword('');
    setSelectedAddress(null);
    setSearchResults([]);
    setIsLoading(false);
    onClose();
  }, [onClose, marker, infoWindow]);

  // 모달 외부 클릭 시 닫기 (지도 영역 제외)
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!modalRef.current) return;
    
    // 지도 영역 클릭은 무시 (지도 내부 상호작용 허용)
    if (mapContainerRef.current && mapContainerRef.current.contains(event.target as Node)) {
      return;
    }
    
    // 모달 외부 클릭 시에만 닫기
    if (!modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  }, [handleClose]);

  // 카카오 맵 SDK 로드 완료 후 초기화
  useEffect(() => {
    if (isKakaoReady && mapContainerRef.current) {
      window.kakao.maps.load(() => {
        initializeMap();
      });
    }
  }, [isKakaoReady, initializeMap]);

  // 모달 외부 클릭 이벤트 리스너
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

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

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        {/* 모달이 제대로 로드되지 않았을 때의 폴백 메시지 */}
        {!isKakaoReady && (
          <div className="absolute inset-0 flex items-center justify-center z-[10001]">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">카카오 맵을 로딩 중입니다...</p>
            </div>
          </div>
        )}
        
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative z-[10000]"
          style={{ 
            minHeight: '600px',
            // 카카오 맵 요소들이 모달을 덮어쓰지 않도록 CSS 강화
            isolation: 'isolate'
          }}
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
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
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-white">
            {/* 왼쪽 검색 패널 */}
            <div className="w-full lg:w-80 p-4 border-r border-gray-200 space-y-4 overflow-y-auto bg-gray-50 relative z-20">
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
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !searchKeyword.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
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
                  className="w-full border-gray-300 hover:bg-gray-100"
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
                        className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-blue-50 text-sm bg-white"
                      >
                        <div className="font-medium">{place.place_name}</div>
                        <div className="text-gray-600 text-xs">
                          {place.address_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 주소 */}
              {selectedAddress && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-800">
                    선택된 주소
                  </h3>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>주소:</strong> {selectedAddress.address}
                    </p>
                    <p>
                      <strong>도시:</strong> {selectedAddress.city}
                    </p>
                    <p>
                      <strong>우편번호:</strong>{' '}
                      {selectedAddress.zipcode || '정보 없음'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽 지도 */}
            <div className="flex-1 p-4 bg-white relative z-10">
              <div
                ref={mapContainerRef}
                className="w-full h-full border border-gray-300 rounded-lg bg-gray-100"
                style={{ 
                  minHeight: '500px',
                  // 카카오 맵 요소들이 모달을 덮어쓰지 않도록 CSS 강화
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-white sticky bottom-0 z-20">
            <Button onClick={handleClose} variant="outline" className="border-gray-300 hover:bg-gray-100">
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
    </>
  );
}
