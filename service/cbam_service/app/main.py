# ============================================================================
# 📦 Import 모듈들
# ============================================================================

import time
import logging
import os
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# CBAM 도메인 라우터
from app.domain.calculation.calculation_controller import router as calculation_router

# ReactFlow 기반 라우터들 (현재 CBAM 기능에서는 사용하지 않음)
# from app.domain.node.node_controller import node_router
# from app.domain.flow.flow_controller import flow_router
# from app.domain.edge.edge_controller import edge_router
# from app.domain.handle.handle_controller import handle_router
# from app.domain.Viewport.Viewport_controller import viewport_router

# ============================================================================
# 🔧 설정 및 초기화
# ============================================================================

"""
Cal_boundary 서비스 메인 애플리케이션

CBAM 관련 HTTP API를 제공하는 FastAPI 애플리케이션입니다.
"""

# 환경 변수 로드 (.env는 로컬에서만 사용)
if not os.getenv("RAILWAY_ENVIRONMENT"):
    load_dotenv()

# 환경 변수 설정
APP_NAME = os.getenv("APP_NAME", "Cal_boundary Service")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_DESCRIPTION = os.getenv("APP_DESCRIPTION", "ReactFlow 기반 서비스")
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

# ============================================================================
# 🔄 애플리케이션 생명주기 관리
# ============================================================================

def get_database_url():
    """데이터베이스 URL 가져오기"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL 환경변수가 설정되지 않았습니다.")
        return None
    return database_url

def clean_database_url(url: str) -> str:
    """데이터베이스 URL 정리"""
    # Railway PostgreSQL에서 발생할 수 있는 잘못된 파라미터들 제거
    invalid_params = [
        'db_type', 'db_type=postgresql', 'db_type=postgres',
        'db_type=mysql', 'db_type=sqlite'
    ]
    
    for param in invalid_params:
        if param in url:
            url = url.replace(param, '')
            logger.warning(f"잘못된 데이터베이스 파라미터 제거: {param}")
    
    # 연속된 & 제거
    url = re.sub(r'&&+', '&', url)
    url = re.sub(r'&+$', '', url)
    
    if '?' in url and url.split('?')[1].startswith('&'):
        url = url.replace('?&', '?')
    
    return url

def initialize_database():
    """데이터베이스 초기화 및 마이그레이션"""
    try:
        database_url = get_database_url()
        if not database_url:
            logger.warning("데이터베이스 URL이 없어 마이그레이션을 건너뜁니다.")
            return
        
        clean_url = clean_database_url(database_url)
        
        # Railway PostgreSQL 최적화 설정
        engine_params = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_size': 5,
            'max_overflow': 10,
            'echo': False,
            'connect_args': {
                'connect_timeout': 30,
                'application_name': 'cbam-service',
            }
        }
        
        # 엔진 생성 및 연결 테스트
        engine = create_engine(clean_url, **engine_params)
        
        with engine.connect() as conn:
            # 데이터베이스 연결 테스트
            result = conn.execute(text("SELECT 1"))
            logger.info("✅ 데이터베이스 연결 성공")
            
            # 테이블 존재 여부 확인
            tables_result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('install', 'product', 'process', 'product_process', 'process_input', 'edge', 'emission_factors', 'emission_attribution', 'product_emissions')
                ORDER BY table_name
            """))
            
            existing_tables = [row[0] for row in tables_result]
            logger.info(f"📋 기존 CBAM 테이블: {existing_tables}")
            
            # 필요한 테이블이 없으면 경고
            required_tables = ['install', 'product', 'process']
            missing_tables = [table for table in required_tables if table not in existing_tables]
            
            if missing_tables:
                logger.warning(f"⚠️ 누락된 필수 테이블: {missing_tables}")
                logger.warning("데이터베이스 스키마를 먼저 생성해주세요.")
            else:
                logger.info("✅ 필수 CBAM 테이블이 모두 존재합니다")
        
        engine.dispose()
        
    except Exception as e:
        logger.error(f"❌ 데이터베이스 초기화 실패: {str(e)}")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info(f"🚀 {APP_NAME} v{APP_VERSION} 시작 중...")
    
    # 데이터베이스 초기화
    initialize_database()
    
    logger.info(f"✅ {APP_NAME} 시작 완료!")
    
    yield
    
    # 종료 시
    logger.info(f"🛑 {APP_NAME} 종료 중...")

# ============================================================================
# 🚀 FastAPI 애플리케이션 생성
# ============================================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    debug=DEBUG_MODE,
    lifespan=lifespan
)

# ============================================================================
# 🔧 미들웨어 설정
# ============================================================================

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 📊 요청/응답 로깅 미들웨어
# ============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """HTTP 요청/응답 로깅"""
    start_time = time.time()
    
    # 요청 로깅
    logger.info(f"📥 {request.method} {request.url.path} - {request.client.host}")
    
    # 응답 처리
    response = await call_next(request)
    
    # 응답 로깅
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
    
    return response

# ============================================================================
# 🎯 라우터 등록
# ============================================================================

# ReactFlow 기반 라우터들 등록 (현재 CBAM 기능에서는 사용하지 않음)
# app.include_router(node_router, prefix="/api")
# app.include_router(flow_router, prefix="/api")
# app.include_router(edge_router, prefix="/api")
# app.include_router(handle_router, prefix="/api")
# app.include_router(viewport_router, prefix="/api")

# CBAM 계산 라우터 등록 (calculation_controller.py에서 prefix 제거됨)
app.include_router(calculation_router, prefix="/api")

# ============================================================================
# 🏥 헬스체크 엔드포인트
# ============================================================================

@app.get("/health", tags=["health"])
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "timestamp": time.time()
    }

@app.get("/db/status", tags=["database"])
async def database_status():
    """데이터베이스 연결 상태 확인"""
    try:
        database_url = get_database_url()
        if not database_url:
            return {
                "status": "unhealthy",
                "database": "not_configured",
                "message": "DATABASE_URL not configured",
                "timestamp": time.time()
            }
        
        clean_url = clean_database_url(database_url)
        engine = create_engine(clean_url, pool_pre_ping=True)
        
        with engine.connect() as conn:
            # 연결 테스트
            result = conn.execute(text("SELECT 1"))
            
            # 테이블 존재 여부 확인
            tables_result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('install', 'product', 'process', 'product_process', 'process_input', 'edge', 'emission_factors', 'emission_attribution', 'product_emissions')
                ORDER BY table_name
            """))
            
            existing_tables = [row[0] for row in tables_result]
            
            # 테이블별 행 수 확인
            table_counts = {}
            for table in existing_tables:
                try:
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.fetchone()[0]
                    table_counts[table] = count
                except Exception:
                    table_counts[table] = "error"
        
        engine.dispose()
        
        return {
            "status": "healthy",
            "database": "connected",
            "tables": {
                "existing": existing_tables,
                "counts": table_counts
            },
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"데이터베이스 상태 확인 실패: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "connection_failed",
            "error": str(e),
            "timestamp": time.time()
        }

@app.get("/", tags=["root"])
async def root():
    """루트 경로"""
    return {
        "message": f"{APP_NAME} is running",
        "version": APP_VERSION,
        "health_check": "/health",
        "database_status": "/db/status",
        "api_docs": "/docs" if DEBUG_MODE else "disabled in production"
    }

# ============================================================================
# 📦 제품 데이터 엔드포인트는 calculation_controller.py에서 관리
# ============================================================================

# 제품 관련 엔드포인트는 /api/product로 접근 가능
# calculation_router가 /api prefix로 등록되어 있음

# ============================================================================
# 🚨 예외 처리 핸들러
# ============================================================================

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

# ============================================================================
# 🚀 서버 실행
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8082,
        reload=DEBUG_MODE,
        log_level="info"
    )
