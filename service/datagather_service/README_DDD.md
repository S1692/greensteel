# 🏗️ DataGather Service - DDD 구조 리팩토링

AI 학습 관련 파일을 제거하고 도메인 주도 설계(DDD) 구조로 리팩토링된 DataGather Service입니다.

## 🗂️ 디렉토리 구조

```
app/
├── domain/                    # 🏗️ 도메인 레이어
│   ├── datagather/           # 데이터 수집 도메인
│   │   ├── __init__.py
│   │   ├── datagather_entity.py      # 데이터 수집 엔티티
│   │   ├── datagather_repository.py  # 데이터 수집 리포지토리
│   │   └── datagather_service.py     # 데이터 수집 도메인 서비스
│   ├── process/              # 공정 도메인
│   │   ├── __init__.py
│   │   ├── process_entity.py         # 공정 엔티티
│   │   ├── process_repository.py     # 공정 리포지토리
│   │   └── process_service.py        # 공정 도메인 서비스
│   └── install/              # 사업장 도메인
│       ├── __init__.py
│       ├── install_entity.py         # 사업장 엔티티
│       ├── install_repository.py     # 사업장 리포지토리
│       └── install_service.py        # 사업장 도메인 서비스
├── application/               # 🚀 애플리케이션 레이어
│   ├── __init__.py
│   ├── datagather_application_service.py  # 데이터 수집 애플리케이션 서비스
│   ├── process_application_service.py     # 공정 애플리케이션 서비스
│   └── install_application_service.py     # 사업장 애플리케이션 서비스
├── infrastructure/            # 🏗️ 인프라스트럭처 레이어
│   ├── __init__.py
│   ├── database.py           # 데이터베이스 연결 관리
│   └── config.py             # 설정 관리
├── main_new.py               # 🚀 새로운 메인 애플리케이션 (DDD 구조)
└── main.py                   # 📝 기존 메인 파일 (참고용)
```

## 🎯 주요 변경사항

### ✅ 제거된 AI 학습 관련 파일들
- `app/studied/` - AI 학습 관련 모듈
- `app/direct_study/` - 직접 학습 모듈
- `app/ananke/` - AI 모델 관련 모듈
- `app/filtering/` - AI 필터링 모듈
- `app/data/` - AI 학습 데이터

### 🏗️ 새로 추가된 DDD 구조
- **도메인 레이어**: 비즈니스 로직과 엔티티 정의
- **애플리케이션 레이어**: 유스케이스 및 애플리케이션 서비스
- **인프라스트럭처 레이어**: 데이터베이스, 설정, 외부 서비스

## 🚀 주요 기능

### 📊 데이터 수집 (DataGather)
- 파일 업로드 처리 (Excel, CSV, JSON 등)
- API 데이터 처리
- 수동 데이터 입력
- 데이터 형식 검증
- 처리 상태 관리

### ⚙️ 공정 관리 (Process)
- 공정 정보 관리
- 공정 계층 구조
- 공정 매개변수 관리
- 공정 상태 관리

### 🏭 사업장 관리 (Install)
- 사업장 정보 관리
- 회사 정보 관리
- 연락처 정보 관리
- 사업장 특성 관리

## 🔧 기술 스택

- **FastAPI**: 웹 프레임워크
- **SQLAlchemy**: ORM
- **PostgreSQL**: 데이터베이스
- **Pydantic**: 데이터 검증
- **AsyncIO**: 비동기 처리

## 🚀 실행 방법

### 1. 환경 설정
```bash
# 환경 변수 설정
export DATABASE_URL="postgresql://username:password@localhost:5432/datagather"
export SECRET_KEY="your-secret-key-here"
export DEBUG="true"
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 서비스 실행
```bash
# 새로운 DDD 구조로 실행
python -m app.main_new

# 또는 기존 구조로 실행
python -m app.main
```

## 📡 API 엔드포인트

### 데이터 수집
- `POST /api/v1/datagather/upload` - 파일 업로드
- `POST /api/v1/datagather/api` - API 데이터 처리
- `POST /api/v1/datagather/manual` - 수동 데이터 입력
- `GET /api/v1/datagather/{id}` - 데이터 수집 정보 조회
- `GET /api/v1/datagather/install/{install_id}/summary` - 사업장별 요약
- `PUT /api/v1/datagather/{id}/status` - 처리 상태 업데이트
- `PUT /api/v1/datagather/{id}/complete` - 데이터 처리 완료

### 헬스체크
- `GET /health` - 서비스 상태 확인

## 🗄️ 데이터베이스 스키마

### data_gather 테이블
- 데이터 수집 정보
- 파일 메타데이터
- 처리 상태 관리
- 체크섬 검증

### process 테이블
- 공정 정보
- 공정 계층 구조
- 공정 매개변수

### install 테이블
- 사업장 정보
- 회사 정보
- 연락처 정보

## 🔄 마이그레이션 가이드

### 기존 코드에서 새 구조로 전환
1. **의존성 주입**: `get_datagather_service()` 사용
2. **서비스 호출**: 애플리케이션 서비스 레이어 사용
3. **에러 처리**: 표준화된 응답 형식 사용

### 예시 코드
```python
# 기존 방식
from app.domain.datagather.datagather_service import DataGatherService

# 새로운 방식
from app.application.datagather_application_service import DataGatherApplicationService

# 의존성 주입으로 서비스 사용
@app.post("/upload")
async def upload_file(
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    result = await service.upload_file(...)
    return result
```

## 🧪 테스트

### 단위 테스트
```bash
# 도메인 서비스 테스트
pytest tests/domain/

# 애플리케이션 서비스 테스트
pytest tests/application/
```

### 통합 테스트
```bash
# API 엔드포인트 테스트
pytest tests/integration/
```

## 📈 성능 최적화

- **비동기 처리**: AsyncIO 기반 비동기 처리
- **데이터베이스 풀링**: 연결 풀 관리
- **배치 처리**: 대량 데이터 처리 최적화
- **캐싱**: 자주 사용되는 데이터 캐싱

## 🔒 보안

- **입력 검증**: Pydantic 기반 데이터 검증
- **파일 업로드 제한**: 파일 크기 및 형식 제한
- **에러 메시지**: 민감한 정보 노출 방지
- **CORS 설정**: 적절한 CORS 정책 적용

## 🚨 주의사항

- **기존 데이터**: 마이그레이션 전 데이터 백업 필수
- **의존성**: 새로운 패키지 의존성 확인
- **환경 변수**: 필수 환경 변수 설정 확인
- **데이터베이스**: PostgreSQL 연결 설정 확인

## 🤝 기여 가이드

### 코드 스타일
- **PEP 8**: Python 코드 스타일 가이드 준수
- **타입 힌트**: 모든 함수에 타입 힌트 추가
- **문서화**: 모든 클래스와 메서드에 docstring 추가

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: DDD 구조 리팩토링
docs: 문서 업데이트
test: 테스트 코드 추가
```

## 📞 지원

문제가 발생하거나 질문이 있으시면:
1. 이슈 트래커에 문제 등록
2. 개발팀에 직접 문의
3. 문서 및 코드 주석 참조

---

**🎉 DDD 구조로 리팩토링이 완료되었습니다!**
