from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.common.settings import settings
from app.common.logger import LoggingMiddleware, auth_logger
from app.common.database import create_tables
from app.router.auth import router as auth_router
from app.www.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)

def log_routes(app: FastAPI) -> None:
    """등록된 라우트 테이블 로깅"""
    auth_logger.info("=== Registered Routes ===")
    for route in app.routes:
        try:
            methods = ",".join(sorted(route.methods)) if hasattr(route, 'methods') else "-"
            path = getattr(route, 'path', '-')
            name = getattr(route, 'name', '-')
            auth_logger.info(f"[ROUTE] path={path}, name={name}, methods={methods}")
        except Exception as e:
            auth_logger.warning(f"Route logging error: {str(e)}")
    auth_logger.info("=== End Routes ===")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    auth_logger.info(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    auth_logger.info(f"Architecture: DDD (Domain-Driven Design)")
    auth_logger.info(f"Environment: {settings.ENVIRONMENT}")
    auth_logger.info(f"Port: {settings.PORT}")
    
    # DB 테이블 생성
    try:
        await create_tables()
        auth_logger.info("Database tables created/verified successfully")
    except Exception as e:
        auth_logger.error(f"Database table creation failed: {str(e)}")
        raise e
    
    # 라우트 로깅
    log_routes(app)
    
    auth_logger.info("Service startup completed")
    
    yield
    
    # 종료 시
    auth_logger.info("Service shutting down...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=settings.SERVICE_NAME,
    description="DDD 구조를 유지하는 간소화된 인증 서비스 (카카오 주소 검색 API 제공)",
    version=settings.SERVICE_VERSION,
    lifespan=lifespan
)

# 미들웨어 설정
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 에러 핸들러 등록
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# 라우터 등록
app.include_router(auth_router)

@app.get("/")
async def root():
    """서비스 상태 확인"""
    return {
        "success": True,
        "message": f"{settings.SERVICE_NAME} is running",
        "data": {
            "version": settings.SERVICE_VERSION,
            "architecture": "DDD",
            "environment": settings.ENVIRONMENT
        }
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy", 
        "service": "auth_service",
        "version": settings.SERVICE_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)