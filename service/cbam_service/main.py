# ============================================================================
# 🚀 CBAM Service Main Application - VERSION 2.0.0
# ============================================================================
# Last Updated: 2024-12-19
# Railway Deployment: FORCE_REBUILD
# ============================================================================

"""
CBAM 서비스 메인 애플리케이션

CBAM 계산 및 제품 관리를 위한 FastAPI 애플리케이션입니다.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import time
import os

# 환경 변수 설정
APP_NAME = os.getenv("APP_NAME", "CBAM Service")
APP_VERSION = os.getenv("APP_VERSION", "2.0.0")
APP_DESCRIPTION = os.getenv("APP_DESCRIPTION", "CBAM 계산 서비스 - Railway 배포용")
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info(f"🚀 {APP_NAME} 시작 중...")
    logger.info(f"버전: {APP_VERSION}")
    logger.info("✅ Railway 배포 환경에서 실행 중")
    yield
    # 종료 시
    logger.info(f"🛑 {APP_NAME} 종료 중...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    debug=DEBUG_MODE,
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 요청/응답 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """HTTP 요청/응답 로깅"""
    start_time = time.time()
    
    # 요청 로깅
    logger.info(f"📥 {request.method} {request.url.path}")
    
    # 응답 처리
    response = await call_next(request)
    
    # 응답 로깅
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
    
    return response

# 헬스체크 엔드포인트
@app.get("/health", tags=["health"])
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "timestamp": time.time(),
        "deployment": "railway",
        "build": "v2.0.0"
    }

# 루트 경로
@app.get("/", tags=["root"])
async def root():
    """루트 경로"""
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "description": APP_DESCRIPTION,
        "deployment": "railway",
        "endpoints": {
            "health": "/health",
            "docs": "/docs"
        }
    }

# CBAM 제품 생성 엔드포인트
@app.post("/api/product", tags=["cbam"])
async def create_product(product_data: dict):
    """CBAM 제품을 생성합니다."""
    try:
        logger.info(f"제품 생성 요청: {product_data.get('name', 'unknown')}")
        
        # 제품 생성 로직 (향후 구현)
        return {
            "status": "success",
            "message": "제품이 성공적으로 생성되었습니다",
            "data": product_data
        }
        
    except Exception as e:
        logger.error(f"제품 생성 중 오류: {str(e)}")
        raise JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "제품 생성 중 오류가 발생했습니다"
            }
        )

# CBAM 계산 엔드포인트
@app.post("/api/calculate", tags=["cbam"])
async def calculate_cbam(calculation_data: dict):
    """CBAM 계산을 수행합니다."""
    try:
        logger.info(f"CBAM 계산 요청: {calculation_data.get('type', 'unknown')}")
        
        # CBAM 계산 로직 (향후 구현)
        return {
            "status": "success",
            "message": "CBAM 계산이 완료되었습니다",
            "data": calculation_data,
            "result": {
                "carbon_emission": 0.0,
                "cbam_charge": 0.0
            }
        }
        
    except Exception as e:
        logger.error(f"CBAM 계산 중 오류: {str(e)}")
        raise JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "CBAM 계산 중 오류가 발생했습니다"
            }
        )

# 전역 예외 처리 핸들러
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
        "main:app",
        host="0.0.0.0",
        port=8082,
        reload=False
    )
