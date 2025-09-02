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
    
    # 테이블 생성
    await database.create_tables()
    
    logger.info("✅ DataGather Service가 성공적으로 시작되었습니다.")
    
    yield
    
    # 종료 시
    logger.info("🛑 DataGather Service를 종료합니다...")
    await database.close_db()
    logger.info("✅ DataGather Service가 종료되었습니다.")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="데이터 수집 서비스 - DDD 구조로 리팩토링된 버전",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 의존성 주입
async def get_session() -> AsyncSession:
    """데이터베이스 세션 의존성"""
    async for session in database.get_session():
        yield session

async def get_datagather_service(session: AsyncSession = Depends(get_session)) -> DataGatherApplicationService:
    """DataGather 애플리케이션 서비스 의존성"""
    return DataGatherApplicationService(session)

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    try:
        db_healthy = await database.health_check()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "service": settings.app_name,
            "version": settings.app_name,
            "database": "connected" if db_healthy else "disconnected"
        }
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "error": str(e)}
        )

# 데이터 수집 관련 엔드포인트
@app.post(f"{settings.api_prefix}/datagather/upload")
async def upload_file(
    install_id: int = Form(...),
    data_type: str = Form(...),
    file: UploadFile = File(...),
    process_id: Optional[int] = Form(None),
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """파일 업로드 처리"""
    try:
        # 파일 유효성 검증
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다.")
        
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in settings.allowed_file_types:
            raise HTTPException(
                status_code=400, 
                detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(settings.allowed_file_types)}"
            )
        
        # 파일 크기 검증
        file_content = await file.read()
        if len(file_content) > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 너무 큽니다. 최대 크기: {settings.max_file_size // (1024*1024)}MB"
            )
        
        # 파일 업로드 처리
        result = await service.upload_file(
            install_id=install_id,
            file_data=file_content,
            file_name=file.filename,
            data_type=data_type,
            process_id=process_id
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=201,
                content=result
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"파일 업로드 처리 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "파일 업로드 처리 중 오류가 발생했습니다."
            }
        )

@app.post(f"{settings.api_prefix}/datagather/api")
async def process_api_data(
    install_id: int,
    data_type: str,
    data: Dict[str, Any],
    process_id: Optional[int] = None,
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """API 데이터 처리"""
    try:
        result = await service.process_api_data(
            install_id=install_id,
            api_data=data,
            data_type=data_type,
            process_id=process_id
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=201,
                content=result
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"API 데이터 처리 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "API 데이터 처리 중 오류가 발생했습니다."
            }
        )

@app.post(f"{settings.api_prefix}/datagather/manual")
async def process_manual_data(
    install_id: int,
    data_type: str,
    data: Dict[str, Any],
    process_id: Optional[int] = None,
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """수동 입력 데이터 처리"""
    try:
        result = await service.process_manual_data(
            install_id=install_id,
            manual_data=data,
            data_type=data_type,
            process_id=process_id
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=201,
                content=result
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"수동 데이터 처리 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "수동 데이터 처리 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/datagather/{{data_gather_id}}")
async def get_data_gather_info(
    data_gather_id: int,
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """데이터 수집 정보 조회"""
    try:
        result = await service.get_data_gather_info(data_gather_id)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=404,
                content=result
            )
            
    except Exception as e:
        logger.error(f"데이터 수집 정보 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "데이터 수집 정보 조회 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/datagather/install/{{install_id}}/summary")
async def get_install_data_summary(
    install_id: int,
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """사업장별 데이터 수집 요약 조회"""
    try:
        result = await service.get_install_data_summary(install_id)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=404,
                content=result
            )
            
    except Exception as e:
        logger.error(f"사업장별 데이터 수집 요약 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "사업장별 데이터 수집 요약 조회 중 오류가 발생했습니다."
            }
        )

@app.put(f"{settings.api_prefix}/datagather/{{data_gather_id}}/status")
async def update_processing_status(
    data_gather_id: int,
    status: str,
    error_message: Optional[str] = None,
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """처리 상태 업데이트"""
    try:
        result = await service.update_processing_status(
            data_gather_id, status, error_message
        )
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"처리 상태 업데이트 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "처리 상태 업데이트 중 오류가 발생했습니다."
            }
        )

@app.put(f"{settings.api_prefix}/datagather/{{data_gather_id}}/complete")
async def complete_data_processing(
    data_gather_id: int,
    processed_data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """데이터 처리 완료"""
    try:
        result = await service.complete_data_processing(
            data_gather_id, processed_data
        )
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"데이터 처리 완료 처리 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "데이터 처리 완료 처리 중 오류가 발생했습니다."
            }
        )

# 메인 실행
if __name__ == "__main__":
    uvicorn.run(
        "main_new:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
