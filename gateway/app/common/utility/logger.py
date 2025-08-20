import logging
import json
from typing import Any, Dict, Optional
from fastapi import Request, Response
import time

# 민감정보 마스킹을 위한 키 목록
SENSITIVE_KEYS = {
    'password', 'token', 'authorization', 'secret', 'key', 'api_key',
    'access_token', 'refresh_token', 'client_secret', 'private_key'
}

class SensitiveDataFilter:
    """민감정보를 마스킹하는 클래스"""
    
    @staticmethod
    def mask_sensitive_data(data: Any) -> Any:
        """데이터에서 민감정보를 마스킹"""
        if isinstance(data, dict):
            masked_data = {}
            for key, value in data.items():
                if isinstance(key, str) and any(sensitive in key.lower() for sensitive in SENSITIVE_KEYS):
                    masked_data[key] = "***MASKED***"
                else:
                    masked_data[key] = SensitiveDataFilter.mask_sensitive_data(value)
            return masked_data
        elif isinstance(data, list):
            return [SensitiveDataFilter.mask_sensitive_data(item) for item in data]
        else:
            return data

class GatewayLogger:
    """게이트웨이 로깅 클래스"""
    
    def __init__(self, name: str = "gateway"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # 콘솔 핸들러 설정
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log_request(self, request: Request, body: Optional[bytes] = None):
        """요청 로깅"""
        # 쿼리 파라미터 로깅
        query_params = dict(request.query_params)
        
        # 요청 바디 로깅 (민감정보 마스킹)
        body_data = None
        if body:
            try:
                body_data = json.loads(body)
                body_data = SensitiveDataFilter.mask_sensitive_data(body_data)
            except:
                body_data = "***BINARY_OR_INVALID_JSON***"
        
        log_data = {
            "method": request.method,
            "path": str(request.url.path),
            "query_params": query_params,
            "body": body_data,
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        }
        
        self.logger.info(f"REQUEST: {json.dumps(log_data, ensure_ascii=False)}")
    
    def log_response(self, method: str, path: str, status_code: int, response_time: float):
        """응답 로깅"""
        log_data = {
            "method": method,
            "path": path,
            "status_code": status_code,
            "response_time_ms": round(response_time * 1000, 2)
        }
        
        self.logger.info(f"RESPONSE: {json.dumps(log_data, ensure_ascii=False)}")
    
    def log_error(self, message: str, error: Optional[Exception] = None):
        """에러 로깅"""
        if error:
            self.logger.error(f"{message}: {str(error)}")
        else:
            self.logger.error(message)
    
    def log_info(self, message: str):
        """정보 로깅"""
        self.logger.info(message)
    
    def log_warning(self, message: str):
        """경고 로깅"""
        self.logger.warning(message)

# 전역 로거 인스턴스
gateway_logger = GatewayLogger()
