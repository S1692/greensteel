# Gateway 503 오류 해결 가이드

## 🚨 **문제 상황**

프론트엔드에서 Gateway 연결 시 503 오류가 발생하고 있습니다:
```
Failed to load resource: the server responded with a status of 503
Gateway 연결 오류: Request failed with status code 503
```

## 🔍 **원인 분석**

### **503 Service Unavailable 오류**
- Gateway 서비스가 실행되지 않음
- 프로덕션 환경에서 Gateway URL 설정 오류
- CORS 설정 문제
- 의존성 서비스 연결 실패
- **잘못된 엔드포인트 경로 사용** ⚠️

### **⚠️ 중요: 올바른 Gateway 엔드포인트**

Railway에 배포된 Gateway의 올바른 엔드포인트:
- **잘못된 경로**: `/gateway/health` → 503 오류
- **올바른 경로**: `/health` → 200 OK

## 🛠️ **해결 방법**

### **1단계: 환경 변수 확인**

`.env.local` 파일에서 다음 설정을 확인하세요:

```bash
# Gateway URL 설정 (프로덕션 - Railway)
NEXT_PUBLIC_GATEWAY_URL=https://gateway-production-da31.up.railway.app

# 또는 개발 환경
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080

# 환경 구분
NEXT_PUBLIC_ENV=production
```

### **2단계: Gateway 서비스 상태 확인**

```bash
# 헬스체크 (올바른 경로)
curl https://gateway-production-da31.up.railway.app/health

# 잘못된 경로 (503 오류 발생)
curl https://gateway-production-da31.up.railway.app/gateway/health
```

### **3단계: CORS 설정 확인**

Gateway의 `ALLOWED_ORIGINS`에 프론트엔드 도메인이 포함되어 있는지 확인:

```bash
# Gateway .env 파일
ALLOWED_ORIGINS=https://greensteel.site,https://www.greensteel.site
```

### **4단계: 프론트엔드 재시작**

```bash
# 개발 서버 재시작
pnpm run dev

# 또는 프로덕션 빌드
pnpm run build
pnpm start
```

## 🔧 **Gateway 서비스 실행**

### **로컬에서 Gateway 실행**

```bash
cd gateway

# 환경 변수 설정
cp env.example .env
# .env 파일 편집하여 올바른 설정 입력

# 의존성 설치
pip install -r requirements.txt

# Gateway 실행
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### **Docker로 Gateway 실행**

```bash
cd gateway

# Docker 이미지 빌드
docker build -t greensteel-gateway .

# 컨테이너 실행
docker run -d \
  --name greensteel-gateway \
  -p 8080:8080 \
  --env-file .env \
  greensteel-gateway
```

### **Railway로 Gateway 배포**

```bash
cd gateway

# Railway CLI 설치
npm install -g @railway/cli

# 로그인 및 프로젝트 연결
railway login
railway link

# 배포
railway up
```

## 📊 **모니터링 및 디버깅**

### **Gateway 로그 확인**

```bash
# 실시간 로그
tail -f gateway.log

# 오류 로그
grep "ERROR" gateway.log

# 요청 로그
grep "Request" gateway.log
```

### **프론트엔드 디버깅**

브라우저 개발자 도구에서:

1. **Network 탭**: API 요청 상태 확인
2. **Console 탭**: 오류 메시지 확인
3. **Application 탭**: 환경 변수 확인

### **헬스체크 엔드포인트 (올바른 경로)**

- **GET** `/health` - Gateway 상태 ✅
- **GET** `/status` - 서비스 상태 ✅
- **GET** `/routing` - 라우팅 정보 ✅
- **GET** `/architecture` - 아키텍처 정보 ✅

### **잘못된 엔드포인트 (503 오류 발생)**

- **GET** `/gateway/health` - 503 오류 ❌
- **GET** `/gateway/status` - 503 오류 ❌
- **GET** `/gateway/routing` - 503 오류 ❌
- **GET** `/gateway/architecture` - 503 오류 ❌

## 🚨 **긴급 상황 대응**

### **Gateway 완전 다운 시**

1. **서비스 상태 확인**
2. **로그 분석**
3. **의존성 서비스 확인**
4. **서비스 재시작**
5. **프론트엔드에서 오프라인 모드 활성화**

### **롤백 계획**

1. **이전 버전으로 복원**
2. **프론트엔드에서 Gateway 우회**
3. **직접 서비스 연결 (임시)**

## 📞 **지원 및 연락처**

- **개발팀**: 개발팀 채널
- **운영팀**: 운영팀 채널
- **긴급**: 긴급 연락망

## 🔗 **관련 문서**

- [Gateway 프로덕션 배포 가이드](../gateway/PRODUCTION_DEPLOYMENT.md)
- [프론트엔드 배포 가이드](DEPLOYMENT.md)
- [API Gateway 설정](GATEWAY_SETUP.md)

## 🎯 **해결 완료 체크리스트**

- [ ] 환경 변수 `NEXT_PUBLIC_GATEWAY_URL` 설정
- [ ] Gateway 엔드포인트 경로 수정 (`/gateway/health` → `/health`)
- [ ] Next.js 설정에서 프로덕션 Gateway URL 적용
- [ ] 프론트엔드 재시작
- [ ] 헬스체크 엔드포인트 테스트 성공
- [ ] 503 오류 해결 확인
