import os
import json
import time
import httpx
from typing import Dict, Optional, Any
from fastapi import Request, Response, HTTPException
from ..common.utility.logger import gateway_logger

class ProxyController:
    """프록시 컨트롤러 - MVC의 Controller 역할"""
    
    def __init__(self):
        self.gateway_name = os.getenv("GATEWAY_NAME", "greensteel-gateway")
        
        # 서비스 매핑 - OCP 원칙 적용 (URL 정리 포함)
        self.service_map = {
            "/auth": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "")),
            "/cbam": self._clean_service_url(os.getenv("CBAM_SERVICE_URL", "")),
            "/datagather": self._clean_service_url(os.getenv("DATAGATHER_SERVICE_URL", "")),
            "/lci": self._clean_service_url(os.getenv("LCI_SERVICE_URL", ""))
        }
        
        # HTTP 클라이언트 설정 - 모든 타임아웃 파라미터 명시적 설정
        self.timeout = httpx.Timeout(
            connect=15.0,      # 연결 타임아웃
            read=300.0,        # 읽기 타임아웃
            write=60.0,        # 쓰기 타임아웃
            pool=30.0          # 연결 풀 타임아웃
        )
        
        gateway_logger.log_info(f"Gateway initialized: {self.gateway_name}")
        gateway_logger.log_info(f"Service map: {self.service_map}")
    
    def _clean_service_url(self, url: str) -> str:
        """서비스 URL 정리 (공백, 세미콜론, 따옴표 제거)"""
        if not url:
            return ""
        
        # 공백, 세미콜론, 따옴표 제거
        cleaned_url = url.strip().rstrip(';').strip('"\'')
        
        # 프로토콜이 없으면 https:// 추가
        if cleaned_url and not cleaned_url.startswith(('http://', 'https://')):
            cleaned_url = f"https://{cleaned_url}"
        
        return cleaned_url
    
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
        
        # 요청 데이터 검증 (특정 엔드포인트)
        if not self.validate_request_data(path, method, body):
            raise HTTPException(status_code=400, detail="Invalid request data")
        
        # 타겟 URL 구성
        target_url = f"{target_service}{path}"
        if request.url.query:
            target_url += f"?{request.url.query}"
        
        # 디버깅을 위한 URL 로깅
        gateway_logger.log_info(f"Proxying {method} {path} to: {target_url}")
        
        # 헤더 준비
        headers = self.prepare_headers(request)
        
        try:
            # httpx.AsyncClient로 프록시 요청 실행
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=target_url,
                    headers=headers,
                    content=body,
                    follow_redirects=False
                )
                
                # 응답 로깅
                response_time = time.time() - start_time
                gateway_logger.log_response(method, path, response.status_code, response_time)
                
                # 응답 반환
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
                
        except httpx.TimeoutException:
            gateway_logger.log_error(f"Timeout error for {method} {path} to {target_url}")
            raise HTTPException(status_code=504, detail="Gateway timeout")
            
        except httpx.ConnectError as e:
            gateway_logger.log_error(f"Connection error for {method} {path} to {target_url}: {str(e)}")
            raise HTTPException(status_code=502, detail="Service connection failed")
            
        except httpx.HTTPStatusError as e:
            gateway_logger.log_error(f"HTTP error for {method} {path}: {e.response.status_code}")
            raise HTTPException(status_code=e.response.status_code, detail="Service error")
            
        except Exception as e:
            gateway_logger.log_error(f"Unexpected error for {method} {path} to {target_url}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal gateway error")
    
    def health_check(self) -> Dict[str, Any]:
        """헬스 체크 - 서비스 상태 확인"""
        return {
            "status": "healthy",
            "gateway": self.gateway_name,
            "timestamp": time.time(),
            "services": {
                prefix: "configured" if url else "not configured"
                for prefix, url in self.service_map.items()
            }
        }
    
    def get_service_status(self) -> Dict[str, Any]:
        """서비스 상태 정보 반환"""
        return {
            "gateway_name": self.gateway_name,
            "uptime": time.time(),
            "service_config": self.service_map,
            "timeout_settings": {
                "connect": self.timeout.connect,
                "read": self.timeout.read,
                "write": self.timeout.write,
                "pool": self.timeout.pool
            }
        }
    
    def get_routing_info(self) -> Dict[str, Any]:
        """라우팅 정보 반환"""
        return {
            "gateway_name": self.gateway_name,
            "routing_rules": {
                "/auth/*": "Authentication Service",
                "/cbam/*": "CBAM Service", 
                "/datagather/*": "Data Gathering Service",
                "/lci/*": "Life Cycle Inventory Service"
            },
            "supported_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
            "timeout_settings": {
                "connect": f"{self.timeout.connect}s",
                "read": f"{self.timeout.read}s",
                "write": f"{self.timeout.write}s",
                "pool": f"{self.timeout.pool}s"
            },
            "validation_rules": {
                "auth_register": ["name", "company", "email", "password (min 8 chars)"],
                "auth_login": ["email", "password"]
            }
        }
