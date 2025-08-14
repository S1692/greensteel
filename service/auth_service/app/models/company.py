from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Company(Base):
    """기업 모델"""
    __tablename__ = "companies"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name_ko = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=True)
    biz_no = Column(String(20), unique=True, index=True, nullable=False)
    ceo_name = Column(String(100), nullable=True)
    
    # 주소 필드
    country = Column(String(10), nullable=True)
    zipcode = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    address1 = Column(String(500), nullable=True)
    
    # 업종 필드
    sector = Column(String(200), nullable=True)
    industry_code = Column(String(20), nullable=True)
    
    # 담당자 필드
    manager_name = Column(String(100), nullable=False)
    manager_phone = Column(String(20), nullable=False)
    manager_email = Column(String(255), nullable=True)
    
    # 시스템 필드
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_biz_no', 'biz_no'),
        Index('idx_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Company(id={self.id}, name_ko='{self.name_ko}', biz_no='{self.biz_no}')>"
    
    def to_dict(self):
        """기업 정보를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "name_ko": self.name_ko,
            "name_en": self.name_en,
            "biz_no": self.biz_no,
            "ceo_name": self.ceo_name,
            "country": self.country,
            "zipcode": self.zipcode,
            "city": self.city,
            "address1": self.address1,
            "sector": self.sector,
            "industry_code": self.industry_code,
            "manager_name": self.manager_name,
            "manager_phone": self.manager_phone,
            "manager_email": self.manager_email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
