# Countries API 404 오류 실제 문제 진단 가이드

## 🚨 **긴급 상황 - 배포 후에도 404 오류**

**현재 문제**: Auth Service를 Railway에 재배포했음에도 불구하고 `/api/v1/countries/search` 엔드포인트가 여전히 404 오류를 반환

## 🔍 **실제 문제 진단 방법**

### **1단계: Auth Service에서 실제 등록된 라우터 확인**

```bash
# 디버그 스크립트 실행
cd service/auth_service
python debug_routes.py

# 또는 직접 API 호출
curl https://authservice-production-1d5b.up.railway.app/debug/routes
curl https://authservice-production-1d5b.up.railway.app/debug/countries
```

### **2단계: 예상 결과 vs 실제 결과**

**예상 결과**:
```json
{
  "country_router_status": "loaded",
  "total_country_routes": 6,
  "full_paths": [
    "/api/v1/countries/search",
    "/api/v1/countries/",
    "/api/v1/countries/code/{code}",
    "/api/v1/countries/unlocode/{unlocode}",
    "/api/v1/countries/",
    "/api/v1/countries/{country_id}"
  ]
}
```

**실제 결과가 다르다면**: 라우터가 제대로 등록되지 않았거나 다른 문제가 있음

### **3단계: 가능한 문제 원인들**

#### **A. Import 오류**
```python
# app/main.py에서
from app.router.country import router as country_router
```
**확인 방법**: Auth Service 로그에서 ImportError 확인

#### **B. 라우터 등록 순서 문제**
```python
# 라우터 등록 순서가 중요할 수 있음
app.include_router(auth_router, prefix="/api/v1")
app.include_router(country_router, prefix="/api/v1/countries")
```

#### **C. 파일 경로 문제**
- `app/router/country.py` 파일이 실제로 존재하는지
- 파일 내용이 올바른지

#### **D. 의존성 문제**
- `CountryService` 클래스가 존재하는지
- `CountryResponse` 등의 스키마가 정의되어 있는지

### **4단계: 단계별 진단**

#### **4-1. 기본 라우터 확인**
```bash
curl https://authservice-production-1d5b.up.railway.app/
curl https://authservice-production-1d5b.up.railway.app/health
curl https://authservice-production-1d5b.up.railway.app/docs
```

#### **4-2. Auth 라우터 확인**
```bash
curl https://authservice-production-1d5b.up.railway.app/api/v1/
```

#### **4-3. Countries 라우터 확인**
```bash
curl https://authservice-production-1d5d5b.up.railway.app/api/v1/countries/
curl https://authservice-production-1d5b.up.railway.app/api/v1/countries/search?query=KR&limit=20
```

### **5단계: 로그 분석**

#### **Auth Service 시작 로그 확인**
```bash
railway logs --service auth-service | grep "countries"
railway logs --service auth-service | grep "country_router"
railway logs --service auth-service | grep "ImportError"
railway logs --service auth-service | grep "ERROR"
```

#### **요청 처리 로그 확인**
```bash
railway logs --service auth-service | grep "REQUEST"
railway logs --service auth-service | grep "RESPONSE"
```

## 🛠️ **문제 해결 방법**

### **방법 1: 라우터 등록 순서 변경**
```python
# app/main.py에서
# 라우터 등록 순서 변경
app.include_router(country_router, prefix="/api/v1/countries")
app.include_router(auth_router, prefix="/api/v1")
```

### **방법 2: 명시적 경로 설정**
```python
# app/router/country.py에서
router = APIRouter(prefix="/countries", tags=["countries"])
```

### **방법 3: 디버그 모드로 실행**
```python
# app/main.py에서
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
```

## 📊 **진단 체크리스트**

- [ ] **디버그 엔드포인트 호출** - `/debug/routes`, `/debug/countries`
- [ ] **기본 라우터 확인** - `/`, `/health`, `/docs`
- [ ] **Auth 라우터 확인** - `/api/v1/`
- [ ] **Countries 라우터 확인** - `/api/v1/countries/`
- [ ] **로그 분석** - ImportError, 라우터 등록 로그
- [ ] **파일 존재 확인** - `country.py`, `country_service.py`, `country.py` (schemas)

## 🚨 **긴급 대응**

### **즉시 확인해야 할 사항**
1. **Auth Service가 실제로 재시작되었는지**
2. **새로운 코드가 실제로 배포되었는지**
3. **Import 오류가 없는지**
4. **라우터 등록 순서가 올바른지**

### **연락처**
- **개발팀**: 즉시 연락
- **운영팀**: 서비스 상태 확인
- **긴급**: 서비스 다운 상황

---

**⚠️ 중요**: 이 가이드로도 문제가 해결되지 않으면 즉시 개발팀에 연락하세요!
