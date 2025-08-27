@echo off
echo 🚀 GreenSteel 백엔드 서비스 시작 중...
echo.

echo 📋 Docker 상태 확인...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker가 설치되어 있지 않습니다.
    echo    Docker Desktop을 설치해주세요: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker 확인 완료
echo.

echo 🐳 백엔드 서비스 시작...
docker-compose up -d

echo.
echo 📊 서비스 상태 확인...
docker-compose ps

echo.
echo 🌐 서비스 접속 정보:
echo    Gateway: http://localhost:8080
echo    Auth Service: http://localhost:8081
echo    CBAM Service: http://localhost:8082
echo    LCA Service: http://localhost:8083
echo    Chatbot Service: http://localhost:8084
echo    Data Gather Service: http://localhost:8085
echo    PostgreSQL: localhost:5432
echo    Redis: localhost:6379
echo.
echo 📝 로그 확인: docker-compose logs -f
echo 🛑 서비스 중지: docker-compose down
echo.
pause
