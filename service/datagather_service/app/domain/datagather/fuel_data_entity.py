# ============================================================================
# 🏗️ FuelData Entity - 연료 데이터 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class FuelData(Base):
    """연료 데이터 엔티티 (fuel_data 테이블)"""
    
    __tablename__ = "fuel_data"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(Integer, nullable=False)
    생산수량 = Column(Numeric, nullable=True)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String, nullable=True)
    투입물명 = Column(String, nullable=True)
    수량 = Column(Numeric, nullable=True)
    단위 = Column(String, nullable=True, default='t')
    분류 = Column(String, nullable=True, default='연료')
    source_table = Column(String, nullable=True)
    source_id = Column(Integer, nullable=True)
    주문처명 = Column(String, nullable=True)
    오더번호 = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=func.now())
    updated_at = Column(DateTime, nullable=True, default=func.now())
    
    def __repr__(self):
        return f"<FuelData(id={self.id}, 투입물명='{self.투입물명}', 분류='{self.분류}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            '로트번호': self.로트번호,
            '생산수량': float(self.생산수량) if self.생산수량 else None,
            '투입일': self.투입일.isoformat() if self.투입일 else None,
            '종료일': self.종료일.isoformat() if self.종료일 else None,
            '공정': self.공정,
            '투입물명': self.투입물명,
            '수량': float(self.수량) if self.수량 else None,
            '단위': self.단위,
            '분류': self.분류,
            'source_table': self.source_table,
            'source_id': self.source_id,
            '주문처명': self.주문처명,
            '오더번호': self.오더번호,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
