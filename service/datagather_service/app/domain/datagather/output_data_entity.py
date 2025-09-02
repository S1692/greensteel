# ============================================================================
# 🏗️ OutputData Entity - 산출물 데이터 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class OutputData(Base):
    """산출물 데이터 엔티티 (output_data 테이블)"""
    
    __tablename__ = "output_data"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(String, nullable=False)
    생산품명 = Column(String, nullable=False)
    생산수량 = Column(Numeric, nullable=False)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String, nullable=False)
    산출물명 = Column(String, nullable=False)
    수량 = Column(Numeric, nullable=False)
    단위 = Column(String, nullable=False, default='t')
    주문처명 = Column(String, nullable=True)
    오더번호 = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=func.now())
    updated_at = Column(DateTime, nullable=True, default=func.now())
    
    def __repr__(self):
        return f"<OutputData(id={self.id}, 공정='{self.공정}', 산출물명='{self.산출물명}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            '로트번호': self.로트번호,
            '생산품명': self.생산품명,
            '생산수량': float(self.생산수량) if self.생산수량 else 0,
            '투입일': self.투입일.isoformat() if self.투입일 else None,
            '종료일': self.종료일.isoformat() if self.종료일 else None,
            '공정': self.공정,
            '산출물명': self.산출물명,
            '수량': float(self.수량) if self.수량 else 0,
            '단위': self.단위,
            '주문처명': self.주문처명,
            '오더번호': self.오더번호,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
