# ============================================================================
# 🏢 Install Service - 사업장 서비스
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from .install_entity import Install
from .install_repository import InstallRepository

class InstallService:
    """사업장 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = InstallRepository(session)
    
    async def create_install(
        self,
        install_name: str,
        company_name: str,
        address: Optional[str] = None,
        region: Optional[str] = None,
        country: Optional[str] = None,
        contact_person: Optional[str] = None,
        contact_email: Optional[str] = None,
        contact_phone: Optional[str] = None,
        industry_type: Optional[str] = None,
        size_category: Optional[str] = None,
        established_date: Optional[str] = None,
        tags: Optional[str] = None,
        metadata: Optional[str] = None
    ) -> Install:
        """사업장 엔티티 생성"""
        
        # 엔티티 생성
        install = Install(
            install_name=install_name,
            company_name=company_name,
            address=address,
            region=region,
            country=country,
            contact_person=contact_person,
            contact_email=contact_email,
            contact_phone=contact_phone,
            industry_type=industry_type,
            size_category=size_category,
            established_date=established_date,
            tags=tags,
            metadata=metadata
        )
        
        return await self.repository.create(install)
    
    async def get_install_by_id(self, install_id: int) -> Optional[Install]:
        """ID로 사업장 엔티티 조회"""
        return await self.repository.get_by_id(install_id)
    
    async def get_installs_by_name(
        self, 
        install_name: str, 
        limit: int = 100
    ) -> List[Install]:
        """사업장명으로 사업장 엔티티 목록 조회"""
        return await self.repository.get_by_name(install_name, limit)
    
    async def get_installs_by_company(
        self, 
        company_name: str, 
        limit: int = 100
    ) -> List[Install]:
        """회사명으로 사업장 엔티티 목록 조회"""
        return await self.repository.get_by_company(company_name, limit)
    
    async def get_installs_by_region(
        self, 
        region: str, 
        limit: int = 100
    ) -> List[Install]:
        """지역으로 사업장 엔티티 목록 조회"""
        return await self.repository.get_by_region(region, limit)
    
    async def get_active_installs(self, limit: int = 100) -> List[Install]:
        """활성 사업장 엔티티 목록 조회"""
        return await self.repository.get_active_installs(limit)
    
    async def get_all_installs(self, limit: int = 100) -> List[Install]:
        """모든 사업장 엔티티 목록 조회"""
        return await self.repository.get_all(limit)
    
    async def update_install(
        self,
        install_id: int,
        update_data: Dict[str, Any]
    ) -> bool:
        """사업장 엔티티 업데이트"""
        return await self.repository.update(install_id, update_data)
    
    async def update_install_status(
        self,
        install_id: int,
        status: str
    ) -> bool:
        """사업장 상태 업데이트"""
        return await self.repository.update_status(install_id, status)
    
    async def delete_install(self, install_id: int) -> bool:
        """사업장 엔티티 삭제"""
        return await self.repository.delete_by_id(install_id)
    
    async def get_install_statistics(self) -> Dict[str, Any]:
        """사업장 통계 조회"""
        return await self.repository.get_statistics()
    
    async def validate_install_data(
        self, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """사업장 데이터 형식 검증"""
        
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        # 필수 필드 검증
        required_fields = ["install_name", "company_name"]
        for field in required_fields:
            if field not in data or not data[field]:
                validation_result["is_valid"] = False
                validation_result["errors"].append(f"필수 필드 누락: {field}")
        
        # 사업장명 길이 검증
        if "install_name" in data and len(data["install_name"]) > 255:
            validation_result["is_valid"] = False
            validation_result["errors"].append("사업장명이 너무 깁니다 (최대 255자)")
        
        # 회사명 길이 검증
        if "company_name" in data and len(data["company_name"]) > 255:
            validation_result["is_valid"] = False
            validation_result["errors"].append("회사명이 너무 깁니다 (최대 255자)")
        
        # 이메일 형식 검증
        if "contact_email" in data and data["contact_email"]:
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data["contact_email"]):
                validation_result["warnings"].append("이메일 형식이 올바르지 않습니다")
        
        # 전화번호 형식 검증
        if "contact_phone" in data and data["contact_phone"]:
            phone_pattern = r'^[\+]?[0-9\s\-\(\)]{10,}$'
            if not re.match(phone_pattern, data["contact_phone"]):
                validation_result["warnings"].append("전화번호 형식이 올바르지 않습니다")
        
        return validation_result
