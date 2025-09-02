#!/usr/bin/env python3
"""
DataGather Service - 메인 애플리케이션
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# 유틸리티 및 데이터베이스 import
from .utils import excel_date_to_postgres_date
from .database import init_db

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

# ==================== 엔드포인트들 ====================

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "service": "datagather",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

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

@app.post("/save-input-data")
async def save_input_data(data: dict):
    """투입물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"투입물 데이터 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        input_data_rows = data.get('data', [])
        
        if not input_data_rows:
            return {"success": False, "message": "저장할 투입물 데이터가 없습니다.", "error": "No input data provided"}
        
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        saved_count = 0
        
        with Session(engine) as session:
            try:
                for row in input_data_rows:
                    try:
                        if row.get('공정') or row.get('투입물명'):
                            unit_value = row.get('단위', '')
                            if not unit_value or unit_value.strip() == '':
                                unit_value = 't'
                            
                            ai_recommendation = row.get('AI추천답변', '')
                            if not ai_recommendation or ai_recommendation.strip() == '':
                                ai_recommendation = None
                            
                            row_data = {
                                '로트번호': row.get('로트번호', ''),
                                '생산품명': row.get('생산품명', ''),
                                '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                '투입일': excel_date_to_postgres_date(row.get('투입일')),
                                '종료일': excel_date_to_postgres_date(row.get('종료일')),
                                '공정': row.get('공정', ''),
                                '투입물명': row.get('투입물명', ''),
                                '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                '단위': unit_value,
                                'ai추천답변': ai_recommendation
                            }
                            
                            row_data = {k: v for k, v in row_data.items() if v is not None}
                            
                            if row_data.get('공정') or row_data.get('투입물명'):
                                session.execute(text("""
                                    INSERT INTO input_data 
                                    (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                     공정, 투입물명, 수량, 단위, ai추천답변)
                                    VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                            :공정, :투입물명, :수량, :단위, :ai추천답변)
                                """), row_data)
                                
                                saved_count += 1
                                logger.info(f"행 {saved_count} 저장 성공: {row_data.get('공정', '')} - {row_data.get('투입물명', '')}")
                            else:
                                logger.warning(f"필수 데이터 부족으로 건너뜀: {row}")
                    
                    except Exception as row_error:
                        logger.error(f"행 데이터 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"DB 저장 완료: {saved_count}행 저장됨")
                return {"success": True, "message": f"데이터베이스에 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                logger.error(f"데이터베이스 저장 실패: {db_error}")
                try:
                    session.rollback()
                except:
                    pass
                raise db_error
                
    except Exception as e:
        logger.error(f"DB 저장 엔드포인트 실패: {e}")
        return {"success": False, "message": f"데이터베이스 저장 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

@app.post("/save-transport-data")
async def save_transport_data(data: dict):
    """운송 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"운송 데이터 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        transport_data = data.get('data', [])
        
        if not transport_data:
            return {"success": False, "message": "저장할 운송 데이터가 없습니다.", "error": "No transport data provided"}
        
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in transport_data:
                    try:
                        transport_record = {
                            '생산품명': row.get('생산품명', ''),
                            '로트번호': row.get('로트번호', ''),
                            '운송물질': row.get('운송 물질', ''),
                            '운송수량': float(row.get('운송 수량', 0)) if row.get('운송 수량') else 0,
                            '운송일자': excel_date_to_postgres_date(row.get('운송 일자')),
                            '도착공정': row.get('도착 공정', ''),
                            '출발지': row.get('출발지', ''),
                            '이동수단': row.get('이동 수단', ''),
                            '주문처명': row.get('주문처명', ''),
                            '오더번호': row.get('오더번호', '')
                        }
                        
                        if not transport_record.get('생산품명') or not transport_record.get('로트번호'):
                            continue
                        
                        session.execute(text("""
                            INSERT INTO transport_data 
                            (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                             도착공정, 출발지, 이동수단, 주문처명, 오더번호)
                            VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                    :도착공정, :출발지, :이동수단, :주문처명, :오더번호)
                        """), transport_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"운송 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                return {"success": True, "message": f"운송 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                raise db_error
                
    except Exception as e:
        logger.error(f"운송 데이터 저장 엔드포인트 실패: {e}")
        return {"success": False, "message": f"운송 데이터 저장 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

@app.post("/save-process-data")
async def save_process_data(data: dict):
    """공정 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"공정 데이터 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        process_data = data.get('data', [])
        
        if not process_data:
            return {"success": False, "message": "저장할 공정 데이터가 없습니다.", "error": "No process data provided"}
        
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in process_data:
                    try:
                        # 디버깅을 위한 로그 추가
                        logger.info(f"처리 중인 행 데이터: {row}")
                        logger.info(f"행의 키들: {list(row.keys())}")
                        
                        process_record = {
                            '공정명': row.get('공정명', ''),
                            '생산제품': row.get('생산제품', ''),
                            '세부공정': row.get('세부공정', ''),
                            '공정_설명': row.get('공정 설명', '') or row.get('공정설명', '') or ''
                        }
                        
                        logger.info(f"생성된 process_record: {process_record}")
                        
                        if not process_record['공정명']:
                            continue
                        
                        session.execute(text("""
                            INSERT INTO process_data 
                            (공정명, 생산제품, 세부공정, "공정 설명")
                            VALUES (:공정명, :생산제품, :세부공정, :공정_설명)
                        """), process_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"공정 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                return {"success": True, "message": f"공정 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                raise db_error
                
    except Exception as e:
        logger.error(f"공정 데이터 저장 엔드포인트 실패: {e}")
        return {"success": False, "message": f"공정 데이터 저장 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

@app.get("/api/datagather/input-data")
async def get_input_data():
    """실적정보(투입물) 조회"""
    try:
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
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
                    "message": "실적정보(투입물) 조회 완료",
                    "data": data,
                    "count": len(data)
                }
                
            except Exception as db_error:
                logger.error(f"실적정보(투입물) 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"실적정보(투입물) 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"실적정보(투입물) 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"실적정보(투입물) 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

@app.get("/api/datagather/transport-data")
async def get_transport_data():
    """운송 데이터 조회"""
    try:
        logger.info("운송 데이터 조회 요청 받음")
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            return {
                "success": False,
                "message": "데이터베이스 연결 정보가 설정되지 않았습니다",
                "error": "DATABASE_URL not set"
            }
        
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
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
                
            except Exception as db_error:
                logger.error(f"운송 데이터 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"운송 데이터 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"운송 데이터 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"운송 데이터 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

@app.get("/api/datagather/process-data")
async def get_process_data():
    """공정 데이터 조회"""
    try:
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
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
                
            except Exception as db_error:
                logger.error(f"공정 데이터 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"공정 데이터 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"공정 데이터 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"공정 데이터 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

@app.get("/api/datagather/output-data")
async def get_output_data():
    """출력 데이터 조회"""
    try:
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
        
        with Session(engine) as session:
            try:
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
                    "message": "출력 데이터 조회 완료",
                    "data": data,
                    "count": len(data)
                }
                
            except Exception as db_error:
                logger.error(f"출력 데이터 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"출력 데이터 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"출력 데이터 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"출력 데이터 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

@app.post("/classify-data")
async def classify_data(data: dict):
    """데이터를 분류하여 저장하는 엔드포인트"""
    try:
        logger.info("데이터 분류 요청 받음")
        input_data = data.get('data', [])
        
        if not input_data:
            return {"success": False, "message": "분류할 데이터가 없습니다.", "error": "No data provided"}
        
        logger.info(f"분류할 데이터: {len(input_data)}행")
        classified_data = []
        
        for row in input_data:
            try:
                process_name = row.get('공정명', '')
                product_name = row.get('생산제품', '')
                detail_process = row.get('세부공정', '')
                
                classified_row = {
                    '공정명': process_name,
                    '생산제품': product_name,
                    '세부공정': detail_process,
                    '공정_설명': row.get('공정 설명', '')
                }
                
                classified_data.append(classified_row)
                
            except Exception as row_error:
                logger.error(f"행 분류 실패: {row_error}")
                continue
        
        logger.info(f"데이터 분류 완료: {len(classified_data)}행 분류됨")
        
        if classified_data:
            database_url = os.getenv("DATABASE_URL")
            engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300, echo=False)
            
            with Session(engine) as session:
                try:
                    session.begin()
                    saved_count = 0
                    
                    for row in classified_data:
                        try:
                            session.execute(text("""
                                INSERT INTO process_data 
                                (공정명, 생산제품, 세부공정, "공정 설명")
                                VALUES (:공정명, :생산제품, :세부공정, :공정_설명)
                            """), row)
                            
                            saved_count += 1
                        
                        except Exception as row_error:
                            logger.error(f"분류된 데이터 저장 실패: {row_error}")
                            continue
                    
                    session.commit()
                    logger.info(f"분류된 데이터 DB 저장 완료: {saved_count}행 저장됨")
                    
                except Exception as db_error:
                    session.rollback()
                    logger.error(f"분류된 데이터 DB 저장 실패: {db_error}")
                    raise db_error
        
        return {
            "success": True, 
            "message": f"데이터 분류 완료 ({len(classified_data)}행)",
            "classified_count": len(classified_data),
            "saved_count": len(classified_data) if classified_data else 0,
            "classified_data": classified_data
        }
        
    except Exception as e:
        logger.error(f"데이터 분류 실패: {e}")
        return {"success": False, "message": f"데이터 분류 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8083,
        reload=True
    )
