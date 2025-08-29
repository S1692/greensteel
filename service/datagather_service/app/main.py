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

# DB 저장 엔드포인트
@app.post("/save-processed-data")
async def save_processed_data(data: dict):
    """AI 처리된 데이터를 데이터베이스에 저장"""
    try:
        logger.info(f"DB 저장 요청 받음: {data.get('filename', 'unknown')}")
        filename = data.get('filename', '')
        input_data = data.get('data', [])
        columns = data.get('columns', [])
        
        if not input_data:
            return {"success": False, "message": "저장할 데이터가 없습니다.", "error": "No data provided"}
        
        from .database import get_db
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine
        import os
        
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway")
        engine = create_engine(database_url)
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in input_data:
                    try:
                        # datagather_input 테이블에 저장
                        if row.get('공정') or row.get('투입물명'):
                            input_data = {
                                'lot_number': row.get('로트번호', ''),
                                'product_name': row.get('생산품명', ''),
                                'production_quantity': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                'input_date': row.get('입고일', None),
                                'end_date': row.get('출고일', None),
                                'process_name': row.get('공정', ''),
                                'input_material': row.get('투입물명', ''),
                                'quantity': float(row.get('수량', 0)) if row.get('수량') else 0,
                                'unit': row.get('단위', ''),
                                'ai_recommendation': row.get('AI추천답변', ''),
                                'source_file': filename
                            }
                            
                            # None 값 제거
                            input_data = {k: v for k, v in input_data.items() if v is not None}
                            
                            cursor = session.execute("""
                                INSERT INTO datagather_input 
                                (lot_number, product_name, production_quantity, input_date, end_date, 
                                 process_name, input_material, quantity, unit, ai_recommendation, source_file)
                                VALUES (:lot_number, :product_name, :production_quantity, :input_date, :end_date,
                                        :process_name, :input_material, :quantity, :unit, :ai_recommendation, :source_file)
                            """, input_data)
                            
                            saved_count += 1
                    
                    except Exception as row_error:
                        logger.error(f"행 데이터 저장 실패: {row_error}")
                        continue
                
                session.commit()
                logger.info(f"DB 저장 완료: {saved_count}행 저장됨")
                return {"success": True, "message": f"데이터베이스에 성공적으로 저장되었습니다. ({saved_count}행)", "saved_count": saved_count, "filename": filename}
                
            except Exception as db_error:
                session.rollback()
                logger.error(f"데이터베이스 저장 실패: {db_error}")
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
        from sqlalchemy import create_engine
        import os
        
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway")
        engine = create_engine(database_url)
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in transport_data:
                    try:
                        transport_record = {
                            'transport_date': row.get('운송일자', None),
                            'departure_location': row.get('출발지', ''),
                            'arrival_location': row.get('도착지', ''),
                            'transport_mode': row.get('운송수단', ''),
                            'transport_distance': float(row.get('운송거리', 0)) if row.get('운송거리') else 0,
                            'transport_cost': float(row.get('운송비용', 0)) if row.get('운송비용') else 0,
                            'transport_volume': float(row.get('운송량', 0)) if row.get('운송량') else 0,
                            'unit': row.get('단위', ''),
                            'source_file': filename
                        }
                        
                        # None 값 제거
                        transport_record = {k: v for k, v in transport_record.items() if v is not None}
                        
                        cursor = session.execute("""
                            INSERT INTO datagather_transport 
                            (transport_date, departure_location, arrival_location, transport_mode, 
                             transport_distance, transport_cost, transport_volume, unit, source_file)
                            VALUES (:transport_date, :departure_location, :arrival_location, :transport_mode,
                                    :transport_distance, :transport_cost, :transport_volume, :unit, :source_file)
                        """, transport_record)
                        
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
        from sqlalchemy import create_engine
        import os
        
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway")
        engine = create_engine(database_url)
        
        with Session(engine) as session:
            try:
                session.begin()
                saved_count = 0
                
                for row in process_data:
                    try:
                        process_record = {
                            'process_name': row.get('공정명', ''),
                            'process_description': row.get('공정설명', ''),
                            'process_type': row.get('공정유형', ''),
                            'process_stage': row.get('공정단계', ''),
                            'process_efficiency': float(row.get('공정효율', 0)) if row.get('공정효율') else 0,
                            'source_file': filename
                        }
                        
                        # None 값 제거
                        process_record = {k: v for k, v in process_record.items() if v is not None}
                        
                        cursor = session.execute("""
                            INSERT INTO datagather_process 
                            (process_name, process_description, process_type, process_stage, process_efficiency, source_file)
                            VALUES (:process_name, :process_description, :process_type, :process_stage, :process_efficiency, :source_file)
                        """, process_record)
                        
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
