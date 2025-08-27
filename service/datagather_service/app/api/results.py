from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..database import get_db
from ..models import ProcessingResult, UserFeedback, ProcessingLog
from ..schemas import (
    ProcessingResultCreate,
    ProcessingResultResponse,
    UserFeedbackCreate,
    UserFeedbackResponse,
    ProcessingStatsResponse
)

router = APIRouter(prefix="/results", tags=["results"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=ProcessingResultResponse)
async def create_processing_result(
    result: ProcessingResultCreate,
    db: Session = Depends(get_db)
):
    """AI 처리 결과를 저장합니다."""
    try:
        db_result = ProcessingResult(
            filename=result.filename,
            original_material=result.original_material,
            processed_material=result.processed_material,
            process_name=result.process_name,
            production_name=result.production_name,
            confidence_score=result.confidence_score,
            ai_model_used=result.ai_model_used,
            processing_time=result.processing_time,
            status=result.status,
            error_message=result.error_message,
            metadata=result.metadata
        )
        
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        logger.info(f"처리 결과 저장 완료: ID {db_result.id}")
        return db_result
        
    except Exception as e:
        db.rollback()
        logger.error(f"처리 결과 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="처리 결과 저장에 실패했습니다.")

@router.get("/", response_model=List[ProcessingResultResponse])
async def get_processing_results(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    filename: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """처리 결과 목록을 조회합니다."""
    try:
        query = db.query(ProcessingResult)
        
        # 필터링
        if filename:
            query = query.filter(ProcessingResult.filename.contains(filename))
        if status:
            query = query.filter(ProcessingResult.status == status)
        if start_date:
            query = query.filter(ProcessingResult.created_at >= start_date)
        if end_date:
            query = query.filter(ProcessingResult.created_at <= end_date)
        
        # 정렬 및 페이징
        results = query.order_by(desc(ProcessingResult.created_at)).offset(skip).limit(limit).all()
        
        logger.info(f"처리 결과 조회 완료: {len(results)}개")
        return results
        
    except Exception as e:
        logger.error(f"처리 결과 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="처리 결과 조회에 실패했습니다.")

@router.get("/{result_id}", response_model=ProcessingResultResponse)
async def get_processing_result(
    result_id: int,
    db: Session = Depends(get_db)
):
    """특정 처리 결과를 조회합니다."""
    try:
        result = db.query(ProcessingResult).filter(ProcessingResult.id == result_id).first()
        if not result:
            raise HTTPException(status_code=404, detail="처리 결과를 찾을 수 없습니다.")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"처리 결과 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="처리 결과 조회에 실패했습니다.")

@router.post("/feedback", response_model=UserFeedbackResponse)
async def create_user_feedback(
    feedback: UserFeedbackCreate,
    db: Session = Depends(get_db)
):
    """사용자 피드백을 저장합니다."""
    try:
        # 처리 결과 존재 확인
        result = db.query(ProcessingResult).filter(ProcessingResult.id == feedback.processing_result_id).first()
        if not result:
            raise HTTPException(status_code=404, detail="처리 결과를 찾을 수 없습니다.")
        
        db_feedback = UserFeedback(
            processing_result_id=feedback.processing_result_id,
            original_material=feedback.original_material,
            corrected_material=feedback.corrected_material,
            feedback_type=feedback.feedback_type,
            user_comment=feedback.user_comment
        )
        
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        
        logger.info(f"사용자 피드백 저장 완료: ID {db_feedback.id}")
        return db_feedback
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"사용자 피드백 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 피드백 저장에 실패했습니다.")

@router.get("/stats/summary", response_model=ProcessingStatsResponse)
async def get_processing_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """처리 통계를 조회합니다."""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        # 전체 처리 건수
        total_count = db.query(ProcessingResult).filter(
            ProcessingResult.created_at >= start_date
        ).count()
        
        # 성공 건수
        success_count = db.query(ProcessingResult).filter(
            ProcessingResult.created_at >= start_date,
            ProcessingResult.status == "completed"
        ).count()
        
        # 실패 건수
        failed_count = db.query(ProcessingResult).filter(
            ProcessingResult.created_at >= start_date,
            ProcessingResult.status == "failed"
        ).count()
        
        # 평균 신뢰도
        avg_confidence = db.query(func.avg(ProcessingResult.confidence_score)).filter(
            ProcessingResult.created_at >= start_date,
            ProcessingResult.confidence_score.isnot(None)
        ).scalar() or 0.0
        
        # 파일별 처리 건수
        file_stats = db.query(
            ProcessingResult.filename,
            func.count(ProcessingResult.id).label('count')
        ).filter(
            ProcessingResult.created_at >= start_date
        ).group_by(ProcessingResult.filename).all()
        
        return ProcessingStatsResponse(
            period_days=days,
            total_count=total_count,
            success_count=success_count,
            failed_count=failed_count,
            success_rate=success_count / total_count * 100 if total_count > 0 else 0,
            avg_confidence=round(avg_confidence, 2),
            file_stats=[{"filename": f.filename, "count": f.count} for f in file_stats]
        )
        
    except Exception as e:
        logger.error(f"처리 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="처리 통계 조회에 실패했습니다.")
