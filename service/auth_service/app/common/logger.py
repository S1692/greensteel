import logging
import sys
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# 로거 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

auth_logger = logging.getLogger("auth_service")

class LoggingMiddleware(BaseHTTPMiddleware):
    """요청/응답 로깅 미들웨어"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 요청 로깅
        auth_logger.info(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # 응답 로깅
        auth_logger.info(f"Response: {response.status_code}")
        
        return response
