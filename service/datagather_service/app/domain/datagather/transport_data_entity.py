# ============================================================================
# 🏗️ TransportData Entity - 운송 데이터 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TransportData(Base):
    """운송 데이터 엔티티 (transport_data 테이블)"""
    
    __tablename__ = "transport_data"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, index=True)
    생산품명 = Column(String, nullable=False)
    로트번호 = Column(String, nullable=False)
    운송물질 = Column(String, nullable=False)
    운송수량 = Column(Numeric, nullable=False)
    운송일자 = Column(Date, nullable=True)
    도착공정 = Column(String, nullable=False)
    출발지 = Column(String, nullable=False)
    이동수단 = Column(String, nullable=False)
    주문처명 = Column(String, nullable=True)
    오더번호 = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=func.now())
    updated_at = Column(DateTime, nullable=True, default=func.now())
    
    def __repr__(self):
        return f"<TransportData(id={self.id}, 운송물질='{self.운송물질}', 이동수단='{self.이동수단}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            '생산품명': self.생산품명,
            '로트번호': self.로트번호,
            '운송물질': self.운송물질,
            '운송수량': float(self.운송수량) if self.운송수량 else 0,
            '운송일자': self.운송일자.isoformat() if self.운송일자 else None,
            '도착공정': self.도착공정,
            '출발지': self.출발지,
            '이동수단': self.이동수단,
            '주문처명': self.주문처명,
            '오더번호': self.오더번호,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
