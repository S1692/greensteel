# API 오류 분석 및 해결 방안

## 🚨 **발생한 오류들**

### **1. 401 Unauthorized 오류**
```
Failed to load resource: the server responded with a status of 401 ()
Manifest fetch from https://greensteel-86xxohbo0-123s-projects-eed55fc0.vercel.app/manifest.json failed, code 401
```

**원인**: Vercel 배포에서 PWA 매니페스트 파일에 대한 인증 오류

**해결책**: 
- Vercel의 인증 설정 확인 필요
- `manifest.json` 파일의 경로 및 권한 확인
- 존재하지 않는 아이콘 파일 참조 제거

### **2. 404 Not Found 오류 (API)**
```
api/v1/countries/search?query=eo&limit=20: Failed to load resource: the server responded with a status of 404 ()
```

**원인**: Auth Service의 countries API 라우터가 제대로 등록되지 않음

**진단 결과**:
- Gateway: 정상 라우팅 ✅
- Auth Service: 요청 수신 ✅  
- Auth Service: 404 응답 ❌

**해결책**: Auth Service 재배포 필요

### **3. ERR_CONNECTION_REFUSED 오류**
```
localhost:8080/process-data: Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**원인**: 하드코딩된 localhost URL 사용

**해결책**: 환경 변수 사용으로 수정
```typescript
const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway-production-da31.up.railway.app';
```

### **4. URL 인코딩 문제**
```
query=%EB%8C%80%ED%95%98&limit=20
```

**원인**: 한글이 URL 인코딩되어 로그에서 읽기 어려움

**해결책**: Gateway 로거에 디코딩 로직 추가
```python
decoded_query_params = {}
for key, value in query_params.items():
    try:
        decoded_key = urllib.parse.unquote(key)
        decoded_value = urllib.parse.unquote(value)
        decoded_query_params[decoded_key] = decoded_value
    except:
        decoded_query_params[key] = value
```

## 🔧 **적용된 수정사항**

### **1. Gateway 로깅 개선**
- URL 디코딩으로 한글 쿼리 파라미터 가독성 향상
- `decoded_query_params` 필드 추가

### **2. PWA 매니페스트 수정**
- 존재하지 않는 PNG 파일을 SVG로 변경
- 빈 screenshots 배열로 수정

### **3. 데이터 업로드 API 엔드포인트 수정**
- 하드코딩된 localhost:8080을 환경 변수로 변경
- 프로덕션/개발 환경 모두 지원

## 🚀 **추가 필요 작업**

### **1. Auth Service 재배포**
```bash
cd service/auth_service
railway up
```

### **2. Vercel 환경 변수 설정**
```
NEXT_PUBLIC_GATEWAY_URL=https://gateway-production-da31.up.railway.app
```

### **3. PWA 아이콘 파일 확인**
- `/icon-192x192.svg` 파일 존재 여부 확인
- 필요시 생성 또는 경로 수정

## 📊 **로그 분석 결과**

### **요청 흐름**:
1. **Frontend (Vercel)** → 검색어 "대하" 입력
2. **Gateway (Railway)** → 정상 라우팅 수행
3. **Auth Service (Railway)** → 404 응답 (문제!)

### **예상 동작**:
1. 요청: `/api/v1/countries/search?query=대하&limit=20`
2. 디코딩: `query=대하`
3. 응답: `{ countries: [...], total: N, query: "대하" }`

## ✅ **해결 완료 항목**

- [x] Gateway 로깅 개선 (URL 디코딩)
- [x] PWA 매니페스트 파일 수정
- [x] 데이터 업로드 API 엔드포인트 수정
- [ ] Auth Service 재배포
- [ ] Vercel 환경 변수 설정

## 🎯 **기대 효과**

1. **로그 가독성 향상**: 한글 검색어가 명확히 표시
2. **API 연결 안정화**: 환경별 엔드포인트 자동 설정
3. **PWA 오류 해결**: 매니페스트 관련 401/404 오류 제거
4. **전체 시스템 안정성**: 모든 API 엔드포인트 정상 작동
