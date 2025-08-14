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
    
    # 로그인 필드 (Company도 로그인 가능)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # 시스템 필드
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_company_biz_no', 'biz_no'),
        Index('idx_company_username', 'username'),
        Index('idx_company_created_at', 'created_at'),
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
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_public_dict(self):
        """공개용 기업 정보 (민감한 정보 제외)"""
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
    
    def get_user_count(self) -> int:
        """소속 사용자 수 반환"""
        return len(self.users) if self.users else 0
    
    def get_active_users(self):
        """활성 사용자 목록 반환"""
        return [user for user in self.users if user.is_active]
    
    def get_users_by_role(self, role: str):
        """특정 역할의 사용자 목록 반환"""
        return [user for user in self.users if user.role == role and user.is_active]
    
    def can_manage_user(self, user_id: int) -> bool:
        """특정 사용자 관리 권한 확인"""
        user = next((u for u in self.users if u.id == user_id), None)
        if not user:
            return False
        
        # Company 관리자는 모든 사용자 관리 가능
        if self.username:  # Company가 로그인 가능한 경우
            return True
        
        return False
