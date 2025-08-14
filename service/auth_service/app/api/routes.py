from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import get_db, User, Company
from schemas.auth import (
    CompanyRegisterIn, CompanyRegisterOut,
    UserRegisterIn, UserRegisterOut,
    LoginIn, TokenOut, UserOut, HealthCheck
)
from core.security import get_password_hash, verify_password, create_access_token, get_current_user
from core.logger import auth_logger
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register/company", response_model=CompanyRegisterOut, status_code=status.HTTP_201_CREATED)
async def register_company(
    company_data: CompanyRegisterIn,
    db: Session = Depends(get_db)
):
    """기업 회원가입"""
    auth_logger.info(f"Company registration attempt for business number: {company_data.biz_no}")
    
    try:
        # 사업자번호 중복 확인
        existing_company = db.query(Company).filter(Company.biz_no == company_data.biz_no).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 등록된 사업자번호입니다."
            )
        
        # username 중복 확인
        existing_username = db.query(Company).filter(Company.username == company_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 ID입니다."
            )
        
        # Company 모델에 맞는 데이터 준비 (password -> hashed_password, confirm_password 제거)
        company_dict = company_data.model_dump()
        company_dict.pop('confirm_password', None)  # confirm_password 필드 제거
        company_dict['hashed_password'] = get_password_hash(company_dict.pop('password'))  # password를 hashed_password로 변환
        
        # 새 기업 생성
        new_company = Company(**company_dict)
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        auth_logger.info(f"Company registered successfully: {new_company.id}")
        return new_company
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        auth_logger.error(f"Unexpected error during company registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="기업 등록 중 오류가 발생했습니다."
        )

@router.post("/register/user", response_model=UserRegisterOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterIn,
    db: Session = Depends(get_db)
):
    """User 회원가입"""
    auth_logger.info(f"User registration attempt for username: {user_data.username}")
    
    try:
        # 기업 존재 확인
        company = db.query(Company).filter(Company.id == user_data.company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="존재하지 않는 기업 ID입니다."
            )
        
        # username 중복 확인
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 ID입니다."
            )
        
        # 새 사용자 생성
        new_user = User(
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            company_id=user_data.company_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        auth_logger.info(f"User registered successfully: {new_user.id}")
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        auth_logger.error(f"Unexpected error during user registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="사용자 등록 중 오류가 발생했습니다."
        )

@router.post("/login", response_model=TokenOut)
async def login(
    login_data: LoginIn,
    db: Session = Depends(get_db)
):
    """사용자 로그인"""
    auth_logger.info(f"Login attempt for username: {login_data.username}")
    
    try:
        # 사용자 조회
        user = db.query(User).filter(User.username == login_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="잘못된 ID 또는 비밀번호입니다."
            )
        
        # 비밀번호 확인
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="잘못된 ID 또는 비밀번호입니다."
            )
        
        # 사용자 상태 확인
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="비활성화된 계정입니다."
            )
        
        # 액세스 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id)})
        
        auth_logger.info(f"User logged in successfully: {user.id}")
        
        return TokenOut(
            access_token=access_token,
            token_type="bearer",
            user=UserOut(
                id=user.id,
                username=user.username,
                full_name=user.full_name,
                company_id=user.company_id,
                is_active=user.is_active,
                created_at=user.created_at
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        auth_logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="로그인 중 오류가 발생했습니다."
        )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """사용자 로그아웃 (클라이언트 측에서 토큰 제거)"""
    return None

@router.get("/me", response_model=UserOut)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """현재 로그인한 사용자 정보 조회"""
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        company_id=current_user.company_id,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.get("/health", response_model=HealthCheck)
async def health_check():
    """서비스 헬스체크"""
    return HealthCheck(
        status="ok",
        timestamp=datetime.now(),
        service="auth-service"
    )
