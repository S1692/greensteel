# EcoTrace Frontend

지속가능한 미래를 위한 탄소 관리 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (엄격 모드)
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React useState (로컬), Axios (서버)
- **Architecture**: MSA + MVC + Atomic Design
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # 공개 라우트
│   │   ├── landing/       # 랜딩 페이지
│   │   └── auth/          # 인증 (로그인/회원가입)
│   ├── (protected)/       # 보호된 라우트
│   │   ├── dashboard/     # 대시보드
│   │   ├── lca/           # LCA 관리
│   │   ├── cbam/          # CBAM 관리
│   │   └── data-upload/   # 데이터 업로드
│   ├── settings/          # 설정
│   ├── globals.css        # 전역 스타일
│   └── layout.tsx         # 루트 레이아웃
├── components/             # 컴포넌트 (Atomic Design)
│   ├── atoms/             # 원자 컴포넌트
│   ├── molecules/         # 분자 컴포넌트
│   ├── organisms/         # 유기체 컴포넌트
│   ├── templates/         # 템플릿 컴포넌트
│   └── CommonShell.tsx    # 공통 레이아웃
├── features/               # 기능별 모듈
├── lib/                    # 유틸리티 및 설정
│   ├── axiosClient.ts     # Gateway 전용 HTTP 클라이언트
│   ├── env.ts             # 환경 변수 관리
│   └── utils.ts           # 공통 유틸리티
└── styles/                 # 스타일 파일
```

## 🏗️ 아키텍처 원칙

### Gateway-Only 네트워킹
- 모든 API 요청은 Gateway를 통해서만 진행
- 서비스 직접 연결 금지
- `NEXT_PUBLIC_GATEWAY_URL` 환경 변수 필수

### 폼 처리 표준
1. `e.preventDefault()`
2. FormData → 객체 변환
3. useState 로컬 상태 반영
4. JSON.stringify(payload)
5. axiosClient.post(...)

### 상태 관리
- 각 폼은 로컬 useState 사용
- 전역 상태 최소화
- 서버 상태는 Axios 기반 thin client

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 편집하여 Gateway URL을 설정하세요:
```env
NEXT_PUBLIC_GATEWAY_URL=https://api.greensteel.site
NEXT_PUBLIC_ENV=development
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드 및 배포
```bash
npm run build
npm start
```

## 📱 모바일-웹 통일 UX

- 컨테이너 쿼리(`@container`) 활용
- `dvh`/`svh`/`lvh` 단위 사용
- `clamp()` 기반 유동 타이포그래피
- 터치 타깃 최소 44×44px
- 대비 4.5:1 이상 보장

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 🌐 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 커스텀 도메인 연결 (greensteel.site)

### 환경 변수 (프로덕션)
```env
NEXT_PUBLIC_GATEWAY_URL=https://api.greensteel.site
NEXT_PUBLIC_ENV=production
```

## 🔒 보안

- CSP 헤더 설정
- Gateway 외 요청 차단
- CSRF 토큰 지원
- 인증 토큰 자동 관리

## 📊 기능

### 인증
- 개인/회사 회원가입
- 로그인/로그아웃
- JWT 토큰 관리

### 대시보드
- 프로젝트 통계
- 최근 활동
- 빠른 액션

### LCA (Life Cycle Assessment)
- 프로젝트 관리
- 계산 실행
- 템플릿 관리

### CBAM (Carbon Border Adjustment Mechanism)
- 보고서 생성
- 탄소 집약도 계산
- 제출 관리

### 데이터 업로드
- Excel/CSV 파일 지원
- 드래그 앤 드롭
- 진행률 표시
- 결과 미리보기

### 설정
- 조직 프로필
- RBAC 관리
- 사용자 관리
- 데이터 거버넌스

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

- 이슈: GitHub Issues


