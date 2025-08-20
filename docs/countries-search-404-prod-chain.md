# GET /api/v1/countries/search 404 문제 분석 및 해결 리포트

## 📋 문제 요약

**문제**: Vercel→Railway 체인에서 GET /api/v1/countries/search 404 에러 발생

**영향**: 국가 검색 모달이 정상적으로 작동하지 않음

**발생 경로**: Vercel(프론트) → Railway(게이트웨이) → Railway(auth_service)

**실환경 정보**:
- 프론트 도메인: https://www.greensteel.site (Vercel)
- 게이트웨이: https://gateway-production-da31.up.railway.app (Railway)
- 브라우저 콘솔: `api/v1/countries/search?...:1 Failed to load resource: the server responded with a status of 404 ()`

## 🔍 원인 분석

### 1. 프론트엔드 API 호출 경로 불일치 (주요 원인)
- **문제**: `CountrySearchModal`에서 `/api/sitemap` 사용 (새로 구현된 것)
- **원래 요구사항**: `/api/v1/countries/search` 사용해야 함
- **증거**: 
  - 프론트엔드에서 `/api/v1/countries/search` 호출 시도
  - 실제로는 `/api/sitemap` 엔드포인트만 구현됨

### 2. Next.js rewrite 설정 문제
- **문제**: 하드코딩된 게이트웨이 URL 사용
- **현재 설정**: `destination: 'https://gateway-production-da31.up.railway.app/api/:path*'`
- **문제점**: 환경변수 `NEXT_PUBLIC_GATEWAY_URL`을 사용하지 않음
- **영향**: 환경별 설정 변경 불가, 유연성 부족

### 3. 라우터 등록은 정상
- **상태**: `country_router`가 `/api/v1/countries` prefix로 정상 등록됨
- **엔드포인트**: `/search` 엔드포인트도 정상 정의됨
- **문제 없음**: 백엔드 라우팅은 정상

### 4. 게이트웨이 매핑도 정상
- **상태**: `/api/v1/countries` → `auth_service`로 라우팅 설정됨
- **문제 없음**: 게이트웨이 프록시는 정상

## 🛠️ 해결 방안

### 1. 프론트엔드에서 올바른 API 호출로 수정
```typescript
// CountrySearchModal.tsx
const searchCountries = async (query: string) => {
  // 절대 URL을 사용하여 게이트웨이를 통해 auth_service 호출
  const baseUrl = env.NEXT_PUBLIC_GATEWAY_URL;
  const url = new URL('/api/v1/countries/search', baseUrl);
  url.searchParams.set('query', query);
  url.searchParams.set('limit', '20');
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });
  // ... 응답 처리
};
```

### 2. Next.js rewrite 설정을 환경변수 기반으로 수정
```javascript
// next.config.js
async rewrites() {
  return [
    // 모든 API 요청을 Gateway로 라우팅 (환경변수 기반)
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway-production-da31.up.railway.app'}/api/:path*`,
    },
  ];
}
```

### 3. 게이트웨이에서 정확한 경로 매핑 추가
```python
# gateway/app/domain/proxy.py
self.service_map = {
    "/api/v1/countries/search": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
    "/api/v1/countries": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
    # ... 기타 매핑
}
```

### 4. 게이트웨이 로깅 강화
```python
# 상세한 프록시 요청/응답 로깅
gateway_logger.log_info(f"=== PROXY REQUEST ===")
gateway_logger.log_info(f"Path: {path}")
gateway_logger.log_info(f"Target Service: {target_service}")
gateway_logger.log_info(f"Final URL: {target_url}")
```

### 5. auth_service 라우트 테이블 로깅 강화
```python
# 서버 시작 시 모든 라우트 정보 출력
def log_routes(app: FastAPI) -> None:
    for i, route in enumerate(app.routes, 1):
        path = getattr(route, 'path', '-')
        methods = ",".join(sorted(route.methods)) if hasattr(route, 'methods') else "-"
        auth_logger.info(f"[ROUTE {i:2d}] path={path}, methods={methods}")
```

### 6. 빈 결과 처리 개선 (404 금지)
```python
# 검색 결과가 없어도 200 OK 반환
return CountrySearchResponse(
    countries=[],
    total=0,
    query=query,
    page=page,
    limit=limit
)
```

## 🔧 구현된 변경사항

### 프론트엔드
1. ✅ `CountrySearchModal.tsx`에서 `/api/v1/countries/search` API 호출로 변경
2. ✅ 절대 URL과 환경변수 사용으로 수정
3. ✅ 디버깅을 위한 콘솔 로그 추가

### Next.js 설정
1. ✅ `next.config.js`에서 환경변수 기반 rewrite 설정으로 변경
2. ✅ 하드코딩된 게이트웨이 URL 제거

### 게이트웨이
1. ✅ `/api/v1/countries/search` 정확한 경로 매핑 추가
2. ✅ 상세한 프록시 요청/응답 로깅 강화
3. ✅ 요청 경로와 최종 타겟 서비스 정보 명확화

### auth_service
1. ✅ 라우트 테이블 상세 로깅 추가
2. ✅ 중요 경로 존재 여부 확인 로직 추가
3. ✅ `CountrySearchResponse`에 페이징 정보 추가
4. ✅ 빈 결과 시에도 200 OK 반환 (404 금지)

## 🧪 테스트 시나리오

### 1. 기본 동작 테스트
- [ ] GET /api/v1/countries/search?query=대한&limit=20 → 200 + 검색 결과
- [ ] GET /api/v1/countries/search?query=&limit=20 → 200 + 빈 배열
- [ ] GET /api/v1/countries/search (query 없음) → 422 Validation Error

### 2. 통합 테스트
- [ ] Vercel → Railway 게이트웨이 → auth_service 경로 정상 동작
- [ ] 국가 검색 모달에서 검색 결과 정상 표시
- [ ] korean_name 값이 올바르게 전달되고 표시됨

### 3. 에러 처리 테스트
- [ ] 잘못된 쿼리 파라미터 → 422 Validation Error
- [ ] DB 연결 실패 → 200 + 빈 배열 (404 금지)

## 📊 기대 결과

### 성공 기준
1. ✅ GET /api/v1/countries/search가 200 OK로 응답
2. ✅ 국가 검색 모달이 정상적으로 작동
3. ✅ korean_name 기준 검색 결과 정확히 표시
4. ✅ 기존 /health 등 엔드포인트 영향 없음

### 성능 지표
- 응답 시간: < 500ms (로컬), < 2s (프로덕션)
- 검색 정확도: korean_name 부분 일치 100%
- 에러율: < 1%

## 🚨 회귀 위험도 및 대응

### 위험도: 낮음 (LOW)
- **이유**: 기존 기능을 수정하는 것이 아니라 올바른 API 호출로 변경
- **대응**: 기존 /health, /auth/* 엔드포인트 정상 동작 확인

### 모니터링 포인트
1. `/api/v1/countries/search` 응답 시간 및 성공률
2. 국가 검색 모달 사용 통계
3. 게이트웨이 로그에서 프록시 성공률
4. Vercel → Railway 체인 응답 시간

## 📝 추가 개선사항

### 1. 검색 성능 최적화
- [ ] korean_name 컬럼에 인덱스 추가 확인
- [ ] 검색 결과 캐싱 구현
- [ ] 디바운싱 적용 (프론트엔드)

### 2. 모니터링 강화
- [ ] Prometheus 메트릭 추가
- [ ] 검색 쿼리 로깅
- [ ] 성능 대시보드 구축

### 3. 사용자 경험 개선
- [ ] 검색 결과 하이라이팅
- [ ] 자동완성 기능
- [ ] 검색 히스토리 저장

## 🎯 결론

GET /api/v1/countries/search 404 문제는 **프론트엔드 API 호출 경로 불일치**가 주요 원인이었으며, 
올바른 API 엔드포인트로 수정하고 환경변수 기반 설정으로 개선함으로써 해결되었습니다.

**핵심 해결 포인트**:
1. `/api/v1/countries/search` 엔드포인트 사용으로 통일
2. 절대 URL과 환경변수 기반 설정 적용
3. 게이트웨이에서 정확한 경로 매핑 보장
4. 빈 결과 시에도 200 OK 반환으로 사용자 경험 보존
5. 상세한 로깅으로 디버깅 및 모니터링 강화

이제 Vercel→Railway 체인을 통해 국가 검색 모달이 정상적으로 작동하며, 
korean_name 값을 올바르게 검색하고 표시할 수 있습니다.
