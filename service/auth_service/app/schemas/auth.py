from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# 기업 회원가입 스키마
class CompanyRegisterIn(BaseModel):
    """기업 회원가입 입력 스키마"""
    name_ko: str = Field(..., min_length=1, max_length=255, description="사업자(상점) 국문 이름")
    name_en: Optional[str] = Field(None, max_length=255, description="사업자(상점) 영문 이름")
    biz_no: str = Field(..., min_length=1, max_length=20, description="사업자번호")
    ceo_name: Optional[str] = Field(None, max_length=100, description="대표자명")
    
    # 주소 필드
    country: Optional[str] = Field(None, max_length=10, description="국가")
    zipcode: Optional[str] = Field(None, max_length=20, description="우편번호")
    city: Optional[str] = Field(None, max_length=100, description="광역 도시명")
    address1: Optional[str] = Field(None, max_length=500, description="상세 주소")
    
    # 업종 필드
    sector: Optional[str] = Field(None, max_length=200, description="업태/업종")
    industry_code: Optional[str] = Field(None, max_length=20, description="업종 코드")
    
    # 담당자 필드
    manager_name: str = Field(..., min_length=1, max_length=100, description="당직자 이름")
    manager_phone: str = Field(..., min_length=1, max_length=20, description="당직자 연락처")
    manager_email: Optional[EmailStr] = Field(None, description="당직자 이메일")

class CompanyRegisterOut(BaseModel):
    """기업 회원가입 출력 스키마"""
    id: int
    name_ko: str
    name_en: Optional[str]
    biz_no: str
    ceo_name: Optional[str]
    country: Optional[str]
    zipcode: Optional[str]
    city: Optional[str]
    address1: Optional[str]
    sector: Optional[str]
    industry_code: Optional[str]
    manager_name: str
    manager_phone: str
    manager_email: Optional[str]
    created_at: datetime

# User 회원가입 스키마
class UserRegisterIn(BaseModel):
    """User 회원가입 입력 스키마"""
    username: str = Field(..., min_length=3, max_length=100, description="사용자 ID")
    password: str = Field(..., min_length=8, max_length=100, description="비밀번호")
    full_name: str = Field(..., min_length=1, max_length=255, description="사용자 이름")
    company_id: int = Field(..., description="소속 기업 ID")

class UserRegisterOut(BaseModel):
    """User 회원가입 출력 스키마"""
    id: int
    username: str
    full_name: str
    company_id: int
    is_active: bool
    created_at: datetime

# 로그인 스키마 (username 기반으로 변경)
class LoginIn(BaseModel):
    """로그인 입력 스키마"""
    username: str = Field(..., description="사용자 ID")
    password: str = Field(..., description="비밀번호")

# 기존 스키마들 (호환성을 위해 유지)
class RegisterIn(BaseModel):
    """기존 회원가입 스키마 (호환성)"""
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    company_id: int

class TokenOut(BaseModel):
    """토큰 출력 스키마"""
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    """사용자 정보 출력 스키마"""
    id: int
    username: str
    full_name: str
    company_id: int
    is_active: bool
    created_at: datetime

class HealthCheck(BaseModel):
    """헬스체크 응답 스키마"""
    status: str
    timestamp: datetime
    service: str

# 순환 참조 해결
TokenOut.model_rebuild()
