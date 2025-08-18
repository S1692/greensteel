from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union, Dict, Any
from datetime import datetime

# Admin(기업) 회원가입 스키마 (이미지 데이터 구조 기반)
class CompanyRegisterIn(BaseModel):
    # 계정 정보
    company_id: str = Field(..., min_length=3, max_length=100, description="로그인 ID")
    password: str = Field(..., min_length=8, description="비밀번호")
    confirm_password: str = Field(..., description="비밀번호 확인")
    
    # 사용자 직접 입력 필드
    Installation: str = Field(..., min_length=1, max_length=255, description="사업장명")
    Installation_en: Optional[str] = Field(None, max_length=255, description="사업장영문명")
    economic_activity: Optional[str] = Field(None, max_length=200, description="업종명")
    economic_activity_en: Optional[str] = Field(None, max_length=200, description="업종영문명")
    representative: Optional[str] = Field(None, max_length=100, description="대표자명")
    representative_en: Optional[str] = Field(None, max_length=100, description="영문대표자명")
    email: Optional[EmailStr] = Field(None, description="이메일")
    telephone: Optional[str] = Field(None, max_length=20, description="전화번호")
    
    # 주소 검색 모달을 통해 자동 입력되는 필드
    street: Optional[str] = Field(None, max_length=255, description="도로명")
    street_en: Optional[str] = Field(None, max_length=255, description="도로영문명")
    number: Optional[str] = Field(None, max_length=50, description="건물번호")
    number_en: Optional[str] = Field(None, max_length=50, description="건물번호영문명")
    postcode: Optional[str] = Field(None, max_length=20, description="우편번호")
    city: Optional[str] = Field(None, max_length=100, description="도시명")
    city_en: Optional[str] = Field(None, max_length=100, description="도시영문명")
    country: Optional[str] = Field(None, max_length=100, description="국가명")
    country_en: Optional[str] = Field(None, max_length=100, description="국가영문명")
    unlocode: Optional[str] = Field(None, max_length=20, description="UNLOCODE")
    sourcelatitude: Optional[float] = Field(None, description="사업장위도")
    sourcelongitude: Optional[float] = Field(None, description="사업장경도")
    
    # 스트림 구조 정보
    stream_id: Optional[str] = Field(None, max_length=100, description="스트림 식별자")
    stream_metadata: Optional[Dict[str, Any]] = Field(None, description="스트림 메타데이터")

class CompanyRegisterOut(BaseModel):
    id: int
    uuid: str
    company_id: str
    Installation: str
    Installation_en: Optional[str]
    economic_activity: Optional[str]
    economic_activity_en: Optional[str]
    representative: Optional[str]
    representative_en: Optional[str]
    email: Optional[str]
    telephone: Optional[str]
    street: Optional[str]
    street_en: Optional[str]
    number: Optional[str]
    number_en: Optional[str]
    postcode: Optional[str]
    city: Optional[str]
    city_en: Optional[str]
    country: Optional[str]
    country_en: Optional[str]
    unlocode: Optional[str]
    sourcelatitude: Optional[float]
    sourcelongitude: Optional[float]
    stream_id: Optional[str]
    stream_version: int
    message: str = "Admin(기업) 등록이 완료되었습니다."

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

# Admin(기업) 정보 스키마 (공개용)
class CompanyOut(BaseModel):
    id: int
    uuid: str
    company_id: str
    Installation: str
    Installation_en: Optional[str]
    economic_activity: Optional[str]
    economic_activity_en: Optional[str]
    representative: Optional[str]
    representative_en: Optional[str]
    email: Optional[str]
    telephone: Optional[str]
    street: Optional[str]
    street_en: Optional[str]
    number: Optional[str]
    number_en: Optional[str]
    postcode: Optional[str]
    city: Optional[str]
    city_en: Optional[str]
    country: Optional[str]
    country_en: Optional[str]
    unlocode: Optional[str]
    sourcelatitude: Optional[float]
    sourcelongitude: Optional[float]
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
