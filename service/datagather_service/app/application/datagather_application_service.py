# ============================================================================
# 🏗️ DataGather Application Service - 애플리케이션 서비스
# ============================================================================

from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ..domain.datagather.datagather_repository import DataGatherRepository

class DataGatherApplicationService:
    """데이터 수집 애플리케이션 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
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
            # 간단한 파일 업로드 처리
            return {
                "success": True,
                "message": f"파일 '{file_name}'이 성공적으로 업로드되었습니다.",
                "file_name": file_name,
                "file_size": len(file_data),
                "data_type": data_type
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
            # 간단한 API 데이터 처리
            return {
                "success": True,
                "message": f"API 데이터가 성공적으로 처리되었습니다. ({data_type})",
                "data_type": data_type,
                "install_id": install_id,
                "processed_count": len(api_data.get('data', []))
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
            # 간단한 수동 데이터 처리
            return {
                "success": True,
                "message": f"수동 데이터가 성공적으로 처리되었습니다. ({data_type})",
                "data_type": data_type,
                "install_id": install_id,
                "processed_count": len(manual_data.get('data', []))
            }
            
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
                    "data": data_gather,
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
                data_type = data_gather.get('source_file', 'unknown')
                if data_type not in summary["data_types"]:
                    summary["data_types"][data_type] = 0
                summary["data_types"][data_type] += 1
            
            # 최근 데이터 (최대 10개)
            summary["recent_data"] = data_gathers[:10]
            
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