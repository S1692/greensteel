# 라우팅 및 PWA 수정 검증 가이드

## 🎯 수정 사항 요약

### 1. Gateway 라우팅 수정
- ✅ `/geo` 프리픽스 추가로 지리 정보 서비스 분리
- ✅ `favicon.ico`와 `robots.txt` 핸들러 추가 (404 방지)
- ✅ 상세한 라우팅 로그 추가

### 2. Frontend API 호출 변경
- ✅ `/api/v1/countries/search` → `/geo/v1/countries/search`로 변경
- ✅ Next.js rewrites 설정으로 Gateway 연결 최적화

### 3. PWA Service Worker 개선
- ✅ `app-build-manifest.json` 파일 precache에서 제외
- ✅ 오래된 캐시 정리 로직 추가 (`cleanupOutdatedCaches`)
- ✅ 캐시 버전 업데이트 (v2)

---

## 🔍 검증 단계

### 단계 1: 라우팅 검증
**목적**: `/geo/v1/countries/search` 경로가 올바른 서비스로 라우팅되는지 확인

1. **브라우저 DevTools 확인**
   ```
   1. 브라우저에서 국가 검색 기능 사용 (예: "대한" 입력)
   2. DevTools → Network 탭 열기
   3. 확인 사항:
      - 요청 URL: `/geo/v1/countries/search?query=대한&limit=20`
      - Method: GET
      - Status: 200 (404가 아님)
   ```

2. **Gateway 로그 확인**
   ```bash
   # Gateway 로그에서 다음과 같은 메시지 확인:
   [INFO] Matched prefix: /geo → upstream: {GEO_SERVICE_URL}
   [INFO] Proxying GET /geo/v1/countries/search to: {GEO_SERVICE_URL}/geo/v1/countries/search
   [INFO] RESPONSE: GET /geo/v1/countries/search → status: 200, time: 0.123s
   
   # 다음 메시지가 나오면 안됨:
   ❌ No service configured for path: /geo/v1/countries/search
   ❌ Service not available for path
   ```

3. **서비스 매핑 확인**
   ```bash
   # Gateway 엔드포인트로 라우팅 정보 확인:
   curl https://gateway-production-da31.up.railway.app/routing
   
   # 응답에서 /geo 매핑 확인:
   {
     "domain_routing": {
       "geo-information": {
         "paths": ["/geo/*"],
         "service": "Geo Service",
         "description": "지리 정보 및 국가 데이터"
       }
     }
   }
   ```

### 단계 2: PWA 검증
**목적**: Service Worker 오류가 해결되었는지 확인

1. **브라우저 콘솔 확인**
   ```
   1. 사이트 새로고침 (Hard Reload: Ctrl+Shift+R)
   2. DevTools → Console 탭 확인
   3. ❌ 다음 오류가 없어야 함:
      - "bad-precaching-response: app-build-manifest.json 404"
      - "Failed to load resource: app-build-manifest.json"
   ```

2. **Service Worker 상태 확인**
   ```
   1. DevTools → Application 탭
   2. Service Workers 섹션에서:
      - Status: "activated and is running" 확인
      - 오류 메시지 없음 확인
   ```

3. **캐시 정리 확인**
   ```
   1. DevTools → Application 탭 → Cache Storage
   2. 확인 사항:
      - 새 캐시 이름들 존재: *-cache-v2
      - 오래된 캐시 자동 정리됨
   3. 필요시 수동 정리:
      - "Clear storage" 버튼 클릭
      - "Clear site data" 실행
   ```

### 단계 3: 엣지 케이스 검증
**목적**: 특수 상황에서도 정상 작동하는지 확인

1. **Favicon 요청 처리**
   ```bash
   # 다음 요청이 404를 반환하지 않고 204 반환하는지 확인:
   curl -I https://gateway-production-da31.up.railway.app/favicon.ico
   # 예상 응답: HTTP/1.1 204 No Content
   ```

2. **한글 쿼리 파라미터 테스트**
   ```
   1. 국가 검색에서 "대한민국" 입력
   2. Network 탭에서 URL 확인:
      - 올바른 인코딩: query=%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD
   3. 검색 결과가 정상적으로 반환되는지 확인
   ```

3. **서비스 연결 상태 확인**
   ```bash
   # Gateway 상태 확인:
   curl https://gateway-production-da31.up.railway.app/status
   
   # 응답에서 geo 서비스 상태 확인:
   {
     "domains": {
       "geo-information": {
         "status": "healthy",
         "message": "Service responding"
       }
     }
   }
   ```

---

## 🚨 문제 해결 가이드

### Gateway 라우팅 문제
```bash
# 1. 환경 변수 확인
echo $GEO_SERVICE_URL
# 또는 기본값 사용 중인지 확인

# 2. 서비스 매핑 재확인
curl https://gateway-production-da31.up.railway.app/routing

# 3. Gateway 재시작 (Railway)
```

### PWA 캐시 문제
```javascript
// 브라우저 콘솔에서 실행 - 캐시 강제 정리
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// 캐시 스토리지 정리
caches.keys().then(function(names) {
  for (let name of names) {
    caches.delete(name);
  }
});
```

### Frontend 빌드 문제
```bash
# 1. 캐시 정리 후 재빌드
pnpm clean
pnpm install
pnpm build

# 2. PWA 설정 확인
# next.config.js에서 buildExcludes 설정 재확인
```

---

## ✅ 성공 기준

### 필수 조건
- [ ] `/geo/v1/countries/search` 요청이 200 상태코드 반환
- [ ] Gateway 로그에 올바른 라우팅 정보 출력
- [ ] PWA 콘솔 오류 없음
- [ ] Service Worker 정상 작동

### 최적화 조건
- [ ] 국가 검색 응답 시간 < 1초
- [ ] PWA 설치 가능
- [ ] 오프라인 상태에서 캐시된 API 응답 사용

---

## 📋 체크리스트

### 배포 전 점검
- [ ] Gateway 환경변수 `GEO_SERVICE_URL` 설정
- [ ] Frontend 환경변수 `NEXT_PUBLIC_GATEWAY_URL` 설정
- [ ] PWA manifest.json 유효성 검사
- [ ] Service Worker 등록 확인

### 배포 후 점검  
- [ ] 프로덕션 환경에서 국가 검색 테스트
- [ ] PWA 설치 테스트 (Chrome, Safari)
- [ ] 모바일 디바이스에서 기능 테스트
- [ ] 네트워크 연결 끊어도 캐시된 컨텐츠 접근 가능

---

## 🔧 환경 변수 설정

### Railway Gateway 서비스
```bash
GEO_SERVICE_URL=https://auth-service-production-xxxx.up.railway.app
# 또는 실제 지리 정보 서비스 URL
```

### Vercel Frontend
```bash
NEXT_PUBLIC_GATEWAY_URL=https://gateway-production-da31.up.railway.app
```

---

## 📞 문제 발생 시 연락처
문제가 지속되면 다음 정보와 함께 보고:
1. 브라우저 DevTools 스크린샷
2. Gateway 로그 (라우팅 관련 부분)
3. 재현 단계
4. 예상 동작 vs 실제 동작
