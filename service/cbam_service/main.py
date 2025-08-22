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
from fastapi import FastAPI, HTTPException
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
    logger.info("🚀 CBAM Service 시작 중...")
    yield
    logger.info("🛑 CBAM Service 종료 중...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="CBAM Service",
    description="CBAM 계산 서비스",
    version="1.0.0",
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

# 헬스체크 엔드포인트
@app.get("/health", tags=["health"])
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "CBAM Service",
        "version": "1.0.0"
    }

# 루트 경로
@app.get("/", tags=["root"])
async def root():
    """루트 경로"""
    return {
        "service": "CBAM Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "product": "/api/product",
            "products": "/api/products"
        }
    }

# CBAM 제품 생성 엔드포인트
@app.post("/api/product", tags=["cbam"])
async def create_product(product_data: dict):
    """CBAM 제품을 생성합니다."""
    try:
        logger.info(f"제품 생성 요청: {product_data.get('name', 'unknown')}")
        logger.info(f"📥 받은 데이터: {product_data}")
        
        # CalculationRepository를 사용하여 데이터베이스에 저장
        from app.domain.calculation.calculation_repository import CalculationRepository
        
        logger.info("🔧 CalculationRepository 초기화 시작...")
        repository = CalculationRepository(use_database=True)
        logger.info("✅ CalculationRepository 초기화 완료")
        
        logger.info("💾 데이터베이스에 제품 저장 시작...")
        saved_product = await repository.create_product(product_data)
        logger.info(f"📤 저장 결과: {saved_product}")
        
        if saved_product:
            logger.info(f"✅ 제품 데이터베이스 저장 성공: {saved_product.get('name', 'unknown')}")
            return {
                "status": "success",
                "message": "제품이 성공적으로 생성되었습니다",
                "data": saved_product
            }
        else:
            logger.error("❌ 제품 데이터베이스 저장 실패 - saved_product이 None")
            raise HTTPException(
                status_code=500,
                detail="제품을 데이터베이스에 저장할 수 없습니다"
            )
        
    except Exception as e:
        logger.error(f"❌ 제품 생성 중 오류: {str(e)}")
        logger.error(f"❌ 오류 타입: {type(e)}")
        import traceback
        logger.error(f"❌ 상세 오류: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"제품 생성 중 오류가 발생했습니다: {str(e)}"
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
            "data": products,
            "count": len(products)
        }
        
    except Exception as e:
        logger.error(f"제품 목록 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="제품 목록 조회 중 오류가 발생했습니다"
        )
