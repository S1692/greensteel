from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from pathlib import Path

# 서브라우터 import
from .filtering.main import app as filtering_app

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info(f"DataGather Service starting up...")
    logger.info("Domain: Data Collection & Processing")
    logger.info("Architecture: Modular Design with Sub-routers")
    
    yield
    # 종료 시
    logger.info(f"DataGather Service shutting down...")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8083,
        reload=False
    )
