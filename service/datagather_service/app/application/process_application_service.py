# ============================================================================
# 🔧 Process Application Service - 공정 애플리케이션 서비스
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.process import ProcessService

class ProcessApplicationService:
    """공정 애플리케이션 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.process_service = ProcessService(session)
    
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
    ) -> Dict[str, Any]:
        """공정 생성"""
        try:
            # 데이터 검증
            process_data = {
                "process_name": process_name,
                "process_type": process_type,
                "process_description": process_description,
                "parent_process_id": parent_process_id,
                "process_order": process_order,
                "capacity": capacity,
                "unit": unit,
                "efficiency": efficiency,
                "tags": tags,
                "metadata": metadata
            }
            
            validation_result = await self.process_service.validate_process_data(process_data)
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "error": "데이터 검증 실패",
                    "validation_errors": validation_result["errors"],
                    "validation_warnings": validation_result["warnings"]
                }
            
            # 공정 생성
            process = await self.process_service.create_process(
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
            
            return {
                "success": True,
                "message": "공정이 성공적으로 생성되었습니다.",
                "process_id": process.id,
                "process": {
                    "id": process.id,
                    "install_id": process.install_id,
                    "process_name": process.process_name,
                    "process_type": process.process_type,
                    "status": process.status,
                    "created_at": process.created_at.isoformat() if process.created_at else None
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 생성 중 오류가 발생했습니다."
            }
    
    async def get_process_by_id(self, process_id: int) -> Dict[str, Any]:
        """ID로 공정 조회"""
        try:
            process = await self.process_service.get_process_by_id(process_id)
            
            if not process:
                return {
                    "success": False,
                    "error": "공정을 찾을 수 없습니다.",
                    "message": f"ID {process_id}에 해당하는 공정이 존재하지 않습니다."
                }
            
            return {
                "success": True,
                "message": "공정 조회 성공",
                "process": {
                    "id": process.id,
                    "install_id": process.install_id,
                    "process_name": process.process_name,
                    "process_type": process.process_type,
                    "process_description": process.process_description,
                    "parent_process_id": process.parent_process_id,
                    "process_order": process.process_order,
                    "capacity": process.capacity,
                    "unit": process.unit,
                    "efficiency": process.efficiency,
                    "status": process.status,
                    "is_active": process.is_active,
                    "tags": process.tags,
                    "metadata": process.metadata,
                    "created_at": process.created_at.isoformat() if process.created_at else None,
                    "updated_at": process.updated_at.isoformat() if process.updated_at else None
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 조회 중 오류가 발생했습니다."
            }
    
    async def get_processes_by_install(
        self, 
        install_id: int, 
        limit: int = 100
    ) -> Dict[str, Any]:
        """사업장별 공정 목록 조회"""
        try:
            processes = await self.process_service.get_processes_by_install(install_id, limit)
            
            process_list = []
            for process in processes:
                process_list.append({
                    "id": process.id,
                    "install_id": process.install_id,
                    "process_name": process.process_name,
                    "process_type": process.process_type,
                    "process_description": process.process_description,
                    "parent_process_id": process.parent_process_id,
                    "process_order": process.process_order,
                    "capacity": process.capacity,
                    "unit": process.unit,
                    "efficiency": process.efficiency,
                    "status": process.status,
                    "is_active": process.is_active,
                    "tags": process.tags,
                    "created_at": process.created_at.isoformat() if process.created_at else None
                })
            
            return {
                "success": True,
                "message": f"사업장 {install_id}의 공정 목록 조회 성공",
                "processes": process_list,
                "count": len(process_list)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 목록 조회 중 오류가 발생했습니다."
            }
    
    async def update_process(
        self,
        process_id: int,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """공정 업데이트"""
        try:
            # 데이터 검증
            validation_result = await self.process_service.validate_process_data(update_data)
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "error": "데이터 검증 실패",
                    "validation_errors": validation_result["errors"],
                    "validation_warnings": validation_result["warnings"]
                }
            
            # 공정 업데이트
            success = await self.process_service.update_process(process_id, update_data)
            
            if success:
                return {
                    "success": True,
                    "message": "공정이 성공적으로 업데이트되었습니다.",
                    "process_id": process_id
                }
            else:
                return {
                    "success": False,
                    "error": "공정 업데이트 실패",
                    "message": "공정 업데이트 중 오류가 발생했습니다."
                }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 업데이트 중 오류가 발생했습니다."
            }
    
    async def delete_process(self, process_id: int) -> Dict[str, Any]:
        """공정 삭제"""
        try:
            success = await self.process_service.delete_process(process_id)
            
            if success:
                return {
                    "success": True,
                    "message": "공정이 성공적으로 삭제되었습니다.",
                    "process_id": process_id
                }
            else:
                return {
                    "success": False,
                    "error": "공정 삭제 실패",
                    "message": "공정 삭제 중 오류가 발생했습니다."
                }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 삭제 중 오류가 발생했습니다."
            }
    
    async def get_process_statistics(self, install_id: Optional[int] = None) -> Dict[str, Any]:
        """공정 통계 조회"""
        try:
            statistics = await self.process_service.get_process_statistics(install_id)
            
            return {
                "success": True,
                "message": "공정 통계 조회 성공",
                "statistics": statistics
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "공정 통계 조회 중 오류가 발생했습니다."
            }
