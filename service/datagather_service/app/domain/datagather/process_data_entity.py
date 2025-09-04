# ============================================================================
# 🏗️ ProcessData Entity - 공정 데이터 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ProcessData(Base):
    """공정 데이터 엔티티 (process_data 테이블)"""
    
    __tablename__ = "process_data"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, index=True)
    공정명 = Column(String(500), nullable=False)
    생산제품 = Column(String(500), nullable=False)
    세부공정 = Column(String(500), nullable=False)
    공정설명 = Column(Text, nullable=True)  # 공정_설명에서 공정설명으로 통일
    created_at = Column(DateTime, nullable=True, default=func.now())
    updated_at = Column(DateTime, nullable=True, default=func.now())
    
    def __repr__(self):
        return f"<ProcessData(id={self.id}, 공정명='{self.공정명}', 생산제품='{self.생산제품}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            '공정명': self.공정명,
            '생산제품': self.생산제품,
            '세부공정': self.세부공정,
            '공정설명': self.공정설명,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
