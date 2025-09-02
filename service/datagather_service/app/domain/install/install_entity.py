# ============================================================================
# 🏗️ Install Entity - 사업장 엔티티
# ============================================================================

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Install(Base):
    """사업장 엔티티"""
    
    __tablename__ = "install"
    
    # 기본 컬럼
    id = Column(Integer, primary_key=True, autoincrement=True, comment="사업장 ID")
    
    # 사업장 정보
    install_name = Column(String(255), nullable=False, comment="사업장명")
    company_name = Column(String(255), nullable=False, comment="회사명")
    business_number = Column(String(20), nullable=True, comment="사업자등록번호")
    
    # 위치 정보
    address = Column(Text, nullable=True, comment="주소")
    city = Column(String(100), nullable=True, comment="도시")
    country = Column(String(100), nullable=True, comment="국가")
    postal_code = Column(String(20), nullable=True, comment="우편번호")
    
    # 연락처 정보
    contact_person = Column(String(100), nullable=True, comment="담당자")
    contact_email = Column(String(255), nullable=True, comment="담당자 이메일")
    contact_phone = Column(String(50), nullable=True, comment="담당자 전화번호")
    
    # 사업장 특성
    industry_type = Column(String(100), nullable=True, comment="산업 분류")
    facility_type = Column(String(100), nullable=True, comment="시설 유형")
    capacity = Column(String(100), nullable=True, comment="시설 규모")
    
    # 상태 정보
    is_active = Column(String(1), nullable=False, default="Y", comment="활성 상태 (Y/N)")
    status = Column(String(20), nullable=False, default="active", comment="상태 (active, inactive, suspended)")
    
    # 메타데이터
    description = Column(Text, nullable=True, comment="사업장 설명")
    tags = Column(Text, nullable=True, comment="태그 (JSON 형태)")
    metadata = Column(Text, nullable=True, comment="추가 메타데이터 (JSON 형태)")
    
    # 시간 정보
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="생성 시간")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="수정 시간")
    
    # 인덱스 정의
    __table_args__ = (
        Index('idx_install_name', 'install_name'),
        Index('idx_install_company', 'company_name'),
        Index('idx_install_business_number', 'business_number'),
        Index('idx_install_city', 'city'),
        Index('idx_install_country', 'country'),
        Index('idx_install_status', 'status'),
        {'comment': '사업장 테이블'}
    )
    
    def __repr__(self):
        return f"<Install(id={self.id}, install_name='{self.install_name}', company_name='{self.company_name}')>"
    
    def to_dict(self):
        """엔티티를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'install_name': self.install_name,
            'company_name': self.company_name,
            'business_number': self.business_number,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'postal_code': self.postal_code,
            'contact_person': self.contact_person,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'industry_type': self.industry_type,
            'facility_type': self.facility_type,
            'capacity': self.capacity,
            'is_active': self.is_active,
            'status': self.status,
            'description': self.description,
            'tags': self.tags,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """딕셔너리에서 엔티티 생성"""
        return cls(
            install_name=data.get('install_name'),
            company_name=data.get('company_name'),
            business_number=data.get('business_number'),
            address=data.get('address'),
            city=data.get('city'),
            country=data.get('country'),
            postal_code=data.get('postal_code'),
            contact_person=data.get('contact_person'),
            contact_email=data.get('contact_email'),
            contact_phone=data.get('contact_phone'),
            industry_type=data.get('industry_type'),
            facility_type=data.get('facility_type'),
            capacity=data.get('capacity'),
            is_active=data.get('is_active', 'Y'),
            status=data.get('status', 'active'),
            description=data.get('description'),
            tags=data.get('tags'),
            metadata=data.get('metadata')
        )
