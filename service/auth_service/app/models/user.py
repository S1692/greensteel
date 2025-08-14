from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    """사용자 모델"""
    __tablename__ = "users"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.utc_timestamp(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_email', 'email'),
        Index('idx_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"
    
    def to_dict(self):
        """사용자 정보를 딕셔너리로 변환 (민감한 정보 제외)"""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
