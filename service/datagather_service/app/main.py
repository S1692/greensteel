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
        
        # AI 추천 답변 생성 (규칙 기반)
        def generate_ai_recommendation(row: dict) -> str:
            """규칙 기반 AI 추천 답변 생성"""
            공정 = row.get('공정', '').lower()
            투입물명 = row.get('투입물명', '').lower()
            수량 = row.get('수량', 0)
            단위 = row.get('단위', '')
            
            # 공정별 추천 로직
            if '코크스' in 공정:
                if '석탄' in 투입물명:
                    return f"코크스 제조 공정에 적합한 석탄 사용. 수량: {수량} {단위}"
                else:
                    return f"코크스 공정에 적합한 원료 선택 필요. 현재: {투입물명}"
            
            elif '소결' in 공정:
                if '철광석' in 투입물명 or '광석' in 투입물명:
                    return f"소결 공정에 적합한 철광석 사용. 수량: {수량} {단위}"
                else:
                    return f"소결 공정에 적합한 원료 선택 필요. 현재: {투입물명}"
            
            elif '제철' in 공정:
                if '코크스' in 투입물명 or '석탄' in 투입물명:
                    return f"제철 공정에 적합한 연료 사용. 수량: {수량} {단위}"
                else:
                    return f"제철 공정에 적합한 연료 선택 필요. 현재: {투입물명}"
            
            elif '제강' in 공정:
                if '산소' in 투입물명 or '가스' in 투입물명:
                    return f"제강 공정에 적합한 산화제 사용. 수량: {수량} {단위}"
                else:
                    return f"제강 공정에 적합한 산화제 선택 필요. 현재: {투입물명}"
            
            elif '압연' in 공정:
                if '전기' in 투입물명 or '에너지' in 투입물명:
                    return f"압연 공정에 적합한 에너지 사용. 수량: {수량} {단위}"
                else:
                    return f"압연 공정에 적합한 에너지 선택 필요. 현재: {투입물명}"
            
            else:
                return f"일반 공정. 원료: {투입물명}, 수량: {수량} {단위}"
        
        # 각 행에 AI 추천 답변 추가
        processed_data = []
        for row in input_data:
            processed_row = row.copy()
            processed_row['AI추천답변'] = generate_ai_recommendation(row)
            processed_data.append(processed_row)
        
        logger.info(f"AI 처리 완료: {len(processed_data)}행 처리됨")
        
        return {
            "success": True,
            "message": "AI 처리가 완료되었습니다.",
            "data": processed_data,
            "columns": columns,
            "total_rows": len(input_data),
            "processed_rows": len(processed_data)
        }
        
    except Exception as e:
        logger.error(f"AI 처리 스트리밍 실패: {e}")
        return {
            "success": False,
            "message": f"AI 처리 중 오류가 발생했습니다: {str(e)}",
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
                            
                            row_data = {
                                '로트번호': row.get('로트번호', ''),
                                '생산품명': row.get('생산품명', ''),
                                '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                '투입일': excel_date_to_postgres_date(row.get('투입일')),
                                '종료일': excel_date_to_postgres_date(row.get('종료일')),
                                '공정': row.get('공정', ''),
                                '투입물명': row.get('투입물명', ''),
                                '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                '단위': unit_value,  # 강제로 't' 설정된 값
                                'source_file': filename
                            }
                            
                            # None 값 제거 (빈 문자열은 유지하되 단위는 't'로 설정)
                            row_data = {k: v for k, v in row_data.items() if v is not None}
                            
                            # 필수 컬럼이 있는지 확인
                            if row_data.get('공정') or row_data.get('투입물명'):
                                cursor = session.execute(text("""
                                    INSERT INTO input_data 
                                    (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                     공정, 투입물명, 수량, 단위, source_file)
                                    VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                            :공정, :투입물명, :수량, :단위, :source_file)
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
        
        from .database import get_db
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine, text
        import os
        
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
                        transport_record = {
                            '생산품명': row.get('생산품명', ''),
                            '로트번호': row.get('로트번호', ''),
                            '운송_물질': row.get('운송 물질', ''),
                            '운송_수량': float(row.get('운송 수량', 0)) if row.get('운송 수량') else 0,
                            '운송_일자': row.get('운송 일자', None),
                            '도착_공정': row.get('도착 공정', ''),
                            '출발지': row.get('출발지', ''),
                            '이동_수단': row.get('이동 수단', ''),
                            'source_file': filename
                        }
                        
                        # None 값 제거
                        transport_record = {k: v for k, v in transport_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO transport_data 
                            (생산품명, 로트번호, 운송_물질, 운송_수량, 운송_일자, 
                             도착_공정, 출발지, 이동_수단, source_file)
                            VALUES (:생산품명, :로트번호, :운송_물질, :운송_수량, :운송_일자,
                                    :도착_공정, :출발지, :이동_수단, :source_file)
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
        
        from .database import get_db
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine, text
        import os
        
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
                        process_record = {
                            '공정명': row.get('공정명', ''),
                            '생산제품': row.get('생산제품', ''),
                            '세부공정': row.get('세부공정', ''),
                            '공정_설명': row.get('공정 설명', ''),
                            'source_file': filename
                        }
                        
                        # None 값 제거
                        process_record = {k: v for k, v in process_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO process_data 
                            (공정명, 생산제품, 세부공정, 공정_설명, source_file)
                            VALUES (:공정명, :생산제품, :세부공정, :공정_설명, :source_file)
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
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in output_data:
                    try:
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
                            'source_file': filename
                        }
                        
                        # None 값 제거
                        output_record = {k: v for k, v in output_record.items() if v is not None}
                        
                        cursor = session.execute(text("""
                            INSERT INTO output_data 
                            (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                             공정, 산출물명, 수량, 단위, source_file)
                            VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                    :공정, :산출물명, :수량, :단위, :source_file)
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

# 분류 데이터 저장 엔드포인트
@app.post("/classify-data")
async def classify_data(data: dict):
    """선택된 데이터를 분류별로 저장하는 엔드포인트"""
    try:
        logger.info(f"분류 데이터 저장 요청 받음: {data.get('classification', 'unknown')}")
        
        # 요청 데이터 추출
        classification = data.get('classification')
        classification_data = data.get('data', [])
        
        if not classification or not classification_data:
            return {
                "success": False,
                "message": "분류 정보 또는 데이터가 없습니다.",
                "error": "Missing classification or data"
            }
        
        if not isinstance(classification_data, list):
            return {
                "success": False,
                "message": "데이터 형식이 올바르지 않습니다.",
                "error": "Data must be a list"
            }
        
        # 분류별 테이블명 매핑
        table_mapping = {
            '연료': 'fuel_data',
            '유틸리티': 'utility_data',
            '폐기물': 'waste_data',
            '공정 생산품': 'process_product_data'
        }
        
        if classification not in table_mapping:
            return {
                "success": False,
                "message": f"지원하지 않는 분류입니다: {classification}",
                "error": f"Unsupported classification: {classification}"
            }
        
        target_table = table_mapping[classification]
        
        # PostgreSQL Railway 데이터베이스 연결 설정
        database_url = os.getenv("DATABASE_URL")
        
        # PostgreSQL 전용 엔진 설정
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
                session.begin()
                saved_count = 0
                
                for row in classification_data:
                    try:
                        # 공통 필드 준비
                        common_record = {
                            '로트번호': row.get('로트번호', ''),
                            '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                            '투입일': excel_date_to_postgres_date(row.get('투입일')),
                            '종료일': excel_date_to_postgres_date(row.get('종료일')),
                            '공정': row.get('공정', ''),
                            '투입물명': row.get('투입물명', ''),
                            '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                            '단위': row.get('단위', 't') if row.get('단위') else 't',
                            '분류': classification,
                            'source_table': row.get('source_table', ''),
                            'source_id': row.get('source_id', ''),
                            'created_at': datetime.now().isoformat()
                        }
                        
                        # None 값 제거
                        common_record = {k: v for k, v in common_record.items() if v is not None}
                        
                        # 분류별 테이블에 데이터 삽입
                        if classification == '연료':
                            cursor = session.execute(text("""
                                INSERT INTO fuel_data 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, source_table, source_id, created_at)
                                VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :source_table, :source_id, :created_at)
                            """), common_record)
                        
                        elif classification == '유틸리티':
                            cursor = session.execute(text("""
                                INSERT INTO utility_data 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, source_table, source_id, created_at)
                                VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :source_table, :source_id, :created_at)
                            """), common_record)
                        
                        elif classification == '폐기물':
                            cursor = session.execute(text("""
                                INSERT INTO waste_data 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, source_table, source_id, created_at)
                                VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :source_table, :source_id, :created_at)
                            """), common_record)
                        
                        elif classification == '공정 생산품':
                            cursor = session.execute(text("""
                                INSERT INTO process_product_data 
                                (로트번호, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, 분류, source_table, source_id, created_at)
                                VALUES (:로트번호, :생산수량, :투입일, :종료일, :공정, :투입물명, :수량, :단위, :분류, :source_table, :source_id, :created_at)
                            """), common_record)
                        
                        saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"분류 데이터 행 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"분류 데이터 DB 저장 완료: {saved_count}행 저장됨 (테이블: {target_table})")
                return {
                    "success": True, 
                    "message": f"{classification} 분류 데이터가 성공적으로 저장되었습니다. ({saved_count}행)", 
                    "saved_count": saved_count, 
                    "classification": classification,
                    "target_table": target_table
                }
                
            except Exception as db_error:
                session.rollback()
                logger.error(f"분류 데이터 데이터베이스 저장 실패: {db_error}")
                raise db_error
                
    except Exception as e:
        logger.error(f"분류 데이터 저장 엔드포인트 실패: {e}")
        return {
            "success": False, 
            "message": f"분류 데이터 저장 중 오류가 발생했습니다: {str(e)}", 
            "error": str(e)
        }

# 분류 데이터 조회 엔드포인트
@app.get("/classified-data/{classification}")
async def get_classified_data(classification: str):
    """특정 분류의 데이터를 조회하는 엔드포인트"""
    try:
        # 분류별 테이블명 매핑
        table_mapping = {
            '연료': 'fuel_data',
            '유틸리티': 'utility_data',
            '폐기물': 'waste_data',
            '공정 생산품': 'process_product_data'
        }
        
        if classification not in table_mapping:
            return {
                "success": False,
                "message": f"지원하지 않는 분류입니다: {classification}",
                "error": f"Unsupported classification: {classification}"
            }
        
        target_table = table_mapping[classification]
        
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
                # 해당 분류 테이블의 모든 데이터 조회
                result = session.execute(text(f"SELECT * FROM {target_table} ORDER BY created_at DESC"))
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
                
                logger.info(f"{classification} 분류 데이터 조회 완료: {len(data)}행")
                return {
                    "success": True,
                    "message": f"{classification} 분류 데이터 조회 완료",
                    "data": data,
                    "count": len(data),
                    "classification": classification
                }
                
            except Exception as db_error:
                logger.error(f"{classification} 분류 데이터 조회 실패: {db_error}")
                return {
                    "success": False,
                    "message": f"{classification} 분류 데이터 조회 중 오류가 발생했습니다: {str(db_error)}",
                    "error": str(db_error)
                }
                
    except Exception as e:
        logger.error(f"분류 데이터 조회 엔드포인트 실패: {e}")
        return {
            "success": False,
            "message": f"분류 데이터 조회 중 오류가 발생했습니다: {str(e)}",
            "error": str(e)
        }

# 입력 데   이터 조회 엔드포인트
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
