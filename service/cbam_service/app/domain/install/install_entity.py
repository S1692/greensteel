# ============================================================================
# 🏭 Install Entity - 사업장 데이터베이스 모델
# ============================================================================

from sqlalchemy import Column, Integer, Text, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any

Base = declarative_base()

class Install(Base):
    """사업장 엔티티"""
    
    __tablename__ = "install"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False, index=True)  # 사업장명
    reporting_year = Column(Integer, nullable=False, default=lambda: datetime.now().year)  # 보고기간 (년도)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    products = relationship("Product", back_populates="install")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "name": self.name,
            "reporting_year": self.reporting_year,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Install":
        """딕셔너리에서 엔티티 생성"""
        return cls(
            name=data.get("name"),
            reporting_year=data.get("reporting_year", datetime.now().year)
        )
    
    def __repr__(self):
        return f"<Install(id={self.id}, name='{self.name}')>"
