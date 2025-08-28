import os
import json
import time
import httpx
from typing import Dict, Optional, Any
from fastapi import Request, Response, HTTPException
from ..common.utility.logger import gateway_logger

class ProxyController:
    """프록시 컨트롤러 - DDD의 Application Layer 역할"""
    
    def __init__(self):
        self.gateway_name = os.getenv("GATEWAY_NAME", "greensteel-gateway")
        
        # 서비스 매핑 - DDD 도메인별 서비스 분리
        self.service_map = {
            # 인증 및 사용자 관리 도메인
            "/auth": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            "/stream": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            "/company": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            "/user": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            
            # 지리 정보 도메인 - 국가/지역 데이터
            "/geo": self._clean_service_url(os.getenv("GEO_SERVICE_URL", os.getenv("AUTH_SERVICE_URL", "http://localhost:8081"))),
            
            # 기존 API 호환성 (새 클라이언트는 /geo 사용 권장)
            "/countries": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            "/api/v1/countries": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            "/api": self._clean_service_url(os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")),
            
            # ESG 관리 도메인
            "/cbam": self._clean_service_url(os.getenv("CBAM_SERVICE_URL", "http://localhost:8082")),
            "/datagather": self._clean_service_url(os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")),
            "/lci": self._clean_service_url(os.getenv("LCI_SERVICE_URL", "http://localhost:8083")),
            
            # AI 어시스턴트 도메인
            "/chatbot": self._clean_service_url(os.getenv("CHATBOT_SERVICE_URL", "http://localhost:8084")),
        }
        
        # HTTP 클라이언트 설정 - DDD 패턴에 맞는 타임아웃 설정
        self.timeout = httpx.Timeout(
            connect=15.0,      # 연결 타임아웃
            read=300.0,        # 읽기 타임아웃 (도메인 서비스 처리 시간 고려)
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
        
        # 프로토콜이 없으면 http:// 추가 (로컬 개발 환경)
        if cleaned_url and not cleaned_url.startswith(('http://', 'https://')):
            if 'localhost' in cleaned_url or '127.0.0.1' in cleaned_url:
                cleaned_url = f"http://{cleaned_url}"
            else:
                cleaned_url = f"https://{cleaned_url}"
        
        return cleaned_url
    
    def get_target_service(self, path: str) -> Optional[str]:
        """경로에 따른 타겟 서비스 URL 반환 - DDD 도메인 기반 라우팅"""
        # 더 구체적인 경로부터 매칭 (긴 경로 우선)
        sorted_prefixes = sorted(self.service_map.keys(), key=len, reverse=True)
        
        for prefix in sorted_prefixes:
            if path.startswith(prefix):
                service_url = self.service_map[prefix]
                if not service_url:
                    gateway_logger.log_warning(f"Service URL not configured for prefix: {prefix}")
                    return None
                return service_url
        
        return None
    
    def validate_request_data(self, path: str, method: str, data: dict) -> bool:
        """요청 데이터 검증 - DDD 도메인 규칙 적용"""
        try:
            if method == "POST":
                # 기업 회원가입 도메인 규칙
                if path == "/auth/register/company":
                    return self._validate_company_registration(data)
                
                # 사용자 회원가입 도메인 규칙
                elif path == "/auth/register/user":
                    return self._validate_user_registration(data)
                
                # 로그인 도메인 규칙
                elif path == "/auth/login":
                    return self._validate_login(data)
                
                # 스트림 이벤트 도메인 규칙
                elif path.startswith("/stream/"):
                    return self._validate_stream_event(path, data)
                
                # CBAM 도메인 규칙
                elif path.startswith("/cbam/"):
                    return self._validate_cbam_data(path, data)
                
                # LCI 도메인 규칙
                elif path.startswith("/lci/"):
                    return self._validate_lci_data(path, data)
            
            return True
            
        except Exception as e:
            gateway_logger.error(f"Validation error: {str(e)}")
            return False
    
    def _validate_company_registration(self, data: dict) -> bool:
        """기업 회원가입 도메인 규칙 검증"""
        # 필수 필드 검증
        required_fields = [
            "name_ko", "biz_no", "manager_name", "manager_phone", 
            "username", "password", "country", "city", "zipcode"
        ]
        
        for field in required_fields:
            if not data.get(field):
                gateway_logger.warning(f"Missing required field: {field}")
                return False
        
        # 도메인 규칙 검증
        username = data.get("username", "")
        if len(username) < 3:
            gateway_logger.warning("Username too short (minimum 3 characters)")
            return False
        
        # 사업자번호 형식 검증 (숫자만)
        biz_no = data.get("biz_no", "")
        if not biz_no.isdigit():
            gateway_logger.warning("Invalid business number format")
            return False
        
        # 담당자 연락처 형식 검증
        manager_phone = data.get("manager_phone", "")
        if not manager_phone.replace("-", "").replace(" ", "").isdigit():
            gateway_logger.warning("Invalid phone number format")
            return False
        
        # 비밀번호 길이 검증
        password = data.get("password", "")
        if len(password) < 8:
            gateway_logger.warning("Password too short (minimum 8 characters)")
            return False
        
        return True
    
    def _validate_user_registration(self, data: dict) -> bool:
        """사용자 회원가입 도메인 규칙 검증"""
        required_fields = ["username", "password", "full_name", "company_id"]
        for field in required_fields:
            if not data.get(field):
                gateway_logger.warning(f"Missing required field: {field}")
                return False
        
        # 도메인 규칙 검증
        username = data.get("username", "")
        if len(username) < 3:
            gateway_logger.warning("Username too short (minimum 3 characters)")
            return False
        
        password = data.get("password", "")
        if len(password) < 8:
            gateway_logger.warning("Password too short (minimum 8 characters)")
            return False
        
        # company_id 숫자 검증
        try:
            int(data.get("company_id", ""))
        except (ValueError, TypeError):
            gateway_logger.warning("Invalid company ID format")
            return False
        
        return True
    
    def _validate_login(self, data: dict) -> bool:
        """로그인 도메인 규칙 검증"""
        if not data.get("username") or not data.get("password"):
            gateway_logger.warning("Missing username or password")
            return False
        
        username = data.get("username", "")
        if len(username) < 3:
            gateway_logger.warning("Username too short")
            return False
        
        return True
    
    def _validate_stream_event(self, path: str, data: dict) -> bool:
        """스트림 이벤트 도메인 규칙 검증"""
        if path == "/stream/events":
            required_fields = ["stream_id", "stream_type", "entity_id", "entity_type", "event_type"]
        elif path == "/stream/snapshots":
            required_fields = ["stream_id", "stream_type", "entity_id", "entity_type", "snapshot_data"]
        elif path == "/stream/metadata":
            required_fields = ["stream_id", "metadata"]
        elif path == "/stream/deactivate":
            required_fields = ["stream_id"]
        else:
            return True
        
        for field in required_fields:
            if not data.get(field):
                gateway_logger.warning(f"Missing required field for stream: {field}")
                return False
        
        return True
    
    def _validate_cbam_data(self, path: str, data: dict) -> bool:
        """CBAM 도메인 규칙 검증"""
        # CBAM 특화 검증 로직
        return True
    
    def _validate_lci_data(self, path: str, data: dict) -> bool:
        """LCI 도메인 규칙 검증"""
        # LCI 특화 검증 로직
        return True
    
    def prepare_headers(self, request: Request) -> Dict[str, str]:
        """프록시 요청을 위한 헤더 준비 - DDD 컨텍스트 정보 포함"""
        headers = dict(request.headers)
        
        # host 헤더 제거 (프록시 요청에서는 불필요)
        headers.pop("host", None)
        
        # 게이트웨이 식별 헤더 추가
        headers["X-Forwarded-By"] = self.gateway_name
        
        # DDD 컨텍스트 정보 추가
        headers["X-Domain-Context"] = self._get_domain_context(request.url.path)
        
        # CORS 관련 헤더 제거 (프록시에서는 불필요)
        headers.pop("origin", None)
        headers.pop("referer", None)
        
        # Content-Length 헤더 제거 (새로운 바디로 재계산됨)
        headers.pop("content-length", None)
        
        return headers
    
    def _get_domain_context(self, path: str) -> str:
        """경로에서 도메인 컨텍스트 추출"""
        if path.startswith("/auth") or path.startswith("/stream") or path.startswith("/company") or path.startswith("/user"):
            return "identity-access"
        elif path.startswith("/geo"):
            return "geo-information"
        elif path.startswith("/countries") or path.startswith("/api/v1/countries") or path.startswith("/api"):
            return "identity-access"  # 기존 호환성
        elif path.startswith("/cbam"):
            return "carbon-border"
        elif path.startswith("/datagather"):
            return "data-collection"
        elif path.startswith("/lci"):
            return "lifecycle-inventory"
        elif path.startswith("/chatbot"):
            return "ai-assistant"
        else:
            return "unknown"
    
    async def proxy_request(self, request: Request) -> Response:
        """프록시 요청 처리 - DDD 도메인 서비스 라우팅"""
        try:
            path = request.url.path
            method = request.method
            target_service = self.get_target_service(path)
            
            # 챗봇 서비스 디버깅 로깅 추가
            if path.startswith("/chatbot"):
                gateway_logger.log_info(f"Chatbot request detected: {path}")
                gateway_logger.log_info(f"Target service URL: {target_service}")
                gateway_logger.log_info(f"Service map for /chatbot: {self.service_map.get('/chatbot')}")
            
            if not target_service:
                gateway_logger.log_error(f"No service configured for path: {path}")
                gateway_logger.log_error(f"Available service prefixes: {list(self.service_map.keys())}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Service not available for path: {path}. Please check service configuration."
                )
            
            # 서비스 연결 상태 확인
            if not await self._check_service_health(target_service):
                gateway_logger.log_error(f"Service {target_service} is not responding")
                raise HTTPException(
                    status_code=503,
                    detail=f"Service {target_service} is not available. Please try again later."
                )
            
            # 요청 데이터 검증
            if method in ["POST", "PUT", "PATCH"]:
                try:
                    body = await request.body()
                    if body:
                        data = json.loads(body)
                        if not self.validate_request_data(path, method, data):
                            raise HTTPException(status_code=400, detail="Invalid request data")
                except json.JSONDecodeError:
                    gateway_logger.log_warning("Invalid JSON in request body")
                    raise HTTPException(status_code=400, detail="Invalid JSON format")
            
            # 프록시 요청 실행
            return await self._execute_proxy_request(request, target_service, path)
            
        except HTTPException:
            raise
        except Exception as e:
            gateway_logger.log_error(f"Unexpected error in proxy_request: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal gateway error")

    async def _check_service_health(self, service_url: str) -> bool:
        """서비스 헬스체크 - DDD 도메인 서비스 상태 확인"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{service_url}/health")
                return response.status_code == 200
        except Exception as e:
            gateway_logger.log_warning(f"Health check failed for {service_url}: {str(e)}")
            return False
    
    async def _execute_proxy_request(self, request: Request, target_service: str, path: str) -> Response:
        """실제 프록시 요청 실행 - DDD 도메인 서비스 통신"""
        start_time = time.time()
        method = request.method
        
        # 타겟 URL 구성
        # 챗봇 서비스의 경우 특별한 경로 매핑
        if path.startswith("/chatbot"):
            if path == "/chatbot/chat":
                target_url = f"{target_service}/chat"  # 올바른 경로로 수정
            elif path == "/chatbot/health":
                target_url = f"{target_service}/health"
            else:
                target_url = f"{target_service}{path}"
        else:
            target_url = f"{target_service}{path}"
            
        if request.url.query:
            target_url += f"?{request.url.query}"
        
        # 프리픽스 매칭 로깅
        matched_prefix = None
        for prefix in sorted(self.service_map.keys(), key=len, reverse=True):
            if path.startswith(prefix):
                matched_prefix = prefix
                break
        
        # 상세 로깅
        gateway_logger.log_info(f"Matched prefix: {matched_prefix} → upstream: {target_service}")
        gateway_logger.log_info(f"Proxying {method} {path} to: {target_url}")
        
        # 헤더 준비
        headers = self.prepare_headers(request)
        
        # 요청 바디 읽기
        body = await request.body()
        
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
                gateway_logger.log_info(f"RESPONSE: {method} {path} → status: {response.status_code}, time: {response_time:.3f}s")
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
        """헬스 체크 - DDD 도메인 서비스 상태 확인"""
        return {
            "status": "healthy",
            "gateway": self.gateway_name,
            "architecture": "DDD (Domain-Driven Design)",
            "timestamp": time.time(),
            "domains": {
                "identity-access": "configured" if self.service_map.get("/auth") else "not configured",
                "carbon-border": "configured" if self.service_map.get("/cbam") else "not configured",
                "data-collection": "configured" if self.service_map.get("/datagather") else "not configured",
                "lifecycle-inventory": "configured" if self.service_map.get("/lci") else "not configured",
                "ai-assistant": "configured" if self.service_map.get("/chatbot") else "not configured"
            }
        }
    
    async def get_service_status(self) -> Dict[str, Any]:
        """서비스 상태 정보 반환 - DDD 도메인별 상태"""
        status_info = {
            "gateway": {
                "name": self.gateway_name,
                "architecture": "DDD (Domain-Driven Design)",
                "status": "running",
                "timestamp": time.time()
            },
            "domains": {}
        }
        
        # 도메인별 서비스 상태 확인
        domain_mapping = {
            "/auth": "identity-access",
            "/stream": "identity-access",
            "/countries": "identity-access",
            "/api/v1/countries": "identity-access",
            "/api": "identity-access",
            "/cbam": "carbon-border",
            "/datagather": "data-collection",
            "/lci": "lifecycle-inventory",
            "/chatbot": "ai-assistant"
        }
        
        for prefix, domain_name in domain_mapping.items():
            service_url = self.service_map.get(prefix)
            if not service_url:
                status_info["domains"][domain_name] = {
                    "status": "not_configured",
                    "url": None,
                    "message": "Service URL not configured"
                }
            else:
                # 서비스 헬스체크 수행
                is_healthy = await self._check_service_health(service_url)
                status_info["domains"][domain_name] = {
                    "status": "healthy" if is_healthy else "unhealthy",
                    "url": service_url,
                    "message": "Service responding" if is_healthy else "Service not responding"
                }
        
        return status_info
    
    def get_routing_info(self) -> Dict[str, Any]:
        """라우팅 정보 반환 - DDD 도메인 구조 기반"""
        return {
            "gateway_name": self.gateway_name,
            "architecture": "DDD (Domain-Driven Design)",
            "domain_routing": {
                            "identity-access": {
                "paths": ["/auth/*", "/stream/*", "/company/*", "/user/*", "/countries/*", "/api/v1/countries/*", "/api/*"],
                "service": "Authentication Service",
                "port": "8081",
                "description": "사용자 인증, 권한 관리, 이벤트 스트림, 국가 정보"
            },
                "carbon-border": {
                    "paths": ["/cbam/*"],
                    "service": "CBAM Service",
                    "port": "8082",
                    "description": "탄소국경조정메커니즘 관리"
                },
                "data-collection": {
                    "paths": ["/datagather/*"],
                    "service": "Data Gathering Service",
                    "port": "8083",
                    "description": "ESG 데이터 수집 및 관리"
                },
                "lifecycle-inventory": {
                    "paths": ["/lci/*"],
                    "service": "Life Cycle Inventory Service",
                    "port": "8084",
                    "description": "생명주기 평가 및 인벤토리"
                },
                "ai-assistant": {
                    "paths": ["/chatbot/*"],
                    "service": "AI Assistant Service",
                    "port": "8084",
                    "description": "AI 어시스턴트 기능"
                }
            },
            "supported_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
            "timeout_settings": {
                "connect": f"{self.timeout.connect}s",
                "read": f"{self.timeout.read}s",
                "write": f"{self.timeout.write}s",
                "pool": f"{self.timeout.pool}s"
            },
            "ddd_features": {
                "domain_events": "스트림 기반 이벤트 소싱",
                "aggregate_roots": "Company, User, Stream, CBAM, LCI",
                "value_objects": "Address, BusinessNumber, ContactInfo",
                "domain_services": "Authentication, StreamProcessing, Validation"
            }
        }
