from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    """사용자 역할"""
    PENDING = "승인 전"
    ADMIN = "관리자"
    USER = "실무자"

class User(BaseModel):
    """사용자 도메인 엔티티"""
    id: Optional[str] = None
    username: str
    full_name: str
    company_id: str
    role: UserRole = UserRole.PENDING
    
    class Config:
        from_attributes = True
