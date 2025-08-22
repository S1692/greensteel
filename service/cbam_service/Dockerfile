# ============================================================================
# 🐳 CBAM 서비스 Docker 이미지 - Railway 배포용
# ============================================================================

FROM python:3.11-slim

# 작업 디렉터리 설정
WORKDIR /app

# 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . /app/

# 포트 노출
EXPOSE 8082

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8082/health || exit 1

# 애플리케이션 실행 (main.py의 app 인스턴스)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8082", "--proxy-headers"]
