# ============================================================================
# 🚀 DataGather Service - Main Application
# ============================================================================

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
import uvicorn

from .infrastructure.database import database
from .infrastructure.config import settings
from .application.datagather_application_service import DataGatherApplicationService

# 로깅 설정
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format=settings.log_format
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info("🚀 DataGather Service를 시작합니다...")
    
    # 설정 유효성 검증
    if not settings.validate():
        raise RuntimeError("설정 유효성 검증에 실패했습니다.")
    
    # 데이터베이스 초기화
    await database.init_db()
    
    logger.info("✅ DataGather Service가 성공적으로 시작되었습니다.")
    
    yield
    
    # 종료 시
    logger.info("🛑 DataGather Service를 종료합니다...")

# FastAPI 앱 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Data Collection & Processing Service - DDD Structure",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 의존성 주입 함수
async def get_session() -> AsyncSession:
    """데이터베이스 세션 의존성"""
    async for session in database.get_session():
        yield session

async def get_datagather_service(session: AsyncSession = Depends(get_session)) -> DataGatherApplicationService:
    """DataGather 애플리케이션 서비스 의존성"""
    return DataGatherApplicationService(session)

# 루트 엔드포인트
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "service": "DataGather Service",
        "version": "1.0.0",
        "description": "Data Collection & Processing Service - DDD Structure",
        "endpoints": {
            "health": "/health",
            "ai_process": "/ai-process",
            "ai_process_api": f"{settings.api_prefix}/datagather/ai-process",
            "documentation": "/docs"
        }
    }

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    try:
        db_healthy = await database.health_check()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "service": settings.app_name,
            "version": settings.app_version,
            "database": "connected" if db_healthy else "disconnected"
        }
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "error": str(e)}
        )

# AI 처리 관련 엔드포인트
@app.post("/ai-process")
async def ai_process_data(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """AI 데이터 처리 - DDD 구조 사용"""
    try:
        logger.info(f"🤖 AI 데이터 처리 요청: {data.get('data_type', 'unknown')}")
        
        # DDD 구조를 사용한 API 데이터 처리
        result = await service.process_api_data(
            install_id=data.get('install_id', 1),
            api_data=data,
            data_type=data.get('data_type', 'ai_processed'),
            process_id=data.get('process_id')
        )
        
        if result["success"]:
            logger.info("✅ AI 데이터 처리 성공")
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "AI 데이터 처리가 완료되었습니다.",
                    "data_gather_id": result.get("data_gather_id"),
                    "saved_count": result.get("saved_count"),
                    "processed_data": data
                }
            )
        else:
            logger.error(f"❌ AI 데이터 처리 실패: {result}")
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"❌ AI 데이터 처리 중 오류: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "AI 데이터 처리 중 오류가 발생했습니다."
            }
        )

@app.post(f"{settings.api_prefix}/datagather/ai-process")
async def ai_process_data_with_prefix(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """AI 데이터 처리 (API prefix 포함)"""
    return await ai_process_data(data, service)

# Gateway에서 사용하는 경로 (API prefix 없이)
@app.post("/api/datagather/ai-process")
async def ai_process_data_gateway(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """AI 데이터 처리 (Gateway 경로)"""
    return await ai_process_data(data, service)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )