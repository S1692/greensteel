from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Union
from app.common.db import get_db
from app.domain.entities.user import User
from app.domain.entities.admin import Admin
from app.domain.schemas.auth import (
    AdminRegisterIn, AdminRegisterOut,
    UserRegisterIn, UserRegisterOut,
    LoginIn, TokenOut, UserOut, AdminOut, HealthCheck
)
from app.common.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.common.logger import auth_logger
from lib.stream_utils import (
    generate_stream_id, create_stream_event, create_stream_snapshot
)
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register/admin", response_model=AdminRegisterOut, status_code=status.HTTP_201_CREATED)
async def register_admin(
    admin_data: AdminRegisterIn,
    db: Session = Depends(get_db)
):
    """Admin 회원가입 (이미지 데이터 구조 기반)"""
    auth_logger.info(f"Admin registration attempt for admin_id: {admin_data.admin_id}")
    
    try:
        # admin_id 중복 확인
        existing_admin = db.query(Admin).filter(Admin.admin_id == admin_data.admin_id).first()
        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 Admin ID입니다."
            )
        
        # Admin 모델에 맞는 데이터 준비 (password -> hashed_password, confirm_password 제거)
        admin_dict = admin_data.model_dump()
        admin_dict.pop('confirm_password', None)  # confirm_password 필드 제거
        admin_dict['hashed_password'] = get_password_hash(admin_dict.pop('password'))  # password를 hashed_password로 변환
        
        # 스트림 ID 생성
        stream_id = admin_data.stream_id or generate_stream_id("admin", 0, "auth")
        admin_dict['stream_id'] = stream_id
        
        # 새 Admin 생성
        new_admin = Admin(**admin_dict)
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        # 스트림 이벤트 생성
        try:
            create_stream_event(
                db=db,
                stream_id=stream_id,
                stream_type="admin",
                entity_id=new_admin.id,
                entity_type="admin",
                event_type="admin_created",
                event_data={
                    "admin_id": new_admin.id,
                    "admin_uuid": new_admin.uuid,
                    "admin_login_id": new_admin.admin_id,
                    "Installation": new_admin.Installation,
                    "postcode": new_admin.postcode,
                    "city": new_admin.city,
                    "country": new_admin.country
                },
                event_metadata={
                    "registration_source": "auth_service",
                    "stream_metadata": admin_data.stream_metadata
                }
            )
            
            # 스트림 스냅샷 생성
            create_stream_snapshot(
                db=db,
                stream_id=stream_id,
                stream_type="admin",
                entity_id=new_admin.id,
                entity_type="admin",
                snapshot_data=new_admin.to_dict(),
                snapshot_metadata={
                    "snapshot_type": "admin_registration",
                    "created_by": "auth_service"
                }
            )
        except Exception as stream_error:
            auth_logger.warning(f"Stream event/snapshot creation failed for admin {new_admin.id}: {str(stream_error)}")
            # 스트림 생성 실패는 회원가입을 막지 않음
        
        auth_logger.info(f"Admin registered successfully: {new_admin.id} with stream_id: {stream_id}")
        return new_admin
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        auth_logger.error(f"Unexpected error during admin registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin 등록 중 오류가 발생했습니다."
        )

@router.post("/register/user", response_model=UserRegisterOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterIn,
    db: Session = Depends(get_db)
):
    """User 회원가입 (Admin에 종속, 스트림 구조 지원)"""
    auth_logger.info(f"User registration attempt for username: {user_data.username}")
    
    try:
        # Admin 존재 확인
        admin = db.query(Admin).filter(Admin.id == user_data.admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="존재하지 않는 Admin ID입니다."
            )
        
        # username 중복 확인
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 User ID입니다."
            )
        
        # 스트림 ID 생성
        stream_id = user_data.stream_id or generate_stream_id("user", 0, "auth")
        
        # 새 사용자 생성
        new_user = User(
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            admin_id=user_data.admin_id,
            stream_id=stream_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # 스트림 이벤트 생성
        try:
            create_stream_event(
                db=db,
                stream_id=stream_id,
                stream_type="user",
                entity_id=new_user.id,
                entity_type="user",
                event_type="user_created",
                event_data={
                    "user_id": new_user.id,
                    "user_uuid": new_user.uuid,
                    "username": new_user.username,
                    "admin_id": new_user.admin_id
                },
                event_metadata={
                    "registration_source": "auth_service",
                    "stream_metadata": user_data.stream_metadata
                }
            )
            
            # 스트림 스냅샷 생성
            create_stream_snapshot(
                db=db,
                stream_id=stream_id,
                stream_type="user",
                entity_id=new_user.id,
                entity_type="user",
                snapshot_data=new_user.to_dict(),
                snapshot_metadata={
                    "snapshot_type": "user_registration",
                    "created_by": "auth_service"
                }
            )
        except Exception as stream_error:
            auth_logger.warning(f"Stream event/snapshot creation failed for user {new_user.id}: {str(stream_error)}")
            # 스트림 생성 실패는 회원가입을 막지 않음
        
        auth_logger.info(f"User registered successfully: {new_user.id} with stream_id: {stream_id}")
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
    """사용자 로그인 (Admin과 User 구분)"""
    auth_logger.info(f"Login attempt for username: {login_data.username}")
    
    try:
        # Admin 로그인 시도
        admin = db.query(Admin).filter(Admin.admin_id == login_data.username).first()
        if admin:
            # 비밀번호 확인
            if not verify_password(login_data.password, admin.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="잘못된 Admin ID 또는 비밀번호입니다."
                )
            
            # 액세스 토큰 생성
            access_token = create_access_token(data={"sub": str(admin.id), "type": "admin"})
            
            # 스트림 이벤트 생성 (Admin 로그인)
            if admin.stream_id:
                try:
                    create_stream_event(
                        db=db,
                        stream_id=admin.stream_id,
                        stream_type="admin",
                        entity_id=admin.id,
                        entity_type="admin",
                        event_type="admin_login",
                        event_data={
                            "admin_id": admin.id,
                            "login_timestamp": datetime.now().isoformat(),
                            "ip_address": "unknown"  # 실제로는 요청에서 추출
                        },
                        event_metadata={
                            "event_source": "auth_service",
                            "login_method": "password"
                        }
                    )
                except Exception as stream_error:
                    auth_logger.warning(f"Stream event creation failed for admin login {admin.id}: {str(stream_error)}")
            
            auth_logger.info(f"Admin login successful: {admin.id}")
            return TokenOut(
                access_token=access_token,
                user_type="admin",
                user_info=admin
            )
        
        # User 로그인 시도
        user = db.query(User).filter(User.username == login_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="잘못된 User ID 또는 비밀번호입니다."
            )
        
        # 비밀번호 확인
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="잘못된 User ID 또는 비밀번호입니다."
            )
        
        # 사용자 상태 확인
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="비활성화된 계정입니다."
            )
        
        # 액세스 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id), "type": "user"})
        
        # 스트림 이벤트 생성 (User 로그인)
        if user.stream_id:
            try:
                create_stream_event(
                    db=db,
                    stream_id=user.stream_id,
                    stream_type="user",
                    entity_id=user.id,
                    entity_type="user",
                    event_type="user_login",
                    event_data={
                        "user_id": user.id,
                        "login_timestamp": datetime.now().isoformat(),
                        "ip_address": "unknown"  # 실제로는 요청에서 추출
                    },
                    event_metadata={
                        "event_source": "auth_service",
                        "login_method": "password"
                    }
                )
            except Exception as stream_error:
                auth_logger.warning(f"Stream event creation failed for user login {user.id}: {str(stream_error)}")
        
        auth_logger.info(f"User logged in successfully: {user.id}")
        
        return TokenOut(
            access_token=access_token,
            token_type="bearer",
            user_type="user",
            user_info=UserOut(
                id=user.id,
                uuid=user.uuid,
                username=user.username,
                full_name=user.full_name,
                admin_id=user.admin_id,
                admin_info=None,
                role=user.role,
                permissions=user.permissions,
                is_admin_user=user.is_admin_user,
                can_manage_users=user.can_manage_users,
                can_view_reports=user.can_view_reports,
                can_edit_data=user.can_edit_data,
                can_export_data=user.can_export_data,
                stream_id=user.stream_id,
                stream_version=user.stream_version,
                stream_metadata=user.stream_metadata,
                is_stream_active=user.is_stream_active,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        auth_logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin/User 로그인 중 오류가 발생했습니다."
        )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """사용자 로그아웃 (클라이언트 측에서 토큰 제거)"""
    return None

@router.get("/me")
async def get_current_user_info(
    current_user: Union[User, Admin] = Depends(get_current_user)
):
    """현재 로그인한 사용자 정보 조회 (Admin과 User 구분)"""
    if hasattr(current_user, 'username'):  # User인 경우
        return UserOut(
            id=current_user.id,
            uuid=current_user.uuid,
            username=current_user.username,
            full_name=current_user.full_name,
            admin_id=current_user.admin_id,
            admin_info=None,
            role=current_user.role,
            permissions=current_user.permissions,
            is_admin_user=current_user.is_admin_user,
            can_manage_users=current_user.can_manage_users,
            can_view_reports=current_user.can_view_reports,
            can_edit_data=current_user.can_edit_data,
            can_export_data=current_user.can_export_data,
            stream_id=current_user.stream_id,
            stream_version=current_user.stream_version,
            stream_metadata=current_user.stream_metadata,
            is_stream_active=current_user.is_stream_active,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    else:  # Admin인 경우
        return AdminOut(
            id=current_user.id,
            uuid=current_user.uuid,
            admin_id=current_user.admin_id,
            Installation=current_user.Installation,
            Installation_en=current_user.Installation_en,
            economic_activity=current_user.economic_activity,
            economic_activity_en=current_user.economic_activity_en,
            representative=current_user.representative,
            representative_en=current_user.representative_en,
            email=current_user.email,
            telephone=current_user.telephone,
            street=current_user.street,
            street_en=current_user.street_en,
            number=current_user.number,
            number_en=current_user.number_en,
            postcode=current_user.postcode,
            city=current_user.city,
            city_en=current_user.city_en,
            country=current_user.country,
            country_en=current_user.country_en,
            unlocode=current_user.unlocode,
            sourcelatitude=current_user.sourcelatitude,
            sourcelongitude=current_user.sourcelongitude,
            stream_id=current_user.stream_id,
            stream_version=current_user.stream_version,
            stream_metadata=current_user.stream_metadata,
            is_stream_active=current_user.is_stream_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )

@router.get("/health", response_model=HealthCheck)
async def health_check():
    """서비스 헬스체크"""
    return HealthCheck(
        status="ok",
        timestamp=datetime.now(),
        service="auth-service"
    )
