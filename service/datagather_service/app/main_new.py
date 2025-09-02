from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

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

def excel_date_to_postgres_date(excel_date):
    """Excel 날짜 숫자를 PostgreSQL date로 변환"""
    if excel_date is None or excel_date == '':
        return None
    
    try:
        from datetime import datetime, timedelta
        # Excel 날짜는 1900년 1월 1일부터의 일수
        # 1900년 1월 1일을 기준으로 날짜 계산
        base_date = datetime(1900, 1, 1)
        if isinstance(excel_date, (int, float)):
            # Excel의 날짜 계산 (1900년 1월 1일 = 1)
            days = int(excel_date) - 1
            result_date = base_date + timedelta(days=days)
            return result_date.strftime('%Y-%m-%d')
        elif isinstance(excel_date, str):
            # 이미 문자열 형태의 날짜인 경우
            return excel_date
        else:
            return None
    except Exception as e:
        logger.warning(f"날짜 변환 실패: {excel_date}, 오류: {e}")
        return None

@app.post("/save-input-data")
async def save_input_data(data: dict):
    """투입물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"투입물 데이터 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        input_data_rows = data.get('data', [])
        
        if not input_data_rows:
            return {"success": False, "message": "저장할 투입물 데이터가 없습니다.", "error": "No input data provided"}
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        # PostgreSQL 전용 엔진 설정
        engine = create_engine(
            database_url,
            pool_pre_ping=True,  # 연결 상태 확인
            pool_recycle=300,    # 5분마다 연결 재생성
            echo=False,          # SQL 로그 비활성화
            connect_args={
                "connect_timeout": 10,  # 연결 타임아웃
                "application_name": "datagather_service"  # 애플리케이션 이름
            }
        )
        
        saved_count = 0
        
        with Session(engine) as session:
            try:
                for row in input_data_rows:
                    try:
                        # 새로운 스키마에 맞게 데이터 처리
                        if row.get('공정') or row.get('투입물명'):
                            # 단위 값 강제로 't'로 설정 (빈 문자열이나 None인 경우)
                            unit_value = row.get('단위', '')
                            if not unit_value or unit_value.strip() == '':
                                unit_value = 't'
                            
                            # AI 추천 답변 처리
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
                            
                            # None 값 제거 (빈 문자열은 유지하되 단위는 't'로 설정)
                            row_data = {k: v for k, v in row_data.items() if v is not None}
                            
                            # 필수 컬럼이 있는지 확인
                            if row_data.get('공정') or row_data.get('투입물명'):
                                cursor = session.execute(text("""
                                    INSERT INTO input_data 
                                    (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                     공정, 투입물명, 수량, 단위, ai추천답변)
                                    VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                            :공정, :투입물명, :수량, :단위, :ai추천답변)
                                """), row_data)
                                
                                saved_count += 1
                                logger.info(f"행 {saved_count} 저장 성공: {row_data.get('공정', '')} - {row_data.get('투입물명', '')} (단위: {row_data.get('단위', '')})")
                            else:
                                logger.warning(f"필수 데이터 부족으로 건너뜀: {row}")
                    
                    except Exception as row_error:
                        logger.error(f"행 데이터 저장 실패: {row_error}")
                        # 개별 행 오류 시에도 계속 진행
                        continue
                
                # 모든 행 처리 후 커밋
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
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        # PostgreSQL 전용 엔진 설정
        engine = create_engine(
            database_url,
            pool_pre_ping=True,  # 연결 상태 확인
            pool_recycle=300,    # 5분마다 연결 재생성
            echo=False,          # SQL 로그 비활성화
            connect_args={
                "connect_timeout": 10,  # 연결 타임아웃
                "application_name": "datagather_service"  # 애플리케이션 이름
            }
        )
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in transport_data:
                    try:
                        # 새로운 스키마에 맞게 데이터 처리
                        transport_record = {
                            '생산품명': row.get('생산품명', ''),
                            '로트번호': row.get('로트번호', ''),
                            '운송물질': row.get('운송물질', ''),
                            '운송수량': float(row.get('운송수량', 0)) if row.get('운송수량') else 0,
                            '운송일자': excel_date_to_postgres_date(row.get('운송일자')),
                            '도착공정': row.get('도착공정', ''),
                            '출발지': row.get('출발지', ''),
                            '이동수단': row.get('이동수단', '')
                        }
                        
                        # None 값 제거
                        transport_record = {k: v for k, v in transport_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO transport_data 
                            (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                             도착공정, 출발지, 이동수단)
                            VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                    :도착공정, :출발지, :이동수단)
                        """), transport_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"운송 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"운송 데이터 DB 저장 완료: {saved_count}행 저장됨")
                return {"success": True, "message": f"운송 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                logger.error(f"운송 데이터 데이터베이스 저장 실패: {db_error}")
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
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        # PostgreSQL 전용 엔진 설정
        engine = create_engine(
            database_url,
            pool_pre_ping=True,  # 연결 상태 확인
            pool_recycle=300,    # 5분마다 연결 재생성
            echo=False,          # SQL 로그 비활성화
            connect_args={
                "connect_timeout": 10,  # 연결 타임아웃
                "application_name": "datagather_service"  # 애플리케이션 이름
            }
        )
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in process_data:
                    try:
                        # 새로운 스키마에 맞게 데이터 처리
                        process_record = {
                            '공정명': row.get('공정명', ''),
                            '공정설명': row.get('공정설명', ''),
                            '공정유형': row.get('공정유형', ''),
                            '공정단계': row.get('공정단계', ''),
                            '공정효율': float(row.get('공정효율', 0)) if row.get('공정효율') else None
                        }
                        
                        # None 값 제거
                        process_record = {k: v for k, v in process_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO process_data 
                            (공정명, 공정설명, 공정유형, 공정단계, 공정효율)
                            VALUES (:공정명, :공정설명, :공정유형, :공정단계, :공정효율)
                        """), process_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"공정 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"공정 데이터 DB 저장 완료: {saved_count}행 저장됨")
                return {"success": True, "message": f"공정 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                logger.error(f"공정 데이터 데이터베이스 저장 실패: {db_error}")
                raise db_error
                
    except Exception as e:
        logger.error(f"공정 데이터 저장 엔드포인트 실패: {e}")
        return {"success": False, "message": f"공정 데이터 저장 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

@app.post("/save-output-data")
async def save_output_data(data: dict):
    """산출물 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"산출물 데이터 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        output_data = data.get('data', [])
        
        if not output_data:
            return {"success": False, "message": "저장할 산출물 데이터가 없습니다.", "error": "No output data provided"}
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        # PostgreSQL 전용 엔진 설정
        engine = create_engine(
            database_url,
            pool_pre_ping=True,  # 연결 상태 확인
            pool_recycle=300,    # 5분마다 연결 재생성
            echo=False,          # SQL 로그 비활성화
            connect_args={
                "connect_timeout": 10,  # 연결 타임아웃
                "application_name": "datagather_service"  # 애플리케이션 이름
            }
        )
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in output_data:
                    try:
                        # 새로운 스키마에 맞게 데이터 처리
                        output_record = {
                            '로트번호': row.get('로트번호', ''),
                            '생산품명': row.get('생산품명', ''),
                            '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                            '투입일': excel_date_to_postgres_date(row.get('투입일')),
                            '종료일': excel_date_to_postgres_date(row.get('종료일')),
                            '공정': row.get('공정', ''),
                            '산출물명': row.get('산출물명', ''),
                            '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                            '단위': row.get('단위', '')
                        }
                        
                        # None 값 제거
                        output_record = {k: v for k, v in output_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO output_data 
                            (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                             공정, 산출물명, 수량, 단위)
                            VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                    :공정, :산출물명, :수량, :단위)
                        """), output_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"산출물 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"산출물 데이터 DB 저장 완료: {saved_count}행 저장됨")
                return {"success": True, "message": f"산출물 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                logger.error(f"산출물 데이터 데이터베이스 저장 실패: {db_error}")
                raise db_error
                
    except Exception as e:
        logger.error(f"산출물 데이터 저장 엔드포인트 실패: {e}")
        return {"success": False, "message": f"산출물 데이터 저장 중 오류가 발생했습니다: {str(e)}", "error": str(e)}

# 입력 데이터 조회 엔드포인트
@app.get("/api/datagather/input-data")
async def get_input_data():
    """실적정보(투입물) 조회"""
    try:
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "datagather_service"
            }
        )
        
        with Session(engine) as session:
            try:
                # input_data 테이블의 모든 데이터 조회
                result = session.execute(text("SELECT * FROM input_data ORDER BY created_at DESC"))
                rows = result.fetchall()
                
                # 결과를 딕셔너리 리스트로 변환
                data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    # datetime 객체를 문자열로 변환
                    for key, value in row_dict.items():
                        if hasattr(value, 'isoformat'):
                            row_dict[key] = value.isoformat()
                    data.append(row_dict)
                
                logger.info(f"실적정보(투입물) 조회 완료: {len(data)}행")
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

# 실적정보(산출물) 조회 엔드포인트
@app.get("/api/datagather/output-data")
async def get_output_data():
    """실적정보(산출물) 조회"""
    try:
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "datagather_service"
            }
        )
        
        with Session(engine) as session:
            try:
                # output_data 테이블의 모든 데이터 조회
                result = session.execute(text("SELECT * FROM output_data ORDER BY created_at DESC"))
                rows = result.fetchall()
                
                # 결과를 딕셔너리 리스트로 변환
                data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    # datetime 객체를 문자열로 변환
                    for key, value in row_dict.items():
                        if hasattr(value, 'isoformat'):
                            row_dict[key] = value.isoformat()
                    data.append(row_dict)
                
                logger.info(f"실적정보(산출물) 조회 완료: {len(data)}행")
                return {
                    "success": True,
                    "message": "실적정보(산출물) 조회 완료",
                    "data": data,
                    "count": len(data)
                }
                
            except Exception as db_error:
                logger.error(f"실적정보(산출물) 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"실적정보(산출물) 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"실적정보(산출물) 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"실적정보(산출물) 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

# 운송 데이터 조회 엔드포인트
@app.get("/api/datagather/transport-data")
async def get_transport_data():
    """운송 데이터 조회"""
    try:
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "datagather_service"
            }
        )
        
        with Session(engine) as session:
            try:
                # transport_data 테이블의 모든 데이터 조회
                result = session.execute(text("SELECT * FROM transport_data ORDER BY created_at DESC"))
                rows = result.fetchall()
                
                # 결과를 딕셔너리 리스트로 변환
                data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    # datetime 객체를 문자열로 변환
                    for key, value in row_dict.items():
                        if hasattr(value, 'isoformat'):
                            row_dict[key] = value.isoformat()
                    data.append(row_dict)
                
                logger.info(f"운송 데이터 조회 완료: {len(data)}행")
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

# 공정 데이터 조회 엔드포인트
@app.get("/api/datagather/process-data")
async def get_process_data():
    """공정 데이터 조회"""
    try:
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "datagather_service"
            }
        )
        
        with Session(engine) as session:
            try:
                # process_data 테이블의 모든 데이터 조회
                result = session.execute(text("SELECT * FROM process_data ORDER BY created_at DESC"))
                rows = result.fetchall()
                
                # 결과를 딕셔너리 리스트로 변환
                data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    # datetime 객체를 문자열로 변환
                    for key, value in row_dict.items():
                        if hasattr(value, 'isoformat'):
                            row_dict[key] = value.isoformat()
                    data.append(row_dict)
                
                logger.info(f"공정 데이터 조회 완료: {len(data)}행")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main_new:app",
        host="0.0.0.0",
        port=8083,
        reload=True
    )
