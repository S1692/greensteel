<<<<<<< HEAD
# ============================================================================
# 🚀 Cal_boundary Main Application
# ============================================================================

"""
Cal_boundary 서비스 메인 애플리케이션

ReactFlow 기반 HTTP API를 제공하는 FastAPI 애플리케이션입니다.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import time
import os
import re
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 라우터 임포트 (ReactFlow 기반 라우터들)
from app.domain.node.node_controller import node_router
from app.domain.flow.flow_controller import flow_router
from app.domain.edge.edge_controller import edge_router
from app.domain.handle.handle_controller import handle_router
from app.domain.Viewport.Viewport_controller import viewport_router

# CBAM 도메인 라우터들
from app.domain.calculation.calculation_controller import router as calculation_router
from app.domain.datasearch.datasearch_controller import datasearch_router
# ============================================================================
# 🔧 애플리케이션 설정
# ============================================================================

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
                'options': '-c timezone=utc -c client_encoding=utf8'
            }
        }
        
        # SSL 모드 설정
        if 'postgresql' in clean_url.lower():
            if '?' in clean_url:
                clean_url += "&sslmode=require"
            else:
                clean_url += "?sslmode=require"
        
        logger.info(f"데이터베이스 연결 시도: {clean_url.split('@')[1] if '@' in clean_url else clean_url}")
        
        engine = create_engine(clean_url, **engine_params)
        
        # 연결 테스트 및 테이블 생성
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ 데이터베이스 연결 성공")
            
            # 제품 테이블 생성
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS product (
                    product_id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    cn_code VARCHAR(50),
                    period_start DATE,
                    period_end DATE,
                    production_qty DECIMAL(10,2) DEFAULT 0,
                    sales_qty DECIMAL(10,2) DEFAULT 0,
                    export_qty DECIMAL(10,2) DEFAULT 0,
                    inventory_qty DECIMAL(10,2) DEFAULT 0,
                    defect_rate DECIMAL(5,4) DEFAULT 0,
                    node_id VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            logger.info("✅ product 테이블 생성 완료")
            
            # 인덱스 생성
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_product_name ON product(name)"))
            logger.info("✅ 인덱스 생성 완료")
            
            conn.commit()
            logger.info("✅ 데이터베이스 마이그레이션 완료")
        
    except Exception as e:
        logger.error(f"❌ 데이터베이스 마이그레이션 실패: {str(e)}")
        # 치명적 오류가 아니므로 계속 진행

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작/종료 시 실행되는 함수"""
    logger.info("🚀 Cal_boundary 서비스 시작 중...")
    
    # 데이터베이스 초기화 및 마이그레이션
    initialize_database()
    
    # ReactFlow 기반 서비스 초기화
    logger.info("✅ ReactFlow 기반 서비스 초기화")
    
    yield
    
    # 서비스 종료 시 정리 작업
    logger.info("✅ ReactFlow 기반 서비스 정리 완료")
    
    logger.info("🛑 Cal_boundary 서비스 종료 중...")

# ============================================================================
# 🚀 FastAPI 애플리케이션 생성
# ============================================================================

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

# ReactFlow 기반 라우터들 등록
app.include_router(node_router, prefix="/api")
app.include_router(flow_router, prefix="/api")
app.include_router(edge_router, prefix="/api")
app.include_router(handle_router, prefix="/api")
app.include_router(viewport_router, prefix="/api")

# CBAM 도메인 라우터들 등록
app.include_router(calculation_router, prefix="/api")
app.include_router(datasearch_router, prefix="/api")

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
=======
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

from app.common.settings import settings

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    logger.info(f"CBAM Service starting up...")
    logger.info("Domain: Carbon Border Adjustment Mechanism")
    logger.info("Architecture: DDD (Domain-Driven Design)")
    yield
    # 종료 시
    logger.info(f"CBAM Service shutting down...")

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리 - DDD Architecture"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="CBAM Service - DDD Architecture",
        description="탄소국경조정메커니즘 도메인 서비스 - DDD 패턴 적용",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # CORS 미들웨어 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600
    )
    
    # 헬스 체크 엔드포인트
    @app.get("/health")
    async def health_check():
        """헬스 체크 엔드포인트 - DDD 도메인 상태"""
        return {
            "status": "ok",
            "service": "cbam",
            "domain": "carbon-border",
            "architecture": "DDD (Domain-Driven Design)",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    # 루트 경로
    @app.get("/")
    async def root():
        """루트 경로 - DDD 도메인 정보"""
        return {
            "service": "CBAM Service",
            "version": "1.0.0",
            "domain": "Carbon Border Adjustment Mechanism",
            "architecture": "DDD (Domain-Driven Design)",
            "endpoints": {
                "health": "/health",
                "cbam": "/api/cbam"
            }
        }
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8082,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
>>>>>>> origin/main
    )
