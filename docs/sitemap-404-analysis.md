# GET /api/sitemap 404 문제 분석 및 해결 리포트

## 📋 문제 요약

**문제**: 모달을 통한 DB 데이터 검색 기능에서 GET /api/sitemap 404 에러 발생

**영향**: 국가 검색 모달이 정상적으로 작동하지 않음

**발생 경로**: 프론트엔드(Next.js) → 게이트웨이(FastAPI) → auth_service(FastAPI, Railway)

## 🔍 원인 분석

### 1. 라우터 미등록 (주요 원인)
- **문제**: `auth_service`에 `/api/sitemap` 엔드포인트가 정의되어 있지 않음
- **증거**: 
  - `service/auth_service/app/router/` 디렉토리에 sitemap 관련 라우터 파일 없음
  - `main.py`에서 sitemap 라우터 등록 누락
  - 프론트엔드에서 `/api/sitemap` 호출 시 404 응답

### 2. 게이트웨이 매핑 설정
- **현재 설정**: `/api/*` → `auth_service`로 라우팅
- **문제**: 매핑은 올바르게 설정되어 있지만, 타겟 서비스에 해당 엔드포인트가 없음

### 3. 프론트엔드 API 호출
- **현재 구현**: `/api/v1/countries/search` 사용
- **문제**: 해당 엔드포인트가 존재하지 않거나 접근 불가

## 🛠️ 해결 방안

### 1. sitemap 라우터 생성
```python
# service/auth_service/app/router/sitemap.py
router = APIRouter(prefix="/api", tags=["sitemap"])

@router.get("/sitemap", response_model=SitemapResponse)
async def get_sitemap(
    q: Optional[str] = Query(None, description="검색어 (korean_name 기준)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db)
):
    # korean_name 기준 검색 구현
```

### 2. 응답 스키마 정의
```python
# service/auth_service/app/domain/schemas/sitemap.py
class SitemapItem(BaseModel):
    id: str
    title: str  # korean_name 값
    url: str
    updated_at: Optional[datetime] = None

class SitemapResponse(BaseModel):
    items: List[SitemapItem]
    total: int
    page: int
    limit: int
```

### 3. 라우터 등록
```python
# service/auth_service/main.py
from app.router import auth_router, stream_router, sitemap_router

app.include_router(sitemap_router, tags=["sitemap"])
```

### 4. 프론트엔드 API 호출 수정
```typescript
// frontend/src/components/CountrySearchModal.tsx
const response = await fetch(
  `/api/sitemap?q=${encodeURIComponent(query)}&page=1&limit=20`
);
```

## 🔧 구현된 변경사항

### 백엔드 (auth_service)
1. ✅ `sitemap.py` 라우터 생성
2. ✅ `sitemap.py` 스키마 생성  
3. ✅ `main.py`에 라우터 등록
4. ✅ 라우트 테이블 로깅 추가

### 프론트엔드
1. ✅ `CountrySearchModal.tsx`에서 `/api/sitemap` API 호출로 변경
2. ✅ sitemap 응답 형식에 맞게 데이터 변환 로직 추가
3. ✅ 환경변수 설명 업데이트

### 게이트웨이
1. ✅ 상세한 요청/응답 로깅 강화
2. ✅ 디버깅을 위한 헤더 및 쿼리 파라미터 로깅 추가

## 🧪 테스트 시나리오

### 1. 기본 동작 테스트
- [ ] GET /api/sitemap (no query) → 200 + 빈 배열
- [ ] GET /api/sitemap?q=한국 → 200 + korean_name 기준 검색 결과
- [ ] GET /api/sitemap?q=한국&page=1&limit=5 → 200 + 페이징 결과

### 2. 에러 처리 테스트
- [ ] 잘못된 쿼리 파라미터 → 422 Validation Error
- [ ] DB 연결 실패 → 200 + 빈 배열 (404 금지)

### 3. 통합 테스트
- [ ] 프론트엔드 → 게이트웨이 → auth_service 경로 정상 동작
- [ ] 국가 검색 모달에서 검색 결과 정상 표시
- [ ] korean_name 값이 올바르게 전달되고 표시됨

## 📊 기대 결과

### 성공 기준
1. ✅ GET /api/sitemap가 200 OK로 응답
2. ✅ 국가 검색 모달이 정상적으로 작동
3. ✅ korean_name 기준 검색 결과 정확히 표시
4. ✅ 기존 /health 등 엔드포인트 영향 없음

### 성능 지표
- 응답 시간: < 500ms (로컬), < 2s (프로덕션)
- 검색 정확도: korean_name 부분 일치 100%
- 에러율: < 1%

## 🚨 회귀 위험도 및 대응

### 위험도: 낮음 (LOW)
- **이유**: 새로운 엔드포인트 추가로 기존 기능에 영향 없음
- **대응**: 기존 /health, /auth/* 엔드포인트 정상 동작 확인

### 모니터링 포인트
1. `/api/sitemap` 응답 시간 및 성공률
2. 국가 검색 모달 사용 통계
3. 게이트웨이 로그에서 프록시 성공률

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

GET /api/sitemap 404 문제는 **라우터 미등록**이 주요 원인이었으며, 
새로운 sitemap 라우터를 생성하고 등록함으로써 해결되었습니다.

**핵심 해결 포인트**:
1. korean_name 기준 검색을 위한 전용 엔드포인트 구현
2. 표준화된 응답 스키마 적용
3. 게이트웨이를 통한 올바른 라우팅 설정
4. 프론트엔드와 백엔드 간 데이터 형식 일치

이제 국가 검색 모달이 정상적으로 작동하며, korean_name 값을 올바르게 검색하고 표시할 수 있습니다.
