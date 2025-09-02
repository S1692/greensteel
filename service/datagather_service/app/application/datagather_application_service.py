# ============================================================================
# 🏗️ DataGather Application Service - 애플리케이션 서비스
# ============================================================================

from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ..domain.datagather.datagather_service import DataGatherService
from ..domain.datagather.datagather_repository import DataGatherRepository

class DataGatherApplicationService:
    """데이터 수집 애플리케이션 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.datagather_service = DataGatherService(session)
        self.repository = DataGatherRepository(session)
    
    async def upload_file(
        self, 
        install_id: int, 
        file_data: bytes, 
        file_name: str, 
        data_type: str,
        process_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """파일 업로드 처리"""
        try:
            # 파일 업로드 처리
            result = await self.datagather_service.process_file_upload(
                install_id=install_id,
                file_data=file_data,
                file_name=file_name,
                data_type=data_type,
                process_id=process_id
            )
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "파일 업로드 처리 중 오류가 발생했습니다."
            }
    
    async def process_api_data(
        self, 
        install_id: int, 
        api_data: Dict[str, Any], 
        data_type: str,
        process_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """API 데이터 처리"""
        try:
            # 데이터 형식 검증
            validation_result = await self.datagather_service.validate_data_format(api_data, data_type)
            if not validation_result["success"]:
                return validation_result
            
            # 데이터 수집 생성
            result = await self.datagather_service.create_data_gather(
                install_id=install_id,
                data_type=data_type,
                data_source="api",
                data_format="json",
                raw_data=api_data,
                process_id=process_id
            )
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "API 데이터 처리 중 오류가 발생했습니다."
            }
    
    async def process_manual_data(
        self, 
        install_id: int, 
        manual_data: Dict[str, Any], 
        data_type: str,
        process_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """수동 입력 데이터 처리"""
        try:
            # 데이터 형식 검증
            validation_result = await self.datagather_service.validate_data_format(manual_data, data_type)
            if not validation_result["success"]:
                return validation_result
            
            # 데이터 수집 생성
            result = await self.datagather_service.create_data_gather(
                install_id=install_id,
                data_type=data_type,
                data_source="manual",
                data_format="json",
                raw_data=manual_data,
                process_id=process_id
            )
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "수동 데이터 처리 중 오류가 발생했습니다."
            }
    
    async def get_data_gather_info(self, data_gather_id: int) -> Dict[str, Any]:
        """데이터 수집 정보 조회"""
        try:
            data_gather = await self.repository.get_by_id(data_gather_id)
            
            if data_gather:
                return {
                    "success": True,
                    "data": data_gather.to_dict(),
                    "message": "데이터 수집 정보를 성공적으로 조회했습니다."
                }
            else:
                return {
                    "success": False,
                    "error": "데이터를 찾을 수 없습니다.",
                    "message": f"ID {data_gather_id}에 해당하는 데이터가 없습니다."
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 수집 정보 조회 중 오류가 발생했습니다."
            }
    
    async def get_install_summary(self, install_id: int) -> Dict[str, Any]:
        """사업장별 요약 정보 조회"""
        try:
            data_gathers = await self.repository.get_by_install_id(install_id)
            
            summary = {
                "install_id": install_id,
                "total_count": len(data_gathers),
                "data_types": {},
                "recent_data": []
            }
            
            # 데이터 타입별 통계
            for data_gather in data_gathers:
                data_type = getattr(data_gather, 'source_file', 'unknown')
                if data_type not in summary["data_types"]:
                    summary["data_types"][data_type] = 0
                summary["data_types"][data_type] += 1
            
            # 최근 데이터 (최대 10개)
            summary["recent_data"] = [data_gather.to_dict() for data_gather in data_gathers[:10]]
            
            return {
                "success": True,
                "data": summary,
                "message": "사업장별 요약 정보를 성공적으로 조회했습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장별 요약 정보 조회 중 오류가 발생했습니다."
            }
    
    async def update_status(
        self, 
        data_gather_id: int, 
        status: str, 
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """처리 상태 업데이트"""
        try:
            success = await self.repository.update_status(data_gather_id, status, error_message)
            
            if success:
                return {
                    "success": True,
                    "message": "상태가 성공적으로 업데이트되었습니다."
                }
            else:
                return {
                    "success": False,
                    "error": "상태 업데이트 실패",
                    "message": "상태 업데이트 중 오류가 발생했습니다."
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "상태 업데이트 중 오류가 발생했습니다."
            }
    
    async def complete_processing(self, data_gather_id: int, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 처리 완료"""
        try:
            # 상태를 completed로 업데이트
            result = await self.update_status(data_gather_id, "completed")
            
            if result["success"]:
                return {
                    "success": True,
                    "message": "데이터 처리가 성공적으로 완료되었습니다.",
                    "processed_data": processed_data
                }
            else:
                return result
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 처리 완료 처리 중 오류가 발생했습니다."
            }