# ============================================================================
# 🏗️ DataGather Entity - 데이터 수집 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DataGather(Base):
    """데이터 수집 엔티티"""
    
    __tablename__ = "data_gather"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, autoincrement=True, comment="데이터 수집 ID")
    install_id = Column(Integer, ForeignKey("install.id", ondelete="CASCADE"), nullable=False, comment="사업장 ID")
    process_id = Column(Integer, ForeignKey("process.id", ondelete="CASCADE"), nullable=True, comment="공정 ID")
    
    # 데이터 수집 정보
    data_type = Column(String(50), nullable=False, comment="데이터 타입 (process, material, fuel, etc.)")
    data_source = Column(String(100), nullable=False, comment="데이터 소스 (manual, api, file, etc.)")
    data_format = Column(String(50), nullable=False, comment="데이터 형식 (json, csv, excel, etc.)")
    
    # 데이터 내용
    raw_data = Column(Text, nullable=True, comment="원시 데이터 (JSON 형태)")
    processed_data = Column(Text, nullable=True, comment="처리된 데이터 (JSON 형태)")
    
    # 상태 정보
    status = Column(String(20), nullable=False, default="pending", comment="처리 상태 (pending, processing, completed, failed)")
    error_message = Column(Text, nullable=True, comment="에러 메시지")
    
    # 메타데이터
    file_name = Column(String(255), nullable=True, comment="파일명")
    file_size = Column(Integer, nullable=True, comment="파일 크기 (bytes)")
    checksum = Column(String(64), nullable=True, comment="파일 체크섬")
    
    # 시간 정보
    collected_at = Column(DateTime(timezone=True), server_default=func.now(), comment="데이터 수집 시간")
    processed_at = Column(DateTime(timezone=True), nullable=True, comment="데이터 처리 완료 시간")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="생성 시간")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="수정 시간")
    
    # 인덱스 정의
    __table_args__ = (
        Index('idx_data_gather_install', 'install_id'),
        Index('idx_data_gather_process', 'process_id'),
        Index('idx_data_gather_type', 'data_type'),
        Index('idx_data_gather_status', 'status'),
        Index('idx_data_gather_collected', 'collected_at'),
        {'comment': '데이터 수집 테이블'}
    )
    
    def __repr__(self):
        return f"<DataGather(id={self.id}, data_type='{self.data_type}', status='{self.status}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'install_id': self.install_id,
            'process_id': self.process_id,
            'data_type': self.data_type,
            'data_source': self.data_source,
            'data_format': self.data_format,
            'raw_data': self.raw_data,
            'processed_data': self.processed_data,
            'status': self.status,
            'error_message': self.error_message,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'checksum': self.checksum,
            'collected_at': self.collected_at.isoformat() if self.collected_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """딕셔너리에서 엔티티 생성"""
        return cls(
            install_id=data.get('install_id'),
            process_id=data.get('process_id'),
            data_type=data.get('data_type'),
            data_source=data.get('data_source'),
            data_format=data.get('data_format'),
            raw_data=data.get('raw_data'),
            processed_data=data.get('processed_data'),
            status=data.get('status', 'pending'),
            error_message=data.get('error_message'),
            file_name=data.get('file_name'),
            file_size=data.get('file_size'),
            checksum=data.get('checksum')
        )
