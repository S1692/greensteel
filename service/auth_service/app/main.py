from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.common.db import create_tables
from app.common.logger import auth_logger
from app.router.auth import router as auth_router
from app.router.country import router as country_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    auth_logger.info("Auth Service 시작 중...")
    
    # 데이터베이스 테이블 생성
    try:
        create_tables()
        auth_logger.info("데이터베이스 테이블 생성 완료")
    except Exception as e:
        auth_logger.error(f"데이터베이스 테이블 생성 실패: {str(e)}")
        raise
    
    auth_logger.info("Auth Service 시작 완료")
    
    yield
    
    # 종료 시
    auth_logger.info("Auth Service 종료 중...")

# FastAPI 앱 생성
app = FastAPI(
    title="Auth Service",
    description="인증 서비스 - 기업 및 사용자 관리",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router, prefix="/api/v1")
app.include_router(country_router, prefix="/api/v1")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Auth Service API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "auth-service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
