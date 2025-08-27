from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import logging
from .common.settings import settings

logger = logging.getLogger(__name__)

# 데이터베이스 엔진 생성
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgresql"):
    # PostgreSQL 연결
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DB_ECHO,
        pool_pre_ping=True,
        pool_recycle=300
    )
    logger.info("PostgreSQL 데이터베이스에 연결되었습니다.")
else:
    # SQLite 폴백 (개발용)
    engine = create_engine(
        "sqlite:///./datagather.db",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DB_ECHO
    )
    logger.info("SQLite 데이터베이스에 연결되었습니다.")

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 의존성
def get_db():
    """데이터베이스 세션을 반환하는 의존성 함수"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """데이터베이스 테이블 생성"""
    try:
        from .models import Base
        Base.metadata.create_all(bind=engine)
        logger.info("데이터베이스 테이블이 생성되었습니다.")
    except Exception as e:
        logger.error(f"테이블 생성 실패: {e}")
        raise

def init_db():
    """데이터베이스 초기화"""
    try:
        create_tables()
        logger.info("데이터베이스 초기화가 완료되었습니다.")
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {e}")
        raise
