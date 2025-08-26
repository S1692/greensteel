# Chatbot Service

GreenSteel ESG 플랫폼을 위한 AI 챗봇 서비스입니다. OpenAI GPT-4와 LangChain을 활용하여 사용자의 질문에 대해 지능적이고 맥락에 맞는 응답을 제공합니다.

**포트: 8004**

## 🚀 주요 기능

- **OpenAI GPT-4 통합**: 최신 AI 모델을 활용한 자연어 처리
- **LangChain 프레임워크**: 체인 기반의 대화 관리 및 메모리
- **컨텍스트 인식**: LCA, CBAM, 데이터 관리 등 상황별 맞춤 응답
- **HTML 응답 지원**: 클릭 가능한 버튼과 링크를 포함한 응답
- **세션 관리**: 사용자별 대화 히스토리 및 컨텍스트 유지
- **DDD 아키텍처**: 도메인 주도 설계 패턴 적용

## 🏗️ 아키텍처

```
chatbot_service/
├── app/
│   ├── common/          # 공통 유틸리티 (설정, 로깅)
│   ├── domain/          # 도메인 로직 (스키마, 서비스)
│   ├── router/          # API 라우터
│   └── www/             # 웹 유틸리티 (에러 핸들러)
├── main.py              # FastAPI 애플리케이션 진입점
├── requirements.txt     # Python 의존성
├── Dockerfile          # Docker 컨테이너 설정
└── README.md           # 이 파일
```

## 📋 요구사항

- Python 3.11+
- OpenAI API 키
- FastAPI
- LangChain

## 🛠️ 설치 및 실행

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd service/chatbot_service

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# 서비스 설정
SERVICE_NAME=chatbot_service
SERVICE_VERSION=1.0.0
ENVIRONMENT=development
PORT=8004
HOST=0.0.0.0

# CORS 설정
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### 3. 서비스 실행

```bash
# 개발 모드로 실행
uvicorn main:app --host 0.0.0.0 --port 8004 --reload

# 또는 Python으로 직접 실행
python main.py
```

### 4. Docker 실행

```bash
# 이미지 빌드
docker build -t chatbot-service .

# 컨테이너 실행
docker run -p 8004:8004 --env-file .env chatbot-service
```

## 🔌 API 엔드포인트

### 기본 엔드포인트

- `GET /` - 서비스 상태 확인
- `GET /health` - 헬스 체크

### 챗봇 API

- `POST /api/v1/chatbot/chat` - 챗봇과 대화
- `GET /api/v1/chatbot/chat/history` - 채팅 히스토리 조회
- `GET /api/v1/chatbot/chat/session/{session_id}` - 세션 정보 조회
- `DELETE /api/v1/chatbot/chat/session/{session_id}` - 세션 초기화
- `POST /api/v1/chatbot/knowledge/search` - 지식베이스 검색
- `GET /api/v1/chatbot/health` - 챗봇 서비스 상태 확인

## 💬 사용 예시

### 챗봇과 대화하기

```bash
curl -X POST "http://localhost:8004/api/v1/chatbot/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "LCA 분석이 무엇인가요?",
    "context": "lca",
    "session_id": "user_123"
  }'
```

### 응답 예시

```json
{
  "success": true,
  "message": "응답이 성공적으로 생성되었습니다.",
  "data": {
    "response": "LCA(Life Cycle Assessment)는 제품의 전체 생명주기 동안 발생하는 환경영향을 체계적으로 분석하고 평가하는 방법입니다... <a href=\"/lca\" class=\"inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700\">📊 LCA 분석 페이지로 이동</a>",
    "session_id": "user_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "model_used": "gpt-4",
    "tokens_used": 150,
    "context": "lca"
  }
}
```

## 🔧 설정 옵션

### OpenAI 설정

- `OPENAI_MODEL`: 사용할 AI 모델 (기본값: gpt-4)
- `OPENAI_TEMPERATURE`: 응답 창의성 (0.0-1.0, 기본값: 0.7)
- `OPENAI_MAX_TOKENS`: 최대 토큰 수 (기본값: 2000)

### LangChain 설정

- `LANGCHAIN_TRACING_V2`: LangSmith 추적 활성화
- `LANGCHAIN_ENDPOINT`: LangSmith 엔드포인트
- `LANGCHAIN_API_KEY`: LangSmith API 키

### 벡터 데이터베이스 설정 (선택사항)

- `CHROMA_PERSIST_DIRECTORY`: ChromaDB 저장 디렉토리
- `CHROMA_COLLECTION_NAME`: 지식베이스 컬렉션 이름

## 🧪 테스트

```bash
# 테스트 실행
pytest

# 특정 테스트 실행
pytest tests/test_chatbot_service.py -v
```

## 📊 모니터링

### 로그 레벨

- `INFO`: 일반적인 서비스 동작 정보
- `WARNING`: 경고 및 주의사항
- `ERROR`: 오류 및 예외 상황

### 헬스 체크

```bash
curl http://localhost:8004/health
```

## 🚨 문제 해결

### 일반적인 문제

1. **OpenAI API 키 오류**
   - `.env` 파일에 올바른 API 키가 설정되었는지 확인
   - API 키의 유효성 및 잔액 확인

2. **LangChain 초기화 실패**
   - 의존성 버전 호환성 확인
   - Python 버전이 3.11+인지 확인

3. **메모리 부족**
   - `OPENAI_MAX_TOKENS` 값 조정
   - 세션 히스토리 제한 설정

### 로그 확인

```bash
# 실시간 로그 확인
tail -f logs/chatbot_service.log

# 특정 오류 검색
grep "ERROR" logs/chatbot_service.log
```

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음으로 연락해주세요:

- 이슈 트래커: [GitHub Issues](https://github.com/your-repo/issues)
- 이메일: support@greensteel.com
- 문서: [API Documentation](http://localhost:8004/docs)
