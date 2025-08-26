from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.domain.schemas.chatbot import (
    ChatRequest, 
    ChatResponse,
    ChatHistoryRequest,
    ChatHistoryResponse,
    KnowledgeBaseQuery,
    KnowledgeBaseResponse
)
from app.domain.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/api/v1/chatbot", tags=["chatbot"])

# 서비스 인스턴스
chatbot_service = ChatbotService()

@router.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy", 
        "service": "chatbot_service",
        "version": "1.0.0",
        "ai_model": "gpt-4"
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """챗봇과 대화"""
    try:
        result = await chatbot_service.process_message(
            message=request.message,
            context=request.context,
            session_id=request.session_id,
            user_id=request.user_id
        )
        
        if result["success"]:
            return ChatResponse(**result)
        else:
            raise HTTPException(status_code=500, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"챗봇 처리 중 오류가 발생했습니다: {str(e)}")

@router.get("/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """채팅 히스토리 조회"""
    try:
        if not session_id and not user_id:
            raise HTTPException(status_code=400, detail="session_id 또는 user_id가 필요합니다.")
        
        if session_id:
            messages = await chatbot_service.get_chat_history(session_id, limit)
        else:
            # user_id로 세션을 찾아서 히스토리 조회 (구현 필요)
            messages = []
        
        return ChatHistoryResponse(
            success=True,
            message="채팅 히스토리를 성공적으로 조회했습니다.",
            data=messages,
            total_count=len(messages),
            has_more=len(messages) >= limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"히스토리 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/chat/session/{session_id}")
async def get_session_info(session_id: str):
    """세션 정보 조회"""
    try:
        session_info = await chatbot_service.get_session_info(session_id)
        if session_info:
            return {
                "success": True,
                "message": "세션 정보를 성공적으로 조회했습니다.",
                "data": session_info
            }
        else:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"세션 정보 조회 중 오류가 발생했습니다: {str(e)}")

@router.delete("/chat/session/{session_id}")
async def clear_session(session_id: str):
    """세션 초기화"""
    try:
        success = await chatbot_service.clear_session(session_id)
        if success:
            return {
                "success": True,
                "message": "세션이 성공적으로 초기화되었습니다.",
                "data": {"session_id": session_id}
            }
        else:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"세션 초기화 중 오류가 발생했습니다: {str(e)}")

@router.post("/knowledge/search", response_model=KnowledgeBaseResponse)
async def search_knowledge_base(query: KnowledgeBaseQuery):
    """지식베이스 검색 (향후 구현)"""
    try:
        # TODO: 벡터 데이터베이스 연동하여 지식 검색 구현
        return KnowledgeBaseResponse(
            success=True,
            message="지식 검색이 성공적으로 완료되었습니다.",
            data=[],
            total_results=0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"지식 검색 중 오류가 발생했습니다: {str(e)}")
