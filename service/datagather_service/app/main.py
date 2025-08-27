from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from pathlib import Path
import os

# GPU 설정 강화
import torch
if torch.cuda.is_available():
    # CUDA 환경변수 설정
    os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'  # 첫 번째 GPU 사용
    
    # 실제 GPU 정보 확인
    gpu_count = torch.cuda.device_count()
    current_device = torch.cuda.current_device()
    gpu_name = torch.cuda.get_device_name(current_device)
    gpu_memory = torch.cuda.get_device_properties(current_device).total_memory / 1024**3
    
    print(f"🚀 GPU 사용 설정:")
    print(f"  📱 GPU 개수: {gpu_count}개")
    print(f"  🎯 현재 GPU: {current_device}번")
    print(f"  🔧 GPU 모델: {gpu_name}")
    print(f"  💾 GPU 메모리: {gpu_memory:.1f}GB")
else:
    print("⚠️ GPU를 사용할 수 없습니다. CPU 모드로 실행됩니다.")

# 서브라우터 import
from .filtering.main import app as filtering_app

# AI 모델 직접 로드
from .ananke.model import XMLRoBERTaClassifier

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
    
    # AI 모델 초기화
    try:
        logger.info("🤖 AI 모델 초기화 시작...")
        
        # 모델 디렉토리 경로 설정
        model_dir = os.path.join(os.path.dirname(__file__), "data", "studied", "model_v24", "model_v24")
        model_dir = os.path.abspath(model_dir)
        
        logger.info(f"🔍 모델 디렉토리: {model_dir}")
        logger.info(f"🔍 모델 디렉토리 존재: {os.path.exists(model_dir)}")
        
        if os.path.exists(model_dir):
            # AI 모델 인스턴스 생성
            # AI 모델 인스턴스 생성
            logger.info("🔄 XMLRoBERTaClassifier 인스턴스 생성 중...")
            try:
                app.state.ai_model = XMLRoBERTaClassifier(model_dir=model_dir)
                logger.info("✅ AI 모델 인스턴스 생성 완료")
                
                # 모델 상태 상세 확인
                if hasattr(app.state.ai_model, 'training_data'):
                    logger.info(f"✅ 학습 데이터 로드 확인: {len(app.state.ai_model.training_data)}개 라벨")
                else:
                    logger.warning("⚠️ 학습 데이터가 로드되지 않았습니다")
                    
                if hasattr(app.state.ai_model, 'input_text_embeddings_cache'):
                    logger.info(f"✅ 임베딩 캐시 로드 확인: {len(app.state.ai_model.input_text_embeddings_cache)}개")
                else:
                    logger.warning("⚠️ 임베딩 캐시가 로드되지 않았습니다")
                    
                # 최종 모델 상태 확인
                logger.info(f"🔍 최종 모델 상태: {type(app.state.ai_model)}")
                logger.info(f"🔍 app.state.ai_model 존재: {hasattr(app.state, 'ai_model')}")
                logger.info(f"🔍 app.state.ai_model 값: {app.state.ai_model}")
                
            except Exception as model_error:
                logger.error(f"❌ XMLRoBERTaClassifier 생성 실패: {model_error}")
                import traceback
                logger.error(f"🔍 모델 생성 에러 상세: {traceback.format_exc()}")
                app.state.ai_model = None
        else:
            logger.error(f"❌ 모델 디렉토리를 찾을 수 없습니다: {model_dir}")
            app.state.ai_model = None
            
    except Exception as e:
        logger.error(f"❌ AI 모델 초기화 실패: {e}")
        import traceback
        logger.error(f"🔍 전체 에러 상세: {traceback.format_exc()}")
        app.state.ai_model = None
    
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
        "modules": ["filtering"],
        "ai_model_status": "loaded" if hasattr(app.state, 'ai_model') and app.state.ai_model else "not_loaded"
    }

# AI 모델 직접 테스트 엔드포인트
@app.post("/ai-test")
async def ai_test(text: str):
    """AI 모델 직접 테스트"""
    if not hasattr(app.state, 'ai_model') or app.state.ai_model is None:
        return {"error": "AI 모델이 로드되지 않았습니다"}
    
    try:
        # AI 모델 상태 상세 확인
        model = app.state.ai_model
        model_status = {
            "model_type": type(model).__name__,
            "has_training_data": hasattr(model, 'training_data'),
            "training_data_count": len(model.training_data) if hasattr(model, 'training_data') else 0,
            "has_embeddings_cache": hasattr(model, 'input_text_embeddings_cache'),
            "embeddings_cache_count": len(model.input_text_embeddings_cache) if hasattr(model, 'input_text_embeddings_cache') else 0,
            "device": str(model.device) if hasattr(model, 'device') else "unknown"
        }
        
        # 철 라벨 상세 확인
        if hasattr(model, 'training_data') and '철' in model.training_data:
            철_데이터 = model.training_data['철']
            철_상세 = {
                "철_라벨_존재": True,
                "철_input_texts_수": len(철_데이터),
                "철_input_texts_샘플": 철_데이터[:5],  # 처음 5개만
                "철ㄹ_포함": '철ㄹ' in 철_데이터,
                "철ㄹ_위치": 철_데이터.index('철ㄹ') + 1 if '철ㄹ' in 철_데이터 else -1
            }
        else:
            철_상세 = {"철_라벨_존재": False}
        
        # AI 모델로 예측
        result = await model.predict(text)
        
        return {
            "input": text,
            "result": result,
            "model_status": model_status,
            "철_상세": 철_상세,
            "model_loaded": True
        }
    except Exception as e:
        import traceback
        return {
            "error": f"AI 예측 실패: {str(e)}",
            "traceback": traceback.format_exc(),
            "model_loaded": hasattr(app.state, 'ai_model') and app.state.ai_model is not None
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
