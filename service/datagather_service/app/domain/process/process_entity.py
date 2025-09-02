# ============================================================================
# 🏗️ Process Entity - 공정 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Process(Base):
    """공정 엔티티"""
    
    __tablename__ = "process"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, autoincrement=True, comment="공정 ID")
    install_id = Column(Integer, ForeignKey("install.id", ondelete="CASCADE"), nullable=False, comment="사업장 ID")
    
    # 공정 정보
    process_name = Column(String(255), nullable=False, comment="공정명")
    process_type = Column(String(100), nullable=False, comment="공정 타입")
    process_description = Column(Text, nullable=True, comment="공정 설명")
    
    # 공정 위치 및 연결
    parent_process_id = Column(Integer, ForeignKey("process.id", ondelete="SET NULL"), nullable=True, comment="상위 공정 ID")
    process_order = Column(Integer, nullable=True, comment="공정 순서")
    
    # 공정 매개변수
    capacity = Column(Numeric(15, 6), nullable=True, comment="공정 용량")
    unit = Column(String(50), nullable=True, comment="단위")
    efficiency = Column(Numeric(5, 4), nullable=True, comment="효율성 (0-1)")
    
    # 상태 정보
    is_active = Column(String(1), nullable=False, default="Y", comment="활성 상태 (Y/N)")
    status = Column(String(20), nullable=False, default="active", comment="상태 (active, inactive, maintenance)")
    
    # 메타데이터
    tags = Column(Text, nullable=True, comment="태그 (JSON 형태)")
    meta_data = Column(Text, nullable=True, comment="추가 메타데이터 (JSON 형태)")
    
    # 시간 정보
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="생성 시간")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="수정 시간")
    
    # 인덱스 정의
    __table_args__ = (
        Index('idx_process_install', 'install_id'),
        Index('idx_process_parent', 'parent_process_id'),
        Index('idx_process_name', 'process_name'),
        Index('idx_process_type', 'process_type'),
        Index('idx_process_status', 'status'),
        {'comment': '공정 테이블'}
    )
    
    def __repr__(self):
        return f"<Process(id={self.id}, process_name='{self.process_name}', process_type='{self.process_type}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'install_id': self.install_id,
            'process_name': self.process_name,
            'process_type': self.process_type,
            'process_description': self.process_description,
            'parent_process_id': self.parent_process_id,
            'process_order': self.process_order,
            'capacity': float(self.capacity) if self.capacity else None,
            'unit': self.unit,
            'efficiency': float(self.efficiency) if self.efficiency else None,
            'is_active': self.is_active,
            'status': self.status,
            'tags': self.tags,
            'metadata': self.meta_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """딕셔너리에서 엔티티 생성"""
        return cls(
            install_id=data.get('install_id'),
            process_name=data.get('process_name'),
            process_type=data.get('process_type'),
            process_description=data.get('process_description'),
            parent_process_id=data.get('parent_process_id'),
            process_order=data.get('process_order'),
            capacity=data.get('capacity'),
            unit=data.get('unit'),
            efficiency=data.get('efficiency'),
            is_active=data.get('is_active', 'Y'),
            status=data.get('status', 'active'),
            tags=data.get('tags'),
            meta_data=data.get('metadata')
        )
