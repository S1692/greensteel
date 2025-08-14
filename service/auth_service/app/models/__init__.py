from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from .user import Base, User
from ..core.settings import settings
from ..core.logger import auth_logger

# 데이터베이스 엔진 생성
def create_database_engine():
    """데이터베이스 엔진 생성"""
    try:
        database_url = settings.database_url
        
        # SQLite인 경우 연결 풀 비활성화 (개발용)
        if database_url.startswith("sqlite"):
            engine = create_engine(
                database_url,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
                echo=False
            )
            auth_logger.info("SQLite database engine created (development mode)")
        else:
            # PostgreSQL인 경우
            engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=300,
                echo=False
            )
            auth_logger.info("PostgreSQL database engine created")
        
        return engine
    except Exception as e:
        auth_logger.error(f"Database engine creation failed: {str(e)}")
        raise

# 데이터베이스 엔진 생성
engine = create_database_engine()

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """데이터베이스 테이블 생성"""
    try:
        Base.metadata.create_all(bind=engine)
        auth_logger.info("Database tables created successfully")
    except Exception as e:
        auth_logger.error(f"Table creation failed: {str(e)}")
        raise

def drop_tables():
    """데이터베이스 테이블 삭제 (개발용)"""
    try:
        Base.metadata.drop_all(bind=engine)
        auth_logger.info("Database tables dropped successfully")
    except Exception as e:
        auth_logger.error(f"Table drop failed: {str(e)}")
        raise

# 모델들을 한 곳에서 import할 수 있도록
__all__ = ["User", "Base", "engine", "SessionLocal", "get_db", "create_tables", "drop_tables"]
