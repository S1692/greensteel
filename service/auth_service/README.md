# Auth Service - Stream Architecture

스트림 구조를 지원하는 인증 서비스입니다. 기업과 사용자의 회원가입, 로그인, 로그아웃을 관리하며, 모든 데이터 변경사항을 스트림 이벤트로 추적합니다.

## 🚀 주요 기능

### 인증 기능
- **기업 회원가입**: UUID 기반 고유 식별자와 스트림 구조 지원
- **사용자 회원가입**: 기업 소속 사용자 등록 및 권한 관리
- **통합 로그인**: 기업과 사용자 모두 로그인 가능
- **JWT 토큰 기반 인증**: 보안성 높은 인증 시스템

### 스트림 구조 지원
- **이벤트 소싱**: 모든 데이터 변경사항을 이벤트로 기록
- **스트림 스냅샷**: 데이터의 특정 시점 상태 저장
- **감사 로그**: 모든 작업에 대한 상세한 추적 기록
- **버전 관리**: 스트림별 버전 추적 및 관리

## 🏗️ 아키텍처

### 데이터 모델
- **Company**: 기업 정보 및 스트림 메타데이터
- **User**: 사용자 정보 및 권한 관리
- **StreamEvent**: 스트림 이벤트 기록
- **StreamSnapshot**: 스트림 상태 스냅샷
- **StreamAudit**: 스트림 감사 로그

### 스트림 구조
```
Company/User 생성 → 스트림 ID 생성 → 이벤트 기록 → 스냅샷 생성 → 감사 로그
```

## 📋 API 엔드포인트

### 인증 API (`/auth`)
- `POST /auth/register/company` - 기업 회원가입
- `POST /auth/register/user` - 사용자 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 현재 사용자 정보
- `GET /auth/health` - 서비스 상태 확인

### 스트림 API (`/stream`)
- `POST /stream/events` - 스트림 이벤트 생성
- `POST /stream/snapshots` - 스트림 스냅샷 생성
- `GET /stream/events/{stream_id}` - 스트림 이벤트 조회
- `GET /stream/snapshots/{stream_id}/latest` - 최신 스냅샷 조회
- `GET /stream/history/{stream_id}` - 스트림 히스토리 조회
- `PUT /stream/metadata` - 스트림 메타데이터 업데이트
- `POST /stream/deactivate` - 스트림 비활성화
- `GET /stream/stats/{stream_id}` - 스트림 통계 조회
- `GET /stream/search` - 스트림 검색
- `GET /stream/status/{stream_id}` - 스트림 상태 조회

## 🛠️ 기술 스택

- **Backend**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL / SQLite
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **Validation**: Pydantic
- **Stream Processing**: Custom Event Sourcing

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 설정
```

### 3. 데이터베이스 초기화
```bash
python -m app.main
```

### 4. 서비스 실행
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload
```

## 📊 스트림 구조 활용 예시

### 기업 회원가입 시
1. 고유한 스트림 ID 생성
2. 회원가입 이벤트 생성
3. 초기 상태 스냅샷 생성
4. 감사 로그 기록

### 사용자 활동 추적
1. 로그인/로그아웃 이벤트 기록
2. 권한 변경 이벤트 기록
3. 데이터 수정 이벤트 기록
4. 실시간 스트림 상태 모니터링

## 🔒 보안 기능

- **UUID 기반 식별**: 예측 불가능한 고유 식별자
- **JWT 토큰**: 안전한 인증 토큰
- **비밀번호 해싱**: bcrypt 기반 암호화
- **권한 기반 접근 제어**: 세분화된 권한 관리
- **감사 로그**: 모든 작업 추적

## 📈 모니터링 및 로깅

- **스트림 이벤트 모니터링**: 실시간 이벤트 추적
- **성능 메트릭**: API 응답 시간 및 처리량
- **오류 로깅**: 상세한 오류 정보 및 스택 트레이스
- **사용자 활동 분석**: 로그인 패턴 및 사용 패턴 분석

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해 주세요.

---

**스트림 구조를 통한 데이터 추적과 이벤트 소싱으로 안전하고 확장 가능한 인증 서비스를 제공합니다.**
