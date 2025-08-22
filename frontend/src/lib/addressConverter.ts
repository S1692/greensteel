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
      roadAddr: string;        // 도로명주소
      jibunAddr: string;       // 지번주소
      zipNo: string;           // 우편번호
      admCd: string;           // 행정구역코드
      rnMgtSn: string;         // 도로명관리번호
      bdKdcd: string;          // 건물종류코드
      siNm: string;            // 시도명
      sggNm: string;           // 시군구명
      emdNm: string;           // 읍면동명
      liNm: string;            // 법정리명
      rn: string;              // 도로명
      udrtYn: string;          // 지하여부
      buldMnnm: string;        // 건물본번
      buldSlno: string;        // 건물부번
      mtYn: string;            // 산여부
      lnbrMnnm: string;        // 지번본번
      lnbrSlno: string;        // 지번부번
      korAddr: string;         // 한국주소
      engAddr: string;         // 영문주소
    }>;
  };
}

interface ConvertedAddress {
  roadAddr: string;        // 도로명주소
  jibunAddr: string;       // 지번주소
  engAddr: string;         // 영문주소
  zipNo: string;           // 우편번호
  siNm: string;            // 시도명
  sggNm: string;           // 시군구명
  emdNm: string;           // 읍면동명
  rn: string;              // 도로명
  buldMnnm: string;        // 건물본번
  buldSlno: string;        // 건물부번
}

interface ParsedAddress {
  buildingNumber: string;  // 건물번호
  cityName: string;        // 도시명 (시/군/구)
  roadName: string;        // 도로명
  fullAddress: string;     // 전체 주소
}

/**
 * 주소 문자열을 파싱하여 건물번호, 도시명, 도로명을 추출합니다.
 * @param address 파싱할 주소 문자열 (예: "서울 강남구 가로수길 5")
 * @returns 파싱된 주소 정보
 */
export function parseAddress(address: string): ParsedAddress {
  try {
    console.log('주소 파싱 시작:', address);
    
    // 주소를 공백으로 분리
    const parts = address.trim().split(/\s+/);
    
    if (parts.length < 3) {
      throw new Error('주소 형식이 올바르지 않습니다. (시/도 시/군/구 도로명 건물번호)');
    }
    
    // 마지막 부분이 건물번호
    const buildingNumber = parts[parts.length - 1];
    
    // 건물번호가 숫자인지 확인
    if (!/^\d+$/.test(buildingNumber)) {
      throw new Error('건물번호가 숫자가 아닙니다: ' + buildingNumber);
    }
    
    // 도시명은 시/군/구 단위 (보통 2번째 부분)
    let cityName = '';
    for (let i = 1; i < parts.length - 1; i++) {
      if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
        cityName = parts[i];
        break;
      }
    }
    
    if (!cityName) {
      throw new Error('도시명(시/군/구)을 찾을 수 없습니다.');
    }
    
    // 도로명은 건물번호 앞부분 (시/군/구 다음부터 건물번호 전까지)
    const cityIndex = parts.findIndex(part => part === cityName);
    const roadName = parts.slice(cityIndex + 1, -1).join('');
    
    if (!roadName) {
      throw new Error('도로명을 찾을 수 없습니다.');
    }
    
    const result: ParsedAddress = {
      buildingNumber,
      cityName,
      roadName,
      fullAddress: address
    };
    
    console.log('주소 파싱 결과:', result);
    return result;
    
  } catch (error) {
    console.error('주소 파싱 실패:', error);
    throw error;
  }
}

/**
 * 행정안전부 주소 API를 통해 주소를 검색하고 영문 주소를 가져옵니다.
 * @param keyword 검색할 주소 키워드
 * @returns 변환된 주소 정보
 */
export async function convertAddressToEnglish(keyword: string): Promise<ConvertedAddress | null> {
  try {
    console.log('영문 주소 변환 시작:', keyword);
    
    // 행정안전부 영문 주소 검색 API 호출 (JSONP 방식)
    const script = document.createElement('script');
    const callbackName = 'jusoCallback_' + Date.now();
    
    return new Promise((resolve, reject) => {
      // 전역 콜백 함수 설정
      (window as any)[callbackName] = (data: AdministrativeAddressResponse) => {
        try {
          console.log('API 응답 데이터:', data);
          
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
          console.log('첫 번째 결과:', firstResult);

          const result: ConvertedAddress = {
            roadAddr: firstResult.roadAddr || '',
            jibunAddr: firstResult.jibunAddr || '',
            engAddr: firstResult.engAddr || '',
            zipNo: firstResult.zipNo || '',
            siNm: firstResult.siNm || '',
            sggNm: firstResult.sggNm || '',
            emdNm: firstResult.emdNm || '',
            rn: firstResult.rn || '',
            buldMnnm: firstResult.buldMnnm || '',
            buldSlno: firstResult.buldSlno || '',
          };

          console.log('변환된 주소:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // 전역 콜백 함수 정리
          delete (window as any)[callbackName];
          document.head.removeChild(script);
        }
      };

      // JSONP 스크립트 생성 (영문 주소 API 사용)
      script.src = `https://business.juso.go.kr/addrlink/addrEngApiJsonp.do?currentPage=1&countPerPage=10&keyword=${encodeURIComponent(keyword)}&confmKey=${process.env.NEXT_PUBLIC_ADMINISTRATIVE_API_KEY}&resultType=json&callback=${callbackName}`;
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
    console.log('주소 영문 변환 시작:', kakaoAddress);
    
    // 전체 주소 구성 (예: "서울 강남구 가로수길 5")
    const fullAddress = `${kakaoAddress.cityName || ''} ${kakaoAddress.roadAddress || ''} ${kakaoAddress.buildingNumber || ''}`.trim();
    
    if (!fullAddress) {
      throw new Error('검색할 주소 키워드가 없습니다.');
    }

    console.log('전체 주소로 검색:', fullAddress);
    
    // 행정안전부 API로 영문 주소 검색
    const convertedAddress = await convertAddressToEnglish(fullAddress);

    if (!convertedAddress) {
      console.warn('영문 주소 변환 실패, 카카오 주소 그대로 사용');
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

    // 영문 주소에서 각 부분 추출
    const englishParts = parseEnglishAddress(convertedAddress.engAddr);
    
    console.log('영문 주소 파싱 결과:', englishParts);
    
    return {
      roadAddress: convertedAddress.roadAddr || kakaoAddress.roadAddress || '',
      buildingNumber: kakaoAddress.buildingNumber || '', // 국문 건물번호 그대로 유지
      cityName: kakaoAddress.cityName || '', // 국문 도시명 유지
      postalCode: convertedAddress.zipNo || kakaoAddress.postalCode || '',
      englishAddress: convertedAddress.engAddr || '',
      englishCity: englishParts.city || '', // 도시명 영문 저장
      englishRoad: englishParts.road || '', // 도로명 영문 저장
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
