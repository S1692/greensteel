# ============================================================================
# 🏗️ DataGather Service - 도메인 서비스
# ============================================================================

from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json
import hashlib
from datetime import datetime

class DataGatherService:
    """데이터 수집 도메인 서비스"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
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
    ) -> Dict[str, Any]:
        """데이터 수집 생성"""
        try:
            # 데이터 검증
            if not data_type or not data_source or not data_format:
                return {
                    "success": False,
                    "error": "필수 필드가 누락되었습니다.",
                    "message": "data_type, data_source, data_format은 필수입니다."
                }
            
            # 체크섬 계산
            checksum = None
            if raw_data:
                data_str = json.dumps(raw_data, sort_keys=True)
                checksum = hashlib.md5(data_str.encode()).hexdigest()
            
            # 데이터베이스에 저장 (input_data 테이블 사용)
            if raw_data and 'data' in raw_data:
                input_data_rows = raw_data['data']
                saved_count = 0
                
                for row in input_data_rows:
                    try:
                        if row.get('공정') or row.get('투입물명'):
                            await self.session.execute(text("""
                                INSERT INTO input_data 
                                (로트번호, 생산품명, 생산수량, 투입일, 종료일, 
                                 공정, 투입물명, 수량, 단위, source_file, 주문처명, 오더번호)
                                VALUES (:로트번호, :생산품명, :생산수량, :투입일, :종료일,
                                        :공정, :투입물명, :수량, :단위, :source_file, :주문처명, :오더번호)
                            """), {
                                '로트번호': row.get('로트번호', ''),
                                '생산품명': row.get('생산품명', ''),
                                '생산수량': float(row.get('생산수량', 0)) if row.get('생산수량') else 0,
                                '투입일': row.get('투입일'),
                                '종료일': row.get('종료일'),
                                '공정': row.get('공정', ''),
                                '투입물명': row.get('투입물명', ''),
                                '수량': float(row.get('수량', 0)) if row.get('수량') else 0,
                                '단위': row.get('단위', 't'),
                                'source_file': file_name or 'api_processed',
                                '주문처명': row.get('주문처명', ''),
                                '오더번호': row.get('오더번호', '')
                            })
                            
                            saved_count += 1
                    
                    except Exception as row_error:
                        print(f"행 데이터 저장 실패: {row_error}")
                        continue
                
                await self.session.commit()
                
                return {
                    "success": True,
                    "message": f"데이터가 성공적으로 저장되었습니다. ({saved_count}행)",
                    "data_gather_id": saved_count,
                    "saved_count": saved_count
                }
            else:
                return {
                    "success": False,
                    "error": "저장할 데이터가 없습니다.",
                    "message": "raw_data에 'data' 필드가 없거나 비어있습니다."
                }
                
        except Exception as e:
            await self.session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 수집 생성 중 오류가 발생했습니다."
            }
    
    async def process_file_upload(
        self, 
        install_id: int, 
        file_data: bytes, 
        file_name: str, 
        data_type: str,
        process_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """파일 업로드 처리"""
        try:
            # 파일 크기 계산
            file_size = len(file_data)
            
            # 체크섬 계산
            checksum = hashlib.md5(file_data).hexdigest()
            
            # 파일 데이터를 JSON으로 파싱 (간단한 예시)
            try:
                file_content = file_data.decode('utf-8')
                raw_data = json.loads(file_content)
            except:
                raw_data = {"filename": file_name, "size": file_size}
            
            # 데이터 수집 생성
            return await self.create_data_gather(
                install_id=install_id,
                data_type=data_type,
                data_source="file",
                data_format="json",
                raw_data=raw_data,
                process_id=process_id,
                file_name=file_name,
                file_size=file_size
            )
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "파일 업로드 처리 중 오류가 발생했습니다."
            }
    
    async def validate_data_format(self, data: Dict[str, Any], data_type: str) -> Dict[str, Any]:
        """데이터 형식 검증"""
        try:
            if data_type == "input_data":
                required_fields = ["공정", "투입물명"]
                for field in required_fields:
                    if not any(row.get(field) for row in data.get('data', [])):
                        return {
                            "success": False,
                            "error": f"필수 필드 '{field}'가 누락되었습니다.",
                            "message": f"데이터에 '{field}' 필드가 필요합니다."
                        }
            
            return {
                "success": True,
                "message": "데이터 형식이 유효합니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 형식 검증 중 오류가 발생했습니다."
            }