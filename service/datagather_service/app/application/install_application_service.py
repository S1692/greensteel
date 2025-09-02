# ============================================================================
# 🏢 Install Application Service - 사업장 애플리케이션 서비스
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.install import InstallService

class InstallApplicationService:
    """사업장 애플리케이션 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.install_service = InstallService(session)
    
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
    ) -> Dict[str, Any]:
        """사업장 생성"""
        try:
            # 데이터 검증
            install_data = {
                "install_name": install_name,
                "company_name": company_name,
                "address": address,
                "region": region,
                "country": country,
                "contact_person": contact_person,
                "contact_email": contact_email,
                "contact_phone": contact_phone,
                "industry_type": industry_type,
                "size_category": size_category,
                "established_date": established_date,
                "tags": tags,
                "metadata": metadata
            }
            
            validation_result = await self.install_service.validate_install_data(install_data)
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "error": "데이터 검증 실패",
                    "validation_errors": validation_result["errors"],
                    "validation_warnings": validation_result["warnings"]
                }
            
            # 사업장 생성
            install = await self.install_service.create_install(
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
            
            return {
                "success": True,
                "message": "사업장이 성공적으로 생성되었습니다.",
                "install_id": install.id,
                "install": {
                    "id": install.id,
                    "install_name": install.install_name,
                    "company_name": install.company_name,
                    "region": install.region,
                    "status": install.status,
                    "created_at": install.created_at.isoformat() if install.created_at else None
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 생성 중 오류가 발생했습니다."
            }
    
    async def get_install_by_id(self, install_id: int) -> Dict[str, Any]:
        """ID로 사업장 조회"""
        try:
            install = await self.install_service.get_install_by_id(install_id)
            
            if not install:
                return {
                    "success": False,
                    "error": "사업장을 찾을 수 없습니다.",
                    "message": f"ID {install_id}에 해당하는 사업장이 존재하지 않습니다."
                }
            
            return {
                "success": True,
                "message": "사업장 조회 성공",
                "install": {
                    "id": install.id,
                    "install_name": install.install_name,
                    "company_name": install.company_name,
                    "address": install.address,
                    "region": install.region,
                    "country": install.country,
                    "contact_person": install.contact_person,
                    "contact_email": install.contact_email,
                    "contact_phone": install.contact_phone,
                    "industry_type": install.industry_type,
                    "size_category": install.size_category,
                    "established_date": install.established_date,
                    "status": install.status,
                    "is_active": install.is_active,
                    "tags": install.tags,
                    "metadata": install.metadata,
                    "created_at": install.created_at.isoformat() if install.created_at else None,
                    "updated_at": install.updated_at.isoformat() if install.updated_at else None
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 조회 중 오류가 발생했습니다."
            }
    
    async def get_all_installs(self, limit: int = 100) -> Dict[str, Any]:
        """모든 사업장 목록 조회"""
        try:
            installs = await self.install_service.get_all_installs(limit)
            
            install_list = []
            for install in installs:
                install_list.append({
                    "id": install.id,
                    "install_name": install.install_name,
                    "company_name": install.company_name,
                    "address": install.address,
                    "region": install.region,
                    "country": install.country,
                    "contact_person": install.contact_person,
                    "contact_email": install.contact_email,
                    "contact_phone": install.contact_phone,
                    "industry_type": install.industry_type,
                    "size_category": install.size_category,
                    "status": install.status,
                    "is_active": install.is_active,
                    "created_at": install.created_at.isoformat() if install.created_at else None
                })
            
            return {
                "success": True,
                "message": "사업장 목록 조회 성공",
                "installs": install_list,
                "count": len(install_list)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 목록 조회 중 오류가 발생했습니다."
            }
    
    async def get_installs_by_company(
        self, 
        company_name: str, 
        limit: int = 100
    ) -> Dict[str, Any]:
        """회사별 사업장 목록 조회"""
        try:
            installs = await self.install_service.get_installs_by_company(company_name, limit)
            
            install_list = []
            for install in installs:
                install_list.append({
                    "id": install.id,
                    "install_name": install.install_name,
                    "company_name": install.company_name,
                    "address": install.address,
                    "region": install.region,
                    "country": install.country,
                    "contact_person": install.contact_person,
                    "contact_email": install.contact_email,
                    "contact_phone": install.contact_phone,
                    "industry_type": install.industry_type,
                    "size_category": install.size_category,
                    "status": install.status,
                    "is_active": install.is_active,
                    "created_at": install.created_at.isoformat() if install.created_at else None
                })
            
            return {
                "success": True,
                "message": f"회사 '{company_name}'의 사업장 목록 조회 성공",
                "installs": install_list,
                "count": len(install_list)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 목록 조회 중 오류가 발생했습니다."
            }
    
    async def update_install(
        self,
        install_id: int,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """사업장 업데이트"""
        try:
            # 데이터 검증
            validation_result = await self.install_service.validate_install_data(update_data)
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "error": "데이터 검증 실패",
                    "validation_errors": validation_result["errors"],
                    "validation_warnings": validation_result["warnings"]
                }
            
            # 사업장 업데이트
            success = await self.install_service.update_install(install_id, update_data)
            
            if success:
                return {
                    "success": True,
                    "message": "사업장이 성공적으로 업데이트되었습니다.",
                    "install_id": install_id
                }
            else:
                return {
                    "success": False,
                    "error": "사업장 업데이트 실패",
                    "message": "사업장 업데이트 중 오류가 발생했습니다."
                }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 업데이트 중 오류가 발생했습니다."
            }
    
    async def delete_install(self, install_id: int) -> Dict[str, Any]:
        """사업장 삭제"""
        try:
            success = await self.install_service.delete_install(install_id)
            
            if success:
                return {
                    "success": True,
                    "message": "사업장이 성공적으로 삭제되었습니다.",
                    "install_id": install_id
                }
            else:
                return {
                    "success": False,
                    "error": "사업장 삭제 실패",
                    "message": "사업장 삭제 중 오류가 발생했습니다."
                }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 삭제 중 오류가 발생했습니다."
            }
    
    async def get_install_statistics(self) -> Dict[str, Any]:
        """사업장 통계 조회"""
        try:
            statistics = await self.install_service.get_install_statistics()
            
            return {
                "success": True,
                "message": "사업장 통계 조회 성공",
                "statistics": statistics
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장 통계 조회 중 오류가 발생했습니다."
            }
