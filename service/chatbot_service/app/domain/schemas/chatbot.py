from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    """챗봇 채팅 요청 모델"""
    message: str = Field(..., description="사용자 메시지", min_length=1, max_length=1000)
    context: Optional[str] = Field("general", description="대화 컨텍스트")
    session_id: Optional[str] = Field(None, description="세션 ID")
    user_id: Optional[str] = Field(None, description="사용자 ID")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="요청 타임스탬프")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatResponse(BaseModel):
    """챗봇 채팅 응답 모델"""
    success: bool = Field(..., description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: Dict[str, Any] = Field(default_factory=dict, description="응답 데이터")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "응답이 성공적으로 생성되었습니다.",
                "data": {
                    "response": "안녕하세요! GreenSteel ESG 플랫폼에 대해 무엇을 도와드릴까요?",
                    "session_id": "session_123",
                    "timestamp": "2024-01-01T12:00:00Z",
                    "model_used": "gpt-4",
                    "tokens_used": 150
                }
            }
        }

class ChatMessage(BaseModel):
    """개별 채팅 메시지 모델"""
    id: str = Field(..., description="메시지 고유 ID")
    role: str = Field(..., description="메시지 역할 (user/assistant)")
    content: str = Field(..., description="메시지 내용")
    timestamp: datetime = Field(..., description="메시지 타임스탬프")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="추가 메타데이터")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatSession(BaseModel):
    """채팅 세션 모델"""
    session_id: str = Field(..., description="세션 고유 ID")
    user_id: Optional[str] = Field(None, description="사용자 ID")
    created_at: datetime = Field(..., description="세션 생성 시간")
    last_activity: datetime = Field(..., description="마지막 활동 시간")
    messages: List[ChatMessage] = Field(default_factory=list, description="세션 내 메시지들")
    context: str = Field("general", description="세션 컨텍스트")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class KnowledgeBaseQuery(BaseModel):
    """지식베이스 쿼리 모델"""
    query: str = Field(..., description="검색 쿼리", min_length=1, max_length=500)
    context: Optional[str] = Field(None, description="검색 컨텍스트")
    limit: Optional[int] = Field(10, description="검색 결과 제한", ge=1, le=100)
    
class KnowledgeBaseResponse(BaseModel):
    """지식베이스 응답 모델"""
    success: bool = Field(..., description="검색 성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: List[Dict[str, Any]] = Field(default_factory=list, description="검색 결과")
    total_results: int = Field(0, description="총 검색 결과 수")
    
class SystemPrompt(BaseModel):
    """시스템 프롬프트 모델"""
    prompt: str = Field(..., description="시스템 프롬프트 내용")
    context: str = Field(..., description="프롬프트 컨텍스트")
    version: str = Field("1.0.0", description="프롬프트 버전")
    is_active: bool = Field(True, description="활성화 여부")
    
class ChatHistoryRequest(BaseModel):
    """채팅 히스토리 요청 모델"""
    session_id: Optional[str] = Field(None, description="세션 ID")
    user_id: Optional[str] = Field(None, description="사용자 ID")
    limit: Optional[int] = Field(50, description="히스토리 제한", ge=1, le=1000)
    offset: Optional[int] = Field(0, description="오프셋", ge=0)
    
class ChatHistoryResponse(BaseModel):
    """채팅 히스토리 응답 모델"""
    success: bool = Field(..., description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: List[ChatMessage] = Field(default_factory=list, description="채팅 히스토리")
    total_count: int = Field(0, description="총 메시지 수")
    has_more: bool = Field(False, description="더 많은 메시지 존재 여부")
