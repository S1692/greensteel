from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from core.settings import settings
from core.logger import LoggingMiddleware, auth_logger
from models import create_tables
from api.routes import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    auth_logger.info(f"Starting {settings.SERVICE_NAME}")
    
    try:
        # 데이터베이스 테이블 생성
        create_tables()
        auth_logger.info("Database initialization completed")
    except Exception as e:
        auth_logger.error(f"Database initialization failed: {str(e)}")
        raise
    
    yield
    
    # 종료 시
    auth_logger.info(f"Shutting down {settings.SERVICE_NAME}")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="Auth Service (minimal)",
    description="심플한 인증 서비스 - 회원가입, 로그인, 로그아웃",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# 로깅 미들웨어 추가
app.add_middleware(LoggingMiddleware)

# 인증 라우터 포함
app.include_router(auth_router)

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "name": settings.SERVICE_NAME,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/favicon.ico")
async def favicon():
    """파비콘 엔드포인트 (204 No Content)"""
    from fastapi.responses import Response
    return Response(status_code=204)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 예외 처리"""
    auth_logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "서버 내부 오류가 발생했습니다."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8081,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )
