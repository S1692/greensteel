# 🚀 GreenSteel 로컬 개발 환경 설정 가이드

## 📋 개요

이 가이드는 GreenSteel 프로젝트를 로컬에서 개발하기 위한 설정 방법을 설명합니다.

## 🐳 백엔드 서비스 실행 (Docker)

### 1. Docker 및 Docker Compose 설치 확인

```bash
# Docker 버전 확인
docker --version
docker-compose --version

# 설치되어 있지 않다면 Docker Desktop을 설치하세요
# https://www.docker.com/products/docker-desktop/
```

### 2. 백엔드 서비스 실행

```bash
# 프로젝트 루트 디렉토리에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

### 3. 서비스 상태 확인

```bash
# 모든 서비스 상태 확인
docker-compose ps

# 헬스체크 확인
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### 4. 백엔드 서비스 중지

```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

## 🖥️ 프론트엔드 실행 (로컬)

### 1. Node.js 및 pnpm 설치 확인

```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# pnpm 버전 확인 (10.0.0 이상 필요)
pnpm --version

# 설치되어 있지 않다면
# Node.js: https://nodejs.org/
# pnpm: npm install -g pnpm
```

### 2. 프론트엔드 의존성 설치

```bash
cd frontend
pnpm install
```

### 3. 환경 변수 설정

프론트엔드 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Next.js 설정
NEXT_PUBLIC_APP_NAME=GreenSteel
NEXT_PUBLIC_APP_VERSION=1.0.0

# API 설정 (Docker 컨테이너의 게이트웨이 서비스)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080

# 카카오 지도 API (필요시 설정)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here

# Google Analytics (선택사항)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PWA 설정
NEXT_PUBLIC_PWA_NAME=GreenSteel
NEXT_PUBLIC_PWA_DESCRIPTION=ESG 관리 플랫폼
NEXT_PUBLIC_PWA_THEME_COLOR=#10B981
NEXT_PUBLIC_PWA_BACKGROUND_COLOR=#FFFFFF

# 환경 설정
NODE_ENV=development
```

### 4. 프론트엔드 개발 서버 실행

```bash
# 개발 서버 실행
pnpm dev

# 또는
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

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
| PostgreSQL | 5432 | localhost:5432 | 데이터베이스 |
| Redis | 6379 | localhost:6379 | 캐시/세션 저장소 |

## 🔧 개발 팁

### 1. 백엔드 서비스만 재시작

```bash
# 특정 서비스만 재시작
docker-compose restart gateway
docker-compose restart auth-service

# 특정 서비스 재빌드 및 재시작
docker-compose up -d --build gateway
```

### 2. 데이터베이스 초기화

```bash
# PostgreSQL 데이터 초기화
docker-compose down -v
docker-compose up -d postgres
```

### 3. 로그 모니터링

```bash
# 실시간 로그 확인
docker-compose logs -f --tail=100

# 특정 서비스의 에러 로그만 확인
docker-compose logs -f gateway | grep ERROR
```

### 4. 컨테이너 내부 접속

```bash
# 특정 서비스 컨테이너 내부 접속
docker-compose exec gateway bash
docker-compose exec postgres psql -U greensteel -d greensteel
```

## 🚨 문제 해결

### 1. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Windows에서 프로세스 종료
taskkill /PID <PID> /F
```

### 2. Docker 컨테이너 문제

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
docker-compose restart

# 컨테이너 재빌드
docker-compose up -d --build
```

### 3. 의존성 문제

```bash
# node_modules 삭제 후 재설치
cd frontend
rm -rf node_modules
pnpm install

# Docker 이미지 재빌드
docker-compose build --no-cache
```

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
