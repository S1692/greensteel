from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import get_db, User
from schemas.auth import RegisterIn, LoginIn, TokenOut, UserOut
from core.security import get_current_user, authenticate_user, get_password_hash, create_access_token
from core.logger import auth_logger

# 라우터 생성
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterIn, db: Session = Depends(get_db)):
    """사용자 회원가입"""
    auth_logger.info(f"Registration attempt for email: {user_data.email}")
    
    try:
        # 이메일 중복 체크
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            auth_logger.warning(f"Registration failed: Email already exists - {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 등록된 이메일입니다."
            )
        
        # 비밀번호 해시 생성
        hashed_password = get_password_hash(user_data.password)
        
        # 새 사용자 생성
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        auth_logger.info(f"User registered successfully: {new_user.email}")
        
        # UserOut 스키마로 변환하여 반환
        return UserOut(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )
        
    except IntegrityError as e:
        db.rollback()
        auth_logger.error(f"Database integrity error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="데이터베이스 오류가 발생했습니다."
        )
    except Exception as e:
        db.rollback()
        auth_logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 오류가 발생했습니다."
        )

@router.post("/login", response_model=TokenOut)
async def login(user_credentials: LoginIn, db: Session = Depends(get_db)):
    """사용자 로그인"""
    auth_logger.info(f"Login attempt for email: {user_credentials.email}")
    
    try:
        # 사용자 인증
        user = authenticate_user(db, user_credentials.email, user_credentials.password)
        if not user:
            auth_logger.warning(f"Login failed: Invalid credentials for {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # 액세스 토큰 생성
        access_token = create_access_token(data={"sub": user.id})
        
        auth_logger.info(f"User logged in successfully: {user.email}")
        
        return TokenOut(
            access_token=access_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        auth_logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 오류가 발생했습니다."
        )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: User = Depends(get_current_user)):
    """사용자 로그아웃 (토큰 무효화 없음, 클라이언트 측에서 처리)"""
    auth_logger.info(f"User logout: {current_user.email}")
    
    # 현재는 단순히 204 응답만 반환
    # 향후 토큰 블랙리스트 기능 확장 가능
    return None

@router.get("/me", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    """현재 사용자 프로필 조회"""
    auth_logger.info(f"Profile request for user: {current_user.email}")
    
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
