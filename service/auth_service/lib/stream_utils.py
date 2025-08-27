"""
스트림 구조를 위한 유틸리티 함수들
"""
import uuid
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.entities.stream import StreamEvent, StreamSnapshot, StreamAudit

def generate_stream_id(entity_type: str, entity_id: int, prefix: str = "") -> str:
    """스트림 ID 생성"""
    if prefix:
        return f"{prefix}_{entity_type}_{entity_id}_{uuid.uuid4().hex[:8]}"
    return f"{entity_type}_{entity_id}_{uuid.uuid4().hex[:8]}"

def create_stream_event(
    db: Session,
    stream_id: str,
    stream_type: str,
    entity_id: int,
    entity_type: str,
    event_type: str,
    event_data: Optional[Dict[str, Any]] = None,
    event_metadata: Optional[Dict[str, Any]] = None,
    user_id: Optional[int] = None,
    user_type: Optional[str] = None
) -> StreamEvent:
    """스트림 이벤트 생성"""
    
    # 기존 이벤트들의 최대 버전 확인
    latest_event = db.query(StreamEvent).filter(
        StreamEvent.stream_id == stream_id
    ).order_by(StreamEvent.event_version.desc()).first()
    
    event_version = 1
    if latest_event:
        event_version = latest_event.event_version + 1
    
    # 새 이벤트 생성
    stream_event = StreamEvent(
        stream_id=stream_id,
        stream_type=stream_type,
        entity_id=entity_id,
        entity_type=entity_type,
        event_type=event_type,
        event_version=event_version,
        event_data=event_data,
        event_metadata=json.dumps(event_metadata, ensure_ascii=False) if event_metadata else None
    )
    
    db.add(stream_event)
    db.commit()
    db.refresh(stream_event)
    
    # 감사 로그 생성
    create_stream_audit(
        db=db,
        stream_id=stream_id,
        stream_type=stream_type,
        entity_id=entity_id,
        entity_type=entity_type,
        action=f"event_{event_type}",
        user_id=user_id,
        user_type=user_type,
        changes={"event_type": event_type, "event_version": event_version}
    )
    
    return stream_event

def create_stream_snapshot(
    db: Session,
    stream_id: str,
    stream_type: str,
    entity_id: int,
    entity_type: str,
    snapshot_data: Dict[str, Any],
    snapshot_metadata: Optional[Dict[str, Any]] = None,
    user_id: Optional[int] = None,
    user_type: Optional[str] = None
) -> StreamSnapshot:
    """스트림 스냅샷 생성"""
    
    # 기존 최신 스냅샷을 비활성화
    db.query(StreamSnapshot).filter(
        StreamSnapshot.stream_id == stream_id,
        StreamSnapshot.is_latest == True
    ).update({"is_latest": False})
    
    # 기존 스냅샷들의 최대 버전 확인
    latest_snapshot = db.query(StreamSnapshot).filter(
        StreamSnapshot.stream_id == stream_id
    ).order_by(StreamSnapshot.snapshot_version.desc()).first()
    
    snapshot_version = 1
    if latest_snapshot:
        snapshot_version = latest_snapshot.snapshot_version + 1
    
    # 새 스냅샷 생성
    stream_snapshot = StreamSnapshot(
        stream_id=stream_id,
        stream_type=stream_type,
        entity_id=entity_id,
        entity_type=entity_type,
        snapshot_version=snapshot_version,
        snapshot_data=snapshot_data,
        snapshot_metadata=json.dumps(snapshot_metadata, ensure_ascii=False) if snapshot_metadata else None,
        is_latest=True
    )
    
    db.add(stream_snapshot)
    db.commit()
    db.refresh(stream_snapshot)
    
    # 감사 로그 생성
    create_stream_audit(
        db=db,
        stream_id=stream_id,
        stream_type=stream_type,
        entity_id=entity_id,
        entity_type=entity_type,
        action="snapshot_created",
        user_id=user_id,
        user_type=user_type,
        changes={"snapshot_version": snapshot_version}
    )
    
    return stream_snapshot

def create_stream_audit(
    db: Session,
    stream_id: str,
    stream_type: str,
    entity_id: int,
    entity_type: str,
    action: str,
    user_id: Optional[int] = None,
    user_type: Optional[str] = None,
    changes: Optional[Dict[str, Any]] = None,
    reason: Optional[str] = None
) -> StreamAudit:
    """스트림 감사 로그 생성"""
    
    stream_audit = StreamAudit(
        stream_id=stream_id,
        stream_type=stream_type,
        entity_id=entity_id,
        entity_type=entity_type,
        action=action,
        user_id=user_id,
        user_type=user_type,
        changes=changes,
        reason=reason
    )
    
    db.add(stream_audit)
    db.commit()
    db.refresh(stream_audit)
    
    return stream_audit

def get_stream_events(
    db: Session,
    stream_id: str,
    limit: int = 100,
    offset: int = 0
) -> List[StreamEvent]:
    """스트림 이벤트 조회"""
    return db.query(StreamEvent).filter(
        StreamEvent.stream_id == stream_id,
        StreamEvent.is_active == True
    ).order_by(StreamEvent.event_version.desc()).offset(offset).limit(limit).all()

def get_latest_snapshot(
    db: Session,
    stream_id: str
) -> Optional[StreamSnapshot]:
    """최신 스트림 스냅샷 조회"""
    return db.query(StreamSnapshot).filter(
        StreamSnapshot.stream_id == stream_id,
        StreamSnapshot.is_latest == True,
        StreamSnapshot.is_active == True
    ).first()

def get_stream_history(
    db: Session,
    stream_id: str,
    include_events: bool = True,
    include_snapshots: bool = True,
    limit: int = 100
) -> Dict[str, Any]:
    """스트림 히스토리 조회"""
    result = {
        "stream_id": stream_id,
        "events": [],
        "snapshots": [],
        "audits": []
    }
    
    if include_events:
        events = get_stream_events(db, stream_id, limit)
        result["events"] = [event.to_dict() for event in events]
    
    if include_snapshots:
        snapshots = db.query(StreamSnapshot).filter(
            StreamSnapshot.stream_id == stream_id,
            StreamSnapshot.is_active == True
        ).order_by(StreamSnapshot.snapshot_version.desc()).limit(limit).all()
        result["snapshots"] = [snapshot.to_dict() for snapshot in snapshots]
    
    # 감사 로그 조회
    audits = db.query(StreamAudit).filter(
        StreamAudit.stream_id == stream_id
    ).order_by(StreamAudit.created_at.desc()).limit(limit).all()
    result["audits"] = [audit.to_dict() for audit in audits]
    
    return result

def update_stream_metadata(
    db: Session,
    stream_id: str,
    metadata: Dict[str, Any],
    user_id: Optional[int] = None,
    user_type: Optional[str] = None
) -> bool:
    """스트림 메타데이터 업데이트"""
    try:
        # 이벤트 생성
        event = create_stream_event(
            db=db,
            stream_id=stream_id,
            stream_type="metadata_update",
            entity_id=0,  # 메타데이터 업데이트는 엔티티와 직접 관련 없음
            entity_type="metadata",
            event_type="metadata_updated",
            event_data={"metadata": metadata},
            user_id=user_id,
            user_type=user_type
        )
        
        return True
    except Exception as e:
        print(f"스트림 메타데이터 업데이트 실패: {str(e)}")
        return False

def deactivate_stream(
    db: Session,
    stream_id: str,
    user_id: Optional[int] = None,
    user_type: Optional[str] = None,
    reason: Optional[str] = None
) -> bool:
    """스트림 비활성화"""
    try:
        # 이벤트 생성
        event = create_stream_event(
            db=db,
            stream_id=stream_id,
            stream_type="deactivation",
            entity_id=0,
            entity_type="stream",
            event_type="stream_deactivated",
            event_data={"reason": reason},
            user_id=user_id,
            user_type=user_type
        )
        
        # 감사 로그 생성
        create_stream_audit(
            db=db,
            stream_id=stream_id,
            stream_type="deactivation",
            entity_id=0,
            entity_type="stream",
            action="stream_deactivated",
            user_id=user_id,
            user_type=user_type,
            reason=reason
        )
        
        return True
    except Exception as e:
        print(f"스트림 비활성화 실패: {str(e)}")
        return False
