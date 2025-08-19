# Auth Service Railway 배포 가이드

## 🚀 **Railway 배포 단계**

### **1. Railway CLI 설치 및 로그인**

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login
```

### **2. 프로젝트 연결**

```bash
cd service/auth_service

# Railway 프로젝트 연결
railway link

# 또는 새 프로젝트 생성
railway init
```

### **3. 환경 변수 설정**

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# 데이터베이스 설정
DATABASE_URL=your_railway_postgresql_url_here
DATABASE_SSL_MODE=require

# 서비스 설정
SERVICE_NAME=auth-service
SERVICE_VERSION=1.0.0

# 로깅 설정
LOG_LEVEL=INFO
LOG_FORMAT=json

# CORS 설정
ALLOWED_ORIGINS=https://greensteel.site,https://www.greensteel.site

# 보안 설정
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### **4. 배포 실행**

```bash
# 배포
railway up

# 또는 특정 서비스만 배포
railway up --service auth-service
```

### **5. 배포 상태 확인**

```bash
# 배포 상태 확인
railway status

# 로그 확인
railway logs

# 서비스 URL 확인
railway domain
```

## 🔧 **문제 해결**

### **Countries API 404 오류 해결**

현재 문제: `/api/v1/countries/search` 엔드포인트가 404 오류를 반환

**해결 방법**:

1. **코드 업데이트 확인**
   ```python
   # app/main.py에서
   app.include_router(country_router, prefix="/api/v1/countries")
   ```

2. **라우터 설정 확인**
   ```python
   # app/router/country.py에서
   router = APIRouter(tags=["countries"])  # prefix 제거
   ```

3. **최종 API 경로**
   - **라우터 등록**: `/api/v1/countries`
   - **엔드포인트**: `/search`
   - **최종 경로**: `/api/v1/countries/search`

### **배포 후 테스트**

```bash
# 헬스체크
curl https://your-auth-service-url.railway.app/health

# Countries API 테스트
curl "https://your-auth-service-url.railway.app/api/v1/countries/search?query=KR&limit=20"

# API 문서 확인
curl https://your-auth-service-url.railway.app/docs
```

## 📊 **모니터링**

### **로그 확인**

```bash
# 실시간 로그
railway logs --follow

# 특정 시간대 로그
railway logs --since 1h

# 오류 로그만
railway logs | grep ERROR
```

### **성능 모니터링**

- **응답 시간**: Gateway 로그에서 `response_time_ms` 확인
- **오류율**: 404, 500 오류 발생 빈도 모니터링
- **데이터베이스 연결**: 헬스체크 엔드포인트에서 DB 상태 확인

## 🚨 **긴급 상황 대응**

### **서비스 다운 시**

1. **상태 확인**
   ```bash
   railway status
   railway logs
   ```

2. **재시작**
   ```bash
   railway restart
   ```

3. **롤백**
   ```bash
   railway rollback
   ```

### **연락처**

- **개발팀**: 개발팀 채널
- **운영팀**: 운영팀 채널
- **긴급**: 긴급 연락망

## 🔗 **관련 문서**

- [Gateway 프로덕션 배포 가이드](../../gateway/PRODUCTION_DEPLOYMENT.md)
- [프론트엔드 배포 가이드](../../frontend/DEPLOYMENT.md)
- [API Gateway 설정](../../frontend/GATEWAY_SETUP.md)
