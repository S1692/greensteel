# GreenSteel Frontend

ESG 관리 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 **빠른 시작**

### **1. 의존성 설치**
```bash
npm install
# 또는
pnpm install
```

### **2. 환경 변수 설정 (중요!)**
```bash
# frontend/.env.local 파일 생성
echo "NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_javascript_key_here" > .env.local
```

**필수 환경 변수:**
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: 카카오 지도 API JavaScript 키

### **3. 개발 서버 실행**
```bash
npm run dev
# 또는
pnpm dev
```

## 🗺️ **카카오 지도 API 설정**

주소 검색 기능을 사용하려면 카카오 지도 API 키가 필요합니다.

### **빠른 설정**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. JavaScript 키 복사
4. `.env.local` 파일에 API 키 설정
5. 개발 서버 재시작

**자세한 설정 방법**: [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md)

## 🏗️ **프로젝트 구조**

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/       # 인증이 필요한 페이지
│   ├── (public)/          # 공개 페이지
│   └── api/               # API 라우트
├── components/             # React 컴포넌트
│   ├── atoms/             # 기본 UI 컴포넌트
│   ├── molecules/         # 복합 UI 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
└── lib/                   # 유틸리티 함수
```

## 🚨 **문제 해결**

### **카카오 지도 API 로딩 실패**
```
카카오 지도 API 스크립트 로드 실패
```

**해결 방법:**
1. `frontend/.env.local` 파일에 API 키 설정
2. 카카오 개발자 콘솔에서 도메인 설정 확인
3. 개발 서버 재시작

### **Manifest 401 오류**
```
Manifest fetch failed, code 401
```

**해결 방법:** `vercel.json` 헤더 설정 완료 ✅

### **CSP 오류**
```
Refused to load script 'https://dapi.kakao.com/v2/maps/sdk.js'
```

**해결 방법:** `next.config.js` CSP 설정 완료 ✅

## 📱 **PWA 기능**

- ✅ 오프라인 지원
- ✅ 앱 설치
- ✅ 푸시 알림
- ✅ 백그라운드 동기화

## 🧪 **테스트**

```bash
npm run test
# 또는
pnpm test
```

## 🚀 **배포**

```bash
npm run build
# 또는
pnpm build
```

## 📚 **문서**

- [카카오 API 설정 가이드](./KAKAO_API_SETUP.md)
- [PWA 구현 가이드](./PWA_README.md)
- [배포 가이드](./DEPLOYMENT.md)

## 🤝 **기여하기**

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
