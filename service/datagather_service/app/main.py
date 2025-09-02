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
            "ai_process_gateway": "/api/datagather/ai-process",
            "save_input_data": "/save-input-data",
            "save_output_data": "/save-output-data",
            "save_transport_data": "/save-transport-data",
            "save_process_data": "/save-process-data",
            "save_processed_data": "/save-processed-data",
            "get_input_data": "/api/datagather/input-data",
            "get_output_data": "/api/datagather/output-data",
            "get_transport_data": "/api/datagather/transport-data",
            "get_process_data": "/api/datagather/process-data",
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

# 투입물 데이터 저장 (기존 엔드포인트)
@app.post("/save-input-data")
async def save_input_data(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """투입물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"투입물 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # DDD 구조를 사용한 API 데이터 처리
        result = await service.process_api_data(
            install_id=data.get('install_id', 1),
            api_data=data,
            data_type='input_data',
            process_id=data.get('process_id')
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"데이터베이스에 성공적으로 저장되었습니다. ({result.get('saved_count', 0)}행)",
                    "saved_count": result.get('saved_count', 0),
                    "filename": data.get('filename', '')
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"투입물 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "투입물 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 투입물 데이터 조회
@app.get("/api/datagather/input-data")
async def get_input_data():
    """투입물 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM input_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "투입물 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"투입물 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "투입물 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 산출물 데이터 조회
@app.get("/api/datagather/output-data")
async def get_output_data():
    """산출물 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM output_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "산출물 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"산출물 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "산출물 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 운송 데이터 조회
@app.get("/api/datagather/transport-data")
async def get_transport_data():
    """운송 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM transport_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "운송 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"운송 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "운송 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 공정 데이터 조회
@app.get("/api/datagather/process-data")
async def get_process_data():
    """공정 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM process_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "공정 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"공정 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 산출물 데이터 저장
@app.post("/save-output-data")
async def save_output_data(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """산출물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"산출물 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # DDD 구조를 사용한 API 데이터 처리
        result = await service.process_api_data(
            install_id=data.get('install_id', 1),
            api_data=data,
            data_type='output_data',
            process_id=data.get('process_id')
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"산출물 데이터가 성공적으로 저장되었습니다. ({result.get('saved_count', 0)}행)",
                    "saved_count": result.get('saved_count', 0),
                    "filename": data.get('filename', '')
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"산출물 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "산출물 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 운송 데이터 저장
@app.post("/save-transport-data")
async def save_transport_data(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """운송 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"운송 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # DDD 구조를 사용한 API 데이터 처리
        result = await service.process_api_data(
            install_id=data.get('install_id', 1),
            api_data=data,
            data_type='transport_data',
            process_id=data.get('process_id')
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"운송 데이터가 성공적으로 저장되었습니다. ({result.get('saved_count', 0)}행)",
                    "saved_count": result.get('saved_count', 0),
                    "filename": data.get('filename', '')
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"운송 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "운송 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 공정 데이터 저장
@app.post("/save-process-data")
async def save_process_data(
    data: Dict[str, Any],
    service: DataGatherApplicationService = Depends(get_datagather_service)
):
    """공정 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"공정 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # DDD 구조를 사용한 API 데이터 처리
        result = await service.process_api_data(
            install_id=data.get('install_id', 1),
            api_data=data,
            data_type='process_data',
            process_id=data.get('process_id')
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"공정 데이터가 성공적으로 저장되었습니다. ({result.get('saved_count', 0)}행)",
                    "saved_count": result.get('saved_count', 0),
                    "filename": data.get('filename', '')
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content=result
            )
            
    except Exception as e:
        logger.error(f"공정 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 처리된 데이터 분류 및 저장
@app.post("/save-processed-data")
async def save_processed_data(data: Dict[str, Any]):
    """처리된 데이터를 분류하여 적절한 테이블에 저장"""
    try:
        logger.info(f"처리된 데이터 분류 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            input_data_rows = data.get('data', [])
            classified_data = {
                'input_data': [],
                'output_data': [],
                'transport_data': [],
                'process_data': [],
                'utility_data': [],
                'waste_data': [],
                'fuel_data': [],
                'process_product_data': []
            }
            
            # 데이터 분류
            for row in input_data_rows:
                try:
                    # 분류 로직
                    분류 = row.get('분류', '').lower()
                    투입물명 = row.get('투입물명', '').lower()
                    공정 = row.get('공정', '').lower()
                    
                    if '연료' in 분류 or any(fuel in 투입물명 for fuel in ['석탄', '가스', '오일', '연료', 'fuel']):
                        classified_data['fuel_data'].append(row)
                    elif '폐기물' in 분류 or any(waste in 투입물명 for waste in ['폐기물', 'waste', '슬래그', '재']):
                        classified_data['waste_data'].append(row)
                    elif '유틸리티' in 분류 or any(util in 투입물명 for util in ['전기', '증기', '냉각수', 'utility']):
                        classified_data['utility_data'].append(row)
                    elif '산출물' in 분류 or '생산품' in 분류 or any(output in 투입물명 for output in ['제품', '생산품', '산출물']):
                        classified_data['output_data'].append(row)
                    elif '운송' in 분류 or any(transport in 투입물명 for transport in ['운송', 'transport', '이동']):
                        classified_data['transport_data'].append(row)
                    elif '공정' in 분류 or any(process in 공정 for process in ['제련', '압연', '가공', '공정']):
                        classified_data['process_product_data'].append(row)
                    else:
                        # 기본적으로 투입물로 분류
                        classified_data['input_data'].append(row)
                
                except Exception as row_error:
                    logger.error(f"행 분류 실패: {row_error}")
                    continue
            
            # 분류된 데이터를 각 테이블에 저장
            total_saved = 0
            save_results = {}
            
            for table_name, rows in classified_data.items():
                if rows:
                    saved_count = 0
                    for row in rows:
                        try:
                            if table_name == 'input_data':
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
                                    'source_file': data.get('filename', 'processed'),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'output_data':
                                session.execute(text("""
                                    INSERT INTO output_data 
                                    (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                     공정, 산출물명, 수량, 단위, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                            :공정, :산출물명, :수량, :단위, :주문처명, :오더번호)
                                """), {
                                    '로트번호': row.get('로트번호', ''),
                                    '생산품명': row.get('생산품명', ''),
                                    '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                    '투입일': row.get('투입일'),
                                    '종료일': row.get('종료일'),
                                    '공정': row.get('공정', ''),
                                    '산출물명': row.get('투입물명', ''),  # 산출물명으로 매핑
                                    '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '단위': row.get('단위', 't'),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'transport_data':
                                session.execute(text("""
                                    INSERT INTO transport_data 
                                    (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                                     도착공정, 출발지, 이동수단, 주문처명, 오더번호)
                                    VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                            :도착공정, :출발지, :이동수단, :주문처명, :오더번호)
                                """), {
                                    '생산품명': row.get('생산품명', ''),
                                    '로트번호': row.get('로트번호', ''),
                                    '운송물질': row.get('투입물명', ''),
                                    '운송수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '운송일자': row.get('투입일'),
                                    '도착공정': row.get('공정', ''),
                                    '출발지': row.get('주문처명', ''),
                                    '이동수단': row.get('분류', ''),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'process_data':
                                session.execute(text("""
                                    INSERT INTO process_data 
                                    (공정명, 생산제품, 세부공정, 공정_설명)
                                    VALUES (:공정명, :생산제품, :세부공정, :공정_설명)
                                """), {
                                    '공정명': row.get('공정', ''),
                                    '생산제품': row.get('생산품명', ''),
                                    '세부공정': row.get('투입물명', ''),
                                    '공정_설명': row.get('분류', '')
                                })
                            else:
                                # utility_data, waste_data, fuel_data, process_product_data
                                session.execute(text(f"""
                                    INSERT INTO {table_name} 
                                    (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :주문처명, :오더번호)
                                """), {
                                    '로트번호': int(row.get('로트번호', 0)) if row.get('로트번호') else 0,
                                    '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                    '투입일': row.get('투입일'),
                                    '종료일': row.get('종료일'),
                                    '공정': row.get('공정', ''),
                                    '투입물명': row.get('투입물명', ''),
                                    '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '단위': row.get('단위', 't'),
                                    '분류': row.get('분류', table_name.replace('_data', '')),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            
                            saved_count += 1
                            total_saved += 1
                        
                        except Exception as row_error:
                            logger.error(f"행 저장 실패 ({table_name}): {row_error}")
                            continue
                    
                    save_results[table_name] = saved_count
                    logger.info(f"{table_name} 테이블에 {saved_count}행 저장")
            
            session.commit()
            logger.info(f"분류 및 저장 완료: 총 {total_saved}행 저장됨")
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"데이터가 성공적으로 분류되어 저장되었습니다. (총 {total_saved}행)",
                    "total_saved": total_saved,
                    "classification_results": save_results,
                    "filename": data.get('filename', '')
                }
            )
            
    except Exception as e:
        logger.error(f"처리된 데이터 분류 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "처리된 데이터 분류 중 오류가 발생했습니다."
            }
        )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )