from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    logger.info(f"DataGather Service starting up...")
    logger.info("Domain: Data Collection & Processing")
    logger.info("Architecture: DDD (Domain-Driven Design)")
    yield
    # 종료 시
    logger.info(f"DataGather Service shutting down...")

# 메인 FastAPI 애플리케이션 생성
app = FastAPI(
    title="DataGather Service - DDD Architecture",
    description="ESG 데이터 수집 및 처리 도메인 서비스 - DDD 패턴 적용",
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
        "version": "1.0.0",
        "modules": ["core"]
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
            "documentation": "/docs"
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

# AI 처리 엔드포인트
@app.post("/ai-process")
async def ai_process(data: dict):
    """AI 모델을 활용한 데이터 처리"""
    try:
        logger.info(f"AI 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # AI 처리 로직 (향후 구현)
        processed_data = {
            "status": "ai_processed",
            "message": "AI 처리가 완료되었습니다",
            "filename": data.get('filename'),
            "original_count": len(data.get('data', [])),
            "processed_count": len(data.get('data', [])),
            "ai_available": True
        }
        
        return processed_data
        
    except Exception as e:
        logger.error(f"AI 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 처리 중 오류가 발생했습니다: {str(e)}")

# 피드백 처리 엔드포인트
@app.post("/feedback")
async def process_feedback(feedback_data: dict):
    """사용자 피드백을 받아 AI 모델을 재학습시킵니다."""
    try:
        logger.info(f"피드백 처리 요청 받음: {feedback_data}")
        
        # 피드백 처리 로직 (향후 구현)
        return {
            "status": "feedback_processed",
            "message": "피드백이 성공적으로 처리되었습니다",
            "data": feedback_data
        }
        
    except Exception as e:
        logger.error(f"피드백 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 처리 중 오류가 발생했습니다: {str(e)}")

# Input 데이터 업로드 엔드포인트
@app.post("/input-data")
async def upload_input_data(data: dict):
    """Input 데이터를 업로드합니다."""
    try:
        logger.info(f"Input 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        return {
            "status": "success",
            "message": "Input 데이터가 성공적으로 업로드되었습니다",
            "filename": data.get('filename'),
            "data_count": len(data.get('data', []))
        }
        
    except Exception as e:
        logger.error(f"Input 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Input 데이터 업로드 중 오류가 발생했습니다: {str(e)}")

# Output 데이터 업로드 엔드포인트
@app.post("/output-data")
async def upload_output_data(data: dict):
    """Output 데이터를 업로드합니다."""
    try:
        logger.info(f"Output 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        return {
            "status": "success",
            "message": "Output 데이터가 성공적으로 업로드되었습니다",
            "filename": data.get('filename'),
            "data_count": len(data.get('data', []))
        }
        
    except Exception as e:
        logger.error(f"Output 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Output 데이터 업로드 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8083,
        reload=False
    )
