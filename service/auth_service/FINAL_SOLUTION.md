# Countries API 404 오류 최종 해결 가이드

## 🚨 **문제 상황**

**현재 문제**: `/api/v1/countries/search` 엔드포인트가 404 오류를 반환

**로그 분석 결과**:
- Gateway: 정상 라우팅 ✅
- Auth Service: 요청 수신 ✅
- Auth Service: 404 응답 ❌

## 🔍 **문제 원인**

**Auth Service에서 countries API가 제대로 등록되지 않았습니다.**

## 🛠️ **해결 방법**

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

### **3단계: 재배포 실행**

```bash
# 재배포
railway up

# 또는 특정 서비스만
railway up --service auth-service
```

### **4단계: 배포 상태 확인**

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
- [즉시 해결 가이드](./QUICK_FIX.md)
- [실제 문제 진단](./ACTUAL_PROBLEM_DIAGNOSIS.md)

---

**⚠️ 중요**: 이 가이드를 따라도 문제가 해결되지 않으면 즉시 개발팀에 연락하세요!
