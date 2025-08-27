from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# ProcessingResult 스키마
class ProcessingResultBase(BaseModel):
    filename: str = Field(..., description="처리된 파일명")
    original_material: str = Field(..., description="원본 투입물명")
    processed_material: str = Field(..., description="처리된 투입물명")
    process_name: Optional[str] = Field(None, description="공정명")
    production_name: Optional[str] = Field(None, description="생산품명")
    confidence_score: Optional[float] = Field(None, description="AI 신뢰도 점수")
    ai_model_used: Optional[str] = Field(None, description="사용된 AI 모델")
    processing_time: Optional[float] = Field(None, description="처리 시간(초)")
    status: str = Field("completed", description="처리 상태")
    error_message: Optional[str] = Field(None, description="에러 메시지")
    metadata: Optional[Dict[str, Any]] = Field(None, description="추가 메타데이터")

class ProcessingResultCreate(ProcessingResultBase):
    pass

class ProcessingResultResponse(ProcessingResultBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# UserFeedback 스키마
class UserFeedbackBase(BaseModel):
    processing_result_id: int = Field(..., description="처리 결과 ID")
    original_material: str = Field(..., description="원본 투입물명")
    corrected_material: str = Field(..., description="수정된 투입물명")
    feedback_type: str = Field(..., description="피드백 타입 (correction, approval, rejection)")
    user_comment: Optional[str] = Field(None, description="사용자 코멘트")

class UserFeedbackCreate(UserFeedbackBase):
    pass

class UserFeedbackResponse(UserFeedbackBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ProcessingStats 스키마
class FileStat(BaseModel):
    filename: str
    count: int

class ProcessingStatsResponse(BaseModel):
    period_days: int
    total_count: int
    success_count: int
    failed_count: int
    success_rate: float
    avg_confidence: float
    file_stats: List[FileStat]

# API 응답 래퍼
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

# 페이지네이션 응답
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
