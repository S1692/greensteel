# Countries API 404 오류 즉시 해결 가이드

## 🚨 **긴급 상황**

**현재 문제**: `/api/v1/countries/search` 엔드포인트가 404 오류를 반환

**영향**: 국가 검색 기능이 완전히 작동하지 않음

## 🔍 **문제 진단 결과**

### **코드 상태**: ✅ 정상
- `app/main.py`: `app.include_router(country_router, prefix="/api/v1/countries")` ✅
- `app/router/country.py`: `router = APIRouter(tags=["countries"])` ✅
- `/search` 엔드포인트: 정상 정의됨 ✅

### **프로덕션 상태**: ❌ 문제
- Railway에 배포된 Auth Service가 이전 버전
- 업데이트된 countries API 코드가 반영되지 않음

## 🛠️ **즉시 해결 방법**

### **1단계: Railway CLI 설치 및 로그인**

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login
```

### **2단계: Auth Service 프로젝트 연결**

```bash
cd service/auth_service

# Railway 프로젝트 연결
railway link

# 연결 상태 확인
railway status
```

### **3단계: 환경 변수 확인**

`.env` 파일에서 다음 설정 확인:

```bash
DATABASE_URL=your_railway_postgresql_url
DATABASE_SSL_MODE=require
```

### **4단계: 재배포 실행**

```bash
# 전체 서비스 재배포
railway up

# 또는 특정 서비스만
railway up --service auth-service
```

### **5단계: 배포 상태 확인**

```bash
# 배포 상태
railway status

# 실시간 로그
railway logs --follow

# 서비스 URL
railway domain
```

## ✅ **해결 완료 확인**

### **헬스체크 테스트**
```bash
curl https://authservice-production-1d5b.up.railway.app/health
```

**예상 응답**:
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "database": "connected"
}
```

### **Countries API 테스트**
```bash
curl "https://authservice-production-1d5b.up.railway.app/api/v1/countries/search?query=KR&limit=20"
```

**예상 응답**:
```json
{
  "countries": [...],
  "total": 1,
  "query": "KR"
}
```

### **API 문서 확인**
```bash
curl https://authservice-production-1d5b.up.railway.app/docs
```

## 🚨 **문제가 지속될 경우**

### **1. 서비스 재시작**
```bash
railway restart
```

### **2. 롤백 후 재배포**
```bash
railway rollback
railway up
```

### **3. 로그 분석**
```bash
railway logs | grep ERROR
railway logs | grep "countries"
```

## 📊 **모니터링**

### **성공 지표**
- [ ] 헬스체크: 200 OK
- [ ] Countries API: 200 OK (검색 결과 반환)
- [ ] 프론트엔드 국가 검색: 정상 작동
- [ ] 404 오류: 더 이상 발생하지 않음

### **실패 시 확인사항**
- [ ] Railway 배포 상태
- [ ] Auth Service 로그
- [ ] 데이터베이스 연결 상태
- [ ] 환경 변수 설정

## 🔗 **관련 문서**

- [Railway 배포 가이드](./RAILWAY_DEPLOYMENT.md)
- [Gateway 연결 설정](../../frontend/GATEWAY_CONNECTION_FIX.md)
- [프론트엔드 API 설정](../../frontend/GATEWAY_SETUP.md)

---

**⚠️ 중요**: 이 가이드를 따라도 문제가 해결되지 않으면 즉시 개발팀에 연락하세요!
