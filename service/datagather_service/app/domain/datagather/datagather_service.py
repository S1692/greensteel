# ============================================================================
# 🔧 DataGather Service - 데이터 수집 서비스
# ============================================================================

import json
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from .datagather_entity import DataGather
from .datagather_repository import DataGatherRepository

class DataGatherService:
    """데이터 수집 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = DataGatherRepository(session)
    
    async def create_data_gather(
        self,
        install_id: int,
        data_type: str,
        data_source: str,
        data_format: str,
        raw_data: Optional[Dict[str, Any]] = None,
        process_id: Optional[int] = None,
        file_name: Optional[str] = None,
        file_size: Optional[int] = None
    ) -> DataGather:
        """데이터 수집 엔티티 생성"""
        
        # 체크섬 계산
        checksum = None
        if raw_data:
            checksum = hashlib.sha256(json.dumps(raw_data, sort_keys=True).encode()).hexdigest()
        
        # 엔티티 생성
        data_gather = DataGather(
            install_id=install_id,
            process_id=process_id,
            data_type=data_type,
            data_source=data_source,
            data_format=data_format,
            raw_data=json.dumps(raw_data) if raw_data else None,
            file_name=file_name,
            file_size=file_size,
            checksum=checksum
        )
        
        return await self.repository.create(data_gather)
    
    async def process_file_upload(
        self,
        install_id: int,
        file_data: bytes,
        file_name: str,
        data_type: str,
        process_id: Optional[int] = None
    ) -> DataGather:
        """파일 업로드 처리"""
        
        # 파일 크기 계산
        file_size = len(file_data)
        
        # 파일 체크섬 계산
        checksum = hashlib.sha256(file_data).hexdigest()
        
        # 원시 데이터를 JSON 형태로 변환
        raw_data = {
            "file_name": file_name,
            "file_size": file_size,
            "checksum": checksum,
            "upload_time": datetime.now().isoformat()
        }
        
        # 데이터 수집 엔티티 생성
        data_gather = await self.create_data_gather(
            install_id=install_id,
            data_type=data_type,
            data_source="file_upload",
            data_format="file",
            raw_data=raw_data,
            process_id=process_id,
            file_name=file_name,
            file_size=file_size
        )
        
        return data_gather
    
    async def process_api_data(
        self,
        install_id: int,
        api_data: Dict[str, Any],
        data_type: str,
        process_id: Optional[int] = None
    ) -> DataGather:
        """API 데이터 처리"""
        
        # 데이터 수집 엔티티 생성
        data_gather = await self.create_data_gather(
            install_id=install_id,
            data_type=data_type,
            data_source="api",
            data_format="json",
            raw_data=api_data,
            process_id=process_id
        )
        
        return data_gather
    
    async def process_manual_data(
        self,
        install_id: int,
        manual_data: Dict[str, Any],
        data_type: str,
        process_id: Optional[int] = None
    ) -> DataGather:
        """수동 입력 데이터 처리"""
        
        # 데이터 수집 엔티티 생성
        data_gather = await self.create_data_gather(
            install_id=install_id,
            data_type=data_type,
            data_source="manual",
            data_format="json",
            raw_data=manual_data,
            process_id=process_id
        )
        
        return data_gather
    
    async def update_processing_status(
        self,
        data_gather_id: int,
        status: str,
        error_message: Optional[str] = None
    ) -> bool:
        """처리 상태 업데이트"""
        return await self.repository.update_status(data_gather_id, status, error_message)
    
    async def complete_processing(
        self,
        data_gather_id: int,
        processed_data: Dict[str, Any]
    ) -> bool:
        """데이터 처리 완료"""
        return await self.repository.update_processed_data(
            data_gather_id, 
            json.dumps(processed_data)
        )
    
    async def get_data_gather_by_id(self, data_gather_id: int) -> Optional[DataGather]:
        """ID로 데이터 수집 엔티티 조회"""
        return await self.repository.get_by_id(data_gather_id)
    
    async def get_data_gather_by_install(
        self, 
        install_id: int, 
        limit: int = 100
    ) -> List[DataGather]:
        """사업장별 데이터 수집 엔티티 목록 조회"""
        return await self.repository.get_by_install_id(install_id, limit)
    
    async def get_data_gather_by_process(
        self, 
        process_id: int, 
        limit: int = 100
    ) -> List[DataGather]:
        """공정별 데이터 수집 엔티티 목록 조회"""
        return await self.repository.get_by_process_id(process_id, limit)
    
    async def get_pending_data(self, limit: int = 100) -> List[DataGather]:
        """처리 대기 중인 데이터 조회"""
        return await self.repository.get_pending_data(limit)
    
    async def get_statistics(self, install_id: Optional[int] = None) -> Dict[str, Any]:
        """데이터 수집 통계 조회"""
        return await self.repository.get_statistics(install_id)
    
    async def delete_data_gather(self, data_gather_id: int) -> bool:
        """데이터 수집 엔티티 삭제"""
        return await self.repository.delete_by_id(data_gather_id)
    
    async def delete_install_data(self, install_id: int) -> bool:
        """사업장별 데이터 수집 엔티티 일괄 삭제"""
        return await self.repository.delete_by_install_id(install_id)
    
    async def validate_data_format(
        self, 
        data: Dict[str, Any], 
        data_type: str
    ) -> Dict[str, Any]:
        """데이터 형식 검증"""
        
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        # 데이터 타입별 검증 규칙
        if data_type == "process":
            required_fields = ["process_name", "process_type"]
            for field in required_fields:
                if field not in data or not data[field]:
                    validation_result["is_valid"] = False
                    validation_result["errors"].append(f"필수 필드 누락: {field}")
        
        elif data_type == "material":
            required_fields = ["material_name", "material_type"]
            for field in required_fields:
                if field not in data or not data[field]:
                    validation_result["is_valid"] = False
                    validation_result["errors"].append(f"필수 필드 누락: {field}")
        
        elif data_type == "fuel":
            required_fields = ["fuel_name", "fuel_type"]
            for field in required_fields:
                if field not in data or not data[field]:
                    validation_result["is_valid"] = False
                    validation_result["errors"].append(f"필수 필드 누락: {field}")
        
        # 데이터 타입이 지정되지 않은 경우
        else:
            if not data:
                validation_result["is_valid"] = False
                validation_result["errors"].append("데이터가 비어있습니다")
        
        return validation_result
