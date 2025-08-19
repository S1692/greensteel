from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.common.settings import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    print(f"Starting {settings.SERVICE_NAME}")
    yield
    # 종료 시
    print(f"Shutting down {settings.SERVICE_NAME}")

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="LCI Service (Layered Architecture)",
        description="레이어드 아키텍처를 적용한 LCI 서비스",
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
        """헬스 체크 엔드포인트"""
        return {
            "status": "ok",
            "name": settings.SERVICE_NAME,
            "timestamp": "2024-01-01T00:00:00Z"
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
