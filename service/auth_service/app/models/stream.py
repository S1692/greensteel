from sqlalchemy import Column, Integer, String, DateTime, Index, Text, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class StreamEvent(Base):
    """스트림 이벤트 모델"""
    __tablename__ = "stream_events"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # 스트림 식별 정보
    stream_id = Column(String(100), nullable=False, index=True, comment="스트림 식별자")
    stream_type = Column(String(50), nullable=False, index=True, comment="스트림 타입 (company, user, lca, cbam 등)")
    entity_id = Column(Integer, nullable=False, comment="연관된 엔티티 ID")
    entity_type = Column(String(50), nullable=False, comment="엔티티 타입")
    
    # 이벤트 정보
    event_type = Column(String(100), nullable=False, comment="이벤트 타입 (create, update, delete, status_change 등)")
    event_version = Column(Integer, nullable=False, comment="이벤트 버전")
    event_data = Column(JSON, nullable=True, comment="이벤트 데이터")
    event_metadata = Column(Text, nullable=True, comment="이벤트 메타데이터 (JSON)")
    
    # 상태 정보
    is_active = Column(Boolean, default=True, nullable=False, comment="이벤트 활성 상태")
    processed_at = Column(DateTime, nullable=True, comment="처리 완료 시간")
    
    # 시스템 필드
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_stream_event_uuid', 'uuid'),
        Index('idx_stream_event_stream_id', 'stream_id'),
        Index('idx_stream_event_type', 'stream_type'),
        Index('idx_stream_event_entity', 'entity_id', 'entity_type'),
        Index('idx_stream_event_version', 'stream_id', 'event_version'),
        Index('idx_stream_event_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<StreamEvent(id={self.id}, uuid='{self.uuid}', stream_id='{self.stream_id}', event_type='{self.event_type}', version={self.event_version})>"
    
    def to_dict(self):
        """스트림 이벤트 정보를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "uuid": self.uuid,
            "stream_id": self.stream_id,
            "stream_type": self.stream_type,
            "entity_id": self.entity_id,
            "entity_type": self.entity_type,
            "event_type": self.event_type,
            "event_version": self.event_version,
            "event_data": self.event_data,
            "event_metadata": self.event_metadata,
            "is_active": self.is_active,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class StreamSnapshot(Base):
    """스트림 스냅샷 모델"""
    __tablename__ = "stream_snapshots"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # 스트림 식별 정보
    stream_id = Column(String(100), nullable=False, index=True, comment="스트림 식별자")
    stream_type = Column(String(50), nullable=False, index=True, comment="스트림 타입")
    entity_id = Column(Integer, nullable=False, comment="연관된 엔티티 ID")
    entity_type = Column(String(50), nullable=False, comment="엔티티 타입")
    
    # 스냅샷 정보
    snapshot_version = Column(Integer, nullable=False, comment="스냅샷 버전")
    snapshot_data = Column(JSON, nullable=False, comment="스냅샷 데이터")
    snapshot_metadata = Column(Text, nullable=True, comment="스냅샷 메타데이터 (JSON)")
    
    # 상태 정보
    is_latest = Column(Boolean, default=False, nullable=False, comment="최신 스냅샷 여부")
    is_active = Column(Boolean, default=True, nullable=False, comment="스냅샷 활성 상태")
    
    # 시스템 필드
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_stream_snapshot_uuid', 'uuid'),
        Index('idx_stream_snapshot_stream_id', 'stream_id'),
        Index('idx_stream_snapshot_type', 'stream_type'),
        Index('idx_stream_snapshot_entity', 'entity_id', 'entity_type'),
        Index('idx_stream_snapshot_version', 'stream_id', 'snapshot_version'),
        Index('idx_stream_snapshot_latest', 'stream_id', 'is_latest'),
        Index('idx_stream_snapshot_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<StreamSnapshot(id={self.id}, uuid='{self.uuid}', stream_id='{self.stream_id}', version={self.snapshot_version}, is_latest={self.is_latest})>"
    
    def to_dict(self):
        """스트림 스냅샷 정보를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "uuid": self.uuid,
            "stream_id": self.stream_id,
            "stream_type": self.stream_type,
            "entity_id": self.entity_id,
            "entity_type": self.entity_type,
            "snapshot_version": self.snapshot_version,
            "snapshot_data": self.snapshot_data,
            "snapshot_metadata": self.snapshot_metadata,
            "is_latest": self.is_latest,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class StreamAudit(Base):
    """스트림 감사 로그 모델"""
    __tablename__ = "stream_audits"
    
    # 기본 필드
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # 스트림 식별 정보
    stream_id = Column(String(100), nullable=False, index=True, comment="스트림 식별자")
    stream_type = Column(String(50), nullable=False, index=True, comment="스트림 타입")
    entity_id = Column(Integer, nullable=False, comment="연관된 엔티티 ID")
    entity_type = Column(String(50), nullable=False, comment="엔티티 타입")
    
    # 감사 정보
    action = Column(String(100), nullable=False, comment="수행된 액션")
    user_id = Column(Integer, nullable=True, comment="수행한 사용자 ID")
    user_type = Column(String(50), nullable=True, comment="사용자 타입 (company, user)")
    changes = Column(JSON, nullable=True, comment="변경 사항")
    reason = Column(String(500), nullable=True, comment="변경 사유")
    
    # 시스템 필드
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # 인덱스 설정
    __table_args__ = (
        Index('idx_stream_audit_uuid', 'uuid'),
        Index('idx_stream_audit_stream_id', 'stream_id'),
        Index('idx_stream_audit_type', 'stream_type'),
        Index('idx_stream_audit_entity', 'entity_id', 'entity_type'),
        Index('idx_stream_audit_action', 'action'),
        Index('idx_stream_audit_user', 'user_id', 'user_type'),
        Index('idx_stream_audit_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<StreamAudit(id={self.id}, uuid='{self.uuid}', stream_id='{self.stream_id}', action='{self.action}', user_id={self.user_id})>"
    
    def to_dict(self):
        """스트림 감사 정보를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "uuid": self.uuid,
            "stream_id": self.stream_id,
            "stream_type": self.stream_type,
            "entity_id": self.entity_id,
            "entity_type": self.entity_type,
            "action": self.action,
            "user_id": self.user_id,
            "user_type": self.user_type,
            "changes": self.changes,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
