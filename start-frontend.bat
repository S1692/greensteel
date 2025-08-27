@echo off
echo 🖥️ GreenSteel 프론트엔드 시작 중...
echo.

echo 📋 Node.js 상태 확인...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo    Node.js를 설치해주세요: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 확인 완료
echo.

echo 📋 pnpm 상태 확인...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm이 설치되어 있지 않습니다.
    echo    pnpm을 설치해주세요: npm install -g pnpm
    pause
    exit /b 1
)

echo ✅ pnpm 확인 완료
echo.

echo 📁 프론트엔드 디렉토리로 이동...
cd frontend

echo 📦 의존성 설치 중...
pnpm install

echo.
echo 🚀 개발 서버 시작...
echo 🌐 접속 URL: http://localhost:3000
echo.
echo 📝 중지하려면 Ctrl+C를 누르세요
echo.

pnpm dev
