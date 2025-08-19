# 🚀 Gateway 설정을 Frontend에 연결하는 방법

## 🔍 문제 상황

Gateway 설정이 frontend에 안 보이는 문제가 발생했습니다.

## 🚨 원인 분석

### 1. 환경 변수 설정 문제
- `NEXT_PUBLIC_GATEWAY_URL`이 기본값으로 설정됨
- 실제 Gateway URL이 설정되지 않음

### 2. Next.js 설정 문제
- Gateway 관련 rewrite 규칙 부족
- API 프록시 설정 불완전

### 3. Gateway 연결 설정 누락
- Frontend에서 Gateway로의 연결 설정 불완전

## 🛠️ 해결 방법

### 방법 1: 환경 변수 설정 (권장)

#### 1단계: .env.local 파일 생성
```bash
cd frontend
cp env.example .env.local
```

#### 2단계: Gateway URL 설정
```bash
# .env.local 파일 편집
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080
```

#### 3단계: 개발 서버 재시작
```bash
pnpm run dev
```

### 방법 2: Next.js 설정 수정

#### 1단계: next.config.js 수정
```javascript
async rewrites() {
  return [
    {
      source: '/sitemap.xml',
      destination: '/api/sitemap',
    },
    // Gateway 프록시 설정 추가
    {
      source: '/api/gateway/:path*',
      destination: 'http://localhost:8080/:path*',
    },
    // 기존 countries API 설정
    {
      source: '/api/v1/countries/:path*',
      destination: 'http://localhost:8000/api/v1/countries/:path*',
    },
  ];
},
```

#### 2단계: 설정 적용
```bash
pnpm run build
pnpm run dev
```

### 방법 3: Railway 배포 시 환경 변수 설정

#### 1단계: Vercel 환경 변수 설정
```bash
# Vercel 대시보드에서 환경 변수 설정
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.railway.app
```

#### 2단계: Railway Gateway URL 확인
```bash
# Railway 대시보드에서 Gateway 서비스 URL 확인
# 예: https://greensteel-gateway-production.up.railway.app
```

## 📋 확인 체크리스트

### 환경 변수 설정
- [ ] `.env.local` 파일 생성
- [ ] `NEXT_PUBLIC_GATEWAY_URL` 설정
- [ ] 개발 서버 재시작

### Next.js 설정
- [ ] `next.config.js` rewrite 규칙 추가
- [ ] Gateway 프록시 설정
- [ ] 설정 적용 및 빌드

### Gateway 연결 테스트
- [ ] Gateway 서비스 실행 확인
- [ ] Frontend에서 Gateway API 호출 테스트
- [ ] 네트워크 탭에서 요청 확인

## 🔧 상세 설정

### 1. 환경 변수 파일 (.env.local)
```bash
# Gateway 설정
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080

# 개발 환경
NODE_ENV=development

# 기타 설정
NEXT_PUBLIC_APP_NAME=GreenSteel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Next.js 설정 (next.config.js)
```javascript
async rewrites() {
  return [
    // Gateway 프록시
    {
      source: '/api/gateway/:path*',
      destination: 'http://localhost:8080/:path*',
    },
    // Auth Service 프록시
    {
      source: '/api/auth/:path*',
      destination: 'http://localhost:8081/api/v1/:path*',
    },
    // 기존 설정
    {
      source: '/api/v1/countries/:path*',
      destination: 'http://localhost:8000/api/v1/countries/:path*',
    },
  ];
},
```

### 3. API 클라이언트 설정 (axiosClient.ts)
```typescript
// Gateway URL 확인
console.log('Gateway URL:', env.NEXT_PUBLIC_GATEWAY_URL);

// API 엔드포인트 수정
export const apiEndpoints = {
  gateway: {
    health: '/health',
    status: '/status',
    routing: '/routing',
    architecture: '/architecture',
  },
  // ... 기존 엔드포인트
};
```

## 🧪 테스트 방법

### 1. Gateway 연결 테스트
```bash
# Gateway 서비스 실행 확인
curl http://localhost:8080/health

# 응답 예시
{
  "status": "healthy",
  "gateway": "greensteel-gateway",
  "timestamp": "2025-08-19T00:00:00Z"
}
```

### 2. Frontend에서 Gateway API 호출
```typescript
// Gateway 상태 확인
const response = await axiosClient.get('/health');
console.log('Gateway Status:', response.data);
```

### 3. 네트워크 탭 확인
- 브라우저 개발자 도구 → Network 탭
- Gateway API 요청 확인
- 응답 상태 및 데이터 확인

## 🚨 문제 해결

### Gateway 연결 실패 시
1. **Gateway 서비스 실행 확인**
   ```bash
   cd gateway
   python -m app.main
   ```

2. **포트 충돌 확인**
   ```bash
   netstat -an | grep 8080
   ```

3. **방화벽 설정 확인**
   - Windows: Windows Defender 방화벽
   - macOS: 시스템 환경설정 → 보안 및 개인정보보호

### 환경 변수 문제 시
1. **파일 경로 확인**
   ```bash
   ls -la frontend/.env.local
   ```

2. **변수 값 확인**
   ```bash
   echo $NEXT_PUBLIC_GATEWAY_URL
   ```

3. **Next.js 캐시 정리**
   ```bash
   rm -rf .next
   pnpm run dev
   ```

## 📊 모니터링

### Gateway 상태 모니터링
- `/health` 엔드포인트로 상태 확인
- `/status` 엔드포인트로 서비스별 상태 확인
- `/routing` 엔드포인트로 라우팅 규칙 확인

### Frontend 연결 모니터링
- 브라우저 콘솔에서 오류 메시지 확인
- 네트워크 탭에서 API 요청/응답 확인
- 환경 변수 값 확인

---

**생성 시간**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**목적**: Gateway 설정을 Frontend에 연결하는 방법 가이드
**상태**: 🔄 설정 진행 중...
