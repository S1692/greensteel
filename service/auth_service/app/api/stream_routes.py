"""
스트림 구조를 위한 API 라우트
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from models import get_db, StreamEvent, StreamSnapshot, StreamAudit
from schemas.stream import (
    StreamEventIn, StreamEventOut, StreamSnapshotIn, StreamSnapshotOut,
    StreamAuditOut, StreamHistoryQuery, StreamHistoryOut, StreamMetadataUpdate,
    StreamDeactivation, StreamStats, StreamSearchQuery, StreamSearchResult,
    StreamStatus
)
from lib.stream_utils import (
    create_stream_event, create_stream_snapshot, create_stream_audit,
    get_stream_events, get_latest_snapshot, get_stream_history,
    update_stream_metadata, deactivate_stream
)

router = APIRouter(prefix="/stream", tags=["stream"])

@router.post("/events", response_model=StreamEventOut)
async def create_event(
    event: StreamEventIn,
    db: Session = Depends(get_db)
):
    """스트림 이벤트 생성"""
    try:
        stream_event = create_stream_event(
            db=db,
            stream_id=event.stream_id,
            stream_type=event.stream_type,
            entity_id=event.entity_id,
            entity_type=event.entity_type,
            event_type=event.event_type,
            event_data=event.event_data,
            event_metadata=event.event_metadata
        )
        return stream_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이벤트 생성 실패: {str(e)}")

@router.post("/snapshots", response_model=StreamSnapshotOut)
async def create_snapshot(
    snapshot: StreamSnapshotIn,
    db: Session = Depends(get_db)
):
    """스트림 스냅샷 생성"""
    try:
        stream_snapshot = create_stream_snapshot(
            db=db,
            stream_id=snapshot.stream_id,
            stream_type=snapshot.stream_type,
            entity_id=snapshot.entity_id,
            entity_type=snapshot.entity_type,
            snapshot_data=snapshot.snapshot_data,
            snapshot_metadata=snapshot.snapshot_metadata
        )
        return stream_snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스냅샷 생성 실패: {str(e)}")

@router.get("/events/{stream_id}", response_model=List[StreamEventOut])
async def get_events(
    stream_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """스트림 이벤트 조회"""
    try:
        events = get_stream_events(db, stream_id, limit, offset)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이벤트 조회 실패: {str(e)}")

@router.get("/snapshots/{stream_id}/latest", response_model=StreamSnapshotOut)
async def get_latest_snapshot_by_stream(
    stream_id: str,
    db: Session = Depends(get_db)
):
    """최신 스트림 스냅샷 조회"""
    try:
        snapshot = get_latest_snapshot(db, stream_id)
        if not snapshot:
            raise HTTPException(status_code=404, detail="스냅샷을 찾을 수 없습니다")
        return snapshot
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스냅샷 조회 실패: {str(e)}")

@router.get("/history/{stream_id}", response_model=StreamHistoryOut)
async def get_stream_history(
    stream_id: str,
    include_events: bool = Query(True),
    include_snapshots: bool = Query(True),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """스트림 히스토리 조회"""
    try:
        history = get_stream_history(
            db, stream_id, include_events, include_snapshots, limit
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"히스토리 조회 실패: {str(e)}")

@router.put("/metadata", response_model=dict)
async def update_metadata(
    metadata_update: StreamMetadataUpdate,
    db: Session = Depends(get_db)
):
    """스트림 메타데이터 업데이트"""
    try:
        success = update_stream_metadata(
            db=db,
            stream_id=metadata_update.stream_id,
            metadata=metadata_update.metadata,
            user_id=metadata_update.user_id,
            user_type=metadata_update.user_type
        )
        if success:
            return {"message": "메타데이터가 업데이트되었습니다", "success": True}
        else:
            raise HTTPException(status_code=500, detail="메타데이터 업데이트 실패")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메타데이터 업데이트 실패: {str(e)}")

@router.post("/deactivate", response_model=dict)
async def deactivate_stream_endpoint(
    deactivation: StreamDeactivation,
    db: Session = Depends(get_db)
):
    """스트림 비활성화"""
    try:
        success = deactivate_stream(
            db=db,
            stream_id=deactivation.stream_id,
            user_id=deactivation.user_id,
            user_type=deactivation.user_type,
            reason=deactivation.reason
        )
        if success:
            return {"message": "스트림이 비활성화되었습니다", "success": True}
        else:
            raise HTTPException(status_code=500, detail="스트림 비활성화 실패")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스트림 비활성화 실패: {str(e)}")

@router.get("/stats/{stream_id}", response_model=StreamStats)
async def get_stream_stats(
    stream_id: str,
    db: Session = Depends(get_db)
):
    """스트림 통계 조회"""
    try:
        # 이벤트 통계
        total_events = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id,
            StreamEvent.is_active == True
        ).count()
        
        # 스냅샷 통계
        total_snapshots = db.query(StreamSnapshot).filter(
            StreamSnapshot.stream_id == stream_id,
            StreamSnapshot.is_active == True
        ).count()
        
        # 감사 로그 통계
        total_audits = db.query(StreamAudit).filter(
            StreamAudit.stream_id == stream_id
        ).count()
        
        # 최신 이벤트 버전
        latest_event = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id
        ).order_by(StreamEvent.event_version.desc()).first()
        latest_event_version = latest_event.event_version if latest_event else 0
        
        # 최신 스냅샷 버전
        latest_snapshot = db.query(StreamSnapshot).filter(
            StreamSnapshot.stream_id == stream_id
        ).order_by(StreamSnapshot.snapshot_version.desc()).first()
        latest_snapshot_version = latest_snapshot.snapshot_version if latest_snapshot else 0
        
        # 스트림 활성 상태
        is_active = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id,
            StreamEvent.is_active == True
        ).first() is not None
        
        # 생성 시간과 마지막 업데이트 시간
        first_event = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id
        ).order_by(StreamEvent.created_at.asc()).first()
        created_at = first_event.created_at if first_event else None
        
        last_event = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id
        ).order_by(StreamEvent.updated_at.desc()).first()
        last_updated = last_event.updated_at if last_event else None
        
        return StreamStats(
            stream_id=stream_id,
            total_events=total_events,
            total_snapshots=total_snapshots,
            total_audits=total_audits,
            latest_event_version=latest_event_version,
            latest_snapshot_version=latest_snapshot_version,
            is_active=is_active,
            created_at=created_at,
            last_updated=last_updated
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")

@router.get("/search", response_model=StreamSearchResult)
async def search_streams(
    stream_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    event_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """스트림 검색"""
    try:
        query = db.query(StreamEvent)
        
        if stream_type:
            query = query.filter(StreamEvent.stream_type == stream_type)
        if entity_type:
            query = query.filter(StreamEvent.entity_type == entity_type)
        if entity_id:
            query = query.filter(StreamEvent.entity_id == entity_id)
        if event_type:
            query = query.filter(StreamEvent.event_type == event_type)
        if user_id:
            query = query.filter(StreamEvent.user_id == user_id)
        
        total_count = query.count()
        results = query.order_by(StreamEvent.created_at.desc()).offset(offset).limit(limit + 1).all()
        
        has_more = len(results) > limit
        if has_more:
            results = results[:-1]
        
        return StreamSearchResult(
            total_count=total_count,
            results=results,
            has_more=has_more
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")

@router.get("/status/{stream_id}", response_model=StreamStatus)
async def get_stream_status(
    stream_id: str,
    db: Session = Depends(get_db)
):
    """스트림 상태 조회"""
    try:
        # 마지막 이벤트 시간
        last_event = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id
        ).order_by(StreamEvent.created_at.desc()).first()
        
        # 마지막 스냅샷 시간
        last_snapshot = db.query(StreamSnapshot).filter(
            StreamSnapshot.stream_id == stream_id
        ).order_by(StreamSnapshot.created_at.desc()).first()
        
        # 스트림 활성 상태
        is_active = db.query(StreamEvent).filter(
            StreamEvent.stream_id == stream_id,
            StreamEvent.is_active == True
        ).first() is not None
        
        status = "active" if is_active else "inactive"
        
        return StreamStatus(
            stream_id=stream_id,
            status=status,
            last_event_at=last_event.created_at if last_event else None,
            last_snapshot_at=last_snapshot.created_at if last_snapshot else None,
            error_message=None,
            processing_status="idle"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상태 조회 실패: {str(e)}")
