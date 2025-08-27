# GreenSteel

ESG 관리 플랫폼 - 환경, 사회, 지배구조를 통합적으로 관리하는 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **PWA**: next-pwa
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: Vercel

## 📋 주요 기능

- **대시보드**: ESG 지표 대시보드
- **CBAM**: 탄소국경조정메커니즘 관리
- **LCA**: 전과정평가(Life Cycle Assessment)
- **데이터 업로드**: ESG 데이터 관리
- **설정**: 사용자 및 시스템 설정
- **PWA**: Progressive Web App 지원

## 🐳 빠른 시작 (Docker)

### 백엔드 서비스 실행

```bash
# 백엔드 서비스 시작 (Docker)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 프론트엔드 실행

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

## 🖥️ 로컬 개발 환경

### 필수 요구사항

- **Docker Desktop**: 백엔드 서비스 실행용
- **Node.js 18.0.0 이상**: 프론트엔드 실행용
- **pnpm 10.0.0 이상**: 패키지 관리자

### Windows 사용자를 위한 간편 실행

1. **백엔드 시작**: `start-backend.bat` 더블클릭
2. **프론트엔드 시작**: `start-frontend.bat` 더블클릭

### 수동 실행

```bash
# 1. 백엔드 서비스 시작
docker-compose up -d

# 2. 프론트엔드 의존성 설치 및 실행
cd frontend
pnpm install
pnpm dev
```

## 🌐 서비스 접속 정보

| 서비스 | 포트 | URL | 설명 |
|--------|------|-----|------|
| Frontend | 3000 | http://localhost:3000 | Next.js 애플리케이션 |
| Gateway | 8080 | http://localhost:8080 | API 게이트웨이 |
| Auth Service | 8081 | http://localhost:8081 | 인증 서비스 |
| CBAM Service | 8082 | http://localhost:8082 | CBAM 서비스 |
| LCA Service | 8083 | http://localhost:8083 | LCA 서비스 |
| Chatbot Service | 8084 | http://localhost:8084 | 챗봇 서비스 |
| Data Gather Service | 8085 | http://localhost:8085 | 데이터 수집 서비스 |

## 📁 프로젝트 구조

```
greensteel/
├── frontend/                 # Next.js 프론트엔드
├── gateway/                  # API 게이트웨이
├── service/                  # 마이크로서비스들
│   ├── auth_service/        # 인증 서비스
│   ├── cbam_service/        # CBAM 서비스
│   ├── lca_service/         # LCA 서비스
│   ├── chatbot_service/     # 챗봇 서비스
│   └── datagather_service/  # 데이터 수집 서비스
├── docker-compose.yml       # Docker Compose 설정
├── start-backend.bat        # 백엔드 시작 스크립트
├── start-frontend.bat       # 프론트엔드 시작 스크립트
└── LOCAL_SETUP.md           # 상세 설정 가이드
```

## 🔧 개발 도구

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성
- **Jest**: 테스트 프레임워크

## 📚 상세 가이드

- **로컬 개발 환경 설정**: [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- **프론트엔드 환경 설정**: [frontend/README_ENV.md](./frontend/README_ENV.md)
- **게이트웨이 설정**: [gateway/README.md](./gateway/README.md)

## 🚨 문제 해결

### 일반적인 문제들

1. **포트 충돌**: `netstat -ano | findstr :8080`으로 확인
2. **Docker 컨테이너 문제**: `docker-compose restart` 또는 `docker-compose up -d --build`
3. **의존성 문제**: `pnpm install` 재실행

### 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

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
