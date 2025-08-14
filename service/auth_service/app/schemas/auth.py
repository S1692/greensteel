from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class RegisterIn(BaseModel):
    """회원가입 입력 스키마"""
    email: EmailStr = Field(..., description="사용자 이메일")
    password: str = Field(..., min_length=8, description="비밀번호 (최소 8자)")
    full_name: Optional[str] = Field(None, max_length=255, description="사용자 전체 이름")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "홍길동"
            }
        }

class LoginIn(BaseModel):
    """로그인 입력 스키마"""
    email: EmailStr = Field(..., description="사용자 이메일")
    password: str = Field(..., description="비밀번호")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class TokenOut(BaseModel):
    """토큰 출력 스키마"""
    access_token: str = Field(..., description="액세스 토큰")
    token_type: str = Field(default="bearer", description="토큰 타입")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }

class UserOut(BaseModel):
    """사용자 정보 출력 스키마"""
    id: int = Field(..., description="사용자 ID")
    email: str = Field(..., description="사용자 이메일")
    full_name: Optional[str] = Field(None, description="사용자 전체 이름")
    is_active: bool = Field(..., description="사용자 활성 상태")
    created_at: datetime = Field(..., description="계정 생성 시간")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "홍길동",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }

class HealthCheck(BaseModel):
    """헬스 체크 응답 스키마"""
    status: str = Field(..., description="서비스 상태")
    name: str = Field(..., description="서비스 이름")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="체크 시간")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "name": "auth-service",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }
