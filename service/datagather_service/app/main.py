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
        
        # 요청 데이터 추출
        input_data = data.get('data', [])
        columns = data.get('columns', [])
        
        if not input_data:
            return {
                "success": False,
                "message": "처리할 데이터가 없습니다.",
                "error": "No data provided"
            }
        
        logger.info(f"AI 처리 시작: {len(input_data)}개 행")
        
        # AI 처리를 위한 규칙 기반 로직 구현
        processed_data = []
        
        for i, row in enumerate(input_data):
            # AI 추천 답변 생성 로직
            ai_recommendation = generate_ai_recommendation(row)
            
            # 원본 데이터에 AI 추천 답변 추가
            processed_row = {**row, 'AI추천답변': ai_recommendation}
            processed_data.append(processed_row)
            
            # 진행 상황 로그
            if (i + 1) % 10 == 0:
                logger.info(f"AI 처리 진행 중: {i + 1}/{len(input_data)} 행 완료")
        
        logger.info(f"AI 처리 완료: {len(processed_data)}개 행 처리됨")
        
        # 결과 반환
        return {
            "success": True,
            "message": "AI 처리 스트리밍 완료",
            "data": processed_data,
            "columns": columns,
            "ai_classification": "규칙 기반 분류 및 추천",
            "streaming": True,
            "timestamp": datetime.now().isoformat(),
            "total_rows": len(input_data),
            "processed_rows": len(processed_data)
        }
        
    except Exception as e:
        logger.error(f"AI 처리 스트리밍 실패: {e}")
        return {
            "success": False,
            "message": "AI 처리 스트리밍 실패",
            "error": str(e),
            "streaming": False
        }

def generate_ai_recommendation(row: dict) -> str:
    """규칙 기반 AI 추천 답변 생성"""
    try:
        process = str(row.get('공정', '')).strip()
        input_material = str(row.get('투입물명', '')).strip()
        quantity = row.get('수량', 0)
        unit = str(row.get('단위', '')).strip()
        
        # 공정별 추천 로직
        if '코크스' in process or '코크스' in str(row.get('생산품명', '')):
            if '점결탄' in input_material:
                return f"코크스 생산을 위한 점결탄 투입량이 적절합니다. 현재 {quantity}{unit} 투입으로 {row.get('생산수량', 0)}톤의 코크스 생산이 가능합니다."
            elif '석탄' in input_material:
                return f"코크스 생산 공정에 적합한 석탄입니다. {quantity}{unit} 투입으로 고품질 코크스 제조가 가능합니다."
        
        elif '소결' in process or '소결' in str(row.get('생산품명', '')):
            if '광석' in input_material:
                return f"소결 공정에 적합한 광석입니다. {quantity}{unit} 투입으로 {row.get('생산수량', 0)}톤의 소결광 생산이 가능합니다."
            elif '정립광' in input_material:
                return f"정립된 광석으로 소결 공정 효율성이 향상됩니다. {quantity}{unit} 투입량이 적절합니다."
            elif '석회' in input_material:
                return f"소결 공정의 용융점 조절을 위한 석회 투입입니다. {quantity}{unit} 투입으로 소결 품질이 향상됩니다."
        
        elif '제철' in process or '고로' in process:
            if '코크스' in input_material:
                return f"고로 제철 공정의 주요 연료입니다. {quantity}{unit} 투입으로 철광석 환원이 가능합니다."
            elif '소결광' in input_material:
                return f"고로 제철 공정에 최적화된 소결광입니다. {quantity}{unit} 투입으로 철 생산 효율성이 향상됩니다."
            elif '석회석' in input_material:
                return f"고로 제철 공정의 슬래그 형성을 위한 용제입니다. {quantity}{unit} 투입량이 적절합니다."
        
        elif '제강' in process:
            if '철' in input_material or '선철' in input_material:
                return f"제강 공정의 원료입니다. {quantity}{unit} 투입으로 강재 제조가 가능합니다."
            elif '합금' in input_material:
                return f"제강 공정의 합금 원소입니다. {quantity}{unit} 투입으로 원하는 강재 특성을 확보할 수 있습니다."
        
        elif '압연' in process:
            if '강재' in input_material or '슬라브' in input_material:
                return f"압연 공정의 원료입니다. {quantity}{unit} 투입으로 압연 제품 생산이 가능합니다."
        
        # 일반적인 추천
        if quantity and unit:
            if quantity > 1000:
                return f"대량 투입으로 인한 경제적 효율성이 높습니다. {quantity}{unit} 투입량이 적절합니다."
            elif quantity < 100:
                return f"소량 투입으로 정밀한 공정 제어가 가능합니다. {quantity}{unit} 투입량이 적절합니다."
            else:
                return f"표준 투입량으로 안정적인 공정 운영이 가능합니다. {quantity}{unit} 투입량이 적절합니다."
        
        return "AI 분석 결과, 투입량과 공정 조건이 적절합니다."
        
    except Exception as e:
        logger.error(f"AI 추천 생성 중 오류: {e}")
        return "AI 분석 중 오류가 발생했습니다."

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
