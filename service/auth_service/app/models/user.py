from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    """사용자 모델 (Company에 종속, 스트림 구조)"""
    __tablename__ = "users"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # 소속 정보 (Company에 강제 종속)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    
    # 권한 정보 (Company에서 부여)
    role = Column(String(50), default="user", nullable=False)
    permissions = Column(JSON, default=dict, nullable=False)
    is_company_admin = Column(Boolean, default=False, nullable=False)
    can_manage_users = Column(Boolean, default=False, nullable=False)
    can_view_reports = Column(Boolean, default=False, nullable=False)
    can_edit_data = Column(Boolean, default=False, nullable=False)
    can_export_data = Column(Boolean, default=False, nullable=False)
    
    # 스트림 구조 필드
    stream_id = Column(String(100), nullable=True, index=True, comment="스트림 식별자")
    stream_version = Column(Integer, default=1, nullable=False, comment="스트림 버전")
    stream_metadata = Column(Text, nullable=True, comment="스트림 메타데이터 (JSON)")
    is_stream_active = Column(Boolean, default=True, nullable=False, comment="스트림 활성 상태")
    
    # 상태 필드
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # 관계 설정 (Company 정보는 읽기 전용)
    company = relationship("Company", backref="users", lazy="joined")
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_user_uuid', 'uuid'),
        Index('idx_user_username', 'username'),
        Index('idx_user_company_id', 'company_id'),
        Index('idx_user_role', 'role'),
        Index('idx_user_stream_id', 'stream_id'),
        Index('idx_user_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, uuid='{self.uuid}', username='{self.username}', full_name='{self.full_name}', company_id={self.company_id}, role='{self.role}')>"
    
    def to_dict(self):
        """사용자 정보를 딕셔너리로 변환 (민감한 정보 제외)"""
        return {
            "id": self.id,
            "uuid": self.uuid,
            "username": self.username,
            "full_name": self.full_name,
            "company_id": self.company_id,
            "role": self.role,
            "permissions": self.permissions,
            "is_company_admin": self.is_company_admin,
            "can_manage_users": self.can_manage_users,
            "can_view_reports": self.can_view_reports,
            "can_edit_data": self.can_edit_data,
            "can_export_data": self.can_export_data,
            "stream_id": self.stream_id,
            "stream_version": self.stream_version,
            "stream_metadata": self.stream_metadata,
            "is_stream_active": self.is_stream_active,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_dict_with_company_info(self):
        """Company 기본 정보와 함께 사용자 정보 반환 (읽기 전용)"""
        company_info = None
        if self.company:
            company_info = {
                "id": self.company.id,
                "uuid": self.company.uuid,
                "name_ko": self.company.name_ko,
                "name_en": self.company.name_en,
                "biz_no": self.company.biz_no
            }
        
        return {
            "id": self.id,
            "uuid": self.uuid,
            "username": self.username,
            "full_name": self.full_name,
            "company_id": self.company_id,
            "company_info": company_info,
            "role": self.role,
            "permissions": self.permissions,
            "is_company_admin": self.is_company_admin,
            "can_manage_users": self.can_manage_users,
            "can_view_reports": self.can_view_reports,
            "can_edit_data": self.can_edit_data,
            "can_export_data": self.can_export_data,
            "stream_id": self.stream_id,
            "stream_version": self.stream_version,
            "stream_metadata": self.stream_metadata,
            "is_stream_active": self.is_stream_active,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def has_permission(self, permission_name: str) -> bool:
        """특정 권한이 있는지 확인"""
        if self.is_company_admin:
            return True
        
        if hasattr(self, permission_name):
            return getattr(self, permission_name, False)
        
        return self.permissions.get(permission_name, False)
    
    def get_role_display_name(self) -> str:
        """역할의 표시명 반환"""
        role_names = {
            "super_admin": "최고 관리자",
            "company_admin": "기업 관리자",
            "manager": "매니저",
            "user": "일반 사용자",
            "viewer": "조회 전용"
        }
        return role_names.get(self.role, self.role)
    
    def update_stream_version(self):
        """스트림 버전 업데이트"""
        self.stream_version += 1
        self.updated_at = func.now()
    
    def set_stream_metadata(self, metadata: dict):
        """스트림 메타데이터 설정"""
        import json
        self.stream_metadata = json.dumps(metadata, ensure_ascii=False)
        self.update_stream_version()
