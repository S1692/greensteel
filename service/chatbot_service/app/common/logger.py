import logging
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.common.settings import settings

# 로거 설정
def setup_logger(name: str, level: str = None) -> logging.Logger:
    """로거 설정"""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(settings.LOG_FORMAT)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    logger.setLevel(level or settings.LOG_LEVEL)
    return logger

# 챗봇 서비스 로거
chatbot_logger = setup_logger("chatbot_service", settings.LOG_LEVEL)

class LoggingMiddleware(BaseHTTPMiddleware):
    """HTTP 요청/응답 로깅 미들웨어"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # 요청 로깅
        chatbot_logger.info(
            f"Request: {request.method} {request.url.path} - "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
        
        # 응답 처리
        response = await call_next(request)
        
        # 응답 로깅
        process_time = time.time() - start_time
        chatbot_logger.info(
            f"Response: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )
        
        return response
