# ============================================================================
# 🏗️ DataGather Repository - 데이터 접근 계층
# ============================================================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from .input_data_entity import InputData

class DataGatherRepository:
    """데이터 수집 리포지토리"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data_gather: InputData) -> InputData:
        """데이터 수집 생성"""
        self.session.add(data_gather)
        await self.session.commit()
        await self.session.refresh(data_gather)
        return data_gather
    
    async def get_by_id(self, data_gather_id: int) -> Optional[InputData]:
        """ID로 데이터 수집 조회"""
        result = await self.session.execute(
            text("SELECT * FROM input_data WHERE id = :id"),
            {"id": data_gather_id}
        )
        row = result.fetchone()
        if row:
            return InputData(**dict(row._mapping))
        return None
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[InputData]:
        """모든 데이터 수집 조회"""
        result = await self.session.execute(
            text("SELECT * FROM input_data ORDER BY created_at DESC LIMIT :limit OFFSET :offset"),
            {"limit": limit, "offset": offset}
        )
        rows = result.fetchall()
        return [InputData(**dict(row._mapping)) for row in rows]
    
    async def get_by_install_id(self, install_id: int) -> List[InputData]:
        """사업장 ID로 데이터 수집 조회"""
        result = await self.session.execute(
            text("SELECT * FROM input_data WHERE source_file LIKE :pattern ORDER BY created_at DESC"),
            {"pattern": f"%install_{install_id}%"}
        )
        rows = result.fetchall()
        return [InputData(**dict(row._mapping)) for row in rows]
    
    async def update_status(self, data_gather_id: int, status: str, error_message: Optional[str] = None) -> bool:
        """상태 업데이트"""
        try:
            await self.session.execute(
                text("UPDATE input_data SET updated_at = NOW() WHERE id = :id"),
                {"id": data_gather_id}
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete(self, data_gather_id: int) -> bool:
        """데이터 수집 삭제"""
        try:
            await self.session.execute(
                text("DELETE FROM input_data WHERE id = :id"),
                {"id": data_gather_id}
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False