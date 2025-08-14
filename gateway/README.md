# GreenSteel API Gateway

마이크로서비스 아키텍처를 위한 FastAPI 기반 API Gateway입니다.

## 🚀 주요 기능

- **프록시 라우팅**: 모든 HTTP 메서드 지원
- **CORS 관리**: greensteel.site 및 Vercel/Railway 프리뷰 도메인 지원
- **로깅**: 요청/응답 로깅 (민감정보 자동 마스킹)
- **헬스체크**: `/health` 엔드포인트
- **서비스 상태**: `/status` 엔드포인트
- **라우팅 정보**: `/routing` 엔드포인트
- **요청 검증**: 회원가입, 로그인 등 특정 엔드포인트 데이터 검증

## 🏗️ 아키텍처

### MVC 패턴
- **Controller**: `domain/proxy.py` - 프록시 로직 처리
- **View**: 프록시 응답 (별도 템플릿 없음)
- **Model**: 없음 (게이트웨이는 DB 미접근)

### 디자인 패턴
- **Proxy Pattern**: Gateway가 대리인으로 라우팅
- **Middleware Pattern**: 로깅 및 CORS 미들웨어
- **OCP**: SERVICE_MAP에 항목만 추가하면 라우트 확장

## 📁 폴더 구조

```
gateway/
├── app/
│   ├── common/
│   │   └── utility/
│   │       └── logger.py          # 로깅 유틸리티
│   ├── domain/
│   │   └── proxy.py               # 프록시 컨트롤러
│   └── main.py                    # FastAPI 애플리케이션
├── requirements.txt                # Python 의존성
├── Dockerfile                     # Docker 설정
├── .dockerignore                  # Docker 제외 파일
├── env.example                    # 환경변수 예시
├── frontend-axios-example.js      # 프론트엔드 Axios 설정 예시
└── README.md                      # 이 파일
```

## ⚙️ 환경변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `GATEWAY_NAME` | `"gateway"` | 게이트웨이 이름 |
| `AUTH_SERVICE_URL` | `""` | 인증 서비스 URL |
| `CBAM_SERVICE_URL` | `""` | CBAM 서비스 URL |
| `DATAGATHER_SERVICE_URL` | `""` | 데이터 수집 서비스 URL |
| `LCI_SERVICE_URL` | `""` | LCI 서비스 URL |
| `ALLOWED_ORIGINS` | `"https://greensteel.site,https://www.greensteel.site"` | 허용된 오리진 |
| `ALLOWED_ORIGIN_REGEX` | `"^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$"` | 허용된 오리진 정규식 |
| `LOG_LEVEL` | `"INFO"` | 로깅 레벨 |

## 🚫 제약사항

- **localhost 사용 금지**: 어떤 형태의 localhost, 127.0.0.1, http://*3000도 허용하지 않음
- **프론트엔드**: Vercel의 https://greensteel.site만 사용
- **포트**: Railway 컨테이너 포트 8080 사용

## 🛣️ 라우팅 규칙

| 경로 | 대상 서비스 |
|------|-------------|
| `/auth/*` | `AUTH_SERVICE_URL` |
| `/cbam/*` | `CBAM_SERVICE_URL` |
| `/datagather/*` | `DATAGATHER_SERVICE_URL` |
| `/lci/*` | `LCI_SERVICE_URL` |

## 🔐 인증 플로우

### 1. 회원가입
```
사용자 입력 → 폼 검증 → Gateway로 POST /auth/register 요청 → AUTH_SERVICE로 프록시
```

### 2. 로그인
```
사용자 입력 → 폼 검증 → Gateway로 POST /auth/login 요청 → AUTH_SERVICE로 프록시 → 토큰 반환
```

### 3. 로그아웃
```
로그아웃 버튼 → Gateway로 POST /auth/logout 요청 → AUTH_SERVICE로 프록시 → 로컬 스토리지 정리
```

### 4. 토큰 갱신
```
토큰 만료 → Gateway로 POST /auth/refresh 요청 → AUTH_SERVICE로 프록시 → 새 토큰 반환
```

### 5. 데이터 검증 규칙
- **회원가입**: name, company, email, password (최소 8자)
- **로그인**: email, password
- **이메일**: @와 . 포함 여부 확인

### 6. 프론트엔드 설정
```bash
# .env.local
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.railway.app
```

## 📊 로깅

### 요청 로깅
- HTTP 메서드, 경로, 쿼리 파라미터
- 요청 바디 (민감정보 자동 마스킹)
- 클라이언트 IP, User-Agent

### 응답 로깅
- HTTP 메서드, 경로, 상태 코드
- 응답 시간 (밀리초)

### 민감정보 마스킹
다음 키들은 자동으로 `***MASKED***`로 마스킹됩니다:
- `password`, `token`, `authorization`
- `secret`, `key`, `api_key`
- `access_token`, `refresh_token`
- `client_secret`, `private_key`

## 🐳 Docker 실행

```bash
# 이미지 빌드
docker build -t greensteel-gateway .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://your-auth-service.railway.app \
  -e CBAM_SERVICE_URL=https://your-cbam-service.railway.app \
  greensteel-gateway
```

## 🚂 Railway 배포

1. **Railway 프로젝트 생성**
2. **GitHub 저장소 연결**
3. **환경변수 설정** (Railway Variables에서)
4. **자동 배포** (Git push 시)

### Railway 환경변수 설정 예시
```
GATEWAY_NAME=greensteel-gateway
AUTH_SERVICE_URL=https://your-auth-service.railway.app
CBAM_SERVICE_URL=https://your-cbam-service.railway.app
DATAGATHER_SERVICE_URL=https://your-datagather-service.railway.app
LCI_SERVICE_URL=https://your-lci-service.railway.app
ALLOWED_ORIGINS=https://greensteel.site,https://www.greensteel.site
ALLOWED_ORIGIN_REGEX=^https://.*\.vercel\.app$|^https://.*\.up\.railway\.app$
LOG_LEVEL=INFO
```

## 🔧 로컬 개발

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp env.example .env
# .env 파일 편집

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## 📡 API 엔드포인트

### 헬스체크
```http
GET /health
```
응답:
```json
{
  "status": "ok",
  "name": "gateway"
}
```

### 서비스 상태
```http
GET /status
```
응답:
```json
{
  "gateway_name": "gateway",
  "services": {
    "/auth": {
      "configured": true,
      "url": "https://auth-service.railway.app"
    },
    "/cbam": {
      "configured": false,
      "url": "Not configured"
    }
  }
}
```

### 라우팅 정보
```http
GET /routing
```
응답:
```json
{
  "gateway_name": "gateway",
  "routing_rules": {
    "/auth/*": "AUTH_SERVICE_URL",
    "/cbam/*": "CBAM_SERVICE_URL",
    "/datagather/*": "DATAGATHER_SERVICE_URL",
    "/lci/*": "LCI_SERVICE_URL"
  },
  "supported_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  "timeout_settings": {
    "connect": "15s",
    "read": "300s",
    "write": "60s"
  },
  "validation_rules": {
    "auth_register": ["name", "company", "email", "password (min 8 chars)"],
    "auth_login": ["email", "password"]
  }
}
```

## 🔒 보안

- **CORS**: 명시적으로 허용된 도메인만 접근 가능
- **신뢰할 수 있는 호스트**: TrustedHostMiddleware 적용
- **민감정보 마스킹**: 로그에 민감정보 노출 방지
- **타임아웃**: 연결/읽기/쓰기 타임아웃 설정
- **요청 검증**: 회원가입, 로그인 등 특정 엔드포인트 데이터 검증

## 📝 로그 예시

### 요청 로그
```
2024-01-01 12:00:00 - gateway - INFO - REQUEST: {"method":"POST","path":"/auth/register","query_params":{},"body":{"name":"홍길동","company":"GreenSteel","email":"hong@greensteel.com","password":"***MASKED***"},"client_ip":"192.168.1.1","user_agent":"Mozilla/5.0..."}
```

### 응답 로그
```
2024-01-01 12:00:01 - gateway - INFO - RESPONSE: {"method":"POST","path":"/auth/register","status_code":201,"response_time_ms":150.25}
```

## 🚀 확장 방법

새로운 서비스를 추가하려면:

1. **환경변수 추가**:
   ```bash
   NEW_SERVICE_URL=https://new-service.railway.app
   ```

2. **SERVICE_MAP에 추가** (`domain/proxy.py`):
   ```python
   self.service_map = {
       # ... 기존 서비스들
       "/newservice": os.getenv("NEW_SERVICE_URL", "")
   }
   ```

3. **Railway Variables에 환경변수 추가**

## 🔗 프론트엔드 연동

### 1. 환경변수 설정
```bash
# frontend/.env.local
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.railway.app
```

### 2. Axios 설정
```typescript
// frontend/src/lib/axiosClient.ts
const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_GATEWAY_URL,
  timeout: 30000,
});
```

### 3. API 호출
```typescript
// 회원가입 예시
const response = await axiosClient.post('/auth/register', {
  name: '홍길동',
  company: 'GreenSteel',
  email: 'hong@greensteel.com',
  password: 'password123'
});

// 로그인 예시
const response = await axiosClient.post('/auth/login', {
  email: 'hong@greensteel.com',
  password: 'password123'
});

// 로그아웃 예시
await authUtils.logout();
```

### 4. 인증 상태 관리
```typescript
// 로그인 상태 확인
if (authUtils.isAuthenticated()) {
  // 로그인된 사용자
}

// 사용자 이메일 가져오기
const email = authUtils.getUserEmail();

// 토큰 갱신
await authUtils.refreshToken();
```

## 📞 지원

문제가 발생하면 로그를 확인하고, 필요시 `/status` 엔드포인트로 서비스 상태를 점검하세요.
