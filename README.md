# GreenSteel

ESG 관리 플랫폼 - 환경, 사회, 지배구조를 통합적으로 관리하는 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **PWA**: next-pwa
- **Deployment**: Vercel

## 📋 주요 기능

- **대시보드**: ESG 지표 대시보드
- **CBAM**: 탄소국경조정메커니즘 관리
- **LCA**: 전과정평가(Life Cycle Assessment)
- **데이터 업로드**: ESG 데이터 관리
- **설정**: 사용자 및 시스템 설정
- **PWA**: Progressive Web App 지원

## 🛠️ 설치 및 실행

### 필수 요구사항

- Node.js 18.0.0 이상
- pnpm 10.0.0 이상

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Next.js 설정
NEXT_PUBLIC_APP_NAME=GreenSteel
NEXT_PUBLIC_APP_VERSION=1.0.0

# API 설정
NEXT_PUBLIC_API_BASE_URL=https://api.greensteel.site
NEXT_PUBLIC_GATEWAY_URL=https://api.greensteel.site

# 카카오 지도 API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here

# Google Analytics (선택사항)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PWA 설정
NEXT_PUBLIC_PWA_NAME=GreenSteel
NEXT_PUBLIC_PWA_DESCRIPTION=ESG 관리 플랫폼
NEXT_PUBLIC_PWA_THEME_COLOR=#10B981
NEXT_PUBLIC_PWA_BACKGROUND_COLOR=#FFFFFF

# 환경 설정
NODE_ENV=production
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/       # 인증이 필요한 페이지
│   ├── (public)/          # 공개 페이지
│   ├── api/               # API 라우트
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── atoms/            # 기본 컴포넌트
│   ├── molecules/        # 분자 컴포넌트
│   └── ui/               # UI 컴포넌트
└── lib/                  # 유틸리티 및 설정
    ├── hooks/            # 커스텀 훅
    └── utils.ts          # 유틸리티 함수
```

## 🌐 배포

이 프로젝트는 Vercel을 통해 배포됩니다.

### Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

## 📱 PWA 기능

- 오프라인 지원
- 홈 화면 설치 가능
- 푸시 알림
- 백그라운드 동기화

## 🔧 개발 도구

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성
- **Jest**: 테스트 프레임워크

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
