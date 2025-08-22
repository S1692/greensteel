# GreenSteel API Gateway

마이크로서비스 아키텍처를 위한 API 게이트웨이입니다. 모든 서비스 요청을 프록시하고 라우팅하며, 스트림 구조를 지원합니다.

## 🚀 주요 기능

### 프록시 및 라우팅

- **서비스 프록시**: 모든 마이크로서비스 요청을 적절한 서비스로 라우팅
- **동적 라우팅**: 환경변수 기반 서비스 URL 매핑
- **로드 밸런싱**: 서비스 헬스체크 기반 상태 확인

### 스트림 구조 지원

- **스트림 API 라우팅**: `/stream/*` 경로를 Auth Service로 라우팅
- **이벤트 소싱**: 스트림 이벤트, 스냅샷, 감사 로그 API 지원
- **스트림 검증**: 스트림 관련 요청 데이터 검증

### 보안 및 검증

- **요청 검증**: 회원가입, 로그인, 스트림 API 요청 데이터 검증
- **CORS 지원**: 크로스 오리진 요청 처리
- **신뢰할 수 있는 호스트**: 보안 강화를 위한 호스트 검증

## 🏗️ 아키텍처

### 서비스 매핑

```
/auth/* → Authentication Service
/stream/* → Authentication Service (Stream API)
/cbam/* → CBAM Service
/datagather/* → Data Gathering Service
/lci/* → Life Cycle Inventory Service
```

### 스트림 구조 지원

- **Stream Events**: 이벤트 생성 및 조회
- **Stream Snapshots**: 상태 스냅샷 관리
- **Stream Audits**: 감사 로그 추적
- **Stream Metadata**: 메타데이터 업데이트

## 📋 API 엔드포인트

### 게이트웨이 관리

- `GET /health` - 게이트웨이 헬스체크
- `GET /status` - 서비스 상태 정보
- `GET /routing` - 라우팅 규칙 및 설정 정보

### 프록시 라우팅

- `/{path:path}` - 모든 경로에 대한 프록시 라우팅
- 지원 메서드: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

## 🛠️ 설치 및 실행

### 1. 환경변수 설정

```bash
cp env.example .env
# .env 파일을 편집하여 서비스 URL 설정
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서비스 실행

```bash
python -m app.main
```

### 4. Docker로 실행

```bash
docker build -t greensteel-gateway .
docker run -p 8080:8080 --env-file .env greensteel-gateway
```

## ⚙️ 환경변수

### 필수 환경변수

- `AUTH_SERVICE_URL`: 인증 서비스 URL
- `CBAM_SERVICE_URL`: CBAM 서비스 URL
- `DATAGATHER_SERVICE_URL`: 데이터 수집 서비스 URL
- `LCI_SERVICE_URL`: LCI 서비스 URL

### 선택 환경변수

- `GATEWAY_NAME`: 게이트웨이 이름 (기본값: greensteel-gateway)
- `ALLOWED_ORIGINS`: 허용된 CORS 오리진
- `ALLOWED_ORIGIN_REGEX`: 허용된 CORS 오리진 정규식
- `LOG_LEVEL`: 로그 레벨 (기본값: INFO)

## 🔒 보안 기능

### 요청 검증

- **기업 회원가입**: 필수 필드, ID 길이, 사업자번호 형식, 연락처 형식, 비밀번호 길이 검증
- **사용자 회원가입**: 필수 필드, ID 길이, 비밀번호 길이, 기업 ID 형식 검증
- **로그인**: 사용자명, 비밀번호 필수 필드 및 길이 검증
- **스트림 API**: 스트림 타입별 필수 필드 검증

### CORS 설정

- 허용된 오리진 기반 CORS 정책
- 정규식 기반 동적 오리진 허용
- 자격 증명 포함 요청 지원

## 📊 모니터링

### 헬스체크

- 게이트웨이 상태 확인
- 서비스별 연결 상태 확인
- 응답 시간 측정

### 로깅

- 요청/응답 로깅
- 에러 로깅
- 성능 메트릭 로깅

## 🔄 스트림 구조 통합

### 이벤트 소싱

- 모든 데이터 변경사항을 이벤트로 기록
- 스트림별 버전 관리
- 감사 로그 추적

### 스트림 API 지원

- 이벤트 생성 및 조회
- 스냅샷 생성 및 관리
- 메타데이터 업데이트
- 스트림 비활성화

## 🚨 에러 처리

### HTTP 상태 코드

- `400`: 잘못된 요청 (검증 실패)
- `404`: 경로를 찾을 수 없음
- `500`: 내부 서버 오류
- `502`: 서비스 연결 실패
- `503`: 서비스 사용 불가
- `504`: 게이트웨이 타임아웃

### 예외 처리

- 서비스 연결 실패
- 타임아웃 에러
- JSON 파싱 에러
- 검증 실패

## 📈 성능 최적화

### 타임아웃 설정

- 연결 타임아웃: 15초
- 읽기 타임아웃: 300초
- 쓰기 타임아웃: 60초
- 연결 풀 타임아웃: 30초

### 연결 풀링

- HTTP 클라이언트 연결 재사용
- 비동기 요청 처리
- 효율적인 리소스 관리

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. Pull Request를 생성합니다

## �� 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**스트림 구조를 지원하는 고성능 API 게이트웨이로 마이크로서비스 아키텍처를 안전하게 관리합니다.**
