# Auth Service

FastAPI 기반 인증 마이크로서비스

## 🚀 빠른 시작

### Docker로 실행
```bash
docker build -t auth-service .
docker run -p 8081:8081 --env-file .env auth-service
```

### 직접 실행
```bash
cd app
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

## 📚 API 문서

- **회원가입**: `POST /auth/register`
- **로그인**: `POST /auth/login`
- **로그아웃**: `POST /auth/logout`
- **프로필**: `GET /auth/me`
- **헬스체크**: `GET /health`

자세한 내용은 `app/README.md`를 참조하세요.
