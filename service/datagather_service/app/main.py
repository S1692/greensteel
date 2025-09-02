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
from .application.process_application_service import ProcessApplicationService
from .application.install_application_service import InstallApplicationService

# 엔티티들을 import하여 테이블 생성 시 사용
from .domain.datagather.input_data_entity import InputData
from .domain.datagather.output_data_entity import OutputData
from .domain.datagather.transport_data_entity import TransportData
from .domain.datagather.process_data_entity import ProcessData
from .domain.datagather.utility_data_entity import UtilityData
from .domain.datagather.waste_data_entity import WasteData
from .domain.datagather.fuel_data_entity import FuelData
from .domain.datagather.process_product_data_entity import ProcessProductData

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

async def get_process_service(session: AsyncSession = Depends(get_session)) -> ProcessApplicationService:
    """Process 애플리케이션 서비스 의존성"""
    return ProcessApplicationService(session)

async def get_install_service(session: AsyncSession = Depends(get_session)) -> InstallApplicationService:
    """Install 애플리케이션 서비스 의존성"""
    return InstallApplicationService(session)

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

# 테이블 생성 엔드포인트 (개발/테스트용)
@app.post("/create-tables")
async def create_tables_endpoint():
    """테이블 생성 (개발/테스트용)"""
    try:
        await database.create_tables()
        return {
            "success": True,
            "message": "테이블이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        logger.error(f"테이블 생성 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "테이블 생성 중 오류가 발생했습니다."
            }
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

# AI 처리 관련 엔드포인트
@app.post("/ai-process")
async def ai_process_data(data: Dict[str, Any]):
    """AI 데이터 처리 - input_data 테이블에 저장"""
    try:
        logger.info(f"🤖 AI 데이터 처리 요청: {data.get('data_type', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # AI 처리된 데이터를 input_data 테이블에 저장
            input_data_rows = data.get('data', [])
            saved_count = 0
            
            for row in input_data_rows:
                try:
                    if row.get('공정') or row.get('투입물명'):
                        # AI 추천 답변 처리
                        ai_recommendation = row.get('AI추천답변', '')
                        if not ai_recommendation or ai_recommendation.strip() == '':
                            ai_recommendation = None
                        
                        # 데이터 삽입
                        session.execute(text("""
                            INSERT INTO input_data 
                            (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                             공정, 투입물명, 수량, 단위, source_file, 주문처명, 오더번호)
                            VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                    :공정, :투입물명, :수량, :단위, :source_file, :주문처명, :오더번호)
                        """), {
                            '로트번호': row.get('로트번호', ''),
                            '생산품명': row.get('생산품명', ''),
                            '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                            '투입일': row.get('투입일'),
                            '종료일': row.get('종료일'),
                            '공정': row.get('공정', ''),
                            '투입물명': row.get('투입물명', ''),
                            '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                            '단위': row.get('단위', 't'),
                            'source_file': data.get('filename', 'ai_processed'),
                            '주문처명': row.get('주문처명', ''),
                            '오더번호': row.get('오더번호', '')
                        })
                        
                        saved_count += 1
                        logger.info(f"행 {saved_count} 저장 성공: {row.get('공정', '')} - {row.get('투입물명', '')}")
                    else:
                        logger.warning(f"필수 데이터 부족으로 건너뜀: {row}")
                
                except Exception as row_error:
                    logger.error(f"행 데이터 저장 실패: {row_error}")
                    continue
            
            session.commit()
            logger.info(f"DB 저장 완료: {saved_count}행 저장됨")
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"AI 데이터 처리가 완료되었습니다. ({saved_count}행 저장)",
                    "saved_count": saved_count,
                    "processed_data": data
                }
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
async def ai_process_data_with_prefix(data: Dict[str, Any]):
    """AI 데이터 처리 (API prefix 포함)"""
    return await ai_process_data(data)

# Gateway에서 사용하는 경로 (API prefix 없이)
@app.post("/api/datagather/ai-process")
async def ai_process_data_gateway(data: Dict[str, Any]):
    """AI 데이터 처리 (Gateway 경로)"""
    return await ai_process_data(data)

# 공정 관련 엔드포인트
@app.post(f"{settings.api_prefix}/process")
async def create_process(
    install_id: int,
    process_name: str,
    process_type: str,
    process_description: Optional[str] = None,
    parent_process_id: Optional[int] = None,
    process_order: Optional[int] = None,
    capacity: Optional[float] = None,
    unit: Optional[str] = None,
    efficiency: Optional[float] = None,
    tags: Optional[str] = None,
    meta_data: Optional[str] = None,
    service: ProcessApplicationService = Depends(get_process_service)
):
    """공정 생성"""
    try:
        result = await service.create_process(
            install_id=install_id,
            process_name=process_name,
            process_type=process_type,
            process_description=process_description,
            parent_process_id=parent_process_id,
            process_order=process_order,
            capacity=capacity,
            unit=unit,
            efficiency=efficiency,
            tags=tags,
            meta_data=meta_data
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
        logger.error(f"공정 생성 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 생성 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/process/{{process_id}}")
async def get_process(
    process_id: int,
    service: ProcessApplicationService = Depends(get_process_service)
):
    """공정 조회"""
    try:
        result = await service.get_process_by_id(process_id)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=404,
                content=result
            )
            
    except Exception as e:
        logger.error(f"공정 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 조회 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/process/install/{{install_id}}")
async def get_processes_by_install(
    install_id: int,
    limit: int = 100,
    service: ProcessApplicationService = Depends(get_process_service)
):
    """사업장별 공정 목록 조회"""
    try:
        result = await service.get_processes_by_install(install_id, limit)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"사업장별 공정 목록 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "사업장별 공정 목록 조회 중 오류가 발생했습니다."
            }
        )

# 사업장 관련 엔드포인트
@app.post(f"{settings.api_prefix}/install")
async def create_install(
    install_name: str,
    company_name: str,
    address: Optional[str] = None,
    region: Optional[str] = None,
    country: Optional[str] = None,
    contact_person: Optional[str] = None,
    contact_email: Optional[str] = None,
    contact_phone: Optional[str] = None,
    industry_type: Optional[str] = None,
    size_category: Optional[str] = None,
    established_date: Optional[str] = None,
    tags: Optional[str] = None,
    meta_data: Optional[str] = None,
    service: InstallApplicationService = Depends(get_install_service)
):
    """사업장 생성"""
    try:
        result = await service.create_install(
            install_name=install_name,
            company_name=company_name,
            address=address,
            region=region,
            country=country,
            contact_person=contact_person,
            contact_email=contact_email,
            contact_phone=contact_phone,
            industry_type=industry_type,
            size_category=size_category,
            established_date=established_date,
            tags=tags,
            meta_data=meta_data
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
        logger.error(f"사업장 생성 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "사업장 생성 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/install/{{install_id}}")
async def get_install(
    install_id: int,
    service: InstallApplicationService = Depends(get_install_service)
):
    """사업장 조회"""
    try:
        result = await service.get_install_by_id(install_id)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=404,
                content=result
            )
            
    except Exception as e:
        logger.error(f"사업장 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "사업장 조회 중 오류가 발생했습니다."
            }
        )

@app.get(f"{settings.api_prefix}/install")
async def get_all_installs(
    limit: int = 100,
    service: InstallApplicationService = Depends(get_install_service)
):
    """모든 사업장 목록 조회"""
    try:
        result = await service.get_all_installs(limit)
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"사업장 목록 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "사업장 목록 조회 중 오류가 발생했습니다."
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
