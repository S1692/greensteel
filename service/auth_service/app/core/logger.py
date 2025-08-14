import json
import logging
import logging.handlers
from typing import Any, Dict, List, Union
from core.settings import settings

# 민감한 키들 정의
SENSITIVE_KEYS = {
    "password", "passwd", "pwd", "secret", "token", 
    "authorization", "access_token", "refresh_token"
}

def mask_payload(data: Any) -> Any:
    """민감한 정보를 마스킹하는 함수 (재귀적 처리)"""
    if isinstance(data, dict):
        masked_data = {}
        for key, value in data.items():
            if key.lower() in SENSITIVE_KEYS:
                masked_data[key] = "***MASKED***"
            else:
                masked_data[key] = mask_payload(value)
        return masked_data
    elif isinstance(data, list):
        return [mask_payload(item) for item in data]
    else:
        return data

def get_logger(name: str) -> logging.Logger:
    """로거 인스턴스 생성"""
    logger = logging.getLogger(name)
    
    # 이미 핸들러가 설정되어 있으면 중복 설정 방지
    if logger.handlers:
        return logger
    
    # 로그 레벨 설정
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # 스트림 핸들러 생성
    handler = logging.StreamHandler()
    
    # 포맷터 설정
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    
    # 핸들러 추가
    logger.addHandler(handler)
    
    return logger

class LoggingMiddleware:
    """요청/응답 로깅 미들웨어"""
    
    def __init__(self):
        self.logger = get_logger("auth_service.middleware")
    
    async def __call__(self, request, call_next):
        # 요청 로깅
        self.log_request(request)
        
        # 응답 처리
        response = await call_next(request)
        
        # 응답 로깅
        self.log_response(response)
        
        return response
    
    def log_request(self, request):
        """요청 로깅"""
        try:
            # 요청 바디 읽기 (비동기 처리 고려)
            body = None
            if request.method in ["POST", "PUT", "PATCH"]:
                # 실제 구현에서는 request.body()를 await해야 하지만
                # 미들웨어에서는 제한적이므로 기본 정보만 로깅
                body = "***REQUEST_BODY***"
            
            # 쿼리 파라미터
            query_params = dict(request.query_params) if request.query_params else {}
            
            # 민감한 정보 마스킹
            masked_query = mask_payload(query_params)
            masked_body = mask_payload(body) if body else None
            
            self.logger.info(
                f"REQUEST: {request.method} {request.url.path} | "
                f"Query: {masked_query} | "
                f"Body: {masked_body}"
            )
        except Exception as e:
            self.logger.error(f"Request logging error: {str(e)}")
    
    def log_response(self, response):
        """응답 로깅"""
        try:
            self.logger.info(
                f"RESPONSE: Status: {response.status_code} | "
                f"Headers: {dict(response.headers)}"
            )
        except Exception as e:
            self.logger.error(f"Response logging error: {str(e)}")

# 전역 로거 인스턴스
auth_logger = get_logger("auth_service")
