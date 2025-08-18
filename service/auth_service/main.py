from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.common.settings import settings
from app.common.logger import LoggingMiddleware, auth_logger
from app.common.db import create_tables
from app.router import auth_router, stream_router
from app.www.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)

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

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="Auth Service (Layered Architecture)",
        description="레이어드 아키텍처를 적용한 인증 서비스 - 회원가입, 로그인, 로그아웃, 스트림 이벤트 관리",
        version="3.0.0",
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
    
    # 예외 핸들러 등록
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # 라우터 등록
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(stream_router, prefix="/stream", tags=["stream"])
    
    # 헬스 체크 엔드포인트
    @app.get("/health")
    async def health_check():
        """헬스 체크 엔드포인트"""
        return {
            "status": "ok",
            "name": settings.SERVICE_NAME,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
    # 파비콘 엔드포인트
    @app.get("/favicon.ico")
    async def favicon():
        """파비콘 엔드포인트 (204 No Content)"""
        from fastapi.responses import Response
        return Response(status_code=204)
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8081,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )
