from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

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
        title="DataGather Service (Layered Architecture)",
        description="레이어드 아키텍처를 적용한 데이터 수집 서비스",
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
    
    # JSON 데이터 처리 엔드포인트
    @app.post("/process-data")
    async def process_data(data: dict):
        """JSON 형태의 데이터를 받아서 처리합니다."""
        try:
            print(f"JSON 데이터 처리 요청 받음: {data.get('filename', 'unknown')}, 행 수: {len(data.get('data', []))}")
            
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
            print(f"데이터 처리 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류가 발생했습니다: {str(e)}")
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8083,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )
