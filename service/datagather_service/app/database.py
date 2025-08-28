import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

# 데이터베이스 URL 환경변수에서 가져오기
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/greensteel")

try:
    # 엔진 생성
    engine = create_engine(DATABASE_URL, echo=False)
    
    # 세션 팩토리 생성
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # 베이스 클래스 생성
    Base = declarative_base()
    
    logger.info("✅ 데이터베이스 연결 성공")
    
except Exception as e:
    logger.error(f"❌ 데이터베이스 연결 실패: {e}")
    engine = None
    SessionLocal = None
    Base = None

def get_db():
    """데이터베이스 세션 생성"""
    if SessionLocal is None:
        raise Exception("데이터베이스 연결이 설정되지 않았습니다")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """데이터베이스 초기화"""
    if Base is None:
        logger.warning("데이터베이스 연결이 설정되지 않아 초기화를 건너뜁니다")
        return
    
    try:
        # 테이블 생성
        Base.metadata.create_all(bind=engine)
        logger.info("✅ 데이터베이스 테이블 생성 완료")
    except Exception as e:
        logger.error(f"❌ 데이터베이스 테이블 생성 실패: {e}")
