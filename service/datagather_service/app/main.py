from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# 데이터베이스 및 모델 import
from .database import init_db
from .models import *

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
        
        logger.info(f"받은 데이터 구조: {type(transport_data)}, 길이: {len(transport_data) if transport_data else 0}")
        if transport_data:
            logger.info(f"첫 번째 행 원본 데이터: {transport_data[0]}")
            logger.info(f"첫 번째 행의 모든 키: {list(transport_data[0].keys()) if transport_data[0] else []}")
        
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
                
                for i, row in enumerate(transport_data):
                    try:
                        logger.info(f"행 {i+1} 처리 시작 - 원본 데이터: {row}")
                        
                        # 이미지 칼럼 순서에 맞게 데이터 처리 (Excel 컬럼명에 맞춤)
                        transport_record = {
                            '생산품명': row.get('생산품명', ''),
                            '로트번호': row.get('로트번호', ''),
                            '운송물질': row.get('운송 물질', ''),  # 공백 포함된 컬럼명 사용
                            '운송수량': float(row.get('운송 수량', 0)) if row.get('운송 수량') else 0,  # 공백 포함된 컬럼명 사용
                            '운송일자': excel_date_to_postgres_date(row.get('운송 일자')),  # 공백 포함된 컬럼명 사용
                            '도착공정': row.get('도착 공정', ''),  # 공백 포함된 컬럼명 사용
                            '출발지': row.get('출발지', ''),
                            '이동수단': row.get('이동 수단', ''),  # 공백 포함된 컬럼명 사용
                            '주문처명': row.get('주문처명', ''),
                            '오더번호': row.get('오더번호', '')
                        }
                        
                        logger.info(f"행 {i+1} - 처리된 데이터: {transport_record}")
                        logger.info(f"행 {i+1} - 운송수량 원본값: {row.get('운송 수량')}, 변환된 값: {transport_record['운송수량']}")
                        logger.info(f"행 {i+1} - 운송일자 원본값: {row.get('운송 일자')}, 변환된 값: {transport_record['운송일자']}")
                        logger.info(f"행 {i+1} - 모든 키와 값: {[(k, v) for k, v in row.items()]}")
                        
                        # 필수 필드가 있는지 확인하고 None 값 처리
                        if not transport_record.get('생산품명') or not transport_record.get('로트번호'):
                            logger.warning(f"필수 데이터 부족으로 건너뜀: {row}")
                            continue
                        
                        # None 값 제거 (운송일자는 NULL 허용)
                        transport_record = {k: v for k, v in transport_record.items() if v is not None or k == '운송일자'}
                        
                        # 운송일자가 None인 경우 NULL로 설정
                        if transport_record.get('운송일자') is None:
                            transport_record['운송일자'] = None
                        
                        logger.info(f"행 {i+1} - 최종 저장할 데이터: {transport_record}")
                        
                        cursor = session.execute(text("""
                            INSERT INTO transport_data 
                            (생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 
                             도착공정, 출발지, 이동수단, 주문처명, 오더번호)
                            VALUES (:생산품명, :로트번호, :운송물질, :운송수량, :운송일자,
                                    :도착공정, :출발지, :이동수단, :주문처명, :오더번호)
                        """), transport_record)
                        
                        saved_count += 1
                        logger.info(f"행 {i+1} 저장 성공")
                    
                    except Exception as row_error:
                        logger.error(f"운송 데이터 행 {i+1} 저장 실패: {row_error}")
                        logger.error(f"행 {i+1} 원본 데이터: {row}")
                        continue
                
                session.commit()
                
                # 0행 저장 시 실패로 처리
                if saved_count == 0:
                    logger.error("운송 데이터 저장 실패: 저장된 행이 없습니다")
                    return {"success": False, "message": "운송 데이터 저장에 실패했습니다. 저장된 행이 없습니다.", "saved_count": 0, "filename": filename}
                
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
                            '공정효율': float(row.get('공정효율', 0)) if row.get('공정효율') else 0.0  # 기본값 0.0으로 설정
                        }
                        
                        # 필수 필드 검증
                        if not process_record['공정명']:
                            logger.warn(f"공정명이 비어있는 행 건너뜀: {row}")
                            continue
                        
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
                
                # 0행 저장 시 실패로 처리
                if saved_count == 0:
                    logger.error("공정 데이터 저장 실패: 저장된 행이 없습니다")
                    return {"success": False, "message": "공정 데이터 저장에 실패했습니다. 저장된 행이 없습니다.", "saved_count": 0, "filename": filename}
                
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
                            '단위': row.get('단위', ''),
                            '주문처명': row.get('주문처명', ''),
                            '오더번호': row.get('오더번호', '')
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
                # 테이블 구조 확인을 위한 로깅
                table_info = session.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'input_data' ORDER BY ordinal_position"))
                columns_info = table_info.fetchall()
                logger.info(f"input_data 테이블 컬럼 정보: {columns_info}")
                
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
                
                # 디버깅을 위한 로깅 추가
                if data:
                    logger.info(f"첫 번째 행 데이터: {data[0]}")
                    logger.info(f"투입물명 컬럼 값들: {[row.get('투입물명', 'N/A') for row in data[:5]]}")
                    # 모든 컬럼명 로깅
                    logger.info(f"첫 번째 행의 모든 컬럼명: {list(data[0].keys())}")
                else:
                    logger.info("조회된 데이터가 없습니다.")
                
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
        logger.info("운송 데이터 조회 요청 받음")
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            logger.error("DATABASE_URL 환경변수가 설정되지 않았습니다")
            return {
                "success": False,
                "message": "데이터베이스 연결 정보가 설정되지 않았습니다",
                "error": "DATABASE_URL not set"
            }
        
        logger.info(f"데이터베이스 연결 시도: {database_url[:20]}...")
        
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
                # 테이블 존재 여부 확인
                table_exists = session.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'transport_data'
                    )
                """)).scalar()
                
                if not table_exists:
                    logger.error("transport_data 테이블이 존재하지 않습니다")
                    return {
                        "success": False,
                        "message": "transport_data 테이블이 존재하지 않습니다",
                        "error": "Table not found"
                    }
                
                # 테이블 구조 확인
                table_info = session.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'transport_data' 
                    ORDER BY ordinal_position
                """))
                columns_info = table_info.fetchall()
                logger.info(f"transport_data 테이블 컬럼 정보: {columns_info}")
                
                # transport_data 테이블의 모든 데이터 조회
                result = session.execute(text("SELECT * FROM transport_data ORDER BY created_at DESC"))
                rows = result.fetchall()
                
                logger.info(f"조회된 원시 데이터: {len(rows)}행")
                
                # 결과를 딕셔너리 리스트로 변환
                data = []
                for i, row in enumerate(rows):
                    try:
                        row_dict = dict(row._mapping)
                        # datetime 객체를 문자열로 변환
                        for key, value in row_dict.items():
                            if hasattr(value, 'isoformat'):
                                row_dict[key] = value.isoformat()
                        data.append(row_dict)
                        
                        # 첫 번째 행 로깅
                        if i == 0:
                            logger.info(f"첫 번째 행 데이터: {row_dict}")
                            logger.info(f"첫 번째 행의 모든 컬럼명: {list(row_dict.keys())}")
                    except Exception as row_error:
                        logger.error(f"행 {i} 변환 실패: {row_error}")
                        continue
                
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

@app.post("/save-processed-data")
async def save_processed_data(data: dict):
    """AI 처리된 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"DB 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        input_data_rows = data.get('data', [])
        columns = data.get('columns', [])
        
        if not input_data_rows:
            return {"success": False, "message": "저장할 데이터가 없습니다.", "error": "No data provided"}
        
        from .database import get_db
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine, text
        import os
        from datetime import datetime, timedelta
        
        def excel_date_to_postgres_date(excel_date):
            """Excel 날짜 숫자를 PostgreSQL date로 변환"""
            if excel_date is None or excel_date == '':
                return None
            
            try:
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
        
        # 데이터베이스에 저장
        saved_count = 0
        
        with Session(engine) as session:
            try:
                for row in input_data_rows:
                    try:
                        # input_data 테이블에 저장
                        if row.get('공정') or row.get('투입물명'):
                            # 단위 값 강제로 't'로 설정 (빈 문자열이나 None인 경우)
                            unit_value = row.get('단위', '')
                            if not unit_value or unit_value.strip() == '':
                                unit_value = 't'
                            
                            # AI 추천 답변이 있으면 투입물명을 대체
                            ai_recommendation = row.get('AI추천답변', '')
                            final_input_name = ai_recommendation if ai_recommendation else row.get('투입물명', '')
                            
                            row_data = {
                                '로트번호': row.get('로트번호', ''),
                                '생산품명': row.get('생산품명', ''),
                                '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                '투입일': excel_date_to_postgres_date(row.get('투입일')),
                                '종료일': excel_date_to_postgres_date(row.get('종료일')),
                                '공정': row.get('공정', ''),
                                '투입물명': final_input_name,  # AI 추천 답변으로 대체된 값
                                '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                '단위': unit_value,  # 강제로 't' 설정된 값
                                'source_file': filename,
                                '주문처명': row.get('주문처명', ''),
                                '오더번호': row.get('오더번호', '')
                            }
                            
                            # None 값 제거 (빈 문자열은 유지하되 단위는 't'로 설정)
                            row_data = {k: v for k, v in row_data.items() if v is not None}
                            
                            # 필수 컬럼이 있는지 확인
                            if row_data.get('공정') or row_data.get('투입물명'):
                                cursor = session.execute(text("""
                                    INSERT INTO input_data 
                                    (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                     공정, 투입물명, 수량, 단위, source_file, 주문처명, 오더번호)
                                    VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                            :공정, :투입물명, :수량, :단위, :source_file, :주문처명, :오더번호)
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

@app.post("/classify-data")
async def classify_data(data: dict):
    """데이터를 분류하여 저장하는 엔드포인트"""
    try:
        logger.info("데이터 분류 요청 받음")
        # 데이터 분류 로직 구현
        return {"success": True, "message": "데이터 분류 완료"}
    except Exception as e:
        logger.error(f"데이터 분류 실패: {e}")
        return {"success": False, "message": f"데이터 분류 실패: {str(e)}", "error": str(e)}

@app.delete("/delete-classification")
async def delete_classification(data: dict):
    """데이터 분류를 삭제하는 엔드포인트"""
    try:
        logger.info("데이터 분류 삭제 요청 받음")
        # 데이터 분류 삭제 로직 구현
        return {"success": True, "message": "데이터 분류 삭제 완료"}
    except Exception as e:
        logger.error(f"데이터 분류 삭제 실패: {e}")
        return {"success": False, "message": f"데이터 분류 삭제 실패: {str(e)}", "error": str(e)}

@app.post("/ai-process")
async def ai_process(data: dict):
    """AI 데이터 처리 엔드포인트"""
    try:
        logger.info("AI 데이터 처리 요청 받음")
        
        # 프론트엔드에서 전송된 데이터 추출
        input_data = data.get('data', [])
        if not input_data:
            return {"success": False, "message": "처리할 데이터가 없습니다."}
        
        processed_data = []
        
        for row in input_data:
            try:
                # AI 처리 로직 (기존 로직 유지)
                processed_row = {
                    '로트번호': row.get('로트번호', ''),
                    '생산품명': row.get('생산품명', ''),
                    '생산수량': row.get('생산수량', 0),
                    '투입일': row.get('투입일', ''),
                    '종료일': row.get('종료일', ''),
                    '공정': row.get('공정', ''),
                    '투입물명': row.get('투입물명', ''),
                    '수량': row.get('수량', 0),
                    '단위': row.get('단위', 't'),
                    'AI추천답변': row.get('AI추천답변', ''),
                    '주문처명': row.get('주문처명', ''),
                    '오더번호': row.get('오더번호', '')
                }
                
                # AI 추천 답변이 있으면 투입물명을 대체
                if processed_row['AI추천답변']:
                    processed_row['투입물명'] = processed_row['AI추천답변']
                
                processed_data.append(processed_row)
                
            except Exception as row_error:
                logger.error(f"행 처리 실패: {row_error}")
                continue
        
        logger.info(f"AI 처리 완료: {len(processed_data)}행 처리됨")
        return {
            "success": True, 
            "message": f"AI 처리 완료 ({len(processed_data)}행)",
            "processed_data": processed_data
        }
        
    except Exception as e:
        logger.error(f"AI 처리 실패: {e}")
        return {
            "success": False, 
            "message": f"AI 처리 중 오류가 발생했습니다: {str(e)}",
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
