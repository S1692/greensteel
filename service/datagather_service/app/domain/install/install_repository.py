# ============================================================================
# 🏢 Install Repository - 사업장 리포지토리
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from .install_entity import Install

class InstallRepository:
    """사업장 리포지토리"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, install: Install) -> Install:
        """사업장 엔티티 생성"""
        self.session.add(install)
        await self.session.commit()
        await self.session.refresh(install)
        return install
    
    async def get_by_id(self, install_id: int) -> Optional[Install]:
        """ID로 사업장 엔티티 조회"""
        result = await self.session.execute(
            select(Install).where(Install.id == install_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, install_name: str, limit: int = 100) -> List[Install]:
        """사업장명으로 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .where(Install.install_name.ilike(f"%{install_name}%"))
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_company(self, company_name: str, limit: int = 100) -> List[Install]:
        """회사명으로 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .where(Install.company_name.ilike(f"%{company_name}%"))
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_region(self, region: str, limit: int = 100) -> List[Install]:
        """지역으로 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .where(Install.region.ilike(f"%{region}%"))
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: str, limit: int = 100) -> List[Install]:
        """상태로 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .where(Install.status == status)
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_active_installs(self, limit: int = 100) -> List[Install]:
        """활성 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .where(Install.is_active == "Y")
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_all(self, limit: int = 100) -> List[Install]:
        """모든 사업장 엔티티 목록 조회"""
        result = await self.session.execute(
            select(Install)
            .order_by(Install.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update(self, install_id: int, update_data: Dict[str, Any]) -> bool:
        """사업장 엔티티 업데이트"""
        try:
            await self.session.execute(
                update(Install)
                .where(Install.id == install_id)
                .values(**update_data)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def update_status(self, install_id: int, status: str) -> bool:
        """사업장 상태 업데이트"""
        try:
            await self.session.execute(
                update(Install)
                .where(Install.id == install_id)
                .values(status=status)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def delete_by_id(self, install_id: int) -> bool:
        """ID로 사업장 엔티티 삭제"""
        try:
            await self.session.execute(
                delete(Install).where(Install.id == install_id)
            )
            await self.session.commit()
            return True
        except Exception:
            await self.session.rollback()
            return False
    
    async def get_statistics(self) -> Dict[str, Any]:
        """사업장 통계 조회"""
        try:
            # 전체 통계
            total_count = await self.session.execute(select(func.count(Install.id)))
            total_count = total_count.scalar()
            
            # 상태별 통계
            status_stats = await self.session.execute(
                select(Install.status, func.count(Install.id))
                .group_by(Install.status)
            )
            status_stats = dict(status_stats.all())
            
            # 지역별 통계
            region_stats = await self.session.execute(
                select(Install.region, func.count(Install.id))
                .group_by(Install.region)
            )
            region_stats = dict(region_stats.all())
            
            # 회사별 통계
            company_stats = await self.session.execute(
                select(Install.company_name, func.count(Install.id))
                .group_by(Install.company_name)
            )
            company_stats = dict(company_stats.all())
            
            return {
                "total_count": total_count,
                "status_stats": status_stats,
                "region_stats": region_stats,
                "company_stats": company_stats
            }
        except Exception:
            return {
                "total_count": 0,
                "status_stats": {},
                "region_stats": {},
                "company_stats": {}
            }
