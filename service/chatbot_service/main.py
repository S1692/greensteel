from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.common.settings import settings
from app.common.logger import LoggingMiddleware, chatbot_logger
from app.router.chatbot import router as chatbot_router
from app.www.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)

def log_routes(app: FastAPI) -> None:
    """등록된 라우트 테이블 로깅"""
    chatbot_logger.info("=== Registered Routes ===")
    for route in app.routes:
        try:
            methods = ",".join(sorted(route.methods)) if hasattr(route, 'methods') else "-"
            path = getattr(route, 'path', '-')
            name = getattr(route, 'name', '-')
            chatbot_logger.info(f"[ROUTE] path={path}, name={name}, methods={methods}")
        except Exception as e:
            chatbot_logger.warning(f"Route logging error: {str(e)}")
    chatbot_logger.info("=== End Routes ===")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    chatbot_logger.info(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    chatbot_logger.info(f"Architecture: DDD (Domain-Driven Design)")
    chatbot_logger.info(f"Environment: {settings.ENVIRONMENT}")
    chatbot_logger.info(f"Port: {settings.PORT}")
    chatbot_logger.info(f"OpenAI Model: {settings.OPENAI_MODEL}")
    
    # LangChain 초기화
    try:
        from app.domain.services.chatbot_service import ChatbotService
        chatbot_service = ChatbotService()
        await chatbot_service.initialize()
        chatbot_logger.info("LangChain and OpenAI initialized successfully")
        
        # 지식 베이스 로드 상태 확인
        kb_info = await chatbot_service.get_knowledge_base_info()
        if kb_info.get("loaded"):
            chatbot_logger.info("Knowledge base loaded successfully")
            chatbot_logger.info(f"Vector store: {kb_info.get('vectorstore_type')}")
            chatbot_logger.info(f"Collection: {kb_info.get('collection_name')}")
        else:
            chatbot_logger.warning("Knowledge base not loaded")
            
    except Exception as e:
        chatbot_logger.error(f"LangChain initialization failed: {str(e)}")
        chatbot_logger.warning("Service will continue without LangChain initialization")
    
    # 라우트 로깅
    log_routes(app)
    
    chatbot_logger.info("Service startup completed")
    
    yield
    
    # 종료 시
    chatbot_logger.info("Service shutting down...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=settings.SERVICE_NAME,
    description="DDD 구조를 유지하는 LangChain 기반 챗봇 서비스 (GreenSteel ESG 플랫폼 지원)",
    version=settings.SERVICE_VERSION,
    lifespan=lifespan
)

# 미들웨어 설정
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 에러 핸들러 등록
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# 라우터 등록
app.include_router(chatbot_router)

@app.get("/")
async def root():
    """서비스 상태 확인"""
    return {
        "success": True,
        "message": f"{settings.SERVICE_NAME} is running",
        "data": {
            "version": settings.SERVICE_VERSION,
            "architecture": "DDD",
            "environment": settings.ENVIRONMENT,
            "ai_model": settings.OPENAI_MODEL,
            "features": [
                "OpenAI GPT-4 Integration",
                "LangChain Framework",
                "GreenSteel ESG Knowledge Base",
                "Contextual Chat Responses"
            ]
        }
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy", 
        "service": "chatbot_service",
        "version": settings.SERVICE_VERSION,
        "ai_model": settings.OPENAI_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
