# ============================================================================
# 🐳 DataGather 서비스 Docker 이미지 - Railway 배포용
# ============================================================================

FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    locales \
    && rm -rf /var/lib/apt/lists/*

# PostgreSQL collation 문제 해결을 위한 로케일 설정
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV PYTHONIOENCODING=utf-8
ENV PYTHONUNBUFFERED=1
ENV PORT=8083

# 포트 노출 (Railway에서 동적으로 할당)
EXPOSE $PORT

# 시작 명령어 (Railway에서 PORT 환경변수 사용)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
