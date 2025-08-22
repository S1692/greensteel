# ============================================================================
# 🐳 CBAM 서비스 Docker 이미지 - Railway 배포용
# ============================================================================

FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV PYTHONIOENCODING=utf-8
ENV PYTHONUNBUFFERED=1
ENV PORT=8082
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

# 포트 노출
EXPOSE 8082

# 시작 명령어 (고정 포트 사용)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8082"]
