from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

# 데이터베이스 및 모델 import
from .database import init_db
from .models import Base

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 메인 FastAPI 애플리케이션 생성
app = FastAPI(
    title="DataGather Service",
    description="ESG 데이터 수집 및 처리 서비스",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
async def startup_event():
    """서비스 시작 시 실행"""
    try:
        init_db()
        logger.info("✅ DataGather 서비스 시작 완료")
    except Exception as e:
        logger.error(f"❌ 서비스 시작 실패: {e}")

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "service": "datagather",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# 루트 경로
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "service": "DataGather Service",
        "version": "1.0.0",
        "description": "Data Collection & Processing Service",
        "endpoints": {
            "health": "/health",
            "documentation": "/docs"
        }
    }

# AI 처리 엔드포인트
@app.post("/api/ai-process")
async def ai_process(data: dict):
    """AI를 통한 데이터 처리"""
    try:
        # OpenAI API를 통한 처리 (실제 구현에서는 OpenAI 클라이언트 사용)
        return {
            "success": True,
            "message": "AI 처리 완료",
            "data": data,
            "ai_classification": "규칙 기반 분류 (AI 모델 로드 실패)"
        }
    except Exception as e:
        logger.error(f"AI 처리 실패: {e}")
        return {
            "success": False,
            "message": "AI 처리 실패",
            "error": str(e)
        }

# AI 처리 스트리밍 엔드포인트
@app.post("/ai-process-stream")
async def ai_process_stream(data: dict):
    """AI를 통한 데이터 처리 스트리밍"""
    try:
        logger.info(f"AI 처리 스트리밍 요청 받음: {data.get('filename', 'unknown')}")
        
        # OpenAI API를 통한 처리 (실제 구현에서는 OpenAI 클라이언트 사용)
        # 스트리밍 응답을 시뮬레이션
        return {
            "success": True,
            "message": "AI 처리 스트리밍 완료",
            "data": data,
            "ai_classification": "규칙 기반 분류 (AI 모델 로드 실패)",
            "streaming": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"AI 처리 스트리밍 실패: {e}")
        return {
            "success": False,
            "message": "AI 처리 스트리밍 실패",
            "error": str(e),
            "streaming": False
        }

# 데이터 업로드 엔드포인트
@app.post("/api/upload")
async def upload_data(data: dict):
    """데이터 업로드 처리"""
    try:
        # 여기에 실제 데이터베이스 저장 로직 구현
        return {
            "success": True,
            "message": "데이터 업로드 완료",
            "data": data
        }
    except Exception as e:
        logger.error(f"데이터 업로드 실패: {e}")
        return {
            "success": False,
            "message": "데이터 업로드 실패",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8083,
        reload=True
    )
