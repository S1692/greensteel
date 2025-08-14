import httpx
from fastapi import Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Optional, Any
import os
from ..common.utility.logger import gateway_logger
import time
import json

class ProxyController:
    """프록시 컨트롤러 - MVC의 Controller 역할"""
    
    def __init__(self):
        # 환경변수에서 서비스 URL들을 가져오고 기본값 설정
        self.gateway_name = os.getenv("GATEWAY_NAME", "gateway")
        
        # 서비스 URL 매핑 (OCP 원칙으로 확장 가능)
        self.service_map = {
            "/auth": os.getenv("AUTH_SERVICE_URL", ""),
            "/cbam": os.getenv("CBAM_SERVICE_URL", ""),
            "/datagather": os.getenv("DATAGATHER_SERVICE_URL", ""),
            "/lci": os.getenv("LCI_SERVICE_URL", "")
        }
        
        # HTTP 클라이언트 설정
        self.timeout = httpx.Timeout(
            connect=15.0,  # 연결 타임아웃
            read=300.0,    # 읽기 타임아웃
            write=60.0     # 쓰기 타임아웃
        )
        
        gateway_logger.log_info(f"Gateway initialized: {self.gateway_name}")
        gateway_logger.log_info(f"Service map: {self.service_map}")
    
    def get_target_service(self, path: str) -> Optional[str]:
        """경로에 따른 타겟 서비스 URL 반환"""
        for prefix, service_url in self.service_map.items():
            if path.startswith(prefix):
                if not service_url:
                    gateway_logger.log_warning(f"Service URL not configured for prefix: {prefix}")
                    return None
                return service_url
        return None
    
    def validate_request_data(self, path: str, method: str, body: bytes) -> bool:
        """요청 데이터 검증 (회원가입, 로그인 등 특정 엔드포인트)"""
        if not body:
            return True  # GET 요청 등은 검증 불필요
        
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            return False
        
        # 회원가입 검증
        if path.startswith("/auth/register") and method == "POST":
            required_fields = ["name", "company", "email", "password"]
            
            # 필수 필드 확인
            for field in required_fields:
                if field not in data or not data[field]:
                    return False
            
            # 이메일 형식 검증 (간단한 검증)
            if "@" not in data["email"] or "." not in data["email"]:
                return False
            
            # 비밀번호 길이 검증
            if len(data["password"]) < 8:
                return False
        
        # 로그인 검증
        elif path.startswith("/auth/login") and method == "POST":
            required_fields = ["email", "password"]
            
            # 필수 필드 확인
            for field in required_fields:
                if field not in data or not data[field]:
                    return False
            
            # 이메일 형식 검증 (간단한 검증)
            if "@" not in data["email"] or "." not in data["email"]:
                return False
        
        return True
    
    def prepare_headers(self, request: Request) -> Dict[str, str]:
        """프록시 요청을 위한 헤더 준비"""
        headers = dict(request.headers)
        
        # host 헤더 제거 (프록시 요청에서는 불필요)
        headers.pop("host", None)
        
        # 게이트웨이 식별 헤더 추가
        headers["X-Forwarded-By"] = self.gateway_name
        
        # CORS 관련 헤더 제거 (프록시에서는 불필요)
        headers.pop("origin", None)
        headers.pop("referer", None)
        
        # Content-Length 헤더 제거 (새로운 바디로 재계산됨)
        headers.pop("content-length", None)
        
        return headers
    
    async def proxy_request(self, request: Request) -> Response:
        """프록시 요청 처리 - MVC의 Controller 메서드"""
        start_time = time.time()
        path = request.url.path
        method = request.method
        
        # 타겟 서비스 찾기
        target_service = self.get_target_service(path)
        if not target_service:
            gateway_logger.log_error(f"No target service found for path: {path}")
            raise HTTPException(status_code=502, detail="Service not configured")
        
        # 요청 바디 읽기
        body = await request.body()
        
        # 요청 데이터 검증
        if not self.validate_request_data(path, method, body):
            gateway_logger.log_warning(f"Invalid request data for {method} {path}")
            raise HTTPException(status_code=400, detail="Invalid request data")
        
        # 요청 로깅
        gateway_logger.log_request(request, body)
        
        # 타겟 URL 구성
        target_url = f"{target_service.rstrip('/')}{path}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 프록시 요청 실행
                response = await client.request(
                    method=method,
                    url=target_url,
                    headers=self.prepare_headers(request),
                    params=request.query_params,
                    content=body
                )
                
                # 응답 로깅
                response_time = time.time() - start_time
                gateway_logger.log_response(method, path, response.status_code, response_time)
                
                # 스트리밍 응답 반환 (대용량 데이터 지원)
                return StreamingResponse(
                    content=response.aiter_bytes(),
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
                
        except httpx.TimeoutException as e:
            gateway_logger.log_error(f"Request timeout to {target_service}: {str(e)}")
            raise HTTPException(status_code=504, detail="Gateway timeout")
        except httpx.ConnectError as e:
            gateway_logger.log_error(f"Connection error to {target_service}: {str(e)}")
            raise HTTPException(status_code=502, detail="Service unavailable")
        except httpx.HTTPStatusError as e:
            # HTTP 상태 코드 오류 처리
            gateway_logger.log_error(f"HTTP error from {target_service}: {e.response.status_code}")
            return StreamingResponse(
                content=e.response.aiter_bytes(),
                status_code=e.response.status_code,
                headers=dict(e.response.headers),
                media_type=e.response.headers.get("content-type")
            )
        except Exception as e:
            gateway_logger.log_error(f"Unexpected error proxying to {target_service}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal gateway error")
    
    def health_check(self) -> Dict[str, str]:
        """헬스체크 응답"""
        return {
            "status": "ok",
            "name": self.gateway_name
        }
    
    def get_service_status(self) -> Dict[str, Any]:
        """서비스 상태 정보 반환"""
        status = {
            "gateway_name": self.gateway_name,
            "services": {}
        }
        
        for prefix, url in self.service_map.items():
            status["services"][prefix] = {
                "configured": bool(url),
                "url": url if url else "Not configured"
            }
        
        return status
    
    def get_routing_info(self) -> Dict[str, Any]:
        """라우팅 정보 반환"""
        return {
            "gateway_name": self.gateway_name,
            "routing_rules": {
                "/auth/*": "AUTH_SERVICE_URL",
                "/cbam/*": "CBAM_SERVICE_URL", 
                "/datagather/*": "DATAGATHER_SERVICE_URL",
                "/lci/*": "LCI_SERVICE_URL"
            },
            "supported_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
            "timeout_settings": {
                "connect": "15s",
                "read": "300s", 
                "write": "60s"
            },
            "validation_rules": {
                "auth_register": ["name", "company", "email", "password (min 8 chars)"],
                "auth_login": ["email", "password"]
            }
        }
