# ============================================================================
# 🔧 Process Service - 공정 서비스
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from .process_entity import Process
from .process_repository import ProcessRepository

class ProcessService:
    """공정 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = ProcessRepository(session)
    
    async def create_process(
        self,
        install_id: int,
        process_name: str,
        process_type: str,
        process_description: Optional[str] = None,
        parent_process_id: Optional[int] = None,
        process_order: Optional[int] = None,
        capacity: Optional[float] = None,
        unit: Optional[str] = None,
        efficiency: Optional[float] = None,
        tags: Optional[str] = None,
        metadata: Optional[str] = None
    ) -> Process:
        """공정 엔티티 생성"""
        
        # 엔티티 생성
        process = Process(
            install_id=install_id,
            process_name=process_name,
            process_type=process_type,
            process_description=process_description,
            parent_process_id=parent_process_id,
            process_order=process_order,
            capacity=capacity,
            unit=unit,
            efficiency=efficiency,
            tags=tags,
            metadata=metadata
        )
        
        return await self.repository.create(process)
    
    async def get_process_by_id(self, process_id: int) -> Optional[Process]:
        """ID로 공정 엔티티 조회"""
        return await self.repository.get_by_id(process_id)
    
    async def get_processes_by_install(
        self, 
        install_id: int, 
        limit: int = 100
    ) -> List[Process]:
        """사업장별 공정 엔티티 목록 조회"""
        return await self.repository.get_by_install_id(install_id, limit)
    
    async def get_processes_by_name(
        self, 
        process_name: str, 
        limit: int = 100
    ) -> List[Process]:
        """공정명으로 공정 엔티티 목록 조회"""
        return await self.repository.get_by_name(process_name, limit)
    
    async def get_processes_by_type(
        self, 
        process_type: str, 
        limit: int = 100
    ) -> List[Process]:
        """공정 타입으로 공정 엔티티 목록 조회"""
        return await self.repository.get_by_type(process_type, limit)
    
    async def get_active_processes(self, limit: int = 100) -> List[Process]:
        """활성 공정 엔티티 목록 조회"""
        return await self.repository.get_active_processes(limit)
    
    async def update_process(
        self,
        process_id: int,
        update_data: Dict[str, Any]
    ) -> bool:
        """공정 엔티티 업데이트"""
        return await self.repository.update(process_id, update_data)
    
    async def update_process_status(
        self,
        process_id: int,
        status: str
    ) -> bool:
        """공정 상태 업데이트"""
        return await self.repository.update_status(process_id, status)
    
    async def delete_process(self, process_id: int) -> bool:
        """공정 엔티티 삭제"""
        return await self.repository.delete_by_id(process_id)
    
    async def delete_processes_by_install(self, install_id: int) -> bool:
        """사업장별 공정 엔티티 일괄 삭제"""
        return await self.repository.delete_by_install_id(install_id)
    
    async def get_process_statistics(self, install_id: Optional[int] = None) -> Dict[str, Any]:
        """공정 통계 조회"""
        return await self.repository.get_statistics(install_id)
    
    async def validate_process_data(
        self, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """공정 데이터 형식 검증"""
        
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        # 필수 필드 검증
        required_fields = ["process_name", "process_type"]
        for field in required_fields:
            if field not in data or not data[field]:
                validation_result["is_valid"] = False
                validation_result["errors"].append(f"필수 필드 누락: {field}")
        
        # 공정명 길이 검증
        if "process_name" in data and len(data["process_name"]) > 255:
            validation_result["is_valid"] = False
            validation_result["errors"].append("공정명이 너무 깁니다 (최대 255자)")
        
        # 공정 타입 검증
        valid_types = ["production", "processing", "assembly", "packaging", "quality_control", "other"]
        if "process_type" in data and data["process_type"] not in valid_types:
            validation_result["warnings"].append(f"알 수 없는 공정 타입: {data['process_type']}")
        
        # 효율성 범위 검증
        if "efficiency" in data:
            efficiency = data["efficiency"]
            if not (0 <= efficiency <= 1):
                validation_result["is_valid"] = False
                validation_result["errors"].append("효율성은 0과 1 사이의 값이어야 합니다")
        
        return validation_result
