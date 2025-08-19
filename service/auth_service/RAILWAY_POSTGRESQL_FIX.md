# Railway PostgreSQL 연결 문제 해결 가이드

## 🚨 문제 상황

Railway PostgreSQL에서 다음과 같은 오류가 발생합니다:

```
FATAL: unrecognized configuration parameter "db_type"
```

이는 Railway에서 제공하는 DATABASE_URL에 잘못된 파라미터가 포함되어 있기 때문입니다.

## 🔍 원인 분석

1. **잘못된 파라미터**: Railway가 `db_type=postgresql` 같은 인식할 수 없는 파라미터를 추가
2. **URL 형식 오류**: 쿼리 파라미터에 문제가 있는 DATABASE_URL
3. **PostgreSQL 설정 충돌**: PostgreSQL이 인식하지 못하는 설정 파라미터

## 🛠️ 해결 방법

### 1. 자동 해결 스크립트 실행

```bash
cd service/auth_service
python railway_fix.py
```

이 스크립트는:
- DATABASE_URL에서 `db_type` 파라미터 제거
- 잘못된 쿼리 파라미터 정리
- Railway 최적화된 환경 변수 파일 생성

### 2. 수동 환경 변수 수정

Railway 프로젝트 설정에서 다음 환경 변수를 확인/수정:

```bash
# 올바른 형식
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# 잘못된 형식 (제거해야 함)
DATABASE_URL=postgresql://username:password@host:port/database?db_type=postgresql&sslmode=require
```

### 3. 코드 수준에서 해결

`app/common/db.py`에서 자동으로 문제 파라미터를 제거합니다:

```python
def clean_database_url(url: str) -> str:
    """데이터베이스 URL에서 잘못된 파라미터 제거"""
    invalid_params = [
        'db_type', 'db_type=postgresql', 'db_type=postgres',
        'db_type=mysql', 'db_type=sqlite'
    ]
    
    for param in invalid_params:
        if param in url:
            url = url.replace(param, '')
    
    return url
```

## 📋 Railway 환경 변수 설정

### 필수 환경 변수

```bash
# 데이터베이스
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_SSL_MODE=require

# 애플리케이션
SERVICE_NAME=greensteel-auth-service
PORT=8081
HOST=0.0.0.0

# JWT
JWT_SECRET=your_secret_key_here
SECRET_KEY=your_secret_key_here

# 환경
ENVIRONMENT=production
DEBUG=false
```

### 선택적 환경 변수

```bash
# 데이터베이스 최적화
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=300

# CORS
ALLOWED_ORIGINS=https://greensteel.site
ALLOWED_ORIGIN_REGEX=^https://.*\.vercel\.app$
```

## 🔧 문제 해결 단계

### 1단계: 환경 변수 확인

```bash
# Railway CLI로 환경 변수 확인
railway variables list

# 또는 Railway 대시보드에서 확인
```

### 2단계: DATABASE_URL 정리

```bash
# 원본 URL
postgresql://user:pass@host:port/db?db_type=postgresql&sslmode=require

# 정리된 URL
postgresql://user:pass@host:port/db?sslmode=require
```

### 3단계: 애플리케이션 재시작

```bash
# Railway에서 서비스 재배포
railway up

# 또는 Railway 대시보드에서 재시작
```

## 📊 모니터링 및 디버깅

### 헬스체크 엔드포인트

```bash
GET /health
```

응답 예시:
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "database": "connected"
}
```

### 데이터베이스 디버그 엔드포인트

```bash
GET /debug/db
```

응답 예시:
```json
{
  "database_url": "***:***@host:port/db",
  "ssl_mode": "require",
  "pool_size": 10,
  "checked_in": 8,
  "checked_out": 2,
  "overflow": 0
}
```

## 🚀 예방 조치

1. **환경 변수 검증**: 배포 전 DATABASE_URL 형식 확인
2. **자동 정리**: 코드에서 문제 파라미터 자동 제거
3. **로깅 강화**: 데이터베이스 연결 상태 상세 로깅
4. **폴백 모드**: 연결 실패 시 SQLite 폴백 제공

## 📝 로그 확인

### 성공적인 연결

```
INFO: 데이터베이스 연결 시도: host:port/database
INFO: 데이터베이스 연결 성공
INFO: 데이터베이스 연결 확인 완료
```

### 문제 발생 시

```
WARNING: 잘못된 데이터베이스 파라미터 제거: db_type
ERROR: 데이터베이스 연결 테스트 실패: [오류 내용]
WARNING: SQLite 폴백 데이터베이스 사용
```

## 🔗 관련 링크

- [Railway PostgreSQL 문서](https://docs.railway.app/databases/postgresql)
- [PostgreSQL 연결 문자열](https://www.postgresql.org/docs/current/libpq-connect.html)
- [SQLAlchemy PostgreSQL 설정](https://docs.sqlalchemy.org/en/14/dialects/postgresql.html)

## 📞 지원

문제가 지속되면:

1. Railway 로그 확인
2. `/debug/db` 엔드포인트 호출
3. 환경 변수 재검토
4. 자동 해결 스크립트 재실행
