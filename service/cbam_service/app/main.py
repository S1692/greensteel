# ============================================================================
# 🚀 Cal_boundary Main Application
# ============================================================================

"""
Cal_boundary 서비스 메인 애플리케이션

ReactFlow 기반 HTTP API를 제공하는 FastAPI 애플리케이션입니다.
"""

import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# 로거 설정
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 환경 변수 설정
APP_NAME = os.getenv("APP_NAME", "CBAM Service")
APP_DESCRIPTION = os.getenv("APP_DESCRIPTION", "탄소국경조정메커니즘(CBAM) 서비스")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"
PORT = int(os.getenv("PORT", "8082"))

# 라우터 임포트 (실제 파일이 존재하는 경우에만)
try:
    from .routers import calculation_router, datasearch_router
    ROUTERS_AVAILABLE = True
except ImportError:
    logger.warning("라우터를 임포트할 수 없습니다. 기본 엔드포인트만 사용합니다.")
    ROUTERS_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    logger.info("🚀 CBAM 서비스 시작 중...")
    logger.info("🚀 애플리케이션 시작 (마이그레이션은 자동 처리됨)...")
    
    yield
    
    logger.info("🛑 CBAM 서비스 종료 중...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    debug=DEBUG_MODE,
    docs_url="/docs" if DEBUG_MODE else None,
    redoc_url="/redoc" if DEBUG_MODE else None,
    openapi_url="/openapi.json" if DEBUG_MODE else None,
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청/응답 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """HTTP 요청/응답 로깅"""
    start_time = time.time()
    
    # 요청 로깅
    logger.info(f"📥 {request.method} {request.url.path} - {request.client.host if request.client else 'unknown'}")
    
    # 응답 처리
    response = await call_next(request)
    
    # 응답 로깅
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
    
    return response

# 라우터 등록 (사용 가능한 경우에만)
if ROUTERS_AVAILABLE:
    app.include_router(calculation_router, prefix="/api")
    app.include_router(datasearch_router, prefix="/api")
    logger.info("✅ CBAM 라우터 등록 완료")
else:
    logger.warning("⚠️ CBAM 라우터를 사용할 수 없습니다")

# 헬스체크 엔드포인트
@app.get("/health", tags=["health"])
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "timestamp": time.time()
    }

# 루트 엔드포인트
@app.get("/", tags=["root"])
async def root():
    """루트 엔드포인트"""
    return {
        "message": f"{APP_NAME} - {APP_DESCRIPTION}",
        "version": APP_VERSION,
        "status": "running"
    }

# 예외 처리 핸들러
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 예외 처리"""
    logger.error(f"❌ 예상치 못한 오류 발생: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "서버 내부 오류가 발생했습니다",
            "detail": str(exc) if DEBUG_MODE else "오류 세부 정보는 숨겨집니다"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False
    )
