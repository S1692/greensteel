from pydantic import BaseModel
from typing import Dict, Any, Optional
from ..entities.user import UserRole

class AddressSearchRequest(BaseModel):
    """주소 검색 요청"""
    query: str

class CheckUsernameRequest(BaseModel):
    """사용자명 중복 확인 요청"""
    username: str

class CheckCompanyIdRequest(BaseModel):
    """기업 ID 존재 확인 요청"""
    company_id: str

class CheckCompanyIdAvailabilityRequest(BaseModel):
    """기업 ID 중복 확인 요청"""
    company_id: str

class UserRegisterRequest(BaseModel):
    """사용자 등록 요청"""
    username: str
    full_name: str
    company_id: str
    password: str
    role: UserRole = UserRole.PENDING

class CompanyRegisterRequest(BaseModel):
    """회사 등록 요청"""
    company_id: str
    password: str
    Installation: str  # 사업장명
    Installation_en: str  # 사업장영문명
    economic_activity: str  # 업종명
    economic_activity_en: str  # 업종영문명
    representative: str  # 대표자명
    representative_en: str  # 영문대표자명
    email: str  # 이메일
    telephone: str  # 전화번호
    street: str  # 도로명
    street_en: str  # 도로영문명
    number: str  # 건물번호
    number_en: str  # 건물번호영문명
    postcode: str  # 우편번호
    city: str  # 도시명
    city_en: str  # 도시영문명
    country: str  # 국가명
    country_en: str  # 국가영문명
    unlocode: str  # UNLOCODE
    sourcelatitude: Optional[float] = None  # 사업장위도
    sourcelongitude: Optional[float] = None  # 사업장경도

class LoginRequest(BaseModel):
    """로그인 요청"""
    username: str
    password: str

class StandardResponse(BaseModel):
    """표준 응답"""
    success: bool
    message: str
    data: Dict[str, Any] = {}
