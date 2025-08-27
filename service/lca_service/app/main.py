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
    logger.info(f"LCA Service starting up...")
    logger.info("Domain: Life Cycle Assessment & Inventory")
    logger.info("Architecture: DDD (Domain-Driven Design)")
    yield
    # 종료 시
    logger.info(f"LCA Service shutting down...")

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리 - DDD Architecture"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="LCA Service - DDD Architecture",
        description="생명주기 평가 및 인벤토리 도메인 서비스 - DDD 패턴 적용",
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
            "service": "lca",
            "domain": "lifecycle-inventory",
            "architecture": "DDD (Domain-Driven Design)",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    # 루트 경로
    @app.get("/")
    async def root():
        """루트 경로 - DDD 도메인 정보"""
        return {
            "service": "LCA Service",
            "version": "1.0.0",
            "domain": "Life Cycle Assessment & Inventory",
            "architecture": "DDD (Domain-Driven Design)",
            "endpoints": {
                "health": "/health",
                "lca": "/api/lca"
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
        port=8084,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )
