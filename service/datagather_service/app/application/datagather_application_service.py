# ============================================================================
# 🚀 DataGather Application Service - 데이터 수집 애플리케이션 서비스
# ============================================================================

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.datagather.datagather_service import DataGatherService
from ..domain.datagather.datagather_entity import DataGather

class DataGatherApplicationService:
    """데이터 수집 애플리케이션 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.datagather_service = DataGatherService(session)
    
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
            data_gather = await self.datagather_service.process_file_upload(
                install_id=install_id,
                file_data=file_data,
                file_name=file_name,
                data_type=data_type,
                process_id=process_id
            )
            
            return {
                "success": True,
                "data_gather_id": data_gather.id,
                "message": "파일 업로드가 성공적으로 처리되었습니다."
            }
            
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
            
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "errors": validation_result["errors"],
                    "message": "데이터 형식이 올바르지 않습니다."
                }
            
            # API 데이터 처리
            data_gather = await self.datagather_service.process_api_data(
                install_id=install_id,
                api_data=api_data,
                data_type=data_type,
                process_id=process_id
            )
            
            return {
                "success": True,
                "data_gather_id": data_gather.id,
                "message": "API 데이터가 성공적으로 처리되었습니다."
            }
            
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
            
            if not validation_result["is_valid"]:
                return {
                    "success": False,
                    "errors": validation_result["errors"],
                    "message": "데이터 형식이 올바르지 않습니다."
                }
            
            # 수동 데이터 처리
            data_gather = await self.datagather_service.process_manual_data(
                install_id=install_id,
                manual_data=manual_data,
                data_type=data_type,
                process_id=process_id
            )
            
            return {
                "success": True,
                "data_gather_id": data_gather.id,
                "message": "수동 입력 데이터가 성공적으로 처리되었습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "수동 입력 데이터 처리 중 오류가 발생했습니다."
            }
    
    async def get_data_gather_info(self, data_gather_id: int) -> Dict[str, Any]:
        """데이터 수집 정보 조회"""
        try:
            data_gather = await self.datagather_service.get_data_gather_by_id(data_gather_id)
            
            if not data_gather:
                return {
                    "success": False,
                    "message": "데이터 수집 정보를 찾을 수 없습니다."
                }
            
            return {
                "success": True,
                "data": data_gather.to_dict(),
                "message": "데이터 수집 정보를 성공적으로 조회했습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 수집 정보 조회 중 오류가 발생했습니다."
            }
    
    async def get_install_data_summary(self, install_id: int) -> Dict[str, Any]:
        """사업장별 데이터 수집 요약 조회"""
        try:
            # 데이터 수집 통계 조회
            statistics = await self.datagather_service.get_statistics(install_id)
            
            # 사업장별 데이터 수집 목록 조회
            data_gather_list = await self.datagather_service.get_data_gather_by_install(install_id, limit=50)
            
            return {
                "success": True,
                "statistics": statistics,
                "recent_data": [dg.to_dict() for dg in data_gather_list],
                "message": "사업장별 데이터 수집 요약을 성공적으로 조회했습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "사업장별 데이터 수집 요약 조회 중 오류가 발생했습니다."
            }
    
    async def update_processing_status(
        self,
        data_gather_id: int,
        status: str,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """처리 상태 업데이트"""
        try:
            success = await self.datagather_service.update_processing_status(
                data_gather_id, status, error_message
            )
            
            if success:
                return {
                    "success": True,
                    "message": "처리 상태가 성공적으로 업데이트되었습니다."
                }
            else:
                return {
                    "success": False,
                    "message": "처리 상태 업데이트에 실패했습니다."
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "처리 상태 업데이트 중 오류가 발생했습니다."
            }
    
    async def complete_data_processing(
        self,
        data_gather_id: int,
        processed_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """데이터 처리 완료"""
        try:
            success = await self.datagather_service.complete_processing(
                data_gather_id, processed_data
            )
            
            if success:
                return {
                    "success": True,
                    "message": "데이터 처리가 성공적으로 완료되었습니다."
                }
            else:
                return {
                    "success": False,
                    "message": "데이터 처리 완료 처리에 실패했습니다."
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 처리 완료 처리 중 오류가 발생했습니다."
            }
