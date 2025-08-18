# 🗺️ 카카오 지도 API 설정 가이드

## 📋 **개요**
GreenSteel 프로젝트에서 주소 검색 기능을 위해 카카오 지도 API를 사용합니다.

## 🔑 **1. 카카오 개발자 계정 생성**

### **1.1 카카오 개발자 사이트 접속**
- [Kakao Developers](https://developers.kakao.com/) 접속
- 카카오 계정으로 로그인

### **1.2 애플리케이션 생성**
1. **내 애플리케이션** → **애플리케이션 추가하기** 클릭
2. **앱 이름**: `GreenSteel` (또는 원하는 이름)
3. **회사명**: 회사명 입력
4. **생성** 버튼 클릭

## ⚙️ **2. 플랫폼 설정**

### **2.1 웹 플랫폼 추가**
1. **플랫폼** → **Web** → **사이트 도메인** 추가
2. **도메인 설정**:
   - **개발 환경**: `http://localhost:3000`
   - **프로덕션 환경**: `https://your-domain.vercel.app`
   - **Vercel 도메인**: `https://greensteel-epxl12-4eq93xbzw-smh1692-hsackrs-projects.vercel.app`

### **2.2 JavaScript 키 확인**
- **앱 키** → **JavaScript 키** 복사
- 이 키를 환경 변수에 설정해야 합니다

## 🔧 **3. 환경 변수 설정**

### **3.1 로컬 개발 환경**
```bash
# frontend/.env.local 파일 생성
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_javascript_key_here
```

### **3.2 Vercel 프로덕션 환경**
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. **Add New** 클릭:
   - **Name**: `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
   - **Value**: 카카오 JavaScript 키
   - **Environment**: Production, Preview, Development 모두 선택

## 🚀 **4. API 키 보안 설정**

### **4.1 도메인 제한**
- **카카오 개발자 콘솔** → **보안** → **도메인**
- 허용할 도메인만 등록:
  - `localhost:3000`
  - `your-domain.vercel.app`
  - `greensteel-epxl12-4eq93xbzw-smh1692-hsackrs-projects.vercel.app`

### **4.2 사용량 제한**
- **보안** → **사용량 제한**
- **일일 사용량**: 적절한 제한 설정 (예: 10,000회)
- **초당 요청 수**: 적절한 제한 설정 (예: 10회)

## 🧪 **5. 테스트 및 검증**

### **5.1 로컬 테스트**
```bash
cd frontend
npm run dev
```
- `http://localhost:3000/register` 접속
- 기업 회원가입 → 주소 검색 버튼 클릭
- 지도가 정상적으로 로드되는지 확인

### **5.2 프로덕션 테스트**
- Vercel 배포 후 실제 도메인에서 테스트
- 주소 검색 기능이 정상 작동하는지 확인

## ❌ **6. 문제 해결**

### **6.1 CSP 오류**
```
Refused to load the script 'https://dapi.kakao.com/v2/maps/sdk.js' because it violates the following Content Security Policy directive
```
**해결 방법**: `next.config.js`의 CSP 설정에 `https://dapi.kakao.com` 추가 완료

### **6.2 API 키 오류**
```
Invalid API key
```
**해결 방법**:
1. 환경 변수 확인
2. 도메인 설정 확인
3. API 키 복사 오류 확인

### **6.3 지도 로딩 실패**
```
지도 로딩에 실패했습니다
```
**해결 방법**:
1. 네트워크 연결 확인
2. 카카오 서비스 상태 확인
3. 브라우저 콘솔 에러 확인

## 📚 **7. 추가 리소스**

### **7.1 카카오 지도 API 문서**
- [Kakao Maps JavaScript API](https://apis.map.kakao.com/web/)
- [주소-좌표 변환 서비스](https://apis.map.kakao.com/web/sample/coord2addr/)
- [장소 검색 서비스](https://apis.map.kakao.com/web/sample/search/)

### **7.2 샘플 코드**
- [카카오 지도 API 샘플](https://apis.map.kakao.com/web/sample/)
- [주소 검색 구현 예제](https://apis.map.kakao.com/web/sample/addr2coord/)

## 🔒 **8. 보안 고려사항**

### **8.1 API 키 노출 방지**
- `NEXT_PUBLIC_` 접두사는 클라이언트에서 접근 가능
- 서버 사이드에서만 사용하는 API 키는 `NEXT_PUBLIC_` 제거

### **8.2 사용량 모니터링**
- 카카오 개발자 콘솔에서 API 사용량 모니터링
- 비정상적인 사용량 증가 시 즉시 확인

### **8.3 에러 처리**
- API 호출 실패 시 적절한 에러 메시지 표시
- 사용자에게 친화적인 에러 안내

---

## ✅ **설정 완료 체크리스트**

- [ ] 카카오 개발자 계정 생성
- [ ] 애플리케이션 생성
- [ ] 웹 플랫폼 추가
- [ ] JavaScript 키 복사
- [ ] 환경 변수 설정
- [ ] 도메인 제한 설정
- [ ] 사용량 제한 설정
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 테스트 완료

**모든 항목을 완료하면 카카오 지도 API가 정상적으로 작동합니다!** 🎉
