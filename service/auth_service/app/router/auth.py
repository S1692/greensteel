from fastapi import APIRouter, HTTPException
from app.domain.schemas.auth import (
    AddressSearchRequest, 
    UserRegisterRequest, 
    CompanyRegisterRequest,
    LoginRequest,
    StandardResponse,
    CheckUsernameRequest,
    CheckCompanyIdRequest,
    CheckCompanyIdAvailabilityRequest
)
from app.domain.services.address_service import AddressService
from app.domain.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# 서비스 인스턴스
address_service = AddressService()
auth_service = AuthService()

@router.post("/address/search", response_model=StandardResponse)
async def search_address(request: AddressSearchRequest):
    """카카오 주소 검색 API"""
    result = await address_service.search_address(request.query)
    return StandardResponse(**result)

@router.post("/check-username", response_model=StandardResponse)
async def check_username(request: CheckUsernameRequest):
    """사용자명 중복 확인"""
    result = await auth_service.check_username(request.username)
    return StandardResponse(**result)

@router.post("/check-company-id", response_model=StandardResponse)
async def check_company_id(request: CheckCompanyIdRequest):
    """기업 ID 존재 확인"""
    result = await auth_service.check_company_id(request.company_id)
    return StandardResponse(**result)

@router.post("/check-company-id-availability", response_model=StandardResponse)
async def check_company_id_availability(request: CheckCompanyIdAvailabilityRequest):
    """기업 ID 중복 확인"""
    result = await auth_service.check_company_id_availability(request.company_id)
    return StandardResponse(**result)

@router.post("/register/user", response_model=StandardResponse)
async def register_user(request: UserRegisterRequest):
    """사용자 등록"""
    result = await auth_service.register_user(
        username=request.username,
        full_name=request.full_name,
        company_id=request.company_id,
        password=request.password,
        role=request.role
    )
    return StandardResponse(**result)

@router.post("/register/company", response_model=StandardResponse)
async def register_company(request: CompanyRegisterRequest):
    """회사 등록"""
    result = await auth_service.register_company(
        company_id=request.company_id,
        password=request.password,
        Installation=request.Installation,
        Installation_en=request.Installation_en,
        economic_activity=request.economic_activity,
        economic_activity_en=request.economic_activity_en,
        representative=request.representative,
        representative_en=request.representative_en,
        email=request.email,
        telephone=request.telephone,
        street=request.street,
        street_en=request.street_en,
        number=request.number,
        number_en=request.number_en,
        postcode=request.postcode,
        city=request.city,
        city_en=request.city_en,
        country=request.country,
        country_en=request.country_en,
        unlocode=request.unlocode,
        sourcelatitude=request.sourcelatitude,
        sourcelongitude=request.sourcelongitude
    )
    return StandardResponse(**result)

@router.post("/login", response_model=StandardResponse)
async def login(request: LoginRequest):
    """로그인"""
    result = await auth_service.login(
        username=request.username,
        password=request.password
    )
    return StandardResponse(**result)
