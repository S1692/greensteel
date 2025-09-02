# ============================================================================
# 🗄️ Database - 데이터베이스 연결 및 설정
# ============================================================================

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
import os

from .config import Settings

# 전역 Base 클래스
Base = declarative_base()

class Database:
    """데이터베이스 연결 관리 클래스"""
    
    def __init__(self):
        self.settings = Settings()
        self.engine = None
        self.async_session_maker = None
    
    async def init_db(self):
        """데이터베이스 초기화"""
        try:
            # 비동기 엔진 생성
            self.engine = create_async_engine(
                self.settings.database_url,
                echo=self.settings.db_echo,
                poolclass=NullPool,
                pool_pre_ping=True
            )
            
            # 비동기 세션 메이커 생성
            self.async_session_maker = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            print("✅ 데이터베이스 연결이 성공적으로 초기화되었습니다.")
            
        except Exception as e:
            print(f"❌ 데이터베이스 연결 초기화 실패: {e}")
            raise
    
    async def close_db(self):
        """데이터베이스 연결 종료"""
        if self.engine:
            await self.engine.dispose()
            print("✅ 데이터베이스 연결이 종료되었습니다.")
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """데이터베이스 세션 생성"""
        if not self.async_session_maker:
            raise RuntimeError("데이터베이스가 초기화되지 않았습니다.")
        
        async with self.async_session_maker() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def create_tables(self):
        """테이블 생성"""
        if not self.engine:
            raise RuntimeError("데이터베이스가 초기화되지 않았습니다.")
        
        try:
            # 도메인 엔티티들을 import하여 테이블 생성
            from ..domain.datagather.datagather_entity import DataGather
            from ..domain.process.process_entity import Process
            from ..domain.install.install_entity import Install
            
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            print("✅ 모든 테이블이 성공적으로 생성되었습니다.")
            
        except Exception as e:
            print(f"❌ 테이블 생성 실패: {e}")
            raise
    
    async def drop_tables(self):
        """테이블 삭제"""
        if not self.engine:
            raise RuntimeError("데이터베이스가 초기화되지 않았습니다.")
        
        try:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            
            print("✅ 모든 테이블이 성공적으로 삭제되었습니다.")
            
        except Exception as e:
            print(f"❌ 테이블 삭제 실패: {e}")
            raise
    
    async def health_check(self) -> bool:
        """데이터베이스 연결 상태 확인"""
        if not self.engine:
            return False
        
        try:
            async with self.engine.begin() as conn:
                await conn.execute("SELECT 1")
            return True
        except Exception:
            return False

# 전역 데이터베이스 인스턴스
database = Database()
