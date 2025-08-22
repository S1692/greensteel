"""
🚀 CBAM SERVICE - RAILWAY DEPLOYMENT VERSION 3.0.0 🚀
============================================================================
BUILD DATE: 2024-12-19
DEPLOYMENT: RAILWAY
FORCE REBUILD: TRUE
============================================================================

CBAM (Carbon Border Adjustment Mechanism) 계산 서비스
Railway 환경에서 실행되는 FastAPI 애플리케이션
"""

import os
import time
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 환경 변수 설정
APP_NAME = os.getenv("APP_NAME", "CBAM Service v3.0.0")
APP_VERSION = os.getenv("APP_VERSION", "3.0.0")
APP_DESCRIPTION = os.getenv("APP_DESCRIPTION", "CBAM 계산 서비스 - Railway 배포 v3.0.0")
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    logger.info("🚀 CBAM Service v3.0.0 시작 중...")
    logger.info("✅ Railway 배포 환경에서 실행 중")
    logger.info(f"📅 빌드 날짜: 2024-12-19")
    logger.info(f"🔧 버전: {APP_VERSION}")
    yield
    logger.info("🛑 CBAM Service v3.0.0 종료 중...")

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
    logger.info(f"📥 {request.method} {request.url.path}")
    
    response = await call_next(request)
    
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
        "build_date": "2024-12-19",
        "build_version": "v3.0.0"
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
        "build_date": "2024-12-19",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "product": "/api/product",
            "calculate": "/api/calculate"
        }
    }

# CBAM 제품 생성 엔드포인트
@app.post("/api/product", tags=["cbam"])
async def create_product(product_data: dict):
    """CBAM 제품을 생성합니다."""
    try:
        logger.info(f"제품 생성 요청: {product_data.get('name', 'unknown')}")
        
        # CalculationRepository를 사용하여 데이터베이스에 저장
        from app.domain.calculation.calculation_repository import CalculationRepository
        
        repository = CalculationRepository(use_database=True)
        saved_product = await repository.create_product(product_data)
        
        if saved_product:
            logger.info(f"✅ 제품 데이터베이스 저장 성공: {saved_product.get('name', 'unknown')}")
            return {
                "status": "success",
                "message": "제품이 성공적으로 생성되었습니다",
                "version": APP_VERSION,
                "data": saved_product
            }
        else:
            logger.error("❌ 제품 데이터베이스 저장 실패")
            raise HTTPException(
                status_code=500,
                detail="제품을 데이터베이스에 저장할 수 없습니다"
            )
        
    except Exception as e:
        logger.error(f"제품 생성 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="제품 생성 중 오류가 발생했습니다"
        )

# CBAM 제품 목록 조회 엔드포인트
@app.get("/api/products", tags=["cbam"])
async def get_products():
    """CBAM 제품 목록을 조회합니다."""
    try:
        logger.info("제품 목록 조회 요청")
        
        # CalculationRepository를 사용하여 데이터베이스에서 제품 목록 조회
        from app.domain.calculation.calculation_repository import CalculationRepository
        
        repository = CalculationRepository(use_database=True)
        products = await repository.get_products()
        
        logger.info(f"✅ 제품 목록 조회 성공: {len(products)}개")
        return {
            "status": "success",
            "message": f"{len(products)}개의 제품을 조회했습니다",
            "version": APP_VERSION,
            "data": products,
            "count": len(products)
        }
        
    except Exception as e:
        logger.error(f"제품 목록 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="제품 목록 조회 중 오류가 발생했습니다"
        )

# CBAM 계산 엔드포인트
@app.post("/api/calculate", tags=["cbam"])
async def calculate_cbam(calculation_data: dict):
    """CBAM 계산을 수행합니다."""
    try:
        logger.info(f"CBAM 계산 요청: {calculation_data.get('type', 'unknown')}")
        
        return {
            "status": "success",
            "message": "CBAM 계산이 완료되었습니다",
            "version": APP_VERSION,
            "data": calculation_data,
            "result": {
                "carbon_emission": 0.0,
                "cbam_charge": 0.0
            }
        }
        
    except Exception as e:
        logger.error(f"CBAM 계산 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="CBAM 계산 중 오류가 발생했습니다"
        )

# 버전 정보 엔드포인트
@app.get("/version", tags=["info"])
async def get_version():
    """서비스 버전 정보"""
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "build_date": "2024-12-19",
        "deployment": "railway",
        "status": "active"
    }

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
            "version": APP_VERSION,
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
