# 환경변수 설정 가이드

## 필수 환경변수

프로젝트를 실행하기 전에 다음 환경변수를 설정해야 합니다.

### 1. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Gateway API 설정
NEXT_PUBLIC_API_BASE=http://localhost:8000

# 챗봇 설정
NEXT_PUBLIC_CHATBOT_ENABLED=true
NEXT_PUBLIC_CHATBOT_TIMEOUT=30000

# 환경 설정
NODE_ENV=development
```

### 2. 환경변수 설명

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `NEXT_PUBLIC_API_BASE` | Gateway API의 기본 URL | - | `http://localhost:8000` |
| `NEXT_PUBLIC_CHATBOT_ENABLED` | 챗봇 기능 활성화 여부 | `true` | `true` / `false` |
| `NEXT_PUBLIC_CHATBOT_TIMEOUT` | 챗봇 API 응답 타임아웃 (ms) | `30000` | `30000` |

### 3. Gateway 서버 설정

Gateway 서버가 다음 엔드포인트를 제공해야 합니다:

- `GET /api/health` - 서버 상태 확인
- `POST /api/ai-process` - 챗봇 AI 처리

### 4. 환경변수 적용

환경변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
pnpm dev
```

## 개발 환경 vs 프로덕션 환경

### 개발 환경 (.env.local)
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_CHATBOT_ENABLED=true
NODE_ENV=development
```

### 프로덕션 환경 (.env.production)
```bash
NEXT_PUBLIC_API_BASE=https://api.greensteel.com
NEXT_PUBLIC_CHATBOT_ENABLED=true
NODE_ENV=production
```

## 문제 해결

### Gateway 연결 실패 시
1. Gateway 서버가 실행 중인지 확인
2. `NEXT_PUBLIC_API_BASE` URL이 올바른지 확인
3. 방화벽 설정 확인
4. 네트워크 연결 상태 확인

### 챗봇 기능이 작동하지 않을 때
1. `NEXT_PUBLIC_CHATBOT_ENABLED=true` 설정 확인
2. Gateway 상태가 "연결됨"인지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인
