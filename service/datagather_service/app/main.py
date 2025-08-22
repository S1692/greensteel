<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from pathlib import Path

# 서브라우터 import
from .filtering.main import app as filtering_app
=======
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import logging
from datetime import datetime

from app.common.settings import settings
>>>>>>> origin/main

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
<<<<<<< HEAD
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info(f"DataGather Service starting up...")
    logger.info("Domain: Data Collection & Processing")
    logger.info("Architecture: Modular Design with Sub-routers")
    
=======
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    logger.info(f"DataGather Service starting up...")
    logger.info("Domain: Data Collection & Processing")
    logger.info("Architecture: DDD (Domain-Driven Design)")
>>>>>>> origin/main
    yield
    # 종료 시
    logger.info(f"DataGather Service shutting down...")

<<<<<<< HEAD
# 메인 FastAPI 애플리케이션 생성
app = FastAPI(
    title="DataGather Service - Modular Architecture",
    description="ESG 데이터 수집 및 처리 서비스 - 모듈형 설계",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 서브라우터 마운트
app.mount("/filtering", filtering_app)

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "service": "datagather",
        "domain": "data-collection",
        "architecture": "Modular with Sub-routers",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "modules": ["filtering"]
    }

# 루트 경로
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "service": "DataGather Service",
        "version": "1.0.0",
        "domain": "Data Collection & Processing",
        "architecture": "Modular with Sub-routers",
        "endpoints": {
            "health": "/health",
            "filtering": "/filtering",
            "documentation": "/docs"
        },
        "sub_routers": {
            "filtering": {
                "description": "AI 모델을 활용한 투입물명 분류 및 수정",
                "endpoints": {
                    "ai_process": "/filtering/ai-process",
                    "feedback": "/filtering/feedback",
                    "process_data": "/filtering/process-data"
                }
            }
        }
    }
=======
def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리 - DDD Architecture"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="DataGather Service - DDD Architecture",
        description="ESG 데이터 수집 및 처리 도메인 서비스 - DDD 패턴 적용",
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
            "service": "datagather",
            "domain": "data-collection",
            "architecture": "DDD (Domain-Driven Design)",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    # 루트 경로
    @app.get("/")
    async def root():
        """루트 경로 - DDD 도메인 정보"""
        return {
            "service": "DataGather Service",
            "version": "1.0.0",
            "domain": "Data Collection & Processing",
            "architecture": "DDD (Domain-Driven Design)",
            "endpoints": {
                "health": "/health",
                "process-data": "/process-data"
            }
        }
    
    # JSON 데이터 처리 엔드포인트
    @app.post("/process-data")
    async def process_data(data: dict):
        """JSON 형태의 데이터를 받아서 처리합니다."""
        try:
            logger.info(f"JSON 데이터 처리 요청 받음: {data.get('filename', 'unknown')}, 행 수: {len(data.get('data', []))}")
            
            # 여기에 향후 AI 모델 처리 로직이 들어갈 예정
            processed_data = {
                "original_count": len(data.get('data', [])),
                "processed_count": len(data.get('data', [])),
                "status": "processed",
                "message": "데이터가 성공적으로 처리되었습니다",
                "filename": data.get('filename'),
                "rows_count": data.get('rows_count'),
                "columns": data.get('columns'),
                "shape": data.get('shape')
            }
            
            return processed_data
            
        except Exception as e:
            logger.error(f"데이터 처리 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류가 발생했습니다: {str(e)}")
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()
>>>>>>> origin/main

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8083,
<<<<<<< HEAD
        reload=False
=======
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
>>>>>>> origin/main
    )
