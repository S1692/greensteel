from fastapi import APIRouter
from app.domain.schemas.auth import (
    UserRegisterRequest, 
    CompanyRegisterRequest,
    LoginRequest,
    StandardResponse,
    CheckUsernameRequest,
    CheckCompanyIdRequest,
    CheckCompanyIdAvailabilityRequest,
    GetUserInfoRequest,
    GetCompanyInfoRequest,
    UpdateCompanyInfoRequest
)
from app.domain.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# 서비스 인스턴스
auth_service = AuthService()



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
        source_latitude=request.source_latitude,
        source_longitude=request.source_longitude
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

@router.post("/user/info", response_model=StandardResponse)
async def get_user_info(request: GetUserInfoRequest):
    """사용자 정보 조회"""
    result = await auth_service.get_user_info(request.username)
    return StandardResponse(**result)

@router.post("/company/info", response_model=StandardResponse)
async def get_company_info(request: GetCompanyInfoRequest):
    """기업 정보 조회"""
    result = await auth_service.get_company_info(request.company_id)
    return StandardResponse(**result)

@router.put("/company/info", response_model=StandardResponse)
async def update_company_info(request: UpdateCompanyInfoRequest):
    """기업 정보 업데이트"""
    result = await auth_service.update_company_info(
        company_id=request.company_id,
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
        source_latitude=request.source_latitude,
        source_longitude=request.source_longitude
    )
    return StandardResponse(**result)
