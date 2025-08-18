from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union, Dict, Any
from datetime import datetime

# Company 회원가입 스키마
class CompanyRegisterIn(BaseModel):
    # 기업 정보
    name_ko: str = Field(..., min_length=1, max_length=255, description="기업 국문명")
    name_en: Optional[str] = Field(None, max_length=255, description="기업 영문명")
    biz_no: str = Field(..., min_length=10, max_length=20, description="사업자번호")
    ceo_name: Optional[str] = Field(None, max_length=100, description="대표자명")
    
    # 주소 정보
    country: Optional[str] = Field(None, max_length=10, description="국가")
    zipcode: Optional[str] = Field(None, max_length=20, description="우편번호")
    city: Optional[str] = Field(None, max_length=100, description="도시")
    address1: Optional[str] = Field(None, max_length=500, description="상세주소")
    
    # 업종 정보
    sector: Optional[str] = Field(None, max_length=200, description="업태/업종")
    industry_code: Optional[str] = Field(None, max_length=20, description="업종코드")
    
    # 담당자 정보
    manager_name: str = Field(..., min_length=1, max_length=100, description="담당자명")
    manager_phone: str = Field(..., min_length=10, max_length=20, description="담당자연락처")
    manager_email: Optional[EmailStr] = Field(None, description="담당자이메일")
    
    # 로그인 정보
    username: str = Field(..., min_length=3, max_length=100, description="로그인 ID")
    password: str = Field(..., min_length=8, description="비밀번호")
    confirm_password: str = Field(..., description="비밀번호 확인")
    
    # 스트림 구조 정보
    stream_id: Optional[str] = Field(None, max_length=100, description="스트림 식별자")
    stream_metadata: Optional[Dict[str, Any]] = Field(None, description="스트림 메타데이터")

class CompanyRegisterOut(BaseModel):
    id: int
    uuid: str
    name_ko: str
    name_en: Optional[str]
    biz_no: str
    username: str
    stream_id: Optional[str]
    stream_version: int
    message: str = "기업 등록이 완료되었습니다."

# User 회원가입 스키마
class UserRegisterIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="로그인 ID")
    password: str = Field(..., min_length=8, description="비밀번호")
    confirm_password: str = Field(..., description="비밀번호 확인")
    full_name: str = Field(..., min_length=1, max_length=255, description="사용자명")
    company_id: int = Field(..., description="소속 기업 ID")
    
    # 스트림 구조 정보
    stream_id: Optional[str] = Field(None, max_length=100, description="스트림 식별자")
    stream_metadata: Optional[Dict[str, Any]] = Field(None, description="스트림 메타데이터")

class UserRegisterOut(BaseModel):
    id: int
    uuid: str
    username: str
    full_name: str
    company_id: int
    stream_id: Optional[str]
    stream_version: int
    message: str = "사용자 등록이 완료되었습니다."

# 통합 로그인 스키마
class LoginIn(BaseModel):
    username: str = Field(..., description="로그인 ID")
    password: str = Field(..., description="비밀번호")

# 로그인 응답 스키마
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str  # "company" 또는 "user"
    user_info: Union["CompanyOut", "UserOut"]

# Company 정보 스키마 (공개용)
class CompanyOut(BaseModel):
    id: int
    uuid: str
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
    username: str
    stream_id: Optional[str]
    stream_version: int
    stream_metadata: Optional[str]
    is_stream_active: bool
    created_at: Optional[datetime]

# User 정보 스키마
class UserOut(BaseModel):
    id: int
    uuid: str
    username: str
    full_name: str
    company_id: int
    company_info: Optional[dict] = None
    role: str
    permissions: dict
    is_company_admin: bool
    can_manage_users: bool
    can_view_reports: bool
    can_edit_data: bool
    can_export_data: bool
    stream_id: Optional[str]
    stream_version: int
    stream_metadata: Optional[str]
    is_stream_active: bool
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

# User 권한 업데이트 스키마
class UserPermissionUpdate(BaseModel):
    user_id: int
    role: Optional[str] = None
    permissions: Optional[dict] = None
    is_company_admin: Optional[bool] = None
    can_manage_users: Optional[bool] = None
    can_view_reports: Optional[bool] = None
    can_edit_data: Optional[bool] = None
    can_export_data: Optional[bool] = None
    is_active: Optional[bool] = None
    stream_metadata: Optional[Dict[str, Any]] = None

# User 목록 조회 스키마
class UserListOut(BaseModel):
    users: list[UserOut]
    total_count: int
    active_count: int
    company_id: int

# 권한 정보 스키마
class PermissionInfo(BaseModel):
    role: str
    role_display_name: str
    permissions: dict
    description: str

# 스트림 메타데이터 스키마
class StreamMetadata(BaseModel):
    stream_id: str
    stream_version: int
    metadata: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime

# 상태 확인 스키마
class HealthCheck(BaseModel):
    status: str
    service: str
    timestamp: datetime

# 순환 참조 해결
TokenOut.model_rebuild()
