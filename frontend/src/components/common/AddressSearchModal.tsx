'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MapPin, X, Search, FileText } from 'lucide-react';

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
  onclose?: () => void;
}

interface DaumPostcode {
  open: () => void;
}

interface DaumPostcodeData {
  roadAddress?: string;
  jibunAddress?: string;
  buildingName?: string;
  zonecode?: string;
  sido?: string;
  sigungu?: string;
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: AddressData) => Promise<void>;
}

interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  buildingNumber: string;
  postalCode: string;
  cityName: string;
  latitude: number | null;
  longitude: number | null;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onSelect,
}: AddressSearchModalProps) {
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log('위도/경도 변환 시작:', address);
      console.log('카카오 API 키:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ? '설정됨' : '설정되지 않음');
      
      // 카카오 지도 API를 사용하여 주소를 좌표로 변환
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}`,
          },
        }
      );

      console.log('카카오 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('카카오 API 키가 유효하지 않습니다. 관리자에게 문의해주세요.');
        } else if (response.status === 429) {
          throw new Error('카카오 API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`카카오 지도 API 호출 실패: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('카카오 API 응답 데이터:', data);
      
      if (data.documents && data.documents.length > 0) {
        const firstResult = data.documents[0];
        console.log('첫 번째 결과:', firstResult);
        
        // 카카오 API 응답 구조에 맞게 수정
        const coordinates = {
          lat: parseFloat(firstResult.y), // 위도 (latitude)
          lng: parseFloat(firstResult.x), // 경도 (longitude)
        };
        
        console.log('변환된 좌표:', coordinates);
        console.log('주소 정보:', {
          address_name: firstResult.address_name,
          road_address_name: firstResult.road_address_name,
          place_name: firstResult.place_name
        });
        
        return coordinates;
      }
      
      console.warn('검색 결과가 없습니다');
      return null;
    } catch (error) {
      console.error('주소 좌표 변환 실패 - 상세 에러:', error);
      console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  const handleAddressSearch = () => {
    // 카카오 주소 검색 팝업 열기
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: async function (data: DaumPostcodeData) {
          try {
            // 주소를 좌표로 변환
            const coordinates = await getCoordinatesFromAddress(data.roadAddress || '');
            
            const addressData: AddressData = {
              roadAddress: data.roadAddress || '',
              jibunAddress: data.jibunAddress || '',
              buildingNumber: data.buildingName || '',
              postalCode: data.zonecode || '',
              cityName: (data.sido || '') + ' ' + (data.sigungu || ''),
              latitude: coordinates?.lat || null,
              longitude: coordinates?.lng || null,
            };
            
            setSelectedAddress(addressData);
            console.log('주소 및 좌표 정보:', addressData);
          } catch (error) {
            console.error('주소 처리 중 오류 발생:', error);
            
            // 사용자에게 에러 메시지 표시
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            
            // 더 친화적인 에러 메시지
            let userMessage = '주소 처리 중 일부 정보를 가져오지 못했습니다.';
            
            if (errorMessage.includes('카카오 API 키')) {
              userMessage = '카카오 지도 API 키가 설정되지 않았습니다. 기본 주소 정보만 설정됩니다.';
            } else if (errorMessage.includes('행정안전부')) {
              userMessage = '영문 주소 변환에 실패했습니다. 기본 주소 정보만 설정됩니다.';
            }
            
            alert(`${userMessage}\n\n기본 주소 정보는 정상적으로 설정됩니다.`);
            
            // 좌표 변환 실패 시에도 기본 주소 정보는 설정
            const addressData: AddressData = {
              roadAddress: data.roadAddress || '',
              jibunAddress: data.jibunAddress || '',
              buildingNumber: data.buildingName || '',
              postalCode: data.zonecode || '',
              cityName: (data.sido || '') + ' ' + (data.sigungu || ''),
              latitude: null,
              longitude: null,
            };
            setSelectedAddress(addressData);
          }
        },
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleAddressSelect = async () => {
    if (selectedAddress) {
      try {
        await onSelect(selectedAddress);
        onClose();
      } catch (error) {
        console.error('주소 선택 처리 중 오류 발생:', error);
        // 오류가 발생해도 모달은 닫기
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedAddress(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div
        className='stitch-card w-full max-w-2xl max-h-[80vh] overflow-hidden'
        ref={modalRef}
      >
        {/* 헤더 */}
        <div className='flex justify-between items-center p-6 border-b border-white/10'>
          <h2 className='stitch-h1 text-xl font-bold'>주소 검색</h2>
          <Button
            onClick={handleClose}
            variant='ghost'
            className='text-white/60 hover:text-white hover:bg-white/10'
          >
            <X size={20} />
          </Button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className='flex-1 p-6 bg-white/5'>
          <div className='text-center space-y-6'>
            {/* 주소 검색 버튼 */}
            <div className='space-y-3'>
              <Button
                onClick={handleAddressSearch}
                className='w-full h-14 text-lg font-semibold'
              >
                <Search className='mr-2' size={20} />
                주소 검색하기
              </Button>
              <p className='stitch-caption text-white/60'>
                클릭하면 카카오 주소 검색 서비스가 팝업으로 열립니다
              </p>
            </div>

            {/* 사용 방법 */}
            <div className='text-left space-y-3'>
              <div className='flex items-center gap-2 mb-3'>
                <FileText className='h-5 w-5 text-primary' />
                <h3 className='stitch-h1 text-lg font-semibold'>사용 방법</h3>
              </div>
              <ol className='space-y-2 text-sm text-white/80'>
                <li className='flex items-start gap-2'>
                  <span className='flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium'>
                    1
                  </span>
                  <span>&quot;주소 검색하기&quot; 버튼을 클릭합니다</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium'>
                    2
                  </span>
                  <span>팝업에서 주소를 검색하고 선택합니다</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium'>
                    3
                  </span>
                  <span>선택한 주소가 위에 표시됩니다</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium'>
                    4
                  </span>
                  <span>&quot;주소 선택&quot; 버튼을 클릭하여 완료합니다</span>
                </li>
              </ol>
            </div>

            {/* 선택된 주소 표시 */}
            {selectedAddress && (
              <div className='bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2'>
                <div className='flex items-center gap-2 mb-2'>
                  <MapPin className='h-4 w-4 text-primary' />
                  <span className='font-medium text-primary'>선택된 주소</span>
                </div>
                <div className='text-sm space-y-1 text-white/80'>
                  <p>
                    <strong>도로명:</strong> {selectedAddress.roadAddress}
                  </p>
                  <p>
                    <strong>지번:</strong> {selectedAddress.jibunAddress}
                  </p>
                  <p>
                    <strong>건물번호:</strong> {selectedAddress.buildingNumber}
                  </p>
                  <p>
                    <strong>우편번호:</strong> {selectedAddress.postalCode}
                  </p>
                  <p>
                    <strong>도시명:</strong> {selectedAddress.cityName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className='p-6 border-t border-white/10 bg-white/5'>
          <div className='flex gap-3'>
            <Button onClick={handleClose} variant='ghost' className='flex-1'>
              취소
            </Button>
            <Button
              onClick={handleAddressSelect}
              disabled={!selectedAddress}
              className='flex-1'
            >
              주소 선택
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
