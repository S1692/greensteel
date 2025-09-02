# ============================================================================
# 🗄️ DataGather Repository - 데이터 수집 리포지토리
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from .datagather_entity import DataGather

class DataGatherRepository:
    """데이터 수집 리포지토리"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data_gather: DataGather) -> DataGather:
        """데이터 수집 엔티티 생성"""
        self.session.add(data_gather)
        await self.session.commit()
        await self.session.refresh(data_gather)
        return data_gather
    
    async def get_by_id(self, data_gather_id: int) -> Optional[DataGather]:
        """ID로 데이터 수집 엔티티 조회"""
        result = await self.session.execute(
            select(DataGather).where(DataGather.id == data_gather_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_install_id(self, install_id: int, limit: int = 100) -> List[DataGather]:
        """사업장 ID로 데이터 수집 엔티티 목록 조회"""
        result = await self.session.execute(
            select(DataGather)
            .where(DataGather.install_id == install_id)
            .order_by(DataGather.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_process_id(self, process_id: int, limit: int = 100) -> List[DataGather]:
        """공정 ID로 데이터 수집 엔티티 목록 조회"""
        result = await self.session.execute(
            select(DataGather)
            .where(DataGather.process_id == process_id)
            .order_by(DataGather.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_data_type(self, data_type: str, limit: int = 100) -> List[DataGather]:
        """데이터 타입으로 데이터 수집 엔티티 목록 조회"""
        result = await self.session.execute(
            select(DataGather)
            .where(DataGather.data_type == data_type)
            .order_by(DataGather.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: str, limit: int = 100) -> List[DataGather]:
        """상태로 데이터 수집 엔티티 목록 조회"""
        result = await self.session.execute(
            select(DataGather)
            .where(DataGather.status == status)
            .order_by(DataGather.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_pending_data(self, limit: int = 100) -> List[DataGather]:
        """처리 대기 중인 데이터 수집 엔티티 목록 조회"""
        result = await self.session.execute(
            select(DataGather)
            .where(DataGather.status == "pending")
            .order_by(DataGather.created_at.asc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update_status(self, data_gather_id: int, status: str, error_message: Optional[str] = None) -> bool:
        """데이터 수집 엔티티 상태 업데이트"""
        try:
            await self.session.execute(
                update(DataGather)
                .where(DataGather.id == data_gather_id)
                .values(
                    status=status,
                    error_message=error_message,
                    processed_at=func.now() if status in ["completed", "failed"] else None
                )
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def update_processed_data(self, data_gather_id: int, processed_data: str) -> bool:
        """처리된 데이터 업데이트"""
        try:
            await self.session.execute(
                update(DataGather)
                .where(DataGather.id == data_gather_id)
                .values(
                    processed_data=processed_data,
                    status="completed",
                    processed_at=func.now()
                )
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete_by_id(self, data_gather_id: int) -> bool:
        """ID로 데이터 수집 엔티티 삭제"""
        try:
            await self.session.execute(
                delete(DataGather).where(DataGather.id == data_gather_id)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete_by_install_id(self, install_id: int) -> bool:
        """사업장 ID로 데이터 수집 엔티티 일괄 삭제"""
        try:
            await self.session.execute(
                delete(DataGather).where(DataGather.install_id == install_id)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def get_statistics(self, install_id: Optional[int] = None) -> Dict[str, Any]:
        """데이터 수집 통계 조회"""
        try:
            # 전체 통계
            total_count = await self.session.execute(select(func.count(DataGather.id)))
            total_count = total_count.scalar()
            
            # 상태별 통계
            status_stats = await self.session.execute(
                select(DataGather.status, func.count(DataGather.id))
                .group_by(DataGather.status)
            )
            status_stats = dict(status_stats.all())
            
            # 데이터 타입별 통계
            type_stats = await self.session.execute(
                select(DataGather.data_type, func.count(DataGather.id))
                .group_by(DataGather.data_type)
            )
            type_stats = dict(type_stats.all())
            
            # 사업장별 통계 (install_id가 지정된 경우)
            if install_id:
                install_stats = await self.session.execute(
                    select(DataGather.status, func.count(DataGather.id))
                    .where(DataGather.install_id == install_id)
                    .group_by(DataGather.status)
                )
                install_stats = dict(install_stats.all())
            else:
                install_stats = {}
            
            return {
                "total_count": total_count,
                "status_stats": status_stats,
                "type_stats": type_stats,
                "install_stats": install_stats
            }
        except Exception:
            return {
                "total_count": 0,
                "status_stats": {},
                "type_stats": {},
                "install_stats": {}
            }
