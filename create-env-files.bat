@echo off
echo 🔧 GreenSteel 환경 변수 파일 생성 중...
echo.

echo 📁 Gateway 환경 변수 파일 생성...
if not exist "gateway\.env" (
    copy "gateway\env.example" "gateway\.env" >nul
    echo ✅ Gateway .env 파일 생성 완료
) else (
    echo ⚠️ Gateway .env 파일이 이미 존재합니다
)

echo.
echo 📁 Auth Service 환경 변수 파일 생성...
if not exist "service\auth_service\.env" (
    copy "service\auth_service\env.example" "service\auth_service\.env" >nul
    echo ✅ Auth Service .env 파일 생성 완료
) else (
    echo ⚠️ Auth Service .env 파일이 이미 존재합니다
)

echo.
echo 📁 CBAM Service 환경 변수 파일 생성...
if not exist "service\cbam_service\.env" (
    copy "service\cbam_service\env.example" "service\cbam_service\.env" >nul
    echo ✅ CBAM Service .env 파일 생성 완료
) else (
    echo ⚠️ CBAM Service .env 파일이 이미 존재합니다
)

echo.
echo 📁 LCA Service 환경 변수 파일 생성...
if not exist "service\lca_service\.env" (
    copy "service\lca_service\env.example" "service\lca_service\.env" >nul
    echo ✅ LCA Service .env 파일 생성 완료
) else (
    echo ⚠️ LCA Service .env 파일이 이미 존재합니다
)

echo.
echo 📁 Chatbot Service 환경 변수 파일 생성...
if not exist "service\chatbot_service\.env" (
    copy "service\chatbot_service\env.example" "service\chatbot_service\.env" >nul
    echo ✅ Chatbot Service .env 파일 생성 완료
) else (
    echo ⚠️ Chatbot Service .env 파일이 이미 존재합니다
)

echo.
echo 📁 Data Gather Service 환경 변수 파일 생성...
if not exist "service\datagather_service\.env" (
    copy "service\datagather_service\env.example" "service\datagather_service\.env" >nul
    echo ✅ Data Gather Service .env 파일 생성 완료
) else (
    echo ⚠️ Data Gather Service .env 파일이 이미 존재합니다
)

echo.
echo 📁 Frontend 환경 변수 파일 생성...
if not exist "frontend\.env.local" (
    copy "frontend\env.example" "frontend\.env.local" >nul
    echo ✅ Frontend .env.local 파일 생성 완료
) else (
    echo ⚠️ Frontend .env.local 파일이 이미 존재합니다
)

echo.
echo 🎉 모든 환경 변수 파일 생성이 완료되었습니다!
echo.
echo 📝 다음 단계:
echo    1. 각 .env 파일을 열어서 필요한 값들을 설정하세요
echo    2. OpenAI API 키 등 민감한 정보는 실제 값으로 변경하세요
echo    3. docker-compose up -d로 백엔드 서비스를 시작하세요
echo    4. cd frontend && pnpm dev로 프론트엔드를 시작하세요
echo.
pause
