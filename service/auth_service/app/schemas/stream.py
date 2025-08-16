from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# 스트림 이벤트 스키마
class StreamEventIn(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    stream_type: str = Field(..., description="스트림 타입")
    entity_id: int = Field(..., description="연관된 엔티티 ID")
    entity_type: str = Field(..., description="엔티티 타입")
    event_type: str = Field(..., description="이벤트 타입")
    event_data: Optional[Dict[str, Any]] = Field(None, description="이벤트 데이터")
    event_metadata: Optional[Dict[str, Any]] = Field(None, description="이벤트 메타데이터")

class StreamEventOut(BaseModel):
    id: int
    uuid: str
    stream_id: str
    stream_type: str
    entity_id: int
    entity_type: str
    event_type: str
    event_version: int
    event_data: Optional[Dict[str, Any]]
    event_metadata: Optional[str]
    is_active: bool
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

# 스트림 스냅샷 스키마
class StreamSnapshotIn(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    stream_type: str = Field(..., description="스트림 타입")
    entity_id: int = Field(..., description="연관된 엔티티 ID")
    entity_type: str = Field(..., description="엔티티 타입")
    snapshot_data: Dict[str, Any] = Field(..., description="스냅샷 데이터")
    snapshot_metadata: Optional[Dict[str, Any]] = Field(None, description="스냅샷 메타데이터")

class StreamSnapshotOut(BaseModel):
    id: int
    uuid: str
    stream_id: str
    stream_type: str
    entity_id: int
    entity_type: str
    snapshot_version: int
    snapshot_data: Dict[str, Any]
    snapshot_metadata: Optional[str]
    is_latest: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

# 스트림 감사 로그 스키마
class StreamAuditIn(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    stream_type: str = Field(..., description="스트림 타입")
    entity_id: int = Field(..., description="연관된 엔티티 ID")
    entity_type: str = Field(..., description="엔티티 타입")
    action: str = Field(..., description="수행된 액션")
    user_id: Optional[int] = Field(None, description="수행한 사용자 ID")
    user_type: Optional[str] = Field(None, description="사용자 타입")
    changes: Optional[Dict[str, Any]] = Field(None, description="변경 사항")
    reason: Optional[str] = Field(None, description="변경 사유")

class StreamAuditOut(BaseModel):
    id: int
    uuid: str
    stream_id: str
    stream_type: str
    entity_id: int
    entity_type: str
    action: str
    user_id: Optional[int]
    user_type: Optional[str]
    changes: Optional[Dict[str, Any]]
    reason: Optional[str]
    created_at: datetime

# 스트림 히스토리 조회 스키마
class StreamHistoryQuery(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    include_events: bool = Field(True, description="이벤트 포함 여부")
    include_snapshots: bool = Field(True, description="스냅샷 포함 여부")
    limit: int = Field(100, description="조회 제한 수")
    offset: int = Field(0, description="조회 시작 위치")

class StreamHistoryOut(BaseModel):
    stream_id: str
    events: List[StreamEventOut]
    snapshots: List[StreamSnapshotOut]
    audits: List[StreamAuditOut]

# 스트림 메타데이터 업데이트 스키마
class StreamMetadataUpdate(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    metadata: Dict[str, Any] = Field(..., description="업데이트할 메타데이터")
    user_id: Optional[int] = Field(None, description="사용자 ID")
    user_type: Optional[str] = Field(None, description="사용자 타입")

# 스트림 비활성화 스키마
class StreamDeactivation(BaseModel):
    stream_id: str = Field(..., description="스트림 식별자")
    reason: Optional[str] = Field(None, description="비활성화 사유")
    user_id: Optional[int] = Field(None, description="사용자 ID")
    user_type: Optional[str] = Field(None, description="사용자 타입")

# 스트림 통계 스키마
class StreamStats(BaseModel):
    stream_id: str
    total_events: int
    total_snapshots: int
    total_audits: int
    latest_event_version: int
    latest_snapshot_version: int
    is_active: bool
    created_at: datetime
    last_updated: datetime

# 스트림 검색 스키마
class StreamSearchQuery(BaseModel):
    stream_type: Optional[str] = Field(None, description="스트림 타입")
    entity_type: Optional[str] = Field(None, description="엔티티 타입")
    entity_id: Optional[int] = Field(None, description="엔티티 ID")
    event_type: Optional[str] = Field(None, description="이벤트 타입")
    user_id: Optional[int] = Field(None, description="사용자 ID")
    start_date: Optional[datetime] = Field(None, description="시작 날짜")
    end_date: Optional[datetime] = Field(None, description="종료 날짜")
    limit: int = Field(100, description="조회 제한 수")
    offset: int = Field(0, description="조회 시작 위치")

class StreamSearchResult(BaseModel):
    total_count: int
    results: List[StreamEventOut]
    has_more: bool

# 스트림 상태 스키마
class StreamStatus(BaseModel):
    stream_id: str
    status: str  # "active", "inactive", "error", "processing"
    last_event_at: Optional[datetime]
    last_snapshot_at: Optional[datetime]
    error_message: Optional[str]
    processing_status: Optional[str]
