# ============================================================================
# 🚀 DataGather Service - Main Application
# ============================================================================

import asyncio
import logging
import os
import json
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
import uvicorn
import httpx

from .infrastructure.database import database
from .infrastructure.config import settings

# 로깅 설정
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format=settings.log_format
)
logger = logging.getLogger(__name__)

# 키워드 기반 분류 시스템
material_keywords = {
    "점결탄": ["점결탄", "coking coal", "코킹"],
    "산화마그네슘": ["산화마그네슘", "magnesium oxide", "MgO"],
    "오븐 코크스": ["오븐 코크스", "oven coke", "코크스"],
    "콜타르": ["콜타르", "coal tar", "타르"],
    "직접 환원철": ["직접 환원철", "direct reduced iron", "DRI"],
    "일산화탄소": ["일산화탄소", "carbon monoxide", "CO"],
    "천연가스": ["천연가스", "natural gas", "NG"],
    "갈탄": ["갈탄", "lignite", "brown coal"],
    "페트롤 및 SBP": ["페트롤", "SBP", "petrol"],
    "역청": ["역청", "bitumen", "아스팔트"],
    "냉각수": ["냉각수", "cooling water", "냉각"],
    "강철": ["강철", "steel", "스틸"],
    "석회석": ["석회석", "limestone", "CaCO3"],
    "산업폐기물": ["산업폐기물", "industrial waste", "폐기물"],
    "메탄": ["메탄", "methane", "CH4"],
    "고로 슬래그": ["고로 슬래그", "blast furnace slag", "슬래그"],
    "철 스크랩": ["철 스크랩", "iron scrap", "스크랩"],
    "분진": ["분진", "dust", "먼지"],
    "윤활유": ["윤활유", "lubricating oil", "오일"],
    "액화석유가스": ["액화석유가스", "LPG", "liquefied petroleum gas"],
    "강철 스크랩": ["강철 스크랩", "steel scrap"],
    "탄산리튬": ["탄산리튬", "lithium carbonate", "Li2CO3"],
    "경유": ["경유", "diesel", "디젤"],
    "잔류 연료유": ["잔류 연료유", "residual fuel oil", "중유"],
    "전기": ["전기", "electricity", "power"],
    "무연탄": ["무연탄", "anthracite", "안트라사이트"],
    "오일 셰일": ["오일 셰일", "oil shale", "셰일"],
    "철광석": ["철광석", "iron ore", "광석"],
    "탄산수소나트륨": ["탄산수소나트륨", "sodium bicarbonate", "NaHCO3"],
    "탄산바륨": ["탄산바륨", "barium carbonate", "BaCO3"],
    "포장재": ["포장재", "packaging", "포장"],
    "액화 천연가스": ["액화 천연가스", "LNG", "liquefied natural gas"],
    "슬러지": ["슬러지", "sludge", "침전물"],
    "소다회": ["소다회", "soda ash", "Na2CO3"],
    "산화바륨": ["산화바륨", "barium oxide", "BaO"],
    "가스공장 가스": ["가스공장 가스", "gas works gas"],
    "폐유": ["폐유", "waste oil", "사용유"],
    "EAF 탄소 전극": ["EAF 탄소 전극", "EAF carbon electrode", "전극"],
    "압연 스케일": ["압연 스케일", "rolling scale", "스케일"],
    "코크스 오븐 가스": ["코크스 오븐 가스", "coke oven gas", "COG"],
    "EAF 충전 탄소": ["EAF 충전 탄소", "EAF charging carbon"],
    "고로가스": ["고로가스", "blast furnace gas", "BFG"],
    "열간성형철 (HBI)": ["열간성형철", "HBI", "hot briquetted iron"],
    "피트 (Peat)": ["피트", "peat", "이탄"],
    "선철": ["선철", "pig iron", "생철"],
    "원유": ["원유", "crude oil", "raw oil"],
    "산소 제강로 가스": ["산소 제강로 가스", "BOF gas"],
    "열유입": ["열유입", "heat input", "열"],
    "절삭칩": ["절삭칩", "cutting chips", "칩"],
    "아역청탄": ["아역청탄", "sub-bituminous coal"],
    "마그네사이트": ["마그네사이트", "magnesite", "MgCO3"],
    "석유 코크스": ["석유 코크스", "petroleum coke", "pet coke"],
    "펠렛": ["펠렛", "pellets", "소결"],
    "오리멀전": ["오리멀전", "ore emulsion"],
    "액화 석유가스": ["액화 석유가스", "liquefied petroleum gas", "LPG"],
    "등유": ["등유", "kerosene", "등화유"],
    "소성가스": ["소성가스", "calcining gas"],
    "에탄": ["에탄", "ethane", "C2H6"],
    "산화칼슘": ["산화칼슘", "calcium oxide", "CaO", "생석회"],
    "나프타": ["나프타", "naphtha", "나프타"],
    "철": ["철", "iron", "Fe"],
    "능철광": ["능철광", "magnetite", "Fe3O4"],
    "소결광": ["소결광", "sinter ore", "소결"],
    "고온 성형 환원철": ["고온 성형 환원철", "hot briquetted iron", "HBI"],
    "휘발유": ["휘발유", "gasoline", "가솔린"],
    "탄산스트론튬": ["탄산스트론튬", "strontium carbonate", "SrCO3"]
}

async def initialize_keyword_classifier():
    """키워드 기반 분류기 초기화"""
    try:
        logger.info("🔍 키워드 기반 분류기 초기화 중...")
        logger.info(f"📋 키워드 사전 로드 완료: {len(material_keywords)}개 재료 분류")
        logger.info("✅ 키워드 기반 분류기 초기화 완료")
        return True
        
    except Exception as e:
        logger.error(f"❌ 키워드 분류기 초기화 실패: {str(e)}")
        return False

async def predict_material_with_keywords(input_text: str) -> tuple[str, float]:
    """키워드 기반 재료 분류"""
    try:
        logger.info(f"🔍 키워드 기반 분류 시작: '{input_text}'")
        
        # 입력 텍스트를 소문자로 변환하고 정규화
        normalized_text = input_text.lower().strip()
        
        # 각 재료에 대해 키워드 매칭 점수 계산
        best_match = None
        best_score = 0.0
        
        for material, keywords in material_keywords.items():
            score = 0.0
            
            # 각 키워드에 대해 매칭 점수 계산
            for keyword in keywords:
                keyword_lower = keyword.lower()
                
                # 정확한 매칭 (높은 점수)
                if keyword_lower == normalized_text:
                    score += 10.0
                # 부분 매칭 (중간 점수)
                elif keyword_lower in normalized_text:
                    score += 5.0
                # 단어 경계 매칭 (낮은 점수)
                elif re.search(r'\b' + re.escape(keyword_lower) + r'\b', normalized_text):
                    score += 3.0
                # 포함 매칭 (가장 낮은 점수)
                elif keyword_lower in normalized_text or normalized_text in keyword_lower:
                    score += 1.0
            
            # 가장 높은 점수를 가진 재료 선택
            if score > best_score:
                best_score = score
                best_match = material
        
        # 신뢰도 계산 (0.0 ~ 1.0)
        confidence = min(best_score / 10.0, 1.0) if best_score > 0 else 0.0
        
        # 매칭된 재료가 있으면 반환, 없으면 원본 텍스트 반환
        if best_match and best_score > 0:
            logger.info(f"✅ 키워드 분류 완료: '{best_match}' (신뢰도: {confidence:.4f})")
            return best_match, confidence
        else:
            logger.info(f"⚠️ 매칭되는 재료를 찾을 수 없습니다. 원본 텍스트 반환: '{input_text}'")
            return input_text, 0.0
        
    except Exception as e:
        logger.error(f"❌ 키워드 분류 실패: {str(e)}")
        return input_text, 0.0

async def generate_ai_recommendation(input_text: str) -> tuple[str, float]:
    """AI 추천 답변 생성 (키워드 기반 분류 사용)"""
    try:
        # 키워드 기반 분류 사용
        return await predict_material_with_keywords(input_text)
        
    except Exception as e:
        logger.error(f"❌ AI 추천 생성 중 오류: {e}")
        return input_text, 0.0

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info("🚀 DataGather Service를 시작합니다...")
    
    # 설정 유효성 검증
    if not settings.validate():
        raise RuntimeError("설정 유효성 검증에 실패했습니다.")
    
    # 데이터베이스 초기화
    await database.init_db()
    
    # 키워드 기반 분류기 초기화
    await initialize_keyword_classifier()
    
    logger.info("✅ DataGather Service가 성공적으로 시작되었습니다.")
    
    yield
    
    # 종료 시
    logger.info("🛑 DataGather Service를 종료합니다...")

# FastAPI 앱 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Data Collection & Processing Service - DDD Structure",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 의존성 주입 함수
async def get_session() -> AsyncSession:
    """데이터베이스 세션 의존성"""
    async for session in database.get_session():
        yield session

# 의존성 주입 함수 제거 - 직접 데이터베이스 세션 사용

# 루트 엔드포인트
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "service": "DataGather Service",
        "version": "1.0.0",
        "description": "Data Collection & Processing Service - DDD Structure",
        "ai_config": {
            "model": "keyword_based_classifier",
            "description": "키워드 기반 재료 분류기",
            "materials_count": len(material_keywords)
        },
        "endpoints": {
            "health": "/health",
            "ai_process": "/ai-process",
            "ai_process_api": f"{settings.api_prefix}/datagather/ai-process",
            "ai_process_gateway": "/api/datagather/ai-process",
            "save_input_data": "/save-input-data",
            "save_output_data": "/save-output-data",
            "save_transport_data": "/save-transport-data",
            "save_process_data": "/save-process-data",
            "save_processed_data": "/save-processed-data",
            "get_input_data": "/api/datagather/input-data",
            "get_output_data": "/api/datagather/output-data",
            "get_transport_data": "/api/datagather/transport-data",
            "get_process_data": "/api/datagather/process-data",
            "delete_input_data": "/api/datagather/input-data/{id}",
            "delete_output_data": "/api/datagather/output-data/{id}",
            "delete_transport_data": "/api/datagather/transport-data/{id}",
            "delete_process_data": "/api/datagather/process-data/{id}",
            "classify_data": "/api/datagather/classify-data",
            "get_classified_data": "/api/datagather/classified-data",
            "documentation": "/docs"
        }
    }

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    try:
        db_healthy = await database.health_check()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "service": settings.app_name,
            "version": settings.app_version,
            "database": "connected" if db_healthy else "disconnected"
        }
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "error": str(e)}
        )

# AI 처리 관련 엔드포인트
@app.post("/ai-process")
async def ai_process_data(data: Dict[str, Any]):
    """AI 데이터 처리"""
    try:
        logger.info(f"🤖 AI 데이터 처리 요청: {data.get('data_type', 'unknown')}")
        logger.info(f"📊 전체 요청 데이터: {data}")
        
        # 입력 데이터에서 처리할 데이터 추출
        input_data = data.get('data', [])
        logger.info(f"📥 입력 데이터 개수: {len(input_data)}")
        logger.info(f"📥 입력 데이터 샘플: {input_data[:2] if input_data else '빈 데이터'}")
        
        # Hugging Face AI 처리
        processed_data = []
        
        for i, item in enumerate(input_data):
            logger.info(f"🔄 처리 중인 항목 {i+1}: {item}")
            투입물명 = item.get('투입물명', '')
            공정 = item.get('공정', '')
            logger.info(f"   - 투입물명: '{투입물명}', 공정: '{공정}'")
            
            # 키워드 기반 분류 모델을 사용하여 AI 추천 답변 생성
            try:
                ai_추천답변, actual_confidence = await generate_ai_recommendation(투입물명)
                logger.info(f"   - 키워드 기반 AI 분류 결과: '{ai_추천답변}', 신뢰도: {actual_confidence:.3f}")
                
            except Exception as e:
                logger.error(f"   - AI 분류 실패, 기본값 사용: {e}")
                ai_추천답변 = 투입물명  # 기본값으로 원본 텍스트 사용
                actual_confidence = 0.0
            
            # 각 항목에 AI 처리 결과 추가
            processed_item = {
                **item,
                "AI추천답변": ai_추천답변,
                "ai_processed": True,
                "ai_model": "keyword_based_classifier",
                "ai_task": "text-classification",
                "classification": "processed",
                "confidence": actual_confidence,
                "processed_at": "2024-01-01T00:00:00Z"
            }
            processed_data.append(processed_item)
            logger.info(f"   ✅ 항목 {i+1} 처리 완료")
        
        logger.info(f"📊 최종 처리된 데이터 개수: {len(processed_data)}")
        
        # AI 분류 결과만 반환
        ai_classification_results = []
        for item in processed_data:
            ai_result = {
                "투입물명": item.get('투입물명', ''),
                "공정": item.get('공정', ''),
                "AI분류결과": item.get('AI추천답변', ''),
                "분류신뢰도": item.get('confidence', 0.0),
                "AI모델": item.get('ai_model', ''),
                "처리시간": item.get('processed_at', '')
            }
            ai_classification_results.append(ai_result)
        
        response_data = {
            "success": True,
            "message": f"키워드 기반 분류기 AI 분류가 완료되었습니다.",
            "ai_model": "keyword_based_classifier",
            "ai_description": "키워드 기반 재료 분류기",
            "ai_task": "text-classification",
            "total_classified": len(ai_classification_results),
            "ai_results": ai_classification_results  # AI 분류 결과만
        }
        
        logger.info("✅ AI 데이터 처리 성공")
        logger.info(f"📤 응답 데이터: {response_data}")
        return JSONResponse(
            status_code=200,
            content=response_data
        )
            
    except Exception as e:
        logger.error(f"❌ AI 데이터 처리 중 오류: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "AI 데이터 처리 중 오류가 발생했습니다.",
                "data": []  # 오류 시에도 빈 배열 반환
            }
        )

@app.post(f"{settings.api_prefix}/datagather/ai-process")
async def ai_process_data_with_prefix(data: Dict[str, Any]):
    """AI 데이터 처리 (API prefix 포함)"""
    return await ai_process_data(data)

# Gateway에서 사용하는 경로 (API prefix 없이)
@app.post("/api/datagather/ai-process")
async def ai_process_data_gateway(data: Dict[str, Any]):
    """AI 데이터 처리 (Gateway 경로)"""
    return await ai_process_data(data)

# 투입물 데이터 저장 (기존 엔드포인트)
@app.post("/save-input-data")
async def save_input_data(data: Dict[str, Any]):
    """투입물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"투입물 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        saved_count = 0
        with Session() as session:
            input_data_rows = data.get('data', [])
            
            for row in input_data_rows:
                try:
                    session.execute(text("""
                        INSERT INTO input_data 
                        (로트번호, 생산품명, 생산수량, 생산수량_단위, 투입일, 종료일, 
                         공정, 투입물명, 수량, 투입물_단위, source_file, 주문처명, 오더번호)
                        VALUES (:로트번호, :생산품명, :생산수량, :생산수량_단위, :투입일, :종료일,
                                :공정, :투입물명, :수량, :투입물_단위, :source_file, :주문처명, :오더번호)
                    """), {
                        '로트번호': row.get('로트번호', ''),
                        '생산품명': row.get('생산품명', ''),
                        '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                        '생산수량_단위': row.get('생산수량_단위', 't'),
                        '투입일': row.get('투입일'),
                        '종료일': row.get('종료일'),
                        '공정': row.get('공정', ''),
                        '투입물명': row.get('투입물명', ''),
                        '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                        '투입물_단위': row.get('투입물_단위', 't'),
                        'source_file': data.get('filename', 'input_data'),
                        '주문처명': row.get('주문처명', ''),
                        '오더번호': row.get('오더번호', '')
                    })
                    saved_count += 1
                except Exception as row_error:
                    logger.error(f"행 저장 실패: {row_error}, 데이터: {row}")
                    # 트랜잭션 롤백 후 계속 진행
                    session.rollback()
                    continue
            
            session.commit()
        
        logger.info(f"투입물 데이터 저장 완료: {saved_count}행 저장됨")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"투입물 데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                "saved_count": saved_count,
                "filename": data.get('filename', ''),
                "total_rows": len(input_data_rows)
            }
        )
            
    except Exception as e:
        logger.error(f"투입물 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "투입물 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 투입물 데이터 조회
@app.get("/api/datagather/input-data")
async def get_input_data():
    """투입물 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM input_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "투입물 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"투입물 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "투입물 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 산출물 데이터 조회
@app.get("/api/datagather/output-data")
async def get_output_data():
    """산출물 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM output_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "산출물 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"산출물 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "산출물 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 운송 데이터 조회
@app.get("/api/datagather/transport-data")
async def get_transport_data():
    """운송 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM transport_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "운송 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"운송 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "운송 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 공정 데이터 조회
@app.get("/api/datagather/process-data")
async def get_process_data():
    """공정 데이터 조회"""
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            result = session.execute(text("SELECT * FROM process_data ORDER BY created_at DESC"))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                data.append(row_dict)
            
            return {
                "success": True,
                "message": "공정 데이터 조회 완료",
                "data": data,
                "count": len(data)
            }
            
    except Exception as e:
        logger.error(f"공정 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 산출물 데이터 저장
@app.post("/save-output-data")
async def save_output_data(
    data: Dict[str, Any],

):
    """산출물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"산출물 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        saved_count = 0
        with Session() as session:
            output_data_rows = data.get('data', [])
            
            for row in output_data_rows:
                try:
                    # 산출물명 필드 매핑 수정
                    output_name = row.get('산출물명', '') or row.get('투입물명', '')
                    
                    session.execute(text("""
                        INSERT INTO output_data 
                        (로트번호, 생산품명, 생산수량, 생산수량_단위, 투입일, 종료일, 
                         공정, 산출물명, 수량, 산출물_단위, source_file, 주문처명, 오더번호)
                        VALUES (:로트번호, :생산품명, :생산수량, :생산수량_단위, :투입일, :종료일,
                                :공정, :산출물명, :수량, :산출물_단위, :source_file, :주문처명, :오더번호)
                    """), {
                        '로트번호': row.get('로트번호', ''),
                        '생산품명': row.get('생산품명', ''),
                        '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                        '생산수량_단위': row.get('생산수량_단위', 't'),
                        '투입일': row.get('투입일'),
                        '종료일': row.get('종료일'),
                        '공정': row.get('공정', ''),
                        '산출물명': output_name,
                        '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                        '산출물_단위': row.get('산출물_단위', 't'),
                        'source_file': data.get('filename', 'output_data'),
                        '주문처명': row.get('주문처명', ''),
                        '오더번호': row.get('오더번호', '')
                    })
                    saved_count += 1
                except Exception as row_error:
                    logger.error(f"행 저장 실패: {row_error}, 데이터: {row}")
                    # 트랜잭션 롤백 후 계속 진행
                    session.rollback()
                    continue
            
            session.commit()
        
        logger.info(f"산출물 데이터 저장 완료: {saved_count}행 저장됨")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"산출물 데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                "saved_count": saved_count,
                "filename": data.get('filename', ''),
                "total_rows": len(output_data_rows)
            }
        )
            
    except Exception as e:
        logger.error(f"산출물 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "산출물 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 운송 데이터 저장
@app.post("/save-transport-data")
async def save_transport_data(
    data: Dict[str, Any],

):
    """운송 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"운송 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        saved_count = 0
        with Session() as session:
            transport_data_rows = data.get('data', [])
            
            for row in transport_data_rows:
                try:
                    # Excel 필드명 매핑 (공백 포함 필드명 사용)
                    transport_material = row.get('운송 물질', '') or row.get('운송물질', '')
                    transport_quantity = row.get('운송 수량', 0) or row.get('운송수량', 0)
                    transport_date = row.get('운송 일자') or row.get('운송일자')
                    destination_process = row.get('도착 공정', '') or row.get('도착공정', '')
                    transport_method = row.get('이동 수단', '') or row.get('이동수단', '')
                    
                    # 운송수량이 0이면 기본값 1로 설정 (체크 제약조건 위반 방지)
                    if not transport_quantity or float(transport_quantity) <= 0:
                        transport_quantity = 1
                    
                    session.execute(text("""
                        INSERT INTO transport_data 
                        (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                         도착공정, 출발지, 이동수단, 주문처명, 오더번호)
                        VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                :도착공정, :출발지, :이동수단, :주문처명, :오더번호)
                    """), {
                        '생산품명': row.get('생산품명', ''),
                        '로트번호': row.get('로트번호', ''),
                        '운송물질': transport_material,
                        '운송수량': float(transport_quantity),
                        '운송일자': transport_date,
                        '도착공정': destination_process,
                        '출발지': row.get('출발지', ''),
                        '이동수단': transport_method,
                        '주문처명': row.get('주문처명', ''),
                        '오더번호': row.get('오더번호', '')
                    })
                    saved_count += 1
                except Exception as row_error:
                    logger.error(f"행 저장 실패: {row_error}, 데이터: {row}")
                    # 트랜잭션 롤백 후 계속 진행
                    session.rollback()
                    continue
            
            session.commit()
        
        logger.info(f"운송 데이터 저장 완료: {saved_count}행 저장됨")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"운송 데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                "saved_count": saved_count,
                "filename": data.get('filename', ''),
                "total_rows": len(transport_data_rows)
            }
        )
            
    except Exception as e:
        logger.error(f"운송 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "운송 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 공정 데이터 저장
@app.post("/save-process-data")
async def save_process_data(
    data: Dict[str, Any],

):
    """공정 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"공정 데이터 저장 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        saved_count = 0
        with Session() as session:
            process_data_rows = data.get('data', [])
            
            for row in process_data_rows:
                try:
                    # 디버깅: Excel 데이터의 모든 필드명과 값 확인
                    logger.info(f"Excel 데이터 필드들: {list(row.keys())}")
                    logger.info(f"전체 데이터: {row}")
                    logger.info(f"공정설명 값: '{row.get('공정설명', '')}'")
                    logger.info(f"공정 설명 값: '{row.get('공정 설명', '')}'")
                    
                    # 모든 필드의 값 확인 (디버깅용)
                    logger.info("=== Excel 데이터 모든 필드 ===")
                    for key, value in row.items():
                        logger.info(f"필드 '{key}': '{value}' (타입: {type(value)})")
                    logger.info("=== 필드 확인 완료 ===")
                    
                    # 공정설명 필드 매핑 (다양한 필드명 지원)
                    process_description = (
                        row.get('공정 설명', '') or 
                        row.get('공정설명', '') or 
                        row.get('설명', '') or 
                        row.get('공정내용', '') or
                        row.get('세부설명', '') or
                        row.get('공정_설명', '') or
                        row.get('공정 내용', '') or
                        row.get('세부 설명', '') or
                        row.get('process_description', '') or
                        row.get('description', '') or
                        # 강제로 상세한 설명 생성
                        f"{row.get('공정명', '')} 공정: {row.get('생산제품', '')} 생산을 위한 {row.get('세부공정', '')} 공정입니다."
                    )
                    
                    # 텍스트가 너무 짧으면 더 상세하게 만들기
                    if len(process_description) < 10:
                        process_description = f"{row.get('공정명', '')} 공정 - {row.get('생산제품', '')} 생산을 위한 {row.get('세부공정', '')} 공정으로, 원료를 가공하여 최종 제품을 생산하는 과정입니다."
                    
                    logger.info(f"최종 공정설명 값: '{process_description}'")
                    
                    session.execute(text("""
                        INSERT INTO process_data 
                        (공정명, 생산제품, 세부공정, 공정설명)
                        VALUES (:공정명, :생산제품, :세부공정, :공정설명)
                    """), {
                        '공정명': row.get('공정명', ''),
                        '생산제품': row.get('생산제품', ''),
                        '세부공정': row.get('세부공정', ''),
                        '공정설명': process_description
                    })
                    saved_count += 1
                except Exception as row_error:
                    logger.error(f"행 저장 실패: {row_error}, 데이터: {row}")
                    # 트랜잭션 롤백 후 계속 진행
                    session.rollback()
                    continue
            
            session.commit()
        
        logger.info(f"공정 데이터 저장 완료: {saved_count}행 저장됨")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"공정 데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                "saved_count": saved_count,
                "filename": data.get('filename', ''),
                "total_rows": len(process_data_rows)
            }
        )
            
    except Exception as e:
        logger.error(f"공정 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "공정 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 처리된 데이터 분류 및 저장
@app.post("/save-processed-data")
async def save_processed_data(data: Dict[str, Any]):
    """처리된 데이터를 분류하여 적절한 테이블에 저장"""
    try:
        logger.info(f"처리된 데이터 분류 요청: {data.get('filename', 'unknown')}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            input_data_rows = data.get('data', [])
            classified_data = {
                'input_data': [],
                'output_data': [],
                'transport_data': [],
                'process_data': [],
                'utility_data': [],
                'waste_data': [],
                'fuel_data': [],
                'process_product_data': []
            }
            
            # 데이터 분류
            for row in input_data_rows:
                try:
                    # 분류 로직
                    분류 = row.get('분류', '').lower()
                    투입물명 = row.get('투입물명', '').lower()
                    공정 = row.get('공정', '').lower()
                    
                    if '연료' in 분류 or any(fuel in 투입물명 for fuel in ['석탄', '가스', '오일', '연료', 'fuel']):
                        classified_data['fuel_data'].append(row)
                    elif '폐기물' in 분류 or any(waste in 투입물명 for waste in ['폐기물', 'waste', '슬래그', '재']):
                        classified_data['waste_data'].append(row)
                    elif '유틸리티' in 분류 or any(util in 투입물명 for util in ['전기', '증기', '냉각수', 'utility']):
                        classified_data['utility_data'].append(row)
                    elif '산출물' in 분류 or '생산품' in 분류 or any(output in 투입물명 for output in ['제품', '생산품', '산출물']):
                        classified_data['output_data'].append(row)
                    elif '운송' in 분류 or any(transport in 투입물명 for transport in ['운송', 'transport', '이동']):
                        classified_data['transport_data'].append(row)
                    elif '공정' in 분류 or any(process in 공정 for process in ['제련', '압연', '가공', '공정']):
                        classified_data['process_product_data'].append(row)
                    else:
                        # 기본적으로 투입물로 분류
                        classified_data['input_data'].append(row)
                
                except Exception as row_error:
                    logger.error(f"행 분류 실패: {row_error}")
                    continue
            
            # 분류된 데이터를 각 테이블에 저장
            total_saved = 0
            save_results = {}
            
            for table_name, rows in classified_data.items():
                if rows:
                    saved_count = 0
                    for row in rows:
                        try:
                            if table_name == 'input_data':
                                session.execute(text("""
                                    INSERT INTO input_data 
                                    (로트번호, 생산품명, 생산수량, 생산수량_단위, 투입일, 종료일, 
                                     공정, 투입물명, 수량, 투입물_단위, source_file, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산품명, :생산수량, :생산수량_단위, :투입일, :종료일,
                                            :공정, :투입물명, :수량, :투입물_단위, :source_file, :주문처명, :오더번호)
                                """), {
                                    '로트번호': row.get('로트번호', ''),
                                    '생산품명': row.get('생산품명', ''),
                                    '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                    '생산수량_단위': row.get('생산수량_단위', 't'),
                                    '투입일': row.get('투입일'),
                                    '종료일': row.get('종료일'),
                                    '공정': row.get('공정', ''),
                                    '투입물명': row.get('투입물명', ''),
                                    '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '투입물_단위': row.get('투입물_단위', 't'),
                                    'source_file': data.get('filename', 'processed'),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'output_data':
                                session.execute(text("""
                                    INSERT INTO output_data 
                                    (로트번호, 생산품명, 생산수량, 생산수량_단위, 투입일, 종료일, 
                                     공정, 산출물명, 수량, 산출물_단위, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산품명, :생산수량, :생산수량_단위, :투입일, :종료일,
                                            :공정, :산출물명, :수량, :산출물_단위, :주문처명, :오더번호)
                                """), {
                                    '로트번호': row.get('로트번호', ''),
                                    '생산품명': row.get('생산품명', ''),
                                    '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                    '생산수량_단위': row.get('생산수량_단위', 't'),
                                    '투입일': row.get('투입일'),
                                    '종료일': row.get('종료일'),
                                    '공정': row.get('공정', ''),
                                    '산출물명': row.get('투입물명', ''),  # 산출물명으로 매핑
                                    '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '산출물_단위': row.get('산출물_단위', 't'),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'transport_data':
                                session.execute(text("""
                                    INSERT INTO transport_data 
                                    (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                                     도착공정, 출발지, 이동수단, 주문처명, 오더번호)
                                    VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                            :도착공정, :출발지, :이동수단, :주문처명, :오더번호)
                                """), {
                                    '생산품명': row.get('생산품명', ''),
                                    '로트번호': row.get('로트번호', ''),
                                    '운송물질': row.get('투입물명', ''),
                                    '운송수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '운송일자': row.get('투입일'),
                                    '도착공정': row.get('공정', ''),
                                    '출발지': row.get('주문처명', ''),
                                    '이동수단': row.get('분류', ''),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            elif table_name == 'process_data':
                                session.execute(text("""
                                    INSERT INTO process_data 
                                    (공정명, 생산제품, 세부공정, 공정설명)
                                    VALUES (:공정명, :생산제품, :세부공정, :공정설명)
                                """), {
                                    '공정명': row.get('공정', ''),
                                    '생산제품': row.get('생산품명', ''),
                                    '세부공정': row.get('투입물명', ''),
                                    '공정설명': row.get('분류', '')
                                })
                            else:
                                # utility_data, waste_data, fuel_data, process_product_data
                                session.execute(text(f"""
                                    INSERT INTO {table_name} 
                                    (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :주문처명, :오더번호)
                                """), {
                                    '로트번호': int(row.get('로트번호', 0)) if row.get('로트번호') else 0,
                                    '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                    '투입일': row.get('투입일'),
                                    '종료일': row.get('종료일'),
                                    '공정': row.get('공정', ''),
                                    '투입물명': row.get('투입물명', ''),
                                    '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                    '단위': row.get('단위', 't'),
                                    '분류': row.get('분류', table_name.replace('_data', '')),
                                    '주문처명': row.get('주문처명', ''),
                                    '오더번호': row.get('오더번호', '')
                                })
                            
                            saved_count += 1
                            total_saved += 1
                        
                        except Exception as row_error:
                            logger.error(f"행 저장 실패 ({table_name}): {row_error}")
                            continue
                    
                    save_results[table_name] = saved_count
                    logger.info(f"{table_name} 테이블에 {saved_count}행 저장")
            
            session.commit()
            logger.info(f"분류 및 저장 완료: 총 {total_saved}행 저장됨")
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"데이터가 성공적으로 분류되어 저장되었습니다. (총 {total_saved}행)",
                    "total_saved": total_saved,
                    "classification_results": save_results,
                    "filename": data.get('filename', '')
                }
            )
            
    except Exception as e:
        logger.error(f"처리된 데이터 분류 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "처리된 데이터 분류 중 오류가 발생했습니다."
            }
        )

# 데이터 분류 저장
@app.post("/api/datagather/classify-data")
async def classify_data(data: Dict[str, Any]):
    """데이터 분류 정보를 분류별 테이블에 저장"""
    try:
        logger.info(f"데이터 분류 저장 요청: {data}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        saved_count = 0
        with Session() as session:
            classification_data = data.get('data', [])
            
            for row in classification_data:
                try:
                    분류 = row.get('분류', '').strip()
                    source_table = row.get('source_table', '')
                    source_id = row.get('source_id', 0)
                    
                    # 분류에 따라 적절한 테이블에 저장
                    if 분류 == '연료':
                        target_table = 'fuel_data'
                    elif 분류 == '유틸리티':
                        target_table = 'utility_data'
                    elif 분류 == '폐기물':
                        target_table = 'waste_data'
                    elif 분류 == '공정 생산품':
                        target_table = 'process_product_data'
                    else:
                        continue
                    
                    # 기존 데이터가 있는지 확인
                    existing_check = session.execute(text(f"""
                        SELECT id FROM {target_table} 
                        WHERE source_table = :source_table AND source_id = :source_id
                    """), {
                        'source_table': source_table,
                        'source_id': source_id
                    }).fetchone()
                    
                    if existing_check:
                        # 기존 데이터가 있으면 업데이트
                        session.execute(text(f"""
                            UPDATE {target_table} 
                            SET 분류 = :분류, updated_at = NOW()
                            WHERE source_table = :source_table AND source_id = :source_id
                        """), {
                            '분류': 분류,
                            'source_table': source_table,
                            'source_id': source_id
                        })
                    else:
                        # 기존 데이터가 없으면 새로 삽입
                        if source_table == 'input_data':
                            session.execute(text(f"""
                                INSERT INTO {target_table} 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 
                                 분류, source_table, source_id, 주문처명, 오더번호, created_at)
                                SELECT CAST(로트번호 AS INTEGER), 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위,
                                       :분류, :source_table, :source_id, 주문처명, 오더번호, NOW()
                                FROM input_data 
                                WHERE id = :source_id
                            """), {
                                '분류': 분류,
                                'source_table': source_table,
                                'source_id': source_id
                            })
                        elif source_table == 'output_data':
                            session.execute(text(f"""
                                INSERT INTO {target_table} 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 
                                 분류, source_table, source_id, 주문처명, 오더번호, created_at)
                                SELECT CAST(로트번호 AS INTEGER), 생산수량, 투입일, 종료일, 공정, 산출물명, 수량, 단위,
                                       :분류, :source_table, :source_id, 주문처명, 오더번호, NOW()
                                FROM output_data 
                                WHERE id = :source_id
                            """), {
                                '분류': 분류,
                                'source_table': source_table,
                                'source_id': source_id
                            })
                    
                    saved_count += 1
                    
                except Exception as row_error:
                    logger.error(f"분류 데이터 저장 실패: {row_error}, 데이터: {row}")
                    session.rollback()
                    continue
            
            session.commit()
        
        logger.info(f"분류 데이터 저장 완료: {saved_count}행 저장됨")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"분류 데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                "saved_count": saved_count,
                "total_rows": len(classification_data)
            }
        )
            
    except Exception as e:
        logger.error(f"분류 데이터 저장 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "분류 데이터 저장 중 오류가 발생했습니다."
            }
        )

# 분류된 데이터 조회
@app.get("/api/datagather/classified-data/{classification}")
async def get_classified_data(classification: str):
    """분류된 데이터 조회 (연료, 유틸리티, 폐기물, 공정 생산품)"""
    try:
        logger.info(f"분류된 데이터 조회 요청: {classification}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # 분류에 따라 적절한 테이블에서 조회
            if classification == '연료':
                table_name = 'fuel_data'
            elif classification == '유틸리티':
                table_name = 'utility_data'
            elif classification == '폐기물':
                table_name = 'waste_data'
            elif classification == '공정 생산품':
                table_name = 'process_product_data'
            else:
                return JSONResponse(
                    status_code=400,
                    content={
                        "success": False,
                        "error": "Invalid classification",
                        "message": f"지원하지 않는 분류입니다: {classification}"
                    }
                )
            
            # 해당 분류 테이블에서 데이터 조회
            query = f"""
                SELECT 
                    id,
                    로트번호,
                    생산수량,
                    투입일,
                    종료일,
                    공정,
                    투입물명,
                    수량,
                    단위,
                    분류,
                    source_table,
                    source_id,
                    주문처명,
                    오더번호,
                    created_at,
                    updated_at
                FROM {table_name}
                ORDER BY created_at DESC
            """
            
            result = session.execute(text(query))
            rows = result.fetchall()
            
            data = []
            for row in rows:
                row_dict = dict(row._mapping)
                
                # 날짜 필드 처리
                for key, value in row_dict.items():
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                
                data.append(row_dict)
            
            logger.info(f"분류된 데이터 조회 완료: {len(data)}행 ({classification})")
            
            return {
                "success": True,
                "message": f"{classification} 분류 데이터 조회 완료",
                "data": data,
                "count": len(data),
                "classification": classification
            }
            
    except Exception as e:
        logger.error(f"분류된 데이터 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": f"{classification} 분류 데이터 조회 중 오류가 발생했습니다."
            }
        )

# 데이터 삭제 API 엔드포인트들
@app.delete("/api/datagather/input-data/{data_id}")
async def delete_input_data(data_id: int):
    """투입물 데이터 삭제"""
    try:
        logger.info(f"투입물 데이터 삭제 요청: ID {data_id}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # 데이터 존재 여부 확인
            check_query = "SELECT id FROM input_data WHERE id = :data_id"
            result = session.execute(text(check_query), {"data_id": data_id})
            if not result.fetchone():
                return JSONResponse(
                    status_code=404,
                    content={
                        "success": False,
                        "error": "Data not found",
                        "message": f"ID {data_id}에 해당하는 투입물 데이터를 찾을 수 없습니다."
                    }
                )
            
            # 데이터 삭제
            delete_query = "DELETE FROM input_data WHERE id = :data_id"
            session.execute(text(delete_query), {"data_id": data_id})
            session.commit()
            
            logger.info(f"투입물 데이터 삭제 완료: ID {data_id}")
            
            return {
                "success": True,
                "message": f"투입물 데이터 (ID: {data_id})가 성공적으로 삭제되었습니다.",
                "deleted_id": data_id
            }
            
    except Exception as e:
        logger.error(f"투입물 데이터 삭제 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": f"투입물 데이터 삭제 중 오류가 발생했습니다."
            }
        )

@app.delete("/api/datagather/output-data/{data_id}")
async def delete_output_data(data_id: int):
    """산출물 데이터 삭제"""
    try:
        logger.info(f"산출물 데이터 삭제 요청: ID {data_id}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # 데이터 존재 여부 확인
            check_query = "SELECT id FROM output_data WHERE id = :data_id"
            result = session.execute(text(check_query), {"data_id": data_id})
            if not result.fetchone():
                return JSONResponse(
                    status_code=404,
                    content={
                        "success": False,
                        "error": "Data not found",
                        "message": f"ID {data_id}에 해당하는 산출물 데이터를 찾을 수 없습니다."
                    }
                )
            
            # 데이터 삭제
            delete_query = "DELETE FROM output_data WHERE id = :data_id"
            session.execute(text(delete_query), {"data_id": data_id})
            session.commit()
            
            logger.info(f"산출물 데이터 삭제 완료: ID {data_id}")
            
            return {
                "success": True,
                "message": f"산출물 데이터 (ID: {data_id})가 성공적으로 삭제되었습니다.",
                "deleted_id": data_id
            }
            
    except Exception as e:
        logger.error(f"산출물 데이터 삭제 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": f"산출물 데이터 삭제 중 오류가 발생했습니다."
            }
        )

@app.delete("/api/datagather/transport-data/{data_id}")
async def delete_transport_data(data_id: int):
    """운송 데이터 삭제"""
    try:
        logger.info(f"운송 데이터 삭제 요청: ID {data_id}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # 데이터 존재 여부 확인
            check_query = "SELECT id FROM transport_data WHERE id = :data_id"
            result = session.execute(text(check_query), {"data_id": data_id})
            if not result.fetchone():
                return JSONResponse(
                    status_code=404,
                    content={
                        "success": False,
                        "error": "Data not found",
                        "message": f"ID {data_id}에 해당하는 운송 데이터를 찾을 수 없습니다."
                    }
                )
            
            # 데이터 삭제
            delete_query = "DELETE FROM transport_data WHERE id = :data_id"
            session.execute(text(delete_query), {"data_id": data_id})
            session.commit()
            
            logger.info(f"운송 데이터 삭제 완료: ID {data_id}")
            
            return {
                "success": True,
                "message": f"운송 데이터 (ID: {data_id})가 성공적으로 삭제되었습니다.",
                "deleted_id": data_id
            }
            
    except Exception as e:
        logger.error(f"운송 데이터 삭제 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": f"운송 데이터 삭제 중 오류가 발생했습니다."
            }
        )

@app.delete("/api/datagather/process-data/{data_id}")
async def delete_process_data(data_id: int):
    """공정 데이터 삭제"""
    try:
        logger.info(f"공정 데이터 삭제 요청: ID {data_id}")
        
        # 데이터베이스 연결
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.database_url.replace("postgresql+asyncpg://", "postgresql://"))
        Session = sessionmaker(bind=engine)
        
        with Session() as session:
            # 데이터 존재 여부 확인
            check_query = "SELECT id FROM process_data WHERE id = :data_id"
            result = session.execute(text(check_query), {"data_id": data_id})
            if not result.fetchone():
                return JSONResponse(
                    status_code=404,
                    content={
                        "success": False,
                        "error": "Data not found",
                        "message": f"ID {data_id}에 해당하는 공정 데이터를 찾을 수 없습니다."
                    }
                )
            
            # 데이터 삭제
            delete_query = "DELETE FROM process_data WHERE id = :data_id"
            session.execute(text(delete_query), {"data_id": data_id})
            session.commit()
            
            logger.info(f"공정 데이터 삭제 완료: ID {data_id}")
            
            return {
                "success": True,
                "message": f"공정 데이터 (ID: {data_id})가 성공적으로 삭제되었습니다.",
                "deleted_id": data_id
            }
            
    except Exception as e:
        logger.error(f"공정 데이터 삭제 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": f"공정 데이터 삭제 중 오류가 발생했습니다."
            }
        )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )