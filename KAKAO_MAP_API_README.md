# 🗺️ 카카오 지도 API 연동 가이드

## 📋 **개요**

GreenSteel 프로젝트에서 **카카오 지도 API**를 사용하여 지도 기반 주소 검색 기능을 구현했습니다. 사용자는 지도에서 직접 위치를 클릭하거나 검색어를 입력하여 정확한 주소를 선택할 수 있습니다.

## 🎯 **주요 기능**

### **1. 지도 기반 주소 선택**
- 🗺️ **직접 클릭**: 지도에서 원하는 위치를 클릭하여 주소 선택
- 🔍 **키워드 검색**: 주소, 건물명, 지점명으로 검색
- 📍 **현재 위치**: GPS를 사용한 현재 위치 기반 주소 선택

### **2. 상세 주소 정보**
- 📍 **좌표 정보**: 위도/경도 좌표 포함
- 🏢 **건물 정보**: 건물명, 상세 주소 정보
- 🏘️ **지역 정보**: 시/도, 구/군, 동/읍/면 정보
- 📮 **우편번호**: 자동 우편번호 매핑

### **3. 사용자 경험**
- 🎨 **직관적 UI**: 지도와 검색 기능이 통합된 모달
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- ⚡ **실시간 검색**: 입력과 동시에 검색 결과 표시

## 🚀 **설정 방법**

### **1. 카카오 개발자 계정 생성**

#### **1단계: 카카오 개발자 사이트 접속**
```
https://developers.kakao.com/
```

#### **2단계: 애플리케이션 생성**
1. **내 애플리케이션** → **애플리케이션 추가하기**
2. **앱 이름**: `GreenSteel`
3. **회사명**: `GreenSteel Inc.`
4. **생성 완료**

#### **3단계: 플랫폼 설정**
1. **플랫폼** → **Web 플랫폼 등록**
2. **사이트 도메인**: `http://localhost:3000` (개발용)
3. **사이트 도메인**: `https://greensteel.site` (프로덕션용)

#### **4단계: JavaScript 키 확인**
```
플랫폼 → Web → JavaScript 키 복사
```

### **2. 환경 변수 설정**

#### **프론트엔드 환경 변수**
```bash
# .env.local
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_javascript_key_here
```

#### **환경 변수 예시**
```bash
# 개발 환경
NEXT_PUBLIC_KAKAO_MAP_API_KEY=1234567890abcdef1234567890abcdef

# 프로덕션 환경
NEXT_PUBLIC_KAKAO_MAP_API_KEY=abcdef1234567890abcdef1234567890
```

### **3. API 키 보안**

#### **도메인 제한**
```
✅ 허용 도메인:
- http://localhost:3000 (개발용)
- https://greensteel.site (프로덕션용)
- https://*.vercel.app (Vercel 배포용)

❌ 차단 도메인:
- http://* (개발용 제외)
- https://* (허용된 도메인 제외)
```

#### **사용량 제한**
```
📊 무료 사용량:
- 일일 API 호출: 300,000회
- 월간 API 호출: 9,000,000회

💰 유료 사용량:
- 일일 API 호출: 300,000회 초과
- 월간 API 호출: 9,000,000회 초과
```

## 🔧 **구현 상세**

### **1. 컴포넌트 구조**

#### **AddressSearchModal.tsx**
```typescript
interface AddressData {
  address: string;           // 기본 주소
  address_eng: string;       // 영문 주소
  zipcode: string;           // 우편번호
  country: string;           // 국가 코드
  country_eng: string;       // 영문 국가명
  city: string;              // 도시명
  city_eng: string;          // 영문 도시명
  address1: string;          // 상세 주소
  address1_eng: string;      // 영문 상세 주소
  latitude?: number;         // 위도
  longitude?: number;        // 경도
}
```

#### **카카오 지도 API 타입**
```typescript
interface KakaoMapData {
  address: string;           // 전체 주소
  address_name: string;      // 주소명
  bname: string;             // 법정동/법정리
  building_name: string;     // 건물명
  region_1depth_name: string; // 시/도
  region_2depth_name: string; // 구/군
  region_3depth_name: string; // 동/읍/면
  zip_code: string;          // 우편번호
  x: string;                 // 경도
  y: string;                 // 위도
}
```

### **2. 주요 함수**

#### **지도 초기화**
```typescript
const initializeMap = () => {
  const options = {
    center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
    level: 3,
  };
  
  const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, options);
  // ... 마커 및 이벤트 설정
};
```

#### **지도 클릭 처리**
```typescript
const handleMapClick = async (latlng: any) => {
  // 마커 위치 설정
  marker.setPosition(latlng);
  marker.setMap(map);
  
  // 좌표를 주소로 변환
  const geocoder = new window.kakao.maps.services.Gecoder();
  geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
    // ... 주소 정보 처리
  });
};
```

#### **키워드 검색**
```typescript
const handleSearch = async () => {
  const places = new window.kakao.maps.services.Places();
  places.keywordSearch(searchKeyword, (results, status) => {
    if (status === window.kakao.maps.services.Status.OK && results.length > 0) {
      const place = results[0];
      const latlng = new window.kakao.maps.LatLng(place.y, place.x);
      
      // 지도 중심 이동 및 마커 표시
      map.setCenter(latlng);
      handleMapClick(latlng);
    }
  });
};
```

#### **현재 위치 사용**
```typescript
const handleCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng = new window.kakao.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      
      map.setCenter(latlng);
      handleMapClick(latlng);
    },
    (error) => {
      alert('현재 위치를 가져오는데 실패했습니다.');
    }
  );
};
```

### **3. UI 구성**

#### **모달 레이아웃**
```
┌─────────────────────────────────────────────────────────────┐
│                    🗺️ 지도로 주소 검색                      │
├─────────────────────────────────────────────────────────────┤
│  [검색어 입력] [🔍 검색] [📍 현재 위치]                    │
│  🟦 지도에서 위치 클릭  🟩 검색어로 주소 찾기  🟪 현재 위치 사용 │
├─────────────────────────────────────────────────────────────┤
│                    [지도 영역]                              │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    📍 선택된 주소 정보                       │
├─────────────────────────────────────────────────────────────┤
│  💡 지도에서 원하는 위치를 클릭하거나 검색어를 입력하여...  │
│                    [취소] [✅ 주소 선택 완료]                │
└─────────────────────────────────────────────────────────────┘
```

## 📱 **사용 방법**

### **1. 기본 사용법**

#### **지도에서 직접 선택**
1. 🔍 **주소 검색 모달 열기**
2. 🗺️ **지도에서 원하는 위치 클릭**
3. 📍 **마커와 정보창 확인**
4. ✅ **"이 주소 선택" 버튼 클릭**

#### **검색어로 주소 찾기**
1. 🔍 **검색창에 키워드 입력** (예: "강남대로", "롯데월드타워")
2. 🔍 **검색 버튼 클릭**
3. 🗺️ **검색 결과 위치로 지도 이동**
4. 📍 **자동으로 마커 표시**
5. ✅ **주소 정보 확인 후 선택**

#### **현재 위치 사용**
1. 📍 **"현재 위치" 버튼 클릭**
2. 📱 **GPS 권한 허용**
3. 🗺️ **현재 위치로 지도 이동**
4. 📍 **자동으로 마커 표시**
5. ✅ **주소 정보 확인 후 선택**

### **2. 고급 기능**

#### **지도 확대/축소**
- 🖱️ **마우스 휠**: 지도 확대/축소
- 🔍 **지도 컨트롤**: 확대/축소 버튼 사용

#### **지도 이동**
- 🖱️ **마우스 드래그**: 지도 이동
- 🎯 **검색 결과**: 자동으로 해당 위치로 이동

#### **주소 정보 상세보기**
- 📍 **마커 클릭**: 상세 주소 정보 표시
- 📋 **정보창**: 주소, 우편번호, 지역 정보 확인

## 🚨 **문제 해결**

### **1. 일반적인 오류**

#### **API 키 오류**
```
❌ 오류: "Invalid API key"
✅ 해결: 
1. 환경 변수 확인
2. 카카오 개발자 사이트에서 API 키 확인
3. 도메인 설정 확인
```

#### **지도 로딩 실패**
```
❌ 오류: "지도를 불러오는 중..."
✅ 해결:
1. 인터넷 연결 확인
2. 카카오 서버 상태 확인
3. 브라우저 캐시 삭제
```

#### **검색 결과 없음**
```
❌ 오류: "검색 결과가 없습니다"
✅ 해결:
1. 검색어 변경 (예: "강남" → "강남대로")
2. 더 구체적인 키워드 사용
3. 지역명 포함하여 검색
```

### **2. 성능 최적화**

#### **지도 로딩 최적화**
```typescript
// 지도 초기화 최적화
useEffect(() => {
  if (isOpen && !map) {
    initializeMap();
  }
}, [isOpen, map]);
```

#### **검색 디바운싱**
```typescript
// 검색 입력 최적화
const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

const handleSearchInput = (value: string) => {
  setSearchKeyword(value);
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  const timeout = setTimeout(() => {
    if (value.trim()) {
      handleSearch();
    }
  }, 500);
  
  setSearchTimeout(timeout);
};
```

#### **메모리 누수 방지**
```typescript
useEffect(() => {
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (map) {
      // 지도 이벤트 리스너 제거
      window.kakao.maps.event.clearListeners(map, 'click');
    }
  };
}, []);
```

## 🔒 **보안 고려사항**

### **1. API 키 보안**
- ✅ **프론트엔드 노출**: JavaScript 키는 클라이언트에 노출되어도 안전
- ✅ **도메인 제한**: 허용된 도메인에서만 API 사용 가능
- ✅ **사용량 제한**: 무료 사용량 초과 시 자동 차단

### **2. 사용자 데이터 보호**
- ✅ **GPS 권한**: 사용자 명시적 허용 필요
- ✅ **주소 정보**: 민감하지 않은 공개 정보만 수집
- ✅ **데이터 암호화**: 전송 시 HTTPS 사용

### **3. API 호출 제한**
- ✅ **Rate Limiting**: 과도한 API 호출 방지
- ✅ **에러 처리**: API 오류 시 적절한 사용자 안내
- ✅ **폴백 처리**: API 실패 시 대체 방법 제공

## 📊 **모니터링 및 분석**

### **1. 사용 통계**
- 📈 **검색 횟수**: 일일/월간 검색 통계
- 📍 **선택 위치**: 사용자가 선택한 주소 분포
- 🕒 **사용 시간**: 평균 사용 시간 및 패턴

### **2. 성능 메트릭**
- ⚡ **로딩 시간**: 지도 초기화 및 검색 응답 시간
- 🔍 **검색 정확도**: 검색 결과의 정확성
- 📱 **디바이스별 성능**: 모바일/데스크톱 성능 비교

### **3. 오류 모니터링**
- 🚨 **API 오류**: 카카오 API 호출 실패율
- 📍 **GPS 오류**: 위치 정보 수집 실패율
- 🔍 **검색 오류**: 검색 기능 관련 오류율

## 🚀 **향후 개선 계획**

### **1. 기능 확장**
- 🗺️ **3D 지도**: 입체적인 건물 및 지형 표시
- 🚗 **경로 안내**: 선택한 주소까지의 경로 표시
- 🏢 **건물 정보**: 건물 상세 정보 및 사진 표시

### **2. 사용자 경험 개선**
- 💾 **최근 검색**: 자주 사용하는 주소 저장
- ⭐ **즐겨찾기**: 자주 사용하는 주소 즐겨찾기
- 📱 **모바일 최적화**: 터치 기반 직관적 조작

### **3. 성능 최적화**
- 🚀 **지연 로딩**: 필요할 때만 지도 로딩
- 💾 **캐싱**: 자주 사용하는 주소 정보 캐싱
- 🔄 **백그라운드 업데이트**: 주소 정보 자동 업데이트

## 📚 **참고 자료**

### **1. 공식 문서**
- [카카오 지도 API 문서](https://apis.map.kakao.com/)
- [JavaScript API 가이드](https://apis.map.kakao.com/web/)
- [REST API 가이드](https://apis.map.kakao.com/rest/)

### **2. 개발자 리소스**
- [카카오 개발자 포럼](https://devtalk.kakao.com/)
- [API 사용 예제](https://apis.map.kakao.com/web/sample/)
- [SDK 다운로드](https://apis.map.kakao.com/web/download/)

### **3. 커뮤니티**
- [GitHub Issues](https://github.com/S1692/greensteel/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kakao-maps)
- [카카오 개발자 블로그](https://developers.kakao.com/blog/)

---

**카카오 지도 API 연동** - 더 나은 주소 검색 경험을 제공하세요! 🗺️✨
