# ============================================================================
# 🗄️ Process Repository - 공정 리포지토리
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from .process_entity import Process

class ProcessRepository:
    """공정 리포지토리"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, process: Process) -> Process:
        """공정 엔티티 생성"""
        self.session.add(process)
        await self.session.commit()
        await self.session.refresh(process)
        return process
    
    async def get_by_id(self, process_id: int) -> Optional[Process]:
        """ID로 공정 엔티티 조회"""
        result = await self.session.execute(
            select(Process).where(Process.id == process_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_install_id(self, install_id: int, limit: int = 100) -> List[Process]:
        """사업장 ID로 공정 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Process)
            .where(Process.install_id == install_id)
            .order_by(Process.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_name(self, process_name: str, limit: int = 100) -> List[Process]:
        """공정명으로 공정 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Process)
            .where(Process.process_name.ilike(f"%{process_name}%"))
            .order_by(Process.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_type(self, process_type: str, limit: int = 100) -> List[Process]:
        """공정 타입으로 공정 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Process)
            .where(Process.process_type == process_type)
            .order_by(Process.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: str, limit: int = 100) -> List[Process]:
        """상태로 공정 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Process)
            .where(Process.status == status)
            .order_by(Process.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_active_processes(self, limit: int = 100) -> List[Process]:
        """활성 공정 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Process)
            .where(Process.is_active == "Y")
            .order_by(Process.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update(self, process_id: int, update_data: Dict[str, Any]) -> bool:
        """공정 엔티티 업데이트"""
        try:
            await self.session.execute(
                update(Process)
                .where(Process.id == process_id)
                .values(**update_data)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def update_status(self, process_id: int, status: str) -> bool:
        """공정 상태 업데이트"""
        try:
            await self.session.execute(
                update(Process)
                .where(Process.id == process_id)
                .values(status=status)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete_by_id(self, process_id: int) -> bool:
        """ID로 공정 엔티티 삭제"""
        try:
            await self.session.execute(
                delete(Process).where(Process.id == process_id)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete_by_install_id(self, install_id: int) -> bool:
        """사업장 ID로 공정 엔티티 일괄 삭제"""
        try:
            await self.session.execute(
                delete(Process).where(Process.install_id == install_id)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def get_statistics(self, install_id: Optional[int] = None) -> Dict[str, Any]:
        """공정 통계 조회"""
        try:
            # 전체 통계
            total_count = await self.session.execute(select(func.count(Process.id)))
            total_count = total_count.scalar()
            
            # 상태별 통계
            status_stats = await self.session.execute(
                select(Process.status, func.count(Process.id))
                .group_by(Process.status)
            )
            status_stats = dict(status_stats.all())
            
            # 공정 타입별 통계
            type_stats = await self.session.execute(
                select(Process.process_type, func.count(Process.id))
                .group_by(Process.process_type)
            )
            type_stats = dict(type_stats.all())
            
            # 사업장별 통계 (install_id가 지정된 경우)
            if install_id:
                install_stats = await self.session.execute(
                    select(Process.status, func.count(Process.id))
                    .where(Process.install_id == install_id)
                    .group_by(Process.status)
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
