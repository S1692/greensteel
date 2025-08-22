/**
 * 행정안전부 실시간 주소정보 조회 API를 활용한 주소 변환
 * 한글 주소를 영문 주소로 변환합니다.
 */

interface AdministrativeAddressResponse {
  results: {
    common: {
      errorCode: string;
      errorMessage: string;
      totalCount: string;
    };
    juso: Array<{
      roadAddr: string;
      roadAddrPart1: string;
      roadAddrPart2: string;
      engAddr: string;
      zipNo: string;
      admCd: string;
      rdnMgtSn: string;
      bdMgtSn: string;
      detBdNmList: string;
      bdNm: string;
      bdKdcd: string;
      siNm: string;
      sggNm: string;
      emdNm: string;
      liNm: string;
      rn: string;
      udrtYn: string;
      buldMnnm: string;
      buldSlno: string;
      mtYn: string;
      lnbrMnnm: string;
      lnbrSlno: string;
      emdNo: string;
      hstryYn: string;
      relJibun: string;
      hemdNm: string;
    }>;
  };
}

interface ConvertedAddress {
  roadAddr: string;        // 도로명주소
  roadAddrPart1: string;   // 도로명주소(지번)
  roadAddrPart2: string;   // 도로명주소(상세)
  engAddr: string;         // 영문주소
  zipNo: string;           // 우편번호
  siNm: string;            // 시도명
  sggNm: string;           // 시군구명
  emdNm: string;           // 읍면동명
  rn: string;              // 도로명
  buldMnnm: string;        // 건물본번
  buldSlno: string;        // 건물부번
}

/**
 * 행정안전부 주소 API를 통해 주소를 검색하고 영문 주소를 가져옵니다.
 * @param keyword 검색할 주소 키워드
 * @returns 변환된 주소 정보
 */
export async function convertAddressToEnglish(keyword: string): Promise<ConvertedAddress | null> {
  try {
    // 행정안전부 주소 검색 API 호출 (JSONP 방식으로 우회)
    const script = document.createElement('script');
    const callbackName = 'jusoCallback_' + Date.now();
    
    return new Promise((resolve, reject) => {
      // 전역 콜백 함수 설정
      (window as any)[callbackName] = (data: AdministrativeAddressResponse) => {
        try {
          // 에러 체크
          if (data.results.common.errorCode !== '0') {
            reject(new Error(`주소 검색 API 에러: ${data.results.common.errorMessage}`));
            return;
          }

          // 검색 결과가 있는지 확인
          if (!data.results.juso || data.results.juso.length === 0) {
            console.warn('검색된 주소가 없습니다:', keyword);
            resolve(null);
            return;
          }

          // 첫 번째 결과 사용 (가장 정확한 매칭)
          const firstResult = data.results.juso[0];

          const result = {
            roadAddr: firstResult.roadAddr || '',
            roadAddrPart1: firstResult.roadAddrPart1 || '',
            roadAddrPart2: firstResult.roadAddrPart2 || '',
            engAddr: firstResult.engAddr || '',
            zipNo: firstResult.zipNo || '',
            siNm: firstResult.siNm || '',
            sggNm: firstResult.sggNm || '',
            emdNm: firstResult.emdNm || '',
            rn: firstResult.rn || '',
            buldMnnm: firstResult.buldMnnm || '',
            buldSlno: firstResult.buldSlno || '',
          };

          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // 전역 콜백 함수 정리
          delete (window as any)[callbackName];
          document.head.removeChild(script);
        }
      };

      // JSONP 스크립트 생성 (business.juso.go.kr 사용)
      script.src = `https://business.juso.go.kr/addrlink/openApi/searchApi.do?currentPage=1&countPerPage=10&keyword=${encodeURIComponent(keyword)}&confmKey=${process.env.NEXT_PUBLIC_ADMINISTRATIVE_API_KEY}&resultType=json&callback=${callbackName}`;
      script.onerror = () => {
        reject(new Error('주소 검색 API 스크립트 로드 실패'));
        delete (window as any)[callbackName];
      };

      // 스크립트를 head에 추가하여 실행
      document.head.appendChild(script);

      // 타임아웃 설정 (10초)
      setTimeout(() => {
        reject(new Error('주소 검색 API 타임아웃'));
        delete (window as any)[callbackName];
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      }, 10000);
    });
  } catch (error) {
    console.error('주소 변환 중 오류 발생:', error);
    return null;
  }
}

/**
 * 카카오 주소 데이터를 행정안전부 API로 보강하여 영문 주소를 추가합니다.
 * @param kakaoAddress 카카오 API에서 받은 주소 데이터
 * @returns 영문 주소가 추가된 주소 데이터
 */
export async function enhanceAddressWithEnglish(kakaoAddress: {
  roadAddress?: string;
  buildingNumber?: string;
  cityName?: string;
  postalCode?: string;
}): Promise<{
  roadAddress: string;
  buildingNumber: string;
  cityName: string;
  postalCode: string;
  englishAddress: string;
  englishCity: string;
  englishRoad: string;
}> {
  try {
    // 카카오 주소를 기반으로 행정안전부 API 검색
    const searchKeyword = `${kakaoAddress.cityName || ''} ${kakaoAddress.roadAddress || ''}`.trim();
    
    if (!searchKeyword) {
      throw new Error('검색할 주소 키워드가 없습니다.');
    }

    const convertedAddress = await convertAddressToEnglish(searchKeyword);

    if (!convertedAddress) {
      // 변환 실패 시 카카오 주소 그대로 사용
      return {
        roadAddress: kakaoAddress.roadAddress || '',
        buildingNumber: kakaoAddress.buildingNumber || '',
        cityName: kakaoAddress.cityName || '',
        postalCode: kakaoAddress.postalCode || '',
        englishAddress: '', // 영문 주소 없음
        englishCity: '',   // 영문 도시명 없음
        englishRoad: '',   // 영문 도로명 없음
      };
    }

    // 영문 주소 파싱 (행정안전부 API 응답에서 추출)
    const englishParts = parseEnglishAddress(convertedAddress.engAddr);

    return {
      roadAddress: convertedAddress.roadAddr || kakaoAddress.roadAddress || '',
      buildingNumber: kakaoAddress.buildingNumber || '',
      cityName: convertedAddress.siNm || kakaoAddress.cityName || '',
      postalCode: convertedAddress.zipNo || kakaoAddress.postalCode || '',
      englishAddress: convertedAddress.engAddr || '',
      englishCity: englishParts.city || '',
      englishRoad: englishParts.road || '',
    };
  } catch (error) {
    console.error('주소 영문 변환 중 오류 발생:', error);
    // 오류 발생 시 카카오 주소 그대로 반환
    return {
      roadAddress: kakaoAddress.roadAddress || '',
      buildingNumber: kakaoAddress.buildingNumber || '',
      cityName: kakaoAddress.cityName || '',
      postalCode: kakaoAddress.postalCode || '',
      englishAddress: '',
      englishCity: '',
      englishRoad: '',
    };
  }
}

/**
 * 영문 주소를 파싱하여 도시명과 도로명을 추출합니다.
 * @param engAddr 영문 주소 문자열
 * @returns 파싱된 도시명과 도로명
 */
function parseEnglishAddress(engAddr: string): { city: string; road: string } {
  try {
    // 영문 주소에서 도시명과 도로명 추출
    // 예: "123, Gangnam-daero, Gangnam-gu, Seoul" -> city: "Seoul", road: "Gangnam-daero"
    const parts = engAddr.split(',').map(part => part.trim());
    
    let city = '';
    let road = '';

    // 마지막 부분이 보통 도시명
    if (parts.length > 0) {
      city = parts[parts.length - 1];
    }

    // "-daero", "-ro", "-gil" 등이 포함된 부분이 도로명
    for (const part of parts) {
      if (part.includes('-daero') || part.includes('-ro') || part.includes('-gil')) {
        road = part;
        break;
      }
    }

    return { city, road };
  } catch (error) {
    console.error('영문 주소 파싱 중 오류 발생:', error);
    return { city: '', road: '' };
  }
}
