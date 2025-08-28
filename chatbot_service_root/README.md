# Chatbot Service

GreenSteel ESG 플랫폼을 위한 LangChain 기반 챗봇 서비스입니다.

## 🏗️ 구조

```
chatbot_service_root/
├── main.py              # FastAPI 애플리케이션 진입점
├── app/                 # DDD 아키텍처 애플리케이션 레이어
│   ├── common/         # 공통 설정 및 로깅
│   ├── domain/         # 도메인 로직 및 서비스
│   ├── router/         # API 라우터
│   └── www/            # 웹 인터페이스 (에러 핸들러 등)
├── requirements.txt     # Python 의존성
├── Dockerfile          # Docker 컨테이너 설정
└── env.example         # 환경변수 예시
```

## 🚀 실행 방법

### 로컬 실행
```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp env.example .env
# .env 파일에서 필요한 값들을 설정

# 서비스 실행
python main.py
```

### Docker 실행
```bash
# 이미지 빌드
docker build -t chatbot-service .

# 컨테이너 실행
docker run -p 8000:8000 chatbot-service
```

## 📡 API 엔드포인트

- `GET /` - 서비스 상태 확인
- `GET /health` - 헬스 체크
- `POST /api/v1/chatbot/chat` - 챗봇 대화
- `GET /api/v1/chatbot/chat/history` - 채팅 히스토리
- `GET /api/v1/chatbot/chat/session/{session_id}` - 세션 정보
- `DELETE /api/v1/chatbot/chat/session/{session_id}` - 세션 초기화

## 🔧 환경변수

필요한 환경변수들을 `.env` 파일에 설정하세요:

```env
# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# 서비스 설정
SERVICE_NAME=Chatbot Service
SERVICE_VERSION=1.0.0
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000

# CORS 설정
CORS_ORIGINS=["*"]
```

## 🏛️ 아키텍처

이 서비스는 **Domain-Driven Design (DDD)** 아키텍처를 따릅니다:

- **Domain Layer**: 비즈니스 로직 및 도메인 모델
- **Application Layer**: 유스케이스 및 서비스 조정
- **Infrastructure Layer**: 외부 시스템 연동
- **Presentation Layer**: API 인터페이스

## 📚 기능

- OpenAI GPT-4 통합
- LangChain 프레임워크
- GreenSteel ESG 지식 베이스
- 컨텍스트 기반 채팅 응답
- 세션 관리
- 채팅 히스토리 저장
